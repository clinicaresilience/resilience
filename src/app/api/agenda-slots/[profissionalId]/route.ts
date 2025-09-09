import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { profissionalId: string } }
) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profissionalId } = params;
    const { searchParams } = new URL(request.url);
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');

    // Definir período padrão se não fornecido (próximos 30 dias)
    const hoje = new Date();
    const inicioDate = dataInicio || hoje.toISOString().split('T')[0];
    const fimDate = dataFim || new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Buscando slots para profissional ${profissionalId} entre ${inicioDate} e ${fimDate}`);

    // Buscar todos os slots disponíveis da tabela agendamento_slot
    const { data: slots, error } = await supabase
      .from('agendamento_slot')
      .select('*')
      .eq('profissional_id', profissionalId)
      .eq('status', 'livre') // Apenas slots livres
      .gte('data', inicioDate)
      .lte('data', fimDate)
      .order('data')
      .order('hora_inicio');

    if (error) {
      console.error('Erro ao buscar slots:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Encontrados ${slots?.length || 0} slots disponíveis`);

    // Mapear para o formato esperado pelo frontend
    const slotsFormatted = (slots || []).map(slot => ({
      id: slot.id,
      data: slot.data,
      horario: slot.hora_inicio,
      hora_inicio: slot.hora_inicio,
      hora_fim: slot.hora_fim,
      disponivel: true, // Já filtrados apenas os livres
      status: slot.status,
      profissional_id: slot.profissional_id
    }));

    return NextResponse.json(slotsFormatted);

  } catch (error) {
    console.error('Erro ao buscar slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - criar agendamento em um slot específico
export async function POST(
  request: NextRequest,
  { params }: { params: { profissionalId: string } }
) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profissionalId } = params;
    const body = await request.json();
    const { slotId, modalidade, notas } = body;

    if (!slotId) {
      return NextResponse.json({ error: 'slotId é obrigatório' }, { status: 400 });
    }

    // Verificar se o slot ainda está disponível
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

    // Criar agendamento
    const dataConsulta = new Date(`${slot.data}T${slot.hora_inicio}:00`).toISOString();

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
      // Se não conseguir ocupar o slot, cancelar o agendamento
      await supabase.from('agendamentos').delete().eq('id', agendamento.id);
      return NextResponse.json({ error: 'Erro ao reservar horário' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      agendamento: agendamento,
      message: 'Agendamento criado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
