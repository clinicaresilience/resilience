import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

// GET - Buscar evoluções de um prontuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prontuarioId = searchParams.get('prontuario_id');
    const agendamentoId = searchParams.get('agendamento_id');

    if (!prontuarioId && !agendamentoId) {
      return NextResponse.json(
        { error: 'Prontuário ID ou Agendamento ID é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    let query = supabase
      .from('prontuario_evolucoes')
      .select(`
        *,
        profissional:usuarios!profissional_id(
          id,
          nome,
          especialidade,
          area,
          crp
        ),
        agendamento:agendamentos(
          id,
          data_consulta,
          status
        )
      `)
      .order('data_evolucao', { ascending: false });

    if (prontuarioId) {
      query = query.eq('prontuario_id', prontuarioId);
    }

    if (agendamentoId) {
      query = query.eq('agendamento_id', agendamentoId);
    }

    const { data: evolucoes, error } = await query;

    if (error) {
      console.error('Erro ao buscar evoluções:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar evoluções', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: evolucoes || [] 
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova evolução
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      prontuario_id, 
      agendamento_id, 
      tipo_evolucao, 
      texto, 
      dados_structurados,
      data_evolucao 
    } = body;

    if (!prontuario_id || !texto || !tipo_evolucao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: prontuario_id, texto, tipo_evolucao' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Verificar usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário tem permissão para criar evolução neste prontuário
    const { data: prontuario, error: prontuarioError } = await supabase
      .from('prontuarios')
      .select('profissional_atual_id')
      .eq('id', prontuario_id)
      .single();

    if (prontuarioError) {
      return NextResponse.json(
        { error: 'Prontuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é profissional responsável (admin NÃO pode criar evoluções)
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (usuarioError) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const isProfissionalResponsavel = prontuario.profissional_atual_id === user.id;

    // Apenas o profissional responsável pode criar evoluções
    if (!isProfissionalResponsavel) {
      return NextResponse.json(
        { error: 'Apenas o profissional responsável pelo prontuário pode criar evoluções' },
        { status: 403 }
      );
    }

    // Criar evolução
    const { data: novaEvolucao, error: evolucaoError } = await supabase
      .from('prontuario_evolucoes')
      .insert([
        {
          prontuario_id,
          profissional_id: user.id,
          agendamento_id,
          tipo_evolucao,
          texto,
          dados_structurados,
          data_evolucao: data_evolucao || new Date().toISOString(),
        }
      ])
      .select(`
        *,
        profissional:usuarios!profissional_id(
          id,
          nome,
          especialidade,
          area,
          crp
        ),
        agendamento:agendamentos(
          id,
          data_consulta,
          status
        )
      `)
      .single();

    if (evolucaoError) {
      console.error('Erro ao criar evolução:', evolucaoError);
      return NextResponse.json(
        { error: 'Erro ao criar evolução', details: evolucaoError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: novaEvolucao
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
