import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

interface ProfissionalPresencial {
  id: string;
  profissional_id: string;
  data_presencial: string;
  hora_inicio?: string;
  hora_fim?: string;
  criado_em: string;
  atualizado_em: string;
}

// GET - Listar designações de atendimento presencial
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profissionalId = searchParams.get('profissional_id');
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');

    let query = supabase
      .from('profissional_presencial')
      .select(`
        *,
        usuarios:profissional_id (
          id,
          nome,
          email,
          informacoes_adicionais
        )
      `)
      .order('data_presencial', { ascending: true });

    // Filtros opcionais
    if (profissionalId) {
      query = query.eq('profissional_id', profissionalId);
    }

    if (dataInicio) {
      query = query.gte('data_presencial', dataInicio);
    }

    if (dataFim) {
      query = query.lte('data_presencial', dataFim);
    }

    const { data: designacoes, error } = await query;

    if (error) {
      console.error('Erro ao buscar designações presenciais:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar designações presenciais' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: designacoes || [],
      message: 'Designações presenciais recuperadas com sucesso'
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova designação de atendimento presencial
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (!usuario || usuario.tipo_usuario !== 'administrador') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem designar atendimento presencial.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { profissional_id, data_presencial, hora_inicio, hora_fim } = body;

    // Validações
    if (!profissional_id || !data_presencial) {
      return NextResponse.json(
        { error: 'Profissional e data são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o profissional existe e é um profissional
    const { data: profissional } = await supabase
      .from('usuarios')
      .select('id, tipo_usuario')
      .eq('id', profissional_id)
      .eq('tipo_usuario', 'profissional')
      .single();

    if (!profissional) {
      return NextResponse.json(
        { error: 'Profissional não encontrado ou inválido' },
        { status: 400 }
      );
    }

    // Verificar se já existe designação para essa data
    const { data: existente } = await supabase
      .from('profissional_presencial')
      .select('id')
      .eq('profissional_id', profissional_id)
      .eq('data_presencial', data_presencial)
      .single();

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe uma designação presencial para este profissional nesta data' },
        { status: 400 }
      );
    }

    // Verificar se há agendamentos online para esta data
    const { data: agendamentosOnline } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('profissional_id', profissional_id)
      .eq('data_consulta', data_presencial)
      .eq('modalidade', 'online')
      .neq('status', 'cancelado');

    if (agendamentosOnline && agendamentosOnline.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível designar atendimento presencial. Já existem agendamentos online para esta data.' },
        { status: 400 }
      );
    }

    // Criar a designação
    const novaDesignacao = {
      profissional_id,
      data_presencial,
      hora_inicio: hora_inicio || null,
      hora_fim: hora_fim || null
    };

    const { data: designacao, error } = await supabase
      .from('profissional_presencial')
      .insert(novaDesignacao)
      .select(`
        *,
        usuarios:profissional_id (
          id,
          nome,
          email,
          informacoes_adicionais
        )
      `)
      .single();

    if (error) {
      console.error('Erro ao criar designação presencial:', error);
      return NextResponse.json(
        { error: 'Erro ao criar designação presencial' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: designacao,
      message: 'Designação presencial criada com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover designação de atendimento presencial
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (!usuario || usuario.tipo_usuario !== 'administrador') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem remover designações presenciais.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID da designação é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar a designação antes de deletar para verificar agendamentos
    const { data: designacao } = await supabase
      .from('profissional_presencial')
      .select('profissional_id, data_presencial')
      .eq('id', id)
      .single();

    if (!designacao) {
      return NextResponse.json(
        { error: 'Designação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se há agendamentos presenciais para esta data
    const { data: agendamentosPresenciais } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('profissional_id', designacao.profissional_id)
      .eq('data_consulta', designacao.data_presencial)
      .eq('modalidade', 'presencial')
      .neq('status', 'cancelado');

    if (agendamentosPresenciais && agendamentosPresenciais.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível remover a designação. Existem agendamentos presenciais confirmados para esta data.' },
        { status: 400 }
      );
    }

    // Deletar a designação
    const { error } = await supabase
      .from('profissional_presencial')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar designação presencial:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar designação presencial' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Designação presencial removida com sucesso'
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
