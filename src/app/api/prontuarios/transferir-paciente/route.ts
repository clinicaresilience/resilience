import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

// PUT - Transferir paciente para novo profissional
export async function PUT(request: NextRequest) {
  try {
    const { prontuario_id, novo_profissional_id } = await request.json();

    console.log('Dados recebidos:', { prontuario_id, novo_profissional_id });

    if (!prontuario_id || !novo_profissional_id) {
      return NextResponse.json(
        { error: 'ID do prontuário e ID do novo profissional são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verificar se o usuário é admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin
    const { data: profile } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (profile?.tipo_usuario !== 'admin' && profile?.tipo_usuario !== 'administrador') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem transferir pacientes.' },
        { status: 403 }
      );
    }

    // Verificar se o prontuário existe
    console.log('Buscando prontuário com ID:', prontuario_id);
    
    const { data: prontuario, error: prontuarioError } = await supabase
      .from('prontuarios')
      .select(`
        id,
        paciente_id,
        profissional_atual_id,
        paciente:usuarios!prontuarios_paciente_fkey(
          id,
          nome,
          email
        )
      `)
      .eq('id', prontuario_id)
      .single();

    console.log('Resultado da busca do prontuário:', { prontuario, prontuarioError });

    if (prontuarioError || !prontuario) {
      console.error('Erro na busca do prontuário:', prontuarioError);
      return NextResponse.json(
        { error: 'Prontuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o novo profissional existe
    const { data: novoProfissional, error: profissionalError } = await supabase
      .from('usuarios')
      .select('id, nome, tipo_usuario')
      .eq('id', novo_profissional_id)
      .eq('tipo_usuario', 'profissional')
      .single();

    if (profissionalError || !novoProfissional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado ou não é um profissional válido' },
        { status: 404 }
      );
    }

    // Verificar se não está tentando transferir para o mesmo profissional
    if (prontuario.profissional_atual_id === novo_profissional_id) {
      return NextResponse.json(
        { error: 'O paciente já está com este profissional' },
        { status: 400 }
      );
    }

    // Realizar a transferência usando nova tabela paciente_profissional
    const supabaseTransaction = await createClient();
    let prontuarioAtualizado: Record<string, unknown>;
    
    try {
      // 1. Desativar relação anterior
      const { error: desativarError } = await supabaseTransaction
        .from('paciente_profissional')
        .update({ ativo: false })
        .eq('paciente_id', prontuario.paciente_id)
        .eq('profissional_id', prontuario.profissional_atual_id)
        .eq('ativo', true);

      if (desativarError) {
        console.error('Erro ao desativar relação anterior:', desativarError);
        throw desativarError;
      }

      // 2. Criar nova relação ativa
      const { error: criarRelacaoError } = await supabaseTransaction
        .from('paciente_profissional')
        .insert({
          paciente_id: prontuario.paciente_id,
          profissional_id: novo_profissional_id,
          ativo: true
        });

      if (criarRelacaoError) {
        console.error('Erro ao criar nova relação:', criarRelacaoError);
        throw criarRelacaoError;
      }

      // 3. Cancelar agendamentos futuros com profissional anterior
      const { data: agendamentosFuturos, error: buscarAgendamentosError } = await supabaseTransaction
        .from('agendamentos')
        .select('id, data_consulta, status')
        .eq('paciente_id', prontuario.paciente_id)
        .eq('profissional_id', prontuario.profissional_atual_id)
        .in('status', ['agendado', 'confirmado'])
        .gte('data_consulta', new Date().toISOString());

      if (buscarAgendamentosError) {
        console.error('Erro ao buscar agendamentos futuros:', buscarAgendamentosError);
        throw buscarAgendamentosError;
      }

      if (agendamentosFuturos && agendamentosFuturos.length > 0) {
        console.log(`Cancelando ${agendamentosFuturos.length} agendamentos futuros do paciente`);
        
        for (const agendamento of agendamentosFuturos) {
          const { error: cancelarError } = await supabaseTransaction
            .from('agendamentos')
            .update({
              status: 'cancelado',
              notas: 'Transferência de paciente para novo profissional - Agendamento cancelado automaticamente'
            })
            .eq('id', agendamento.id);

          if (cancelarError) {
            console.error('Erro ao cancelar agendamento:', cancelarError);
            // Continuar cancelando outros agendamentos mesmo se um falhar
          }
        }
      }

      // 4. Atualizar prontuário (mantém compatibilidade)
      const { data: prontuarioData, error: updateError } = await supabaseTransaction
        .from('prontuarios')
        .update({
          profissional_atual_id: novo_profissional_id,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', prontuario_id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar prontuário:', updateError);
        throw updateError;
      }
      
      prontuarioAtualizado = prontuarioData;
    } catch (transactionError) {
      console.error('Erro na transação de transferência:', transactionError);
      return NextResponse.json(
        { error: 'Erro ao transferir prontuário' },
        { status: 500 }
      );
    }

    // Log da transferência para auditoria (opcional)
    const pacienteData = Array.isArray(prontuario.paciente) 
      ? prontuario.paciente[0] 
      : prontuario.paciente;
    
    console.log(`Transferência realizada:
      - Prontuário ID: ${prontuario_id}
      - Paciente: ${pacienteData?.nome || 'Nome não encontrado'}
      - Paciente ID: ${prontuario.paciente_id}
      - Profissional anterior: ${prontuario.profissional_atual_id}
      - Novo profissional: ${novo_profissional_id} (${novoProfissional.nome})
      - Realizada por: ${user.id}
      - Data: ${new Date().toISOString()}`
    );

    return NextResponse.json({
      success: true,
      data: prontuarioAtualizado,
      message: `Paciente ${pacienteData?.nome || ''} foi transferido com sucesso para ${novoProfissional.nome}`
    });

  } catch (error) {
    console.error('Erro ao transferir paciente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
