import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { TimezoneUtils } from '@/utils/timezone';

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

    // Formatar as exceções com dados de exibição usando Luxon
    const excecoesFormatadas = (excecoes || []).map(excecao => {
      const dataExcecaoUTC = TimezoneUtils.dbTimestampToUTC(excecao.data_excecao);
      
      const resultado: any = {
        ...excecao,
        data_excecao: dataExcecaoUTC,
        // Campos formatados para exibição
        dataFormatada: TimezoneUtils.formatForDisplay(dataExcecaoUTC, undefined, 'date'),
      };
      
      // Formatar horários se existirem
      if (excecao.hora_inicio) {
        const horaInicioUTC = TimezoneUtils.dbTimestampToUTC(excecao.hora_inicio);
        resultado.hora_inicio = horaInicioUTC;
        resultado.horaInicioFormatada = TimezoneUtils.formatForDisplay(horaInicioUTC, undefined, 'time');
      }
      
      if (excecao.hora_fim) {
        const horaFimUTC = TimezoneUtils.dbTimestampToUTC(excecao.hora_fim);
        resultado.hora_fim = horaFimUTC;
        resultado.horaFimFormatada = TimezoneUtils.formatForDisplay(horaFimUTC, undefined, 'time');
      }
      
      // Formatar data fim se existir (para feriados/férias)
      if (excecao.data_fim) {
        const dataFimUTC = TimezoneUtils.dbTimestampToUTC(excecao.data_fim);
        resultado.data_fim = dataFimUTC;
        resultado.dataFimFormatada = TimezoneUtils.formatForDisplay(dataFimUTC, undefined, 'date');
      }
      
      return resultado;
    });

    return NextResponse.json({
      success: true,
      excecoes: excecoesFormatadas
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

    // Configurar data_excecao baseado no tipo - usando Luxon para conversão UTC
    if (tipo === 'recorrente') {
      // Para recorrentes, usar uma data padrão (hoje) mas com horários específicos
      const today = TimezoneUtils.extractDate(TimezoneUtils.now());
      insertData.data_excecao = TimezoneUtils.createDateTime(today, '00:00');
      insertData.hora_inicio = TimezoneUtils.createDateTime(today, hora_inicio);
      insertData.hora_fim = TimezoneUtils.createDateTime(today, hora_fim);
    } else if (tipo === 'pontual') {
      insertData.data_excecao = TimezoneUtils.createDateTime(data, '00:00');
      if (hora_inicio && hora_fim) {
        insertData.hora_inicio = TimezoneUtils.createDateTime(data, hora_inicio);
        insertData.hora_fim = TimezoneUtils.createDateTime(data, hora_fim);
      }
    } else if (tipo === 'feriado') {
      insertData.data_excecao = TimezoneUtils.createDateTime(data, '00:00');
      if (data_fim) {
        insertData.data_fim = TimezoneUtils.createDateTime(data_fim, '23:59');
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

    // Formatar a exceção criada com dados de exibição
    const excecaoFormatada: any = {
      ...excecao,
      // Garantir que timestamps estão em UTC
      data_excecao: TimezoneUtils.dbTimestampToUTC(excecao.data_excecao),
      dataFormatada: TimezoneUtils.formatForDisplay(TimezoneUtils.dbTimestampToUTC(excecao.data_excecao), undefined, 'date'),
    };
    
    if (excecao.hora_inicio) {
      const horaInicioUTC = TimezoneUtils.dbTimestampToUTC(excecao.hora_inicio);
      excecaoFormatada.hora_inicio = horaInicioUTC;
      excecaoFormatada.horaInicioFormatada = TimezoneUtils.formatForDisplay(horaInicioUTC, undefined, 'time');
    }
    
    if (excecao.hora_fim) {
      const horaFimUTC = TimezoneUtils.dbTimestampToUTC(excecao.hora_fim);
      excecaoFormatada.hora_fim = horaFimUTC;
      excecaoFormatada.horaFimFormatada = TimezoneUtils.formatForDisplay(horaFimUTC, undefined, 'time');
    }
    
    if (excecao.data_fim) {
      const dataFimUTC = TimezoneUtils.dbTimestampToUTC(excecao.data_fim);
      excecaoFormatada.data_fim = dataFimUTC;
      excecaoFormatada.dataFimFormatada = TimezoneUtils.formatForDisplay(dataFimUTC, undefined, 'date');
    }

    return NextResponse.json({
      success: true,
      excecao: excecaoFormatada,
      message: 'Exceção criada com sucesso!'
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
