// app/api/profissionais/agenda/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { TimezoneUtils } from '@/utils/timezone';
import { DateTime } from 'luxon';

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
    data: TimezoneUtils.extractDate(TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio)),
    horaInicio: TimezoneUtils.extractTime(TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio)),
    horaFim: TimezoneUtils.extractTime(TimezoneUtils.dbTimestampToUTC(slot.data_hora_fim)),
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

    // Buscar designações presenciais para os próximos 30 dias para verificar conflitos
    const hoje = DateTime.now().setZone('America/Sao_Paulo').startOf('day');
    const dataLimite = hoje.plus({ days: 30 }).endOf('day');
    
    const { data: designacoesPresenciais, error: presencialError } = await supabase
      .from('profissional_presencial')
      .select('data_presencial')
      .eq('profissional_id', profissional_id)
      .gte('data_presencial', hoje.toISODate())
      .lte('data_presencial', dataLimite.toISODate());

    if (presencialError) {
      console.error('Erro ao buscar designações presenciais:', presencialError);
    }

    // Criar set de datas presenciais para lookup rápido
    const datasPresenciais = new Set(
      (designacoesPresenciais || []).map(d => d.data_presencial)
    );

    if (datasPresenciais.size > 0) {
      console.log(`Profissional ${profissional_id} tem ${datasPresenciais.size} designações presenciais. Não será possível criar agenda online para essas datas.`);
      
      // Informar ao usuário sobre as datas com conflito
      const datasConflito = Array.from(datasPresenciais).sort();
      return NextResponse.json({
        error: `Não é possível criar agenda online. O profissional possui designações para atendimento presencial nas seguintes datas: ${datasConflito.join(', ')}. Para criar agenda online, primeiro remova as designações presenciais.`,
        datasConflito,
        tipo: 'conflito_presencial'
      }, { status: 400 });
    }

    // Limpar slots antigos (opcional - pode querer manter histórico)
    await supabase
      .from('agendamento_slot')
      .delete()
      .eq('profissional_id', profissional_id)
      .eq('status', 'livre');

    const slotsParaCriar = [];
    const diasConfig = configuracao.dias || [];
    const intervaloMinutos = configuracao.intervalo_minutos || 60;

    for (let data = hoje; data <= dataLimite; data = data.plus({ days: 1 })) {
      const diaSemana = data.weekday % 7; // Luxon weekday (1=segunda) -> JS (0=domingo)
      const dataStr = data.toISODate();
      
      // Pular datas com designação presencial (verificação adicional de segurança)
      if (datasPresenciais.has(dataStr)) {
        console.log(`Pulando data ${dataStr} - profissional tem designação presencial`);
        continue;
      }
      
      // Verificar se este dia da semana está configurado
      const configDia = diasConfig.find((d: { diaSemana: number; horaInicio: string; horaFim: string }) => d.diaSemana === diaSemana);
      if (!configDia) continue;

      const [horaInicioHour, horaInicioMin] = configDia.horaInicio.split(':').map(Number);
      const [horaFimHour, horaFimMin] = configDia.horaFim.split(':').map(Number);
      
      const horaInicio = data.set({ hour: horaInicioHour, minute: horaInicioMin, second: 0 });
      const horaFim = data.set({ hour: horaFimHour, minute: horaFimMin, second: 0 });

      // Gerar slots no intervalo especificado
      let slot = horaInicio;
      while (slot < horaFim) {
        const slotFim = slot.plus({ minutes: intervaloMinutos });
        
        slotsParaCriar.push({
          profissional_id,
          data_hora_inicio: TimezoneUtils.toUTC(slot.toISO() || ''),
          data_hora_fim: TimezoneUtils.toUTC(slotFim.toISO() || ''),
          status: 'livre',
          modalidade: 'online', // Definir explicitamente que são slots online
        });
        
        slot = slotFim;
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
        data: TimezoneUtils.extractDate(TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio)),
        horaInicio: TimezoneUtils.extractTime(TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio)),
        horaFim: TimezoneUtils.extractTime(TimezoneUtils.dbTimestampToUTC(slot.data_hora_fim)),
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
