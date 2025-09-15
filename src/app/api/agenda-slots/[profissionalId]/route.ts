import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { TimezoneUtils } from '@/utils/timezone';

export async function GET(
  request: NextRequest,
  { params }: { params: { profissionalId: string } }
) {
  try {
    const supabase = await createClient();

    // Remover autenticação obrigatória para permitir acesso público aos horários
    // Esta API deve ser acessível para usuários não logados fazerem agendamentos

    const { profissionalId } = params;
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    const hoje = TimezoneUtils.now();
    const inicioDate = dataInicio || hoje;
    const fimDate = dataFim || TimezoneUtils.addTime(hoje, 30, 'days');

    // Buscar slots usando timestamptz
    const { data: slots, error } = await supabase
      .from('agendamento_slot')
      .select('*')
      .eq('profissional_id', profissionalId)
      .eq('status', 'livre')
      .gte('data_hora_inicio', inicioDate)
      .lte('data_hora_inicio', fimDate)
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

    // Filtrar slots que não estão bloqueados por exceções
    const slotsDisponiveis = (slots || []).filter(slot => {
      const dataHoraInicioUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio);
      const dataHoraFimUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_fim);
      
      return !isSlotBlocked(dataHoraInicioUTC, dataHoraFimUTC);
    });

    // Mapear para frontend com formato correto
    const slotsFormatted = slotsDisponiveis.map(slot => {
      const dataHoraInicioUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio);
      const dataHoraFimUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_fim);
      
      return {
        id: slot.id,
        profissional_id: slot.profissional_id,
        // Separar data e hora para compatibilidade com frontend (convertido para timezone local)
        data: TimezoneUtils.extractDate(dataHoraInicioUTC),
        hora: TimezoneUtils.extractTime(dataHoraInicioUTC),
        hora_inicio: TimezoneUtils.extractTime(dataHoraInicioUTC),
        hora_fim: TimezoneUtils.extractTime(dataHoraFimUTC),
        // Campos adicionais para compatibilidade
        horario: TimezoneUtils.extractTime(dataHoraInicioUTC),
        data_hora_inicio: dataHoraInicioUTC, // Timestamp UTC
        data_hora_fim: dataHoraFimUTC, // Timestamp UTC
        disponivel: slot.status === 'livre',
        status: slot.status,
        // Campos formatados para exibição
        dataFormatada: TimezoneUtils.formatForDisplay(dataHoraInicioUTC, undefined, 'date'),
        horaFormatada: TimezoneUtils.formatForDisplay(dataHoraInicioUTC, undefined, 'time'),
        dataHoraFormatada: TimezoneUtils.formatForDisplay(dataHoraInicioUTC)
      };
    });

    console.log(`Retornando ${slotsFormatted.length} slots para profissional ${profissionalId}`);
    return NextResponse.json(slotsFormatted);

  } catch (error) {
    console.error('Erro ao buscar slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { profissionalId: string } }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profissionalId } = params;
    const { slotId, modalidade, notas } = await request.json();

    if (!slotId) {
      return NextResponse.json({ error: 'slotId é obrigatório' }, { status: 400 });
    }

    // Buscar slot pelo ID
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

    // Criar agendamento usando data_hora_inicio convertido para UTC
    const dataConsultaUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio);

    const { data: agendamento, error: agendamentoError } = await supabase
      .from('agendamentos')
      .insert({
        paciente_id: user.id,
        profissional_id: profissionalId,
        data_consulta: dataConsultaUTC,
        status: 'confirmado',
        modalidade: modalidade || 'presencial',
        notas: notas
      })
      .select()
      .single();

    if (agendamentoError) {
      console.error('Erro ao criar agendamento:', agendamentoError);
      return NextResponse.json({ error: agendamentoError.message }, { status: 500 });
    }

    // Marcar slot como ocupado
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
