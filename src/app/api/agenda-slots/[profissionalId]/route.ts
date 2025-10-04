import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { TimezoneUtils } from '@/utils/timezone';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profissionalId: string }> }
) {
  try {
    const supabase = await createClient();

    // Remover autenticação obrigatória para permitir acesso público aos horários
    // Esta API deve ser acessível para usuários não logados fazerem agendamentos

    const { profissionalId } = await params;
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    const hoje = TimezoneUtils.now();

    // Garantir que as datas tenham horário completo
    let inicioDate: string;
    let fimDate: string;

    if (dataInicio) {
      // Se data vem no formato YYYY-MM-DD, adicionar horário 00:00:00
      inicioDate = dataInicio.includes('T') ? dataInicio : `${dataInicio}T00:00:00Z`;
    } else {
      inicioDate = hoje;
    }

    if (dataFim) {
      // Se data vem no formato YYYY-MM-DD, adicionar fim do dia (próximo dia às 00:00)
      if (dataFim.includes('T')) {
        fimDate = dataFim;
      } else {
        // Adicionar 1 dia para pegar até o fim do dia especificado
        const fimDateObj = new Date(dataFim + 'T23:59:59Z');
        fimDateObj.setDate(fimDateObj.getDate() + 1);
        fimDate = fimDateObj.toISOString().split('.')[0] + 'Z';
      }
    } else {
      fimDate = TimezoneUtils.addTime(hoje, 30, 'days');
    }

    console.log('Buscando slots:', { profissionalId, inicioDate, fimDate });

    // Buscar slots usando timestamptz
    const { data: slots, error } = await supabase
      .from('agendamento_slot')
      .select('*')
      .eq('profissional_id', profissionalId)
      .eq('status', 'livre')
      .gte('data_hora_inicio', inicioDate)
      .lt('data_hora_inicio', fimDate)
      .order('data_hora_inicio');

    if (error) {
      console.error('Erro ao buscar slots:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Buscar exceções/paradas do profissional
    const { data: excessoes, error: excessoesError } = await supabase
      .from('agenda_excecoes')
      .select('*')
      .eq('profissional_id', profissionalId)
      .eq('disponivel', false);

    if (excessoesError) {
      console.error('Erro ao buscar exceções:', excessoesError);
    }

    // Função para verificar se um slot deve ser bloqueado por exceções
    const isSlotBlocked = (slotDataHoraInicioUTC: string, slotDataHoraFimUTC: string) => {
      if (!excessoes) return false;

      const slotDateStr = TimezoneUtils.extractDate(slotDataHoraInicioUTC);
      const slotHoraInicio = TimezoneUtils.extractTime(slotDataHoraInicioUTC);
      const slotHoraFim = TimezoneUtils.extractTime(slotDataHoraFimUTC);

      for (const excecao of excessoes) {
        // Tipo recorrente (almoço): bloquear horário em todos os dias
        if (excecao.tipo === 'recorrente') {
          if (excecao.hora_inicio && excecao.hora_fim) {
            const excecaoHoraInicioUTC = TimezoneUtils.dbTimestampToUTC(excecao.hora_inicio);
            const excecaoHoraFimUTC = TimezoneUtils.dbTimestampToUTC(excecao.hora_fim);
            const excecaoHoraInicio = TimezoneUtils.extractTime(excecaoHoraInicioUTC);
            const excecaoHoraFim = TimezoneUtils.extractTime(excecaoHoraFimUTC);
            
            console.log(`Comparando slot ${slotHoraInicio}-${slotHoraFim} com exceção recorrente ${excecaoHoraInicio}-${excecaoHoraFim}`);
            
            // Verificar se há sobreposição de horários
            if (!(slotHoraFim <= excecaoHoraInicio || slotHoraInicio >= excecaoHoraFim)) {
              return true;
            }
          }
        }
        
        // Tipo pontual: bloquear dia e horário específico
        else if (excecao.tipo === 'pontual') {
          const excecaoDataUTC = TimezoneUtils.dbTimestampToUTC(excecao.data_excecao);
          const excecaoDataStr = TimezoneUtils.extractDate(excecaoDataUTC);
          if (excecaoDataStr === slotDateStr) {
            // Se não tem horário específico, bloqueia o dia todo
            if (!excecao.hora_inicio || !excecao.hora_fim) {
              return true;
            }
            // Se tem horário específico, verifica sobreposição
            const excecaoHoraInicioUTC = TimezoneUtils.dbTimestampToUTC(excecao.hora_inicio);
            const excecaoHoraFimUTC = TimezoneUtils.dbTimestampToUTC(excecao.hora_fim);
            const excecaoHoraInicio = TimezoneUtils.extractTime(excecaoHoraInicioUTC);
            const excecaoHoraFim = TimezoneUtils.extractTime(excecaoHoraFimUTC);
            
            if (!(slotHoraFim <= excecaoHoraInicio || slotHoraInicio >= excecaoHoraFim)) {
              return true;
            }
          }
        }
        
        // Tipo feriado/férias: bloquear período inteiro de dias
        else if (excecao.tipo === 'feriado') {
          const excecaoDataInicioUTC = TimezoneUtils.dbTimestampToUTC(excecao.data_excecao);
          const excecaoDataInicio = TimezoneUtils.extractDate(excecaoDataInicioUTC);
          const excecaoDataFim = excecao.data_fim ? TimezoneUtils.extractDate(TimezoneUtils.dbTimestampToUTC(excecao.data_fim)) : excecaoDataInicio;
          if (slotDateStr >= excecaoDataInicio && slotDateStr <= excecaoDataFim) {
            return true;
          }
        }
      }

      return false;
    };

    // Buscar designações presenciais para o período
    const { data: designacoesPresenciais, error: presencialError } = await supabase
      .from('profissional_presencial')
      .select('data_presencial')
      .eq('profissional_id', profissionalId)
      .gte('data_presencial', TimezoneUtils.extractDate(inicioDate))
      .lte('data_presencial', TimezoneUtils.extractDate(fimDate));

    if (presencialError) {
      console.error('Erro ao buscar designações presenciais:', presencialError);
    }

    // Criar set de datas presenciais para lookup rápido
    const datasPresenciais = new Set(
      (designacoesPresenciais || []).map(d => d.data_presencial)
    );

    // Buscar designações presenciais completas para criar slots presenciais
    const { data: designacoesCompletas, error: designacoesError } = await supabase
      .from('profissional_presencial')
      .select('*')
      .eq('profissional_id', profissionalId)
      .gte('data_presencial', TimezoneUtils.extractDate(inicioDate))
      .lte('data_presencial', TimezoneUtils.extractDate(fimDate));

    if (designacoesError) {
      console.error('Erro ao buscar designações completas:', designacoesError);
    }

    // Filtrar slots que não estão bloqueados por exceções E respeitam modalidade presencial
    const slotsOnlineDisponiveis = (slots || []).filter(slot => {
      const dataHoraInicioUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio);
      const dataHoraFimUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_fim);
      const dataSlot = TimezoneUtils.extractDate(dataHoraInicioUTC);
      
      // Verificar se não está bloqueado por exceções
      if (isSlotBlocked(dataHoraInicioUTC, dataHoraFimUTC)) {
        return false;
      }

      // Se o profissional está designado para presencial nesta data,
      // não exibir slots online
      if (datasPresenciais.has(dataSlot)) {
        return false;
      }

      return true;
    });

    // Mapear slots online para frontend
    const slotsOnlineFormatted = slotsOnlineDisponiveis.map(slot => {
      const dataHoraInicioUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio);
      const dataHoraFimUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_fim);
      
      return {
        id: slot.id,
        profissional_id: slot.profissional_id,
        modalidade: 'online',
        data: TimezoneUtils.extractDate(dataHoraInicioUTC),
        hora: TimezoneUtils.extractTime(dataHoraInicioUTC),
        hora_inicio: TimezoneUtils.extractTime(dataHoraInicioUTC),
        hora_fim: TimezoneUtils.extractTime(dataHoraFimUTC),
        horario: TimezoneUtils.extractTime(dataHoraInicioUTC),
        data_hora_inicio: dataHoraInicioUTC,
        data_hora_fim: dataHoraFimUTC,
        disponivel: slot.status === 'livre',
        status: slot.status,
        dataFormatada: TimezoneUtils.formatForDisplay(dataHoraInicioUTC, undefined, 'date'),
        horaFormatada: TimezoneUtils.formatForDisplay(dataHoraInicioUTC, undefined, 'time'),
        dataHoraFormatada: TimezoneUtils.formatForDisplay(dataHoraInicioUTC)
      };
    });

    // Criar slots presenciais virtuais para datas com designação presencial
    const slotsPresenciaisFormatted = [];
    for (const designacao of (designacoesCompletas || [])) {
      const dataDesignacao = designacao.data_presencial;
      
      // Se tem horário específico definido, criar slot para esse período
      if (designacao.hora_inicio && designacao.hora_fim) {
        const dataHoraInicioStr = `${dataDesignacao}T${designacao.hora_inicio}:00`;
        const dataHoraFimStr = `${dataDesignacao}T${designacao.hora_fim}:00`;
        
        const slotPresencial = {
          id: `presencial-${designacao.id}`,
          profissional_id: profissionalId,
          modalidade: 'presencial',
          data: dataDesignacao,
          hora: designacao.hora_inicio.substring(0, 5),
          hora_inicio: designacao.hora_inicio.substring(0, 5),
          hora_fim: designacao.hora_fim.substring(0, 5),
          horario: designacao.hora_inicio.substring(0, 5),
          data_hora_inicio: dataHoraInicioStr,
          data_hora_fim: dataHoraFimStr,
          disponivel: true,
          status: 'livre',
          dataFormatada: new Date(dataDesignacao).toLocaleDateString('pt-BR'),
          horaFormatada: designacao.hora_inicio.substring(0, 5),
          dataHoraFormatada: `${new Date(dataDesignacao).toLocaleDateString('pt-BR')} ${designacao.hora_inicio.substring(0, 5)}`,
          isPresencial: true,
          designacao_id: designacao.id
        };
        
        slotsPresenciaisFormatted.push(slotPresencial);
      } else {
        // Sem horário específico - criar slots para horário comercial (8h às 18h)
        const horariosComerciais = [
          '08:00', '09:00', '10:00', '11:00', 
          '14:00', '15:00', '16:00', '17:00'
        ];
        
        for (const hora of horariosComerciais) {
          const horaFim = `${parseInt(hora.split(':')[0]) + 1}:00`;
          const dataHoraInicioStr = `${dataDesignacao}T${hora}:00`;
          const dataHoraFimStr = `${dataDesignacao}T${horaFim}:00`;
          
          const slotPresencial = {
            id: `presencial-${designacao.id}-${hora}`,
            profissional_id: profissionalId,
            modalidade: 'presencial',
            data: dataDesignacao,
            hora: hora,
            hora_inicio: hora,
            hora_fim: horaFim,
            horario: hora,
            data_hora_inicio: dataHoraInicioStr,
            data_hora_fim: dataHoraFimStr,
            disponivel: true,
            status: 'livre',
            dataFormatada: new Date(dataDesignacao).toLocaleDateString('pt-BR'),
            horaFormatada: hora,
            dataHoraFormatada: `${new Date(dataDesignacao).toLocaleDateString('pt-BR')} ${hora}`,
            isPresencial: true,
            designacao_id: designacao.id
          };
          
          slotsPresenciaisFormatted.push(slotPresencial);
        }
      }
    }

    // Combinar slots online e presenciais
    const slotsFormatted = [...slotsOnlineFormatted, ...slotsPresenciaisFormatted];

    console.log(`Retornando ${slotsFormatted.length} slots para profissional ${profissionalId}`);
    return NextResponse.json(slotsFormatted);

  } catch (error) {
    console.error('Erro ao buscar slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ profissionalId: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profissionalId } = await params;
    const { slotId, modalidade, notas, dataHoraInicio, dataHoraFim } = await request.json();

    if (!slotId) {
      return NextResponse.json({ error: 'slotId é obrigatório' }, { status: 400 });
    }

    let dataConsultaUTC;
    let isPresencialSlot = false;

    // Verificar se é slot presencial (ID começa com 'presencial-')
    if (slotId.startsWith('presencial-')) {
      isPresencialSlot = true;
      
      if (!dataHoraInicio) {
        return NextResponse.json({ error: 'dataHoraInicio é obrigatório para slots presenciais' }, { status: 400 });
      }
      
      dataConsultaUTC = dataHoraInicio;
    } else {
      // Buscar slot regular pelo ID
      const { data: slot, error: slotError } = await supabase
        .from('agendamento_slot')
        .select('*')
        .eq('id', slotId)
        .eq('profissional_id', profissionalId)
        .eq('status', 'livre')
        .single();

      if (slotError || !slot) {
        return NextResponse.json({ error: 'Slot não disponível' }, { status: 400 });
      }

      dataConsultaUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio);
    }

    // Criar agendamento
    const { data: agendamento, error: agendamentoError } = await supabase
      .from('agendamentos')
      .insert({
        paciente_id: user.id,
        profissional_id: profissionalId,
        data_consulta: dataConsultaUTC,
        status: 'confirmado',
        modalidade: modalidade || (isPresencialSlot ? 'presencial' : 'online'),
        notas: notas
      })
      .select()
      .single();

    if (agendamentoError) {
      console.error('Erro ao criar agendamento:', agendamentoError);
      return NextResponse.json({ error: agendamentoError.message }, { status: 500 });
    }

    // Se for slot regular (não presencial), marcar como ocupado
    if (!isPresencialSlot) {
      const { error: updateSlotError } = await supabase
        .from('agendamento_slot')
        .update({
          status: 'ocupado',
          paciente_id: user.id,
          atualizado_em: TimezoneUtils.now()
        })
        .eq('id', slotId);

      if (updateSlotError) {
        console.error('Erro ao ocupar slot:', updateSlotError);
        await supabase.from('agendamentos').delete().eq('id', agendamento.id);
        return NextResponse.json({ error: 'Erro ao reservar horário' }, { status: 500 });
      }
    }
    // Para slots presenciais, não precisamos marcar nada como ocupado pois são virtuais

    return NextResponse.json({
      success: true,
      agendamento,
      message: 'Agendamento criado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
