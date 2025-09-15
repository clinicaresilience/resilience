import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

// GET - Verificar se um profissional está designado para atendimento presencial em uma data específica
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profissionalId = searchParams.get('profissional_id');
    const data = searchParams.get('data');

    // Validações
    if (!profissionalId || !data) {
      return NextResponse.json(
        { error: 'Profissional ID e data são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se há designação presencial para esta data
    const { data: designacaoPresencial } = await supabase
      .from('profissional_presencial')
      .select(`
        id,
        data_presencial,
        hora_inicio,
        hora_fim,
        usuarios:profissional_id (
          id,
          nome
        )
      `)
      .eq('profissional_id', profissionalId)
      .eq('data_presencial', data)
      .single();

    const isPresencial = !!designacaoPresencial;

    // Se há designação presencial, verificar agendamentos existentes
    let agendamentosExistentes = [];
    if (isPresencial) {
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_consulta,
          modalidade,
          status,
          paciente:usuarios!agendamentos_paciente_id_fkey(nome)
        `)
        .eq('profissional_id', profissionalId)
        .eq('data_consulta', data)
        .neq('status', 'cancelado');

      agendamentosExistentes = agendamentos || [];
    }

    return NextResponse.json({
      data: {
        profissional_id: profissionalId,
        data,
        is_presencial: isPresencial,
        designacao: designacaoPresencial,
        agendamentos_existentes: agendamentosExistentes,
        modalidade_permitida: isPresencial ? 'presencial' : 'online',
        pode_criar_slots_online: !isPresencial,
        pode_criar_slots_presencial: isPresencial
      },
      message: 'Verificação de disponibilidade realizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao verificar disponibilidade presencial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Verificar disponibilidade para múltiplas datas
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { profissional_id, datas } = body;

    // Validações
    if (!profissional_id || !datas || !Array.isArray(datas)) {
      return NextResponse.json(
        { error: 'Profissional ID e array de datas são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar todas as designações presenciais para as datas solicitadas
    const { data: designacoes } = await supabase
      .from('profissional_presencial')
      .select(`
        id,
        data_presencial,
        hora_inicio,
        hora_fim
      `)
      .eq('profissional_id', profissional_id)
      .in('data_presencial', datas);

    // Criar mapa de disponibilidade
    const disponibilidade = datas.map(data => {
      const designacao = designacoes?.find(d => d.data_presencial === data);
      const isPresencial = !!designacao;

      return {
        data,
        is_presencial: isPresencial,
        designacao: designacao || null,
        modalidade_permitida: isPresencial ? 'presencial' : 'online',
        pode_criar_slots_online: !isPresencial,
        pode_criar_slots_presencial: isPresencial
      };
    });

    return NextResponse.json({
      data: {
        profissional_id,
        disponibilidade
      },
      message: 'Verificação em lote realizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao verificar disponibilidade em lote:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
