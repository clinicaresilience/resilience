import { NextResponse, NextRequest } from "next/server"
import { AgendamentosService } from "@/services/database/agendamentos.service"
import { createClient } from "@/lib/server"




export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "ID do agendamento não fornecido" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { justificativa } = body;

  if (!justificativa || justificativa.trim().length === 0) {
    return NextResponse.json(
      { error: "Justificativa é obrigatória" },
      { status: 400 }
    );
  }

  const agendamento = await AgendamentosService.updateAgendamentoStatus(id, {
    status: "cancelado",
    notas: justificativa,
  });

  if (!agendamento) {
    return NextResponse.json(
      { error: "Agendamento não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: agendamento.id,
      status: agendamento.status,
      notas: agendamento.notas,
    },
  });
}



// GET /api/agendamentos
// Retorna os agendamentos do usuário logado
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar dados do usuário para determinar o tipo
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single()

    // Definir filtros baseado no tipo de usuário
    const filters: {
      usuario_id?: string;
      profissional_id?: string;
    } = {}

    if (userData?.tipo_usuario === "comum") {
      filters.usuario_id = user.id
    } else if (userData?.tipo_usuario === "profissional") {
      filters.profissional_id = user.id
    }
    // Admins podem ver todos, então não adiciona filtros

    const agendamentos = await AgendamentosService.listAgendamentos(filters)

    // Mapear para o formato esperado pelo frontend
    const formattedAgendamentos = agendamentos.map((ag: any) => ({
      id: ag.id,
      usuarioId: ag.paciente_id,
      profissionalId: ag.profissional_id,
      profissionalNome: ag.profissional?.nome || "Profissional",
      especialidade: ag.profissional?.especialidade || "",
      dataISO: ag.data_consulta,
      local: "Clínica Resilience",
      status: ag.status,
      notas: ag.notas,
      modalidade: ag.modalidade,
      // Dados do paciente para o profissional
      pacienteNome: ag.paciente?.nome || "Paciente",
      pacienteEmail: ag.paciente?.email || "",
      pacienteTelefone: ag.paciente?.telefone || "",
    }))

    return NextResponse.json({
      success: true,
      data: formattedAgendamentos,
    }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Erro ao buscar agendamentos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos", detail: errorMessage },
      { status: 500 }
    )
  }
}

// POST /api/agendamentos
// Cria um agendamento para o usuário logado usando o novo sistema de slots
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { 
      profissional_id, 
      slot_id, 
      data_consulta, 
      modalidade, 
      notas 
    } = body || {};

    // Validar dados obrigatórios - agora aceita tanto slot_id quanto data_consulta para compatibilidade
    if (!profissional_id || (!slot_id && !data_consulta)) {
      return NextResponse.json(
        {
          error: "Campos obrigatórios ausentes",
          required: ["profissional_id", "slot_id ou data_consulta"],
        },
        { status: 400 }
      );
    }

    // Validar modalidade
    const validModalidade = modalidade || 'presencial';
    if (!['presencial', 'online'].includes(validModalidade)) {
      return NextResponse.json(
        { error: "Modalidade inválida. Escolha 'presencial' ou 'online'." },
        { status: 400 }
      );
    }

    let agendamento;

    if (slot_id) {
      // ✅ NOVO MÉTODO: Agendamento usando slot_id específico
      console.log('Criando agendamento com slot_id:', slot_id);
      
      // Verificar se o slot ainda está disponível
      const { data: slot, error: slotError } = await supabase
        .from('agendamento_slot')
        .select('*')
        .eq('id', slot_id)
        .eq('profissional_id', profissional_id)
        .eq('status', 'livre')
        .single();

      if (slotError || !slot) {
        return NextResponse.json(
          { error: "Slot não disponível ou não encontrado" },
          { status: 409 }
        );
      }

      // Criar data_consulta a partir do slot
      const dataConsulta = new Date(`${slot.data}T${slot.hora_inicio}`).toISOString();

      // Criar agendamento usando o AgendamentosService
      agendamento = await AgendamentosService.createAgendamento({
        usuario_id: user.id,
        profissional_id,
        data_consulta: dataConsulta,
        modalidade: validModalidade,
        notas,
      });

    } else {
      // 🔄 MÉTODO ANTIGO: Agendamento usando data_consulta (para compatibilidade)
      console.log('Criando agendamento com data_consulta:', data_consulta);

      // Verificar disponibilidade
      const isAvailable = await AgendamentosService.checkAvailability(
        profissional_id,
        data_consulta
      );

      if (!isAvailable) {
        return NextResponse.json(
          { error: "Horário não disponível" },
          { status: 409 }
        );
      }

      // Criar agendamento
      agendamento = await AgendamentosService.createAgendamento({
        usuario_id: user.id,
        profissional_id,
        data_consulta,
        modalidade: validModalidade,
        notas,
      });
    }

    // Formatar resposta
    const formattedAgendamento = {
      id: agendamento.id,
      usuarioId: agendamento.paciente_id,
      profissionalId: agendamento.profissional_id,
      profissionalNome: agendamento.profissional?.nome || "Profissional",
      especialidade: agendamento.profissional?.especialidade || "",
      dataISO: agendamento.data_consulta,
      status: agendamento.status,
      notas: agendamento.notas,
      modalidade: agendamento.modalidade,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedAgendamento,
        message: "Agendamento criado com sucesso!"
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento", detail: errorMessage },
      { status: 500 }
    );
  }
}
