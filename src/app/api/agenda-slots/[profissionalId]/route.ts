import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(
  req: Request,
  context: { params: { profissionalId: string } }
) {
  const supabase = await createClient();
  const { profissionalId } = context.params;
  const { searchParams } = new URL(req.url);
  const dataEspecifica = searchParams.get('data'); // formato: YYYY-MM-DD

  try {
    console.log('=== BUSCANDO SLOTS ===');
    console.log('Profissional ID:', profissionalId);
    console.log('Data específica:', dataEspecifica);

    // Buscar configurações da agenda do profissional
    const { data: configuracoes, error: configError } = await supabase
      .from("agenda_configuracoes")
      .select("dia_semana, hora_inicio, hora_fim, intervalo_minutos")
      .eq("profissional_id", profissionalId);

    if (configError || !configuracoes || configuracoes.length === 0) {
      console.log('Nenhuma configuração encontrada:', configError);
      return NextResponse.json({ slots: [] });
    }

    console.log('Configurações encontradas:', configuracoes);

    // Buscar exceções (dias bloqueados)
    const { data: excecoes, error: excecoesError } = await supabase
      .from("agenda_excecoes")
      .select("data")
      .eq("profissional_id", profissionalId);

    const datasExcecoes = new Set(excecoes?.map(e => e.data) || []);
    console.log('Exceções (dias bloqueados):', Array.from(datasExcecoes));

    // Buscar agendamentos existentes para verificar slots ocupados
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from("agendamentos")
      .select("data_consulta")
      .eq("profissional_id", profissionalId)
      .neq("status", "cancelado");

    const slotsOcupados = new Set(
      agendamentos?.map(ag => {
        const date = new Date(ag.data_consulta);
        const data = date.toISOString().split('T')[0];
        const hora = date.toISOString().split('T')[1].substring(0, 5);
        return `${data}_${hora}`;
      }) || []
    );

    console.log('Slots ocupados:', Array.from(slotsOcupados));

    // Gerar slots dinamicamente
    const slots = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparação correta
    
    const inicioRange = dataEspecifica ? new Date(dataEspecifica) : hoje;
    const fimRange = dataEspecifica ? new Date(dataEspecifica) : new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    for (let d = new Date(inicioRange); d <= fimRange; d.setDate(d.getDate() + 1)) {
      const dataStr = d.toISOString().split('T')[0];
      const diaSemana = d.getDay(); // 0=domingo, 1=segunda, etc.

      // Pular se for data passada
      if (d < hoje) continue;

      // Pular se estiver nas exceções
      if (datasExcecoes.has(dataStr)) continue;

      // Buscar configuração para este dia da semana
      const config = configuracoes.find(c => c.dia_semana === diaSemana);
      if (!config) continue;

      // Gerar horários para este dia
      const horaInicio = config.hora_inicio.split(':');
      const horaFim = config.hora_fim.split(':');
      const intervalo = config.intervalo_minutos;

      const inicioMinutos = parseInt(horaInicio[0]) * 60 + parseInt(horaInicio[1]);
      const fimMinutos = parseInt(horaFim[0]) * 60 + parseInt(horaFim[1]);

      for (let minutos = inicioMinutos; minutos < fimMinutos; minutos += intervalo) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        const horaStr = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        
        const slotKey = `${dataStr}_${horaStr}`;
        const disponivel = !slotsOcupados.has(slotKey);

        slots.push({
          id: `${profissionalId}_${dataStr}_${horaStr}`,
          data: dataStr,
          hora: horaStr,
          disponivel
        });
      }
    }

    console.log(`Slots gerados: ${slots.length}`);
    console.log('Primeiros 5 slots:', slots.slice(0, 5));

    // Filtrar apenas disponíveis se não for data específica
    const slotsDisponiveis = dataEspecifica ? slots : slots.filter(s => s.disponivel);

    return NextResponse.json({ slots: slotsDisponiveis });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao buscar slots:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
