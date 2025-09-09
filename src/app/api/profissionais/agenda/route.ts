// app/api/profissionais/agenda/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import moment from 'moment';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const profissionalId = searchParams.get('profissionalId');
  if (!profissionalId) return NextResponse.json({ error: 'profissionalId é obrigatório' }, { status: 400 });

  const dataInicio = searchParams.get('dataInicio') || new Date().toISOString();
  const dataFim = searchParams.get('dataFim') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Buscar slots existentes
  const { data: slots, error } = await supabase
    .from('agendamento_slot')
    .select('*')
    .eq('profissional_id', profissionalId)
    .gte('data_hora_inicio', dataInicio)
    .lte('data_hora_inicio', dataFim)
    .order('data_hora_inicio');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Formatar slots para compatibilidade com frontend
  const formattedSlots = slots?.map(slot => ({
    id: slot.id,
    profissional_id: slot.profissional_id,
    data: moment(slot.data_hora_inicio).format('YYYY-MM-DD'),
    horaInicio: moment(slot.data_hora_inicio).format('HH:mm'),
    horaFim: moment(slot.data_hora_fim).format('HH:mm'),
    status: slot.status,
    data_hora_inicio: slot.data_hora_inicio,
    data_hora_fim: slot.data_hora_fim,
  })) || [];

  return NextResponse.json({ slots: formattedSlots });
}

// POST: Criar cronograma de agenda
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { profissional_id, configuracao } = body;

  if (!profissional_id || !configuracao) {
    return NextResponse.json({ error: 'profissional_id e configuracao são obrigatórios' }, { status: 400 });
  }

  try {
    console.log('Criando cronograma para profissional:', profissional_id);
    console.log('Configuração recebida:', configuracao);

    // Limpar slots antigos (opcional - pode querer manter histórico)
    await supabase
      .from('agendamento_slot')
      .delete()
      .eq('profissional_id', profissional_id)
      .eq('status', 'livre');

    const slotsParaCriar = [];
    const diasConfig = configuracao.dias || [];
    const intervaloMinutos = configuracao.intervalo_minutos || 60;

    // Gerar slots para os próximos 30 dias
    const hoje = moment().startOf('day');
    const dataLimite = moment().add(30, 'days').endOf('day');

    for (let data = hoje.clone(); data.isSameOrBefore(dataLimite); data.add(1, 'day')) {
      const diaSemana = data.day(); // 0 = domingo, 1 = segunda, etc.
      
      // Verificar se este dia da semana está configurado
      const configDia = diasConfig.find((d: any) => d.diaSemana === diaSemana);
      if (!configDia) continue;

      const horaInicio = moment(data).hour(parseInt(configDia.horaInicio.split(':')[0])).minute(parseInt(configDia.horaInicio.split(':')[1]));
      const horaFim = moment(data).hour(parseInt(configDia.horaFim.split(':')[0])).minute(parseInt(configDia.horaFim.split(':')[1]));

      // Gerar slots no intervalo especificado
      for (let slot = horaInicio.clone(); slot.isBefore(horaFim); slot.add(intervaloMinutos, 'minutes')) {
        const slotFim = slot.clone().add(intervaloMinutos, 'minutes');
        
        slotsParaCriar.push({
          profissional_id,
          data_hora_inicio: slot.toISOString(),
          data_hora_fim: slotFim.toISOString(),
          status: 'livre',
        });
      }
    }

    console.log(`Criando ${slotsParaCriar.length} slots`);

    // Inserir slots em batches
    if (slotsParaCriar.length > 0) {
      const { data: novoSlots, error: insertError } = await supabase
        .from('agendamento_slot')
        .insert(slotsParaCriar)
        .select();

      if (insertError) {
        console.error('Erro ao inserir slots:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      // Formatar slots para resposta
      const formattedSlots = novoSlots.map(slot => ({
        id: slot.id,
        profissional_id: slot.profissional_id,
        data: moment(slot.data_hora_inicio).format('YYYY-MM-DD'),
        horaInicio: moment(slot.data_hora_inicio).format('HH:mm'),
        horaFim: moment(slot.data_hora_fim).format('HH:mm'),
        status: slot.status,
        data_hora_inicio: slot.data_hora_inicio,
        data_hora_fim: slot.data_hora_fim,
      }));

      return NextResponse.json({
        success: true,
        message: `Cronograma criado com sucesso! ${slotsParaCriar.length} horários gerados.`,
        agenda: {
          configuracao,
          slots: formattedSlots
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Nenhum slot foi gerado. Verifique a configuração.',
        agenda: {
          configuracao,
          slots: []
        }
      });
    }

  } catch (error) {
    console.error('Erro ao criar cronograma:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
