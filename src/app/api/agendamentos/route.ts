import { NextResponse, NextRequest } from "next/server";
import { AgendamentosService } from "@/services/database/agendamentos.service";
import { CompaniesService } from "@/services/database/companies.service";
import { createClient } from "@/lib/server";
import { TimezoneUtils } from "@/utils/timezone";
import { EmailService } from "@/services/email/email.service";

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

    // Enviar notificação por email após cancelamento bem-sucedido
    try {
      const dadosEmail = await EmailService.buscarDadosAgendamento(id);
      if (dadosEmail) {
        // Adicionar justificativa ao objeto de dados
        dadosEmail.justificativa_cancelamento = justificativa;
        await EmailService.enviarNotificacaoCancelamento(dadosEmail);
      } else {
        console.warn('Não foi possível buscar dados do agendamento para envio de email:', id);
      }
    } catch (emailError) {
      console.error('Erro ao enviar notificações de cancelamento:', emailError);
      // Não falhar o cancelamento por erro de email
    }

    return NextResponse.json({
      success: true,
      data: {
        id: agendamento.id,
        status: agendamento.status,
        notas: agendamento.notas,
      },
    });
  } catch (error: unknown) {
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
          const dataConsultaUTC = TimezoneUtils.dbTimestampToUTC(ag.data_consulta);
          
          const { data: slot } = await supabase
            .from('agendamento_slot')
            .select('data_hora_inicio, data_hora_fim')
            .eq('profissional_id', ag.profissional_id)
            .eq('data_hora_inicio', dataConsultaUTC)
            .eq('paciente_id', ag.paciente_id)
            .single();

          const dataConsultaFormatted = TimezoneUtils.formatForDisplay(dataConsultaUTC);
          
          return {
            id: ag.id,
            usuarioId: ag.paciente_id,
            profissionalId: ag.profissional_id,
            profissionalNome: ag.profissional?.nome || "Profissional",
            especialidade: ag.profissional?.especialidade || "",
            dataISO: dataConsultaUTC,
            data_consulta: dataConsultaUTC,
            data_hora_inicio: slot?.data_hora_inicio ? TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio) : dataConsultaUTC,
            data_hora_fim: slot?.data_hora_fim ? TimezoneUtils.dbTimestampToUTC(slot.data_hora_fim) : undefined,
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
            // Adicionar campos formatados para exibição
            dataFormatada: dataConsultaFormatted,
            horaFormatada: TimezoneUtils.formatForDisplay(dataConsultaUTC, undefined, 'time'),
          };
        } catch (error: unknown) {
          console.warn('Erro ao buscar slot para agendamento:', ag.id, error);
          // Retornar agendamento sem dados de slot em caso de erro
          const dataConsultaUTC = TimezoneUtils.dbTimestampToUTC(ag.data_consulta);
          const dataConsultaFormatted = TimezoneUtils.formatForDisplay(dataConsultaUTC);
          
          return {
            id: ag.id,
            usuarioId: ag.paciente_id,
            profissionalId: ag.profissional_id,
            profissionalNome: ag.profissional?.nome || "Profissional",
            especialidade: ag.profissional?.especialidade || "",
            dataISO: dataConsultaUTC,
            data_consulta: dataConsultaUTC,
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
            // Adicionar campos formatados para exibição
            dataFormatada: dataConsultaFormatted,
            horaFormatada: TimezoneUtils.formatForDisplay(dataConsultaUTC, undefined, 'time'),
          };
        }
      })
    );

    return NextResponse.json({ success: true, data: agendamentosComSlots }, { status: 200 });
  } catch (error: unknown) {
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

    // NOVA LÓGICA: Verificar se é primeiro agendamento ou validar profissional padrão
    const { data: relacaoExistente } = await supabase
      .from('paciente_profissional')
      .select('profissional_id')
      .eq('paciente_id', user.id)
      .eq('ativo', true)
      .single();

    if (relacaoExistente) {
      // Paciente já tem profissional padrão - validar se está tentando agendar com o mesmo
      if (relacaoExistente.profissional_id !== profissional_id) {
        return NextResponse.json({ 
          error: "Você só pode agendar consultas com seu profissional atual. Para mudança de profissional, entre em contato com a administração." 
        }, { status: 403 });
      }
    } else {
      // Verificar se paciente tem prontuário existente (caso foi transferido mas ainda não tem relação ativa)
      const { data: prontuarioExistente } = await supabase
        .from('prontuarios')
        .select('profissional_atual_id')
        .eq('paciente_id', user.id)
        .single();

      if (prontuarioExistente) {
        // Paciente tem prontuário - validar se está agendando com profissional atual do prontuário
        if (prontuarioExistente.profissional_atual_id !== profissional_id) {
          return NextResponse.json({ 
            error: "Você só pode agendar consultas com seu profissional atual. Para mudança de profissional, entre em contato com a administração." 
          }, { status: 403 });
        }
        
        // Criar relação na tabela paciente_profissional para sincronizar
        console.log(`Criando relação para paciente transferido ${user.id} com profissional: ${profissional_id}`);
        
        const { error: criarRelacaoError } = await supabase
          .from('paciente_profissional')
          .insert({
            paciente_id: user.id,
            profissional_id: profissional_id,
            ativo: true
          });

        if (criarRelacaoError) {
          console.error('Erro ao criar relação para paciente transferido:', criarRelacaoError);
          // Não falhar - continuar com agendamento mesmo se relação não for criada
        }
      } else {
        // PRIMEIRO AGENDAMENTO - Criar relação na tabela paciente_profissional
        console.log(`Primeiro agendamento do paciente ${user.id} - definindo profissional padrão: ${profissional_id}`);
        
        const { error: criarRelacaoError } = await supabase
          .from('paciente_profissional')
          .insert({
            paciente_id: user.id,
            profissional_id: profissional_id,
            ativo: true
          });

        if (criarRelacaoError) {
          console.error('Erro ao criar relação paciente-profissional:', criarRelacaoError);
          return NextResponse.json({ 
            error: "Erro ao definir profissional padrão" 
          }, { status: 500 });
        }
      }
    }

    const validModalidade = modalidade || 'presencial';
    if (!['presencial', 'online'].includes(validModalidade)) {
      return NextResponse.json({ error: "Modalidade inválida. Escolha 'presencial' ou 'online'." }, { status: 400 });
    }

    // NOVA VALIDAÇÃO: Verificar designação presencial vs modalidade solicitada
    const dataConsultaFormatted = data_consulta ? 
      (data_consulta.includes('T') ? TimezoneUtils.extractDate(TimezoneUtils.dbTimestampToUTC(data_consulta)) : data_consulta.split('T')[0]) :
      (slot_id ? null : null);

    if (dataConsultaFormatted || slot_id) {
      let dataParaVerificar = dataConsultaFormatted;
      
      // Se usando slot_id, buscar a data do slot
      if (slot_id && !dataParaVerificar) {
        const { data: slotInfo } = await supabase
          .from('agendamento_slot')
          .select('data_hora_inicio')
          .eq('id', slot_id)
          .single();
        
        if (slotInfo) {
          dataParaVerificar = TimezoneUtils.extractDate(TimezoneUtils.dbTimestampToUTC(slotInfo.data_hora_inicio));
        }
      }

      if (dataParaVerificar) {
        // Verificar se há designação presencial para esta data
        const { data: designacaoPresencial } = await supabase
          .from('profissional_presencial')
          .select('id')
          .eq('profissional_id', profissional_id)
          .eq('data_presencial', dataParaVerificar)
          .single();

        const temDesignacaoPresencial = !!designacaoPresencial;

        // Aplicar regras de exclusividade
        if (temDesignacaoPresencial && validModalidade === 'online') {
          return NextResponse.json({ 
            error: "Este profissional está designado para atendimento presencial nesta data. Agendamentos online não são permitidos." 
          }, { status: 400 });
        }

        if (!temDesignacaoPresencial && validModalidade === 'presencial') {
          return NextResponse.json({ 
            error: "Este profissional não está designado para atendimento presencial nesta data. Apenas agendamentos online são permitidos." 
          }, { status: 400 });
        }
      }
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

      // Criar agendamento usando timestamptz do slot convertido para UTC
      const dataConsultaUTC = TimezoneUtils.dbTimestampToUTC(slot.data_hora_inicio);
      agendamento = await AgendamentosService.createAgendamento({
        usuario_id: user.id,
        profissional_id,
        data_consulta: dataConsultaUTC,
        modalidade: validModalidade,
        notas,
      });

    } else {
      // Agendamento usando data_consulta - garantir que está em UTC
      let dataConsultaUTC: string;
      
      // Se data_consulta contém informação de timezone, converter para UTC
      if (data_consulta.includes('T') && (data_consulta.includes('+') || data_consulta.includes('-') || data_consulta.includes('Z'))) {
        dataConsultaUTC = TimezoneUtils.dbTimestampToUTC(data_consulta);
      } else {
        // Se não tem timezone, assumir que é horário local do Brasil
        dataConsultaUTC = TimezoneUtils.toUTC(data_consulta);
      }
      
      const isAvailable = await AgendamentosService.checkAvailability(profissional_id, dataConsultaUTC);
      if (!isAvailable) return NextResponse.json({ error: "Horário não disponível" }, { status: 409 });

      agendamento = await AgendamentosService.createAgendamento({
        usuario_id: user.id,
        profissional_id,
        data_consulta: dataConsultaUTC,
        modalidade: validModalidade,
        notas,
      });
    }

    const dataConsultaUTC = TimezoneUtils.dbTimestampToUTC(agendamento.data_consulta);
    
    // Enviar notificação por email após criação bem-sucedida
    try {
      const dadosEmail = await EmailService.buscarDadosAgendamento(agendamento.id);
      if (dadosEmail) {
        await EmailService.enviarNotificacaoCriacao(dadosEmail);
      } else {
        console.warn('Não foi possível buscar dados do agendamento para envio de email:', agendamento.id);
      }
    } catch (emailError: unknown) {
      console.error('Erro ao enviar notificações de email:', emailError);
      // Não falhar o agendamento por erro de email
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: agendamento.id,
        usuarioId: agendamento.paciente_id,
        profissionalId: agendamento.profissional_id,
        profissionalNome: agendamento.profissional?.nome || "Profissional",
        especialidade: agendamento.profissional?.especialidade || "",
        dataISO: dataConsultaUTC,
        status: agendamento.status,
        notas: agendamento.notas,
        modalidade: agendamento.modalidade,
        // Campos formatados para exibição
        dataFormatada: TimezoneUtils.formatForDisplay(dataConsultaUTC),
        horaFormatada: TimezoneUtils.formatForDisplay(dataConsultaUTC, undefined, 'time'),
      },
      message: "Agendamento criado com sucesso!"
    }, { status: 201 });
  } catch (error: unknown) {
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
