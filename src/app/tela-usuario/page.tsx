import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, User, Clock, FileText, Heart, Phone } from "lucide-react";
import PendingAppointmentResumer from "@/components/user/pending-appointment-resumer";

type Consulta = {
  id: string;
  profissional_nome: string;
  tipo: string;
  data_consulta: string;
};

export default async function TelaUsuario() {
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

  if (error || !usuario) redirect("/auth/login");
  if (usuario.tipo_usuario === "administrador")
    redirect("/painel-administrativo");

  const agoraISO = new Date().toISOString();
  const { data: consultasData } = await supabase
    .from("agendamentos")
    .select("id, data_consulta, status, profissional_id")
    .eq("paciente_id", user.id)
    .eq("status", "confirmado")
    .gte("data_consulta", agoraISO)
    .order("data_consulta", { ascending: true });

  // buscar nomes dos profissionais
  let consultas: Consulta[] = [];
  if (consultasData && consultasData.length > 0) {
    const profIds = Array.from(
      new Set(consultasData.map((c) => c.profissional_id).filter(Boolean))
    );

    const { data: profs } = await supabase
      .from("usuarios")
      .select("id, nome")
      .in("id", profIds)
      .eq("tipo_usuario", "profissional");

    const profMap =
      profs?.reduce<Record<string, string>>((acc, p) => {
        acc[p.id] = p.nome;
        return acc;
      }, {}) || {};

    consultas = consultasData.map((c) => ({
      id: c.id,
      profissional_nome: c.profissional_id
        ? profMap[c.profissional_id]
        : "Profissional",
      tipo: "Consulta",
      data_consulta: c.data_consulta,
    }));
  }

  return (
    <>
      <PendingAppointmentResumer />
      {/* Cabeçalho da Página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-azul-escuro-secundario">
          Área do Paciente
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Bem-vindo, <span className="font-semibold">{usuario.nome}</span>!
          Gerencie seus agendamentos e acompanhe seu cuidado.
        </p>
      </div>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Próxima Consulta</p>
                <p className="text-lg font-semibold">Hoje 14:30</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Consultas Este Mês</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Profissional</p>
                <p className="text-lg font-semibold">Dr. Silva</p>
              </div>
              <User className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Bem-estar</p>
                <p className="text-lg font-semibold">Ótimo</p>
              </div>
              <Heart className="h-8 w-8 text-pink-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Ações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/tela-usuario/agendamentos">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-azul-escuro" />
                <CardTitle className="text-lg">Meus Agendamentos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualize, agende ou cancele suas consultas
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/tela-usuario/perfil">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-azul-escuro" />
                <CardTitle className="text-lg">Meu Perfil</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Atualize suas informações pessoais e de contato
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/tela-usuario/historico">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-azul-escuro" />
                <CardTitle className="text-lg">Histórico Médico</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acesse seu histórico de consultas e tratamentos
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/portal-publico/profissionais">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-azul-escuro" />
                <CardTitle className="text-lg">Nossos Profissionais</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Conheça nossa equipe de profissionais qualificados
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/tela-usuario/contato">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-6 w-6 text-azul-escuro" />
                <CardTitle className="text-lg">Contato</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Entre em contato conosco para dúvidas ou emergências
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/tela-usuario/recursos">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-azul-escuro" />
                <CardTitle className="text-lg">Recursos de Bem-estar</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acesse materiais e dicas para seu bem-estar mental
              </CardDescription>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Próximas Consultas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Próximas Consultas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-48 overflow-y-auto h-full">
              {consultas.length === 0 && (
                <p className="text-gray-600">
                  Você não tem próximas consultas agendadas.
                </p>
              )}
              {consultas.map((c) => {
                const dataObj = new Date(c.data_consulta);
                const hora = dataObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const diaTexto = dataObj.toLocaleDateString();

                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Dr. {c.profissional_nome}</p>
                      <p className="text-sm text-gray-600">{c.tipo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{hora}</p>
                      <p className="text-sm text-gray-600">{diaTexto}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/tela-usuario/agendamentos">
                  Ver Todos os Agendamentos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Dicas de Bem-estar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="font-medium text-blue-800">
                  Respiração Consciente
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Pratique 5 minutos de respiração profunda pela manhã
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="font-medium text-green-800">Exercício Regular</p>
                <p className="text-sm text-green-600 mt-1">
                  Caminhadas de 30 minutos ajudam a reduzir o estresse
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <p className="font-medium text-purple-800">Sono Reparador</p>
                <p className="text-sm text-purple-600 mt-1">
                  Mantenha uma rotina de sono de 7-8 horas por noite
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
