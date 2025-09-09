import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { profissionalId: string } }
) {
  try {
    const supabase = await createClient();

    // Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profissionalId } = params;
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    const hoje = new Date();
    const inicioDate = dataInicio || hoje.toISOString();
    const fimDate = dataFim || new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

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
      .from('agenda_excessoes')
      .select('*')
      .eq('profissional_id', profissionalId)
      .eq('disponivel', false);

    if (excessoesError) {
      console.error('Erro ao buscar exceções:', excessoesError);
    }

    // Função para verificar se um slot deve ser bloqueado por exceções
    const isSlotBlocked = (slotDate: Date, slotHoraInicio: string, slotHoraFim: string) => {
      if (!excessoes) return false;

      const slotDateStr = slotDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const slotDiaSemana = slotDate.getDay(); // 0 = domingo, 1 = segunda, etc.

      for (const excecao of excessoes) {
        // Tipo pontual: bloquear dia e horário específico
        if (excecao.tipo === 'pontual') {
          if (excecao.data === slotDateStr && 
              excecao.hora_inicio && excecao.hora_fim &&
              slotHoraInicio >= excecao.hora_inicio && 
              slotHoraFim <= excecao.hora_fim) {
            return true;
          }
        }
        
        // Tipo recorrente (almoço): bloquear horário em todos os dias
        else if (excecao.tipo === 'recorrente') {
          if (excecao.hora_inicio && excecao.hora_fim &&
              slotHoraInicio >= excecao.hora_inicio && 
              slotHoraFim <= excecao.hora_fim) {
            return true;
          }
        }
        
        // Tipo feriado/férias: bloquear período inteiro de dias
        else if (excecao.tipo === 'feriado') {
          const dataFim = excecao.data_fim || excecao.data;
          if (slotDateStr >= excecao.data && slotDateStr <= dataFim) {
            return true;
          }
        }
      }

      return false;
    };

    // Filtrar slots que não estão bloqueados por exceções
    const slotsDisponiveis = (slots || []).filter(slot => {
      const dataHoraInicio = new Date(slot.data_hora_inicio);
      const dataHoraFim = new Date(slot.data_hora_fim);
      const horaInicio = dataHoraInicio.toISOString().split('T')[1].substring(0, 5);
      const horaFim = dataHoraFim.toISOString().split('T')[1].substring(0, 5);
      
      return !isSlotBlocked(dataHoraInicio, horaInicio, horaFim);
    });

    // Mapear para frontend com formato correto
    const slotsFormatted = slotsDisponiveis.map(slot => {
      const dataHoraInicio = new Date(slot.data_hora_inicio);
      const dataHoraFim = new Date(slot.data_hora_fim);
      
      return {
        id: slot.id,
        profissional_id: slot.profissional_id,
        // Separar data e hora para compatibilidade com frontend
        data: dataHoraInicio.toISOString().split('T')[0], // YYYY-MM-DD
        hora: dataHoraInicio.toISOString().split('T')[1].substring(0, 5), // HH:mm
        hora_inicio: dataHoraInicio.toISOString().split('T')[1].substring(0, 5), // HH:mm
        hora_fim: dataHoraFim.toISOString().split('T')[1].substring(0, 5), // HH:mm
        // Campos adicionais para compatibilidade
        horario: dataHoraInicio.toISOString().split('T')[1].substring(0, 5), // HH:mm
        data_hora_inicio: slot.data_hora_inicio, // Timestamp completo
        data_hora_fim: slot.data_hora_fim, // Timestamp completo
        disponivel: slot.status === 'livre',
        status: slot.status
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

    // Criar agendamento usando data_hora_inicio
    const dataConsulta = new Date(slot.data_hora_inicio).toISOString();

    const { data: agendamento, error: agendamentoError } = await supabase
      .from('agendamentos')
      .insert({
        paciente_id: user.id,
        profissional_id: profissionalId,
        data_consulta: dataConsulta,
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
        atualizado_em: new Date().toISOString()
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
