import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { TimezoneUtils } from '@/utils/timezone';
import { ExceptionLimitsService } from '@/services/database/exception-limits.service';

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
      
      const resultado: Record<string, unknown> = {
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
    const insertData: Record<string, unknown> = {
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

    // VALIDAÇÃO DOS LIMITES DE EXCEÇÃO
    if (hora_inicio && hora_fim && disponivel === false) {
      // Calcular duração da exceção em minutos
      const horaInicioTime = hora_inicio.split(':').map(Number);
      const horaFimTime = hora_fim.split(':').map(Number);
      const duracaoMinutos = (horaFimTime[0] * 60 + horaFimTime[1]) - (horaInicioTime[0] * 60 + horaInicioTime[1]);
      
      if (duracaoMinutos > 0) {
        try {
          // Mapear motivo para tipo de exceção dos limites
          let tipoExcecaoLimite = 'qualquer';
          const motivoLower = motivo.toLowerCase();
          if (motivoLower.includes('almoço') || motivoLower.includes('almoco')) {
            tipoExcecaoLimite = 'almoco';
          } else if (motivoLower.includes('pausa')) {
            tipoExcecaoLimite = 'pausa';
          } else if (motivoLower.includes('reunião') || motivoLower.includes('reuniao')) {
            tipoExcecaoLimite = 'reuniao';
          } else if (motivoLower.includes('emergência') || motivoLower.includes('emergencia')) {
            tipoExcecaoLimite = 'emergencia';
          } else {
            tipoExcecaoLimite = 'outro';
          }

          // Buscar limite específico primeiro
          let applicableLimit = await ExceptionLimitsService.getLimitForProfessional(profissional_id, tipoExcecaoLimite);

          // Se não encontrar limite específico para o tipo, buscar limite global "qualquer"
          if (!applicableLimit && tipoExcecaoLimite !== 'qualquer') {
            applicableLimit = await ExceptionLimitsService.getLimitForProfessional(profissional_id, 'qualquer');
          }

          if (applicableLimit) {
            // Converter limite PostgreSQL interval para minutos
            const limitString = applicableLimit.limite_diario;
            let limiteMinutos = 0;
            
            // Tratar formato HH:MM:SS (ex: "01:30:00")
            if (limitString.match(/^\d{2}:\d{2}:\d{2}$/)) {
              const [hours, minutes, seconds] = limitString.split(':').map(Number);
              limiteMinutos = hours * 60 + minutes;
            }
            // Tratar formato textual (ex: "1 hour 30 minutes")
            else {
              if (limitString.includes('hour')) {
                const hours = parseInt(limitString.match(/(\d+)\s*hour/)?.[1] || '0');
                limiteMinutos += hours * 60;
              }
              if (limitString.includes('minute')) {
                const minutes = parseInt(limitString.match(/(\d+)\s*minute/)?.[1] || '0');
                limiteMinutos += minutes;
              }
            }

            // BUSCAR EXCEÇÕES EXISTENTES DO PROFISSIONAL PARA O TIPO
            const dataHoje = TimezoneUtils.extractDate(TimezoneUtils.now());
            const { data: excecoesExistentes, error: excecoesError } = await supabase
              .from('agenda_excecoes')
              .select('hora_inicio, hora_fim, motivo')
              .eq('profissional_id', profissional_id)
              .eq('disponivel', false)
              .gte('data_excecao', `${dataHoje}T00:00:00Z`)
              .lte('data_excecao', `${dataHoje}T23:59:59Z`);

            if (excecoesError) {
              console.error('Erro ao buscar exceções existentes:', excecoesError);
            }

            // Calcular tempo total já usado hoje para o tipo de exceção
            let tempoJaUsado = 0;
            if (excecoesExistentes) {
              for (const excecao of excecoesExistentes) {
                if (excecao.hora_inicio && excecao.hora_fim) {
                  // Mapear motivo da exceção existente para verificar se é do mesmo tipo
                  let tipoExistente = 'qualquer';
                  const motivoExistenteLower = excecao.motivo.toLowerCase();
                  if (motivoExistenteLower.includes('almoço') || motivoExistenteLower.includes('almoco')) {
                    tipoExistente = 'almoco';
                  } else if (motivoExistenteLower.includes('pausa')) {
                    tipoExistente = 'pausa';
                  } else if (motivoExistenteLower.includes('reunião') || motivoExistenteLower.includes('reuniao')) {
                    tipoExistente = 'reuniao';
                  } else if (motivoExistenteLower.includes('emergência') || motivoExistenteLower.includes('emergencia')) {
                    tipoExistente = 'emergencia';
                  } else {
                    tipoExistente = 'outro';
                  }

                  // Se for do mesmo tipo ou o limite for para "qualquer", somar o tempo
                  if (tipoExistente === tipoExcecaoLimite || tipoExcecaoLimite === 'qualquer') {
                    const horaInicioExistente = TimezoneUtils.extractTime(TimezoneUtils.dbTimestampToUTC(excecao.hora_inicio)).split(':').map(Number);
                    const horaFimExistente = TimezoneUtils.extractTime(TimezoneUtils.dbTimestampToUTC(excecao.hora_fim)).split(':').map(Number);
                    const duracaoExistente = (horaFimExistente[0] * 60 + horaFimExistente[1]) - (horaInicioExistente[0] * 60 + horaInicioExistente[1]);
                    if (duracaoExistente > 0) {
                      tempoJaUsado += duracaoExistente;
                    }
                  }
                }
              }
            }

            // Verificar se a soma total (existente + nova exceção) excede o limite
            const tempoTotalComNovaExcecao = tempoJaUsado + duracaoMinutos;
            if (tempoTotalComNovaExcecao > limiteMinutos) {
              const limiteFormatado = limitString
                .replace('hours', 'h')
                .replace('hour', 'h')
                .replace('minutes', 'min')
                .replace('minute', 'min');
              
              const tipoExcecaoLabel = tipoExcecaoLimite === 'almoco' ? 'Almoço' :
                                     tipoExcecaoLimite === 'pausa' ? 'Pausa' :
                                     tipoExcecaoLimite === 'reuniao' ? 'Reunião' :
                                     tipoExcecaoLimite === 'emergencia' ? 'Emergência' :
                                     tipoExcecaoLimite === 'outro' ? 'Outro' : 'Qualquer Exceção';
              
              const escopo = applicableLimit.profissional_id ? 'individual' : 'global';
              const tempoJaUsadoFormatado = `${Math.floor(tempoJaUsado/60)}h ${tempoJaUsado%60}min`;
              const tempoRestante = limiteMinutos - tempoJaUsado;
              const tempoRestanteFormatado = tempoRestante > 0 ? `${Math.floor(tempoRestante/60)}h ${tempoRestante%60}min` : '0min';
              
              return NextResponse.json({ 
                error: `Limite diário excedido. Limite ${escopo} para ${tipoExcecaoLabel}: ${limiteFormatado} por dia. Você já usou ${tempoJaUsadoFormatado} hoje e tentou adicionar mais ${Math.floor(duracaoMinutos/60)}h ${duracaoMinutos%60}min. Tempo restante disponível: ${tempoRestanteFormatado}.`,
                limite_excedido: true,
                limite_atual: limiteFormatado,
                tempo_ja_usado: tempoJaUsadoFormatado,
                tempo_solicitado: `${Math.floor(duracaoMinutos/60)}h ${duracaoMinutos%60}min`,
                tempo_restante: tempoRestanteFormatado,
                tipo_excecao: tipoExcecaoLabel
              }, { status: 400 });
            }
          }
        } catch (limitError) {
          console.error('Erro ao validar limites de exceção:', limitError);
          // Não bloquear a criação da exceção se houver erro na validação de limites
        }
      }
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
    const excecaoFormatada: Record<string, unknown> = {
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
