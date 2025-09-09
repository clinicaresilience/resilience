import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await context.params;

  // Buscar profissional
  const { data: profissional, error: profError } = await supabase
    .from("usuarios")
    .select("id, nome, informacoes_adicionais, avatar_url")
    .eq("id", id)
    .eq("tipo_usuario", "profissional")
    .single();

  if (profError || !profissional) {
    return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
  }

  const hoje = new Date().toISOString(); // ISO completo

  // Buscar slots futuros usando novo schema
  const { data: slots, error: slotsError } = await supabase
    .from("agendamento_slot")
    .select("id, data_hora_inicio, data_hora_fim, status, paciente_id")
    .eq("profissional_id", id)
    .gte("data_hora_inicio", hoje) // compara timestamptz diretamente
    .order("data_hora_inicio", { ascending: true });

  if (slotsError) {
    return NextResponse.json({ error: slotsError.message }, { status: 500 });
  }

  // Converter para formato do frontend
  const agendas = (slots || []).map((slot) => {
    const dataHoraInicio = new Date(slot.data_hora_inicio);
    
    // Garantir que as datas são válidas
    if (isNaN(dataHoraInicio.getTime())) {
      console.error('Data inválida para slot:', slot.id, slot.data_hora_inicio);
      return null;
    }
    
    // Extrair data e hora usando UTC para evitar problemas de timezone
    const dataFormatada = dataHoraInicio.toISOString().split("T")[0]; // "2025-09-07"
    const horaFormatada = dataHoraInicio.toISOString().split("T")[1].substring(0, 5); // "08:00"
    
    console.log('Formatando slot:', {
      id: slot.id,
      original: slot.data_hora_inicio,
      dataFormatada,
      horaFormatada
    });
    
    return {
      id: slot.id,
      data: dataFormatada,
      hora: horaFormatada,
      disponivel: slot.status === "livre",
      data_hora_inicio: slot.data_hora_inicio,
      data_hora_fim: slot.data_hora_fim,
      status: slot.status
    };
  }).filter(Boolean); // Remove slots nulos

  return NextResponse.json({
    profissional,
    agendas,
  });
}
