import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, FileText, Clock, TrendingUp, AlertCircle } from "lucide-react";

export default async function TelaProfissional() {
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

  return (
    <div className="min-h-screen w-full bg-gray-50 pt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Cabeçalho da Página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-azul-escuro">
            Área do Profissional
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Bem-vindo, <span className="font-semibold">Dr(a). {usuario.nome}</span>! 
            Gerencie suas consultas e acompanhe seus pacientes.
          </p>
        </div>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Consultas Hoje</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Próxima Consulta</p>
                  <p className="text-lg font-semibold">14:30</p>
                </div>
                <Clock className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Pacientes Ativos</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pendentes</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Ações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/tela-profissional/consultas">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-azul-escuro" />
                  <CardTitle className="text-lg">Minhas Consultas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Visualize sua agenda, confirme ou cancele consultas
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/tela-profissional/pacientes">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-azul-escuro" />
                  <CardTitle className="text-lg">Meus Pacientes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Histórico e informações dos pacientes atendidos
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/tela-profissional/prontuarios">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-azul-escuro" />
                  <CardTitle className="text-lg">Prontuários</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Acesse e edite prontuários dos seus pacientes
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/tela-profissional/agenda">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-6 w-6 text-azul-escuro" />
                  <CardTitle className="text-lg">Minha Agenda</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Visualize sua agenda em formato de calendário
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/tela-profissional/estatisticas">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-azul-escuro" />
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Acompanhe suas métricas e desempenho
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/tela-profissional/perfil">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-azul-escuro" />
                  <CardTitle className="text-lg">Meu Perfil</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Atualize suas informações profissionais
                </CardDescription>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Próximas Consultas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Próximas Consultas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Maria Silva Santos</p>
                  <p className="text-sm text-gray-600">Consulta de retorno - Ansiedade</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">14:30</p>
                  <p className="text-sm text-gray-600">Hoje</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">João Carlos Oliveira</p>
                  <p className="text-sm text-gray-600">Primeira consulta</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">16:00</p>
                  <p className="text-sm text-gray-600">Hoje</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Ana Paula Costa</p>
                  <p className="text-sm text-gray-600">Terapia de casal</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">09:00</p>
                  <p className="text-sm text-gray-600">Amanhã</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button asChild className="w-full">
                <Link href="/tela-profissional/consultas">
                  Ver Todas as Consultas
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
