import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profissionalId = searchParams.get('profissionalId');

    if (!profissionalId) {
      return NextResponse.json({ error: 'profissionalId é obrigatório' }, { status: 400 });
    }

    // Buscar exceções do profissional
    const { data: excecoes, error } = await supabase
      .from('agenda_excecoes')
      .select('*')
      .eq('profissional_id', profissionalId)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar exceções:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      excecoes: excecoes || []
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      profissional_id, 
      tipo, 
      motivo, 
      data, 
      data_fim, 
      hora_inicio, 
      hora_fim,
      disponivel = false 
    } = body;

    // Validações básicas
    if (!profissional_id || !tipo || !motivo) {
      return NextResponse.json({ 
        error: 'profissional_id, tipo e motivo são obrigatórios' 
      }, { status: 400 });
    }

    // Validações específicas por tipo
    if (tipo === 'recorrente') {
      if (!hora_inicio || !hora_fim) {
        return NextResponse.json({ 
          error: 'Para exceções recorrentes, hora_inicio e hora_fim são obrigatórios' 
        }, { status: 400 });
      }
    } else if (tipo === 'pontual') {
      if (!data) {
        return NextResponse.json({ 
          error: 'Para exceções pontuais, data é obrigatória' 
        }, { status: 400 });
      }
    } else if (tipo === 'feriado') {
      if (!data) {
        return NextResponse.json({ 
          error: 'Para exceções de feriado/férias, data é obrigatória' 
        }, { status: 400 });
      }
    }

    // Preparar dados para inserção baseado no schema real
    let insertData: any = {
      profissional_id,
      tipo,
      motivo,
      disponivel
    };

    // Configurar data_excecao baseado no tipo - usando timezone local do Brasil
    if (tipo === 'recorrente') {
      // Para recorrentes, usar uma data padrão (hoje) mas com horários específicos
      const today = new Date().toISOString().split('T')[0];
      insertData.data_excecao = `${today}T00:00:00-03:00`;
      insertData.hora_inicio = `${today}T${hora_inicio}:00-03:00`;
      insertData.hora_fim = `${today}T${hora_fim}:00-03:00`;
    } else if (tipo === 'pontual') {
      insertData.data_excecao = `${data}T00:00:00-03:00`;
      if (hora_inicio && hora_fim) {
        insertData.hora_inicio = `${data}T${hora_inicio}:00-03:00`;
        insertData.hora_fim = `${data}T${hora_fim}:00-03:00`;
      }
    } else if (tipo === 'feriado') {
      insertData.data_excecao = `${data}T00:00:00-03:00`;
      if (data_fim) {
        insertData.data_fim = data_fim;
      }
    }

    // Verificar se o usuário é o próprio profissional ou um admin
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (usuario.tipo_usuario !== 'administrador' && user.id !== profissional_id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Inserir exceção
    const { data: excecao, error: insertError } = await supabase
      .from('agenda_excecoes')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir exceção:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      excecao,
      message: 'Exceção criada com sucesso!'
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
