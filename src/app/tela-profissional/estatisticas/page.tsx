import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Calendar, Clock, Target, Award } from "lucide-react";

export default async function EstatisticasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // buscar dados do usuário
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("tipo_usuario, nome")
    .eq("id", user.id)
    .single();

  if (error || !usuario) {
    redirect("/auth/login");
  }

  // Verificar se é profissional
  if (usuario.tipo_usuario !== "profissional") {
    if (usuario.tipo_usuario === "administrador") {
      redirect("/painel-administrativo");
    } else {
      redirect("/tela-usuario");
    }
  }

  // Buscar estatísticas reais do banco de dados
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioAno = new Date(agora.getFullYear(), 0, 1);

  // Total de consultas do profissional
  const { data: totalConsultas } = await supabase
    .from("consultas")
    .select("id", { count: "exact" })
    .eq("profissional_id", user.id);

  // Pacientes únicos ativos (com consultas nos últimos 6 meses)
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
  
  const { data: pacientesAtivos } = await supabase
    .from("consultas")
    .select("paciente_id")
    .eq("profissional_id", user.id)
    .gte("data_hora", seisMesesAtras.toISOString());

  const pacientesUnicos = new Set(pacientesAtivos?.map(c => c.paciente_id) || []).size;

  // Consultas por status para calcular taxa de comparecimento
  const { data: consultasStatus } = await supabase
    .from("consultas")
    .select("status_consulta")
    .eq("profissional_id", user.id);

  const totalConsultasCount = consultasStatus?.length || 0;
  const consultasConcluidas = consultasStatus?.filter(c => c.status_consulta === "concluido").length || 0;
  const taxaComparecimento = totalConsultasCount > 0 ? Math.round((consultasConcluidas / totalConsultasCount) * 100) : 0;

  // Consultas por mês (últimos 4 meses)
  const consultasPorMes: { mes: string; count: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const mesAtual = new Date();
    mesAtual.setMonth(mesAtual.getMonth() - i);
    const inicioMesAtual = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const fimMesAtual = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);

    const { data: consultasMes } = await supabase
      .from("consultas")
      .select("id", { count: "exact" })
      .eq("profissional_id", user.id)
      .gte("data_hora", inicioMesAtual.toISOString())
      .lte("data_hora", fimMesAtual.toISOString());

    consultasPorMes.push({
      mes: mesAtual.toLocaleDateString('pt-BR', { month: 'long' }),
      count: consultasMes?.length || 0
    });
  }

  // Horários mais procurados
  const { data: consultasHorarios } = await supabase
    .from("consultas")
    .select("data_hora")
    .eq("profissional_id", user.id);

  const horariosCounts: { [key: string]: number } = {};
  consultasHorarios?.forEach(consulta => {
    const hora = new Date(consulta.data_hora).getHours();
    const faixaHorario = `${hora.toString().padStart(2, '0')}:00 - ${(hora + 1).toString().padStart(2, '0')}:00`;
    horariosCounts[faixaHorario] = (horariosCounts[faixaHorario] || 0) + 1;
  });

  const horariosOrdenados = Object.entries(horariosCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4);

  // Prontuários com PDF
  const { data: prontuarios } = await supabase
    .from("consultas")
    .select("prontuario")
    .eq("profissional_id", user.id)
    .not("prontuario", "is", null);

  const totalProntuarios = prontuarios?.length || 0;

  // Calcular taxa de comparecimento do mês anterior para comparação
  const mesPassado = new Date();
  mesPassado.setMonth(mesPassado.getMonth() - 1);
  const inicioMesPassado = new Date(mesPassado.getFullYear(), mesPassado.getMonth(), 1);
  const fimMesPassado = new Date(mesPassado.getFullYear(), mesPassado.getMonth() + 1, 0);

  const { data: consultasMesPassado } = await supabase
    .from("consultas")
    .select("status_consulta")
    .eq("profissional_id", user.id)
    .gte("data_hora", inicioMesPassado.toISOString())
    .lte("data_hora", fimMesPassado.toISOString());

  const totalMesPassado = consultasMesPassado?.length || 0;
  const concluidasMesPassado = consultasMesPassado?.filter(c => c.status_consulta === "concluido").length || 0;
  const taxaMesPassado = totalMesPassado > 0 ? Math.round((concluidasMesPassado / totalMesPassado) * 100) : 0;
  const diferencaTaxa = taxaComparecimento - taxaMesPassado;

  // Calcular novos pacientes (primeiras consultas nos últimos 30 dias)
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const { data: consultasRecentes } = await supabase
    .from("consultas")
    .select("paciente_id")
    .eq("profissional_id", user.id)
    .gte("data_hora", trintaDiasAtras.toISOString());

  const { data: todasConsultas } = await supabase
    .from("consultas")
    .select("paciente_id, data_hora")
    .eq("profissional_id", user.id)
    .order("data_hora", { ascending: true });

  // Identificar novos pacientes (primeira consulta nos últimos 30 dias)
  const novosPacientes = new Set<string>();
  const pacientesRecentes = new Set(consultasRecentes?.map(c => c.paciente_id) || []);

  pacientesRecentes.forEach(pacienteId => {
    const primeiraConsulta = todasConsultas?.find(c => c.paciente_id === pacienteId);
    if (primeiraConsulta && new Date(primeiraConsulta.data_hora) >= trintaDiasAtras) {
      novosPacientes.add(pacienteId);
    }
  });

  const totalNovosPacientes = novosPacientes.size;

  return (
    <>
      <div className="mb-4">
        <BackButton href="/tela-profissional" texto="Voltar para Área do Profissional" />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-azul-escuro">Minhas Estatísticas</h1>
        <p className="mt-2 text-lg text-gray-600">
          Acompanhe suas métricas e desempenho, Dr(a). {usuario.nome}
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Consultas</p>
                <p className="text-2xl font-bold">{totalConsultasCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Pacientes Ativos</p>
                <p className="text-2xl font-bold">{pacientesUnicos}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Taxa de Comparecimento</p>
                <p className="text-2xl font-bold">{taxaComparecimento}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Prontuários PDF</p>
                <p className="text-2xl font-bold">{totalProntuarios}</p>
              </div>
              <Award className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Desempenho Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consultasPorMes.map((mes, index) => (
                <div key={mes.mes} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{mes.mes}</span>
                  <span className={`font-semibold ${index === consultasPorMes.length - 1 ? 'text-green-600' : ''}`}>
                    {mes.count} consulta{mes.count !== 1 ? 's' : ''}
                    {index === consultasPorMes.length - 1 && mes.count > 0 ? ' ↗' : ''}
                  </span>
                </div>
              ))}
              {consultasPorMes.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  Nenhuma consulta encontrada nos últimos meses
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários Mais Procurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {horariosOrdenados.length > 0 ? (
                horariosOrdenados.map(([horario, count], index) => (
                  <div key={horario} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{horario}</span>
                    <span className={`font-semibold ${index === 0 ? 'text-green-600' : ''}`}>
                      {count} consulta{count !== 1 ? 's' : ''}
                      {index === 0 && count > 0 ? ' 🏆' : ''}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Nenhum horário com consultas encontrado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Resumo de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{taxaComparecimento}%</div>
              <div className="text-sm text-gray-600">Taxa de Comparecimento</div>
              <div className={`text-xs mt-1 ${diferencaTaxa >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {diferencaTaxa >= 0 ? '+' : ''}{diferencaTaxa}% vs mês anterior
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalProntuarios}</div>
              <div className="text-sm text-gray-600">Prontuários Criados</div>
              <div className="text-xs text-blue-600 mt-1">
                {totalConsultasCount > 0 ? Math.round((totalProntuarios / totalConsultasCount) * 100) : 0}% das consultas
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{pacientesUnicos}</div>
              <div className="text-sm text-gray-600">Pacientes Ativos</div>
              <div className="text-xs text-purple-600 mt-1">
                {totalNovosPacientes > 0 ? `+${totalNovosPacientes} novos pacientes` : 'Nenhum novo paciente'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
