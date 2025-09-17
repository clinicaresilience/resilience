import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import Link from "next/link";
import { ProfessionalPageWrapper } from "@/components/professional/professional-page-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Users,
  Clock,
  AlertCircle,
  Building2,
} from "lucide-react";
import PrimeiroAcessoModal from "./primeiro-acesso";

export default async function TelaProfissional() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Buscar dados do usuário
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("tipo_usuario, nome, primeiro_acesso")
    .eq("id", user.id)
    .single();

  if (error || !usuario) redirect("/auth/login");

  // Redirecionar se não for profissional
  if (usuario.tipo_usuario !== "profissional") {
    if (usuario.tipo_usuario === "administrador") redirect("/painel-administrativo");
    else redirect("/tela-usuario");
  }

  const tz = "America/Sao_Paulo"; // fuso horário local

  // Datas auxiliares
  const hoje = new Date();
  const inicioHoje = new Date(hoje.toLocaleDateString("en-US", { timeZone: tz }));
  const fimHoje = new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000);
  const amanha = new Date(fimHoje.getTime());
  
  // Consultas de hoje
  const { data: consultasHoje } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("profissional_id", user.id)
    .gte("data_consulta", inicioHoje.toISOString())
    .lt("data_consulta", fimHoje.toISOString());

  const totalConsultasHoje = consultasHoje?.length || 0;

  // Próxima consulta confirmada
  const { data: proximaConsulta } = await supabase
    .from("agendamentos")
    .select(`
      data_consulta,
      paciente:usuarios!agendamentos_paciente_id_fkey(nome)
    `)
    .eq("profissional_id", user.id)
    .eq("status", "confirmado")
    .gte("data_consulta", new Date().toISOString())
    .order("data_consulta", { ascending: true })
    .limit(1)
    .maybeSingle();

  const proximaConsultaHorario = proximaConsulta
    ? new Date(proximaConsulta.data_consulta).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: tz,
      })
    : null;

  // Pacientes ativos últimos 6 meses
  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
  const { data: pacientesAtivos } = await supabase
    .from("agendamentos")
    .select("paciente_id")
    .eq("profissional_id", user.id)
    .gte("data_consulta", seisMesesAtras.toISOString());
  const totalPacientesAtivos = new Set(pacientesAtivos?.map(c => c.paciente_id) || []).size;

  // Consultas pendentes
  const { data: consultasPendentes } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("profissional_id", user.id)
    .in("status", ["pendente", "confirmado"])
    .gte("data_consulta", new Date().toISOString());
  const totalPendentes = consultasPendentes?.length || 0;

  // Próximas consultas (30 dias) - expandido para mostrar mais consultas
  const proximosTrintaDiasConsultas = new Date();
  proximosTrintaDiasConsultas.setDate(proximosTrintaDiasConsultas.getDate() + 30);
  const { data: proximasConsultas } = await supabase
    .from("agendamentos")
    .select(`
      id,
      data_consulta,
      status,
      notas,
      paciente:usuarios!agendamentos_paciente_id_fkey(nome)
    `)
    .eq("profissional_id", user.id)
    .in("status", ["confirmado", "pendente"])
    .gte("data_consulta", new Date().toISOString())
    .lt("data_consulta", proximosTrintaDiasConsultas.toISOString())
    .order("data_consulta", { ascending: true });

  // Buscar designações presenciais ativas (próximos 30 dias)
  const proximosTrintaDias = new Date();
  proximosTrintaDias.setDate(proximosTrintaDias.getDate() + 30);
  const { data: designacoesPresenciais } = await supabase
    .from("profissional_presencial")
    .select("data_presencial, hora_inicio, hora_fim")
    .eq("profissional_id", user.id)
    .gte("data_presencial", hoje.toISOString().split('T')[0])
    .lte("data_presencial", proximosTrintaDias.toISOString().split('T')[0])
    .order("data_presencial", { ascending: true });

  // Função auxiliar para formatar datas
  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr);
    const dataLocal = data.toLocaleDateString("pt-BR", { timeZone: tz });
    const horario = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: tz });

    const hojeStr = hoje.toLocaleDateString("pt-BR", { timeZone: tz });
    const amanhaStr = amanha.toLocaleDateString("pt-BR", { timeZone: tz });

    let texto = "";
    if (dataLocal === hojeStr) texto = "Hoje";
    else if (dataLocal === amanhaStr) texto = "Amanhã";
    else texto = dataLocal;

    return { horario, texto };
  };

  return (
    <ProfessionalPageWrapper usuario={usuario} userEmail={user.email || ""}>
      <div>
        <PrimeiroAcessoModal
          primeiroAcesso={usuario.primeiro_acesso}
          userId={user.id}
          userEmail={user.email!}
        />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-azul-escuro">Área do Profissional</h1>
        <p className="mt-2 text-lg text-gray-600">
          Bem-vindo, <span className="font-semibold">Dr(a). {usuario.nome}</span>! Gerencie suas consultas e acompanhe seus pacientes.
        </p>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm">Consultas Hoje</p>
              <p className="text-2xl font-bold">{totalConsultasHoje}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-green-100 text-sm">Próxima Consulta</p>
              <p className="text-lg font-semibold">{proximaConsultaHorario || "Nenhuma"}</p>
            </div>
            <Clock className="h-8 w-8 text-green-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-purple-100 text-sm">Pacientes Ativos</p>
              <p className="text-2xl font-bold">{totalPacientesAtivos}</p>
            </div>
            <Users className="h-8 w-8 text-purple-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-orange-100 text-sm">Pendentes</p>
              <p className="text-2xl font-bold">{totalPendentes}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-200" />
          </CardContent>
        </Card>
      </div>

      {/* Designações Presenciais */}
      {designacoesPresenciais && designacoesPresenciais.length > 0 && (
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Building2 className="h-5 w-5" />
              <span>Atendimento Presencial</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-blue-700 mb-4">
                Você tem {designacoesPresenciais.length} designação(ões) para atendimento presencial:
              </p>
              {designacoesPresenciais.map((designacao, index) => {
                // Formatação segura de data
                const dataStr = designacao.data_presencial;
                let dataFormatada = 'Data inválida';
                let textoData = 'Data inválida';
                
                try {
                  // Parse da data do banco (formato: "2025-09-18 00:00:00+00")
                  const dataDesignacao = new Date(dataStr);
                  
                  if (!isNaN(dataDesignacao.getTime())) {
                    // Formatar usando UTC para evitar problemas de timezone
                    const ano = dataDesignacao.getUTCFullYear();
                    const mes = String(dataDesignacao.getUTCMonth() + 1).padStart(2, '0');
                    const dia = String(dataDesignacao.getUTCDate()).padStart(2, '0');
                    dataFormatada = `${dia}/${mes}/${ano}`;
                    
                    // Comparar com data de hoje em UTC
                    const hoje = new Date();
                    const hojeUTC = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
                    const designacaoUTC = new Date(ano, dataDesignacao.getUTCMonth(), dataDesignacao.getUTCDate());
                    const amanhaUTC = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
                    
                    textoData = dataFormatada;
                    if (designacaoUTC.getTime() === hojeUTC.getTime()) {
                      textoData = `Hoje (${dataFormatada})`;
                    } else if (designacaoUTC.getTime() === amanhaUTC.getTime()) {
                      textoData = `Amanhã (${dataFormatada})`;
                    }
                  }
                } catch (error) {
                  console.error('Erro ao formatar data:', error, 'Data recebida:', dataStr);
                }

                const horarioTexto = designacao.hora_inicio && designacao.hora_fim 
                  ? `${designacao.hora_inicio.substring(0, 5)} às ${designacao.hora_fim.substring(0, 5)}`
                  : 'Dia inteiro';

                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">{textoData}</p>
                      <p className="text-sm text-blue-700">{horarioTexto}</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        <Building2 className="h-3 w-3 mr-1" />
                        Presencial
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> Durante os dias de atendimento presencial, você não poderá criar agenda online. 
                  Entre em contato com o administrador se precisar fazer alterações.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximas consultas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Próximas Consultas (30 dias)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proximasConsultas && proximasConsultas.length > 0 ? (
              proximasConsultas.map((consulta: any) => {
                const { horario, texto } = formatarData(consulta.data_consulta);
                const nomePaciente = consulta.paciente?.nome || "Paciente não identificado";

                return (
                  <div key={consulta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{nomePaciente}</p>
                      <p className="text-sm text-gray-600">{consulta.notas || "Consulta agendada"}</p>
                      <p className="text-xs text-blue-600">Status: {consulta.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{horario}</p>
                      <p className="text-sm text-gray-600">{texto}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhuma consulta agendada</p>
                <p className="text-sm">Você não tem consultas nos próximos 30 dias</p>
                <p className="text-xs text-gray-400 mt-2">
                  Mostrando consultas confirmadas e pendentes
                </p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button asChild className="w-full">
              <Link href="/tela-profissional/consultas">Ver Todas as Consultas</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </ProfessionalPageWrapper>
  );
}
