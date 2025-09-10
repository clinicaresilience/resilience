import { NextResponse, NextRequest } from "next/server";
import { AgendamentosService } from "@/services/database/agendamentos.service";
import { CompaniesService } from "@/services/database/companies.service";
import { createClient } from "@/lib/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "ID do agendamento não fornecido" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { justificativa } = await req.json().catch(() => ({}));
  if (!justificativa?.trim()) return NextResponse.json({ error: "Justificativa é obrigatória" }, { status: 400 });

  try {
    // Verificar se o usuário tem permissão para cancelar este agendamento
    const agendamentoExistente = await AgendamentosService.getAgendamentoById(id);
    if (!agendamentoExistente) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    // Verificar se o usuário é o paciente ou o profissional do agendamento
    const { data: userData } = await supabase.from("usuarios").select("tipo_usuario").eq("id", user.id).single();
    const isPaciente = userData?.tipo_usuario === "comum" && agendamentoExistente.paciente_id === user.id;
    const isProfissional = userData?.tipo_usuario === "profissional" && agendamentoExistente.profissional_id === user.id;
    const isAdmin = userData?.tipo_usuario === "administrador";

    if (!isPaciente && !isProfissional && !isAdmin) {
      return NextResponse.json({ error: "Não autorizado a cancelar este agendamento" }, { status: 403 });
    }

    // Usar o método cancelAgendamento que libera o slot automaticamente
    const agendamento = await AgendamentosService.cancelAgendamento(id, justificativa);

    return NextResponse.json({
      success: true,
      data: {
        id: agendamento.id,
        status: agendamento.status,
        notas: agendamento.notas,
      },
    });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return NextResponse.json({ 
      error: "Erro ao cancelar agendamento", 
      detail: error instanceof Error ? error.message : "Erro desconhecido" 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: userData } = await supabase.from("usuarios").select("tipo_usuario").eq("id", user.id).single();

    // Buscar agendamentos com dados dos slots para obter duração real
    let query = supabase
      .from('agendamentos')
      .select(`
        *,
        paciente:usuarios!agendamentos_paciente_id_fkey(id, nome, email, telefone),
        profissional:usuarios!agendamentos_profissional_id_fkey(nome)
      `);

    if (userData?.tipo_usuario === "comum") query = query.eq('paciente_id', user.id);
    if (userData?.tipo_usuario === "profissional") query = query.eq('profissional_id', user.id);

    const { data: agendamentos, error: agendamentosError } = await query.order('data_consulta', { ascending: true });

    if (agendamentosError) {
      console.error('Erro ao buscar agendamentos:', agendamentosError);
      throw agendamentosError;
    }

    // Para cada agendamento, buscar o slot correspondente para obter data_hora_fim
    const agendamentosComSlots = await Promise.all(
      (agendamentos || []).map(async (ag) => {
        try {
          const dataConsultaISO = new Date(ag.data_consulta).toISOString();
          
          const { data: slot } = await supabase
            .from('agendamento_slot')
            .select('data_hora_inicio, data_hora_fim')
            .eq('profissional_id', ag.profissional_id)
            .eq('data_hora_inicio', dataConsultaISO)
            .eq('paciente_id', ag.paciente_id)
            .single();

          return {
            id: ag.id,
            usuarioId: ag.paciente_id,
            profissionalId: ag.profissional_id,
            profissionalNome: ag.profissional?.nome || "Profissional",
            especialidade: ag.profissional?.especialidade || "",
            dataISO: ag.data_consulta,
            data_consulta: ag.data_consulta,
            data_hora_inicio: slot?.data_hora_inicio || ag.data_consulta,
            data_hora_fim: slot?.data_hora_fim,
            local: "Clínica Resilience",
            status: ag.status,
            notas: ag.notas,
            modalidade: ag.modalidade,
            pacienteNome: ag.paciente?.nome || "Paciente",
            pacienteEmail: ag.paciente?.email || "",
            pacienteTelefone: ag.paciente?.telefone || "",
            paciente: {
              id: ag.paciente_id,
              nome: ag.paciente?.nome || "Paciente",
              email: ag.paciente?.email || "",
              telefone: ag.paciente?.telefone || "",
            },
            profissional: {
              nome: ag.profissional?.nome || "Profissional",
            },
          };
        } catch (error) {
          console.warn('Erro ao buscar slot para agendamento:', ag.id, error);
          // Retornar agendamento sem dados de slot em caso de erro
          return {
            id: ag.id,
            usuarioId: ag.paciente_id,
            profissionalId: ag.profissional_id,
            profissionalNome: ag.profissional?.nome || "Profissional",
            especialidade: ag.profissional?.especialidade || "",
            dataISO: ag.data_consulta,
            data_consulta: ag.data_consulta,
            local: "Clínica Resilience",
            status: ag.status,
            notas: ag.notas,
            modalidade: ag.modalidade,
            pacienteNome: ag.paciente?.nome || "Paciente",
            pacienteEmail: ag.paciente?.email || "",
            pacienteTelefone: ag.paciente?.telefone || "",
            paciente: {
              id: ag.paciente_id,
              nome: ag.paciente?.nome || "Paciente",
              email: ag.paciente?.email || "",
              telefone: ag.paciente?.telefone || "",
            },
            profissional: {
              nome: ag.profissional?.nome || "Profissional",
            },
          };
        }
      })
    );

    return NextResponse.json({ success: true, data: agendamentosComSlots }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json({ error: "Erro ao buscar agendamentos", detail: error instanceof Error ? error.message : "Erro desconhecido" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { profissional_id, slot_id, data_consulta, modalidade, notas, codigo_empresa } = body || {};

    if (!profissional_id || (!slot_id && !data_consulta)) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes", required: ["profissional_id", "slot_id ou data_consulta"] }, { status: 400 });
    }

    // Validar código da empresa obrigatório
    if (!codigo_empresa?.trim()) {
      return NextResponse.json({ error: "Código da empresa é obrigatório para agendamentos" }, { status: 400 });
    }

    // Verificar se o código da empresa é válido (existe e está ativa)
    const isValidCompanyCode = await CompaniesService.isValidCompanyCode(codigo_empresa.trim());
    if (!isValidCompanyCode) {
      return NextResponse.json({ 
        error: "Código da empresa inválido ou empresa inativa. Verifique com sua empresa o código correto." 
      }, { status: 400 });
    }

    const validModalidade = modalidade || 'presencial';
    if (!['presencial', 'online'].includes(validModalidade)) {
      return NextResponse.json({ error: "Modalidade inválida. Escolha 'presencial' ou 'online'." }, { status: 400 });
    }

    let agendamento;

    if (slot_id) {
      // Agendamento usando slot_id
      const { data: slot, error: slotError } = await supabase
        .from('agendamento_slot')
        .select('*')
        .eq('id', slot_id)
        .eq('profissional_id', profissional_id)
        .eq('status', 'livre')
        .single();

      if (slotError || !slot) return NextResponse.json({ error: "Slot não disponível ou não encontrado" }, { status: 409 });

      // Criar agendamento usando timestamptz do slot
      const dataConsulta = new Date(slot.data_hora_inicio).toISOString();
      agendamento = await AgendamentosService.createAgendamento({
        usuario_id: user.id,
        profissional_id,
        data_consulta: dataConsulta,
        modalidade: validModalidade,
        notas,
      });

    } else {
      // Agendamento usando data_consulta
      const isAvailable = await AgendamentosService.checkAvailability(profissional_id, data_consulta);
      if (!isAvailable) return NextResponse.json({ error: "Horário não disponível" }, { status: 409 });

      agendamento = await AgendamentosService.createAgendamento({
        usuario_id: user.id,
        profissional_id,
        data_consulta,
        modalidade: validModalidade,
        notas,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: agendamento.id,
        usuarioId: agendamento.paciente_id,
        profissionalId: agendamento.profissional_id,
        profissionalNome: agendamento.profissional?.nome || "Profissional",
        especialidade: agendamento.profissional?.especialidade || "",
        dataISO: agendamento.data_consulta,
        status: agendamento.status,
        notas: agendamento.notas,
        modalidade: agendamento.modalidade,
      },
      message: "Agendamento criado com sucesso!"
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    
    // Se for um erro de validação (como o limite de 1 agendamento por dia), retornar com status 400
    if (error instanceof Error) {
      // Verificar se é um erro de validação específico
      const errorMessage = error.message;
      if (errorMessage.includes('já possui um agendamento para o dia') ||
          errorMessage.includes('apenas um agendamento por dia') ||
          errorMessage.includes('não é possível agendar consultas')) {
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Erro ao criar agendamento" 
    }, { status: 500 });
  }
}
