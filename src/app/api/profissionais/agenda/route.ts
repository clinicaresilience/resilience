import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

// Interface para o slot no novo sistema
interface AgendamentoSlot {
  id?: string;
  profissional_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: 'livre' | 'ocupado' | 'cancelado';
  paciente_id?: string;
  criado_em?: string;
  atualizado_em?: string;
}

// Interface para configuração do dia da semana
interface DiaConfig {
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
}

// Interface para configuração completa
interface ConfiguracaoAgenda {
  dias: DiaConfig[];
  intervalo_minutos: number;
}

/**
 * Gera slots individuais de agendamento para cada data específica
 * com base na configuração do profissional
 */
function generateAgendamentoSlots(
  profissional_id: string,
  dias: DiaConfig[],
  intervaloMinutos: number,
  dataInicio: string,
  dataFim: string
): AgendamentoSlot[] {
  const slots: AgendamentoSlot[] = [];
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  // Iterar através de cada data no período
  for (let data = new Date(inicio); data <= fim; data.setDate(data.getDate() + 1)) {
    const diaSemana = data.getDay(); // 0=domingo, 1=segunda, etc.
    
    // Encontrar configuração para este dia da semana
    const diaConfig = dias.find(d => d.diaSemana === diaSemana);
    if (!diaConfig) continue; // Profissional não atende neste dia

    const { horaInicio, horaFim } = diaConfig;
    const [hStart, mStart] = horaInicio.split(":").map(Number);
    const [hEnd, mEnd] = horaFim.split(":").map(Number);
    const startMinutes = hStart * 60 + mStart;
    const endMinutes = hEnd * 60 + mEnd;

    // Gerar slots para este dia específico
    for (let t = startMinutes; t + intervaloMinutos <= endMinutes; t += intervaloMinutos) {
      const slotHInicio = Math.floor(t / 60).toString().padStart(2, "0");
      const slotMInicio = (t % 60).toString().padStart(2, "0");
      const horaInicioSlot = `${slotHInicio}:${slotMInicio}`;
      
      const tFim = t + intervaloMinutos;
      const slotHFim = Math.floor(tFim / 60).toString().padStart(2, "0");
      const slotMFim = (tFim % 60).toString().padStart(2, "0");
      const horaFimSlot = `${slotHFim}:${slotMFim}`;

      slots.push({
        profissional_id,
        data: data.toISOString().split('T')[0], // YYYY-MM-DD
        hora_inicio: horaInicioSlot,
        hora_fim: horaFimSlot,
        status: 'livre'
      });
    }
  }
  
  return slots;
}

// POST - criar slots de agenda do profissional
export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const { profissional_id, configuracao, periodo } = body;

  if (!profissional_id || !configuracao) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  try {
    // Definir período padrão se não fornecido (próximos 30 dias)
    const dataInicio = periodo?.inicio || new Date().toISOString().split('T')[0];
    const dataFim = periodo?.fim || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Gerar slots com datas específicas
    const slots = generateAgendamentoSlots(
      profissional_id,
      configuracao.dias,
      configuracao.intervalo_minutos,
      dataInicio,
      dataFim
    );

    // Primeiro, remover slots existentes para o período (para evitar duplicatas)
    const { error: deleteError } = await supabase
      .from("agendamento_slot")
      .delete()
      .eq("profissional_id", profissional_id)
      .gte("data", dataInicio)
      .lte("data", dataFim)
      .eq("status", "livre"); // Só remove slots livres

    if (deleteError) {
      console.error("Erro ao limpar slots antigos:", deleteError);
    }

    // Inserir novos slots
    const { data, error } = await supabase
      .from("agendamento_slot")
      .insert(slots)
      .select();

    if (error) {
      console.error("Erro ao criar slots:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Criados ${data.length} slots para o profissional ${profissional_id}`);

    return NextResponse.json({ 
      success: true, 
      slots_criados: data.length,
      periodo: { inicio: dataInicio, fim: dataFim }
    });

  } catch (error) {
    console.error("Erro no POST /api/profissionais/agenda:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// GET - buscar slots do profissional
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const profissionalId = searchParams.get("profissionalId");
  const dataInicio = searchParams.get("dataInicio");
  const dataFim = searchParams.get("dataFim");

  if (!profissionalId) {
    return NextResponse.json({ error: "profissionalId é obrigatório" }, { status: 400 });
  }

  try {
    let query = supabase
      .from("agendamento_slot")
      .select("*")
      .eq("profissional_id", profissionalId);

    // Filtrar por período se fornecido
    if (dataInicio) {
      query = query.gte("data", dataInicio);
    }
    if (dataFim) {
      query = query.lte("data", dataFim);
    }

    const { data, error } = await query.order("data").order("hora_inicio");

    if (error) {
      console.error("Erro ao buscar slots:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Agrupar slots por data para facilitar o uso no frontend
    const slotsPorData = data.reduce((acc: Record<string, AgendamentoSlot[]>, slot) => {
      if (!acc[slot.data]) {
        acc[slot.data] = [];
      }
      acc[slot.data].push(slot);
      return acc;
    }, {});

    return NextResponse.json({
      slots: data,
      slots_por_data: slotsPorData,
      total: data.length
    });

  } catch (error) {
    console.error("Erro no GET /api/profissionais/agenda:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
