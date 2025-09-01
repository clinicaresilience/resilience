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
                <p className="text-2xl font-bold">127</p>
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
                <p className="text-2xl font-bold">23</p>
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
                <p className="text-2xl font-bold">92%</p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Avaliação Média</p>
                <p className="text-2xl font-bold">4.8</p>
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Janeiro</span>
                <span className="font-semibold">18 consultas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fevereiro</span>
                <span className="font-semibold">22 consultas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Março</span>
                <span className="font-semibold">25 consultas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Abril</span>
                <span className="font-semibold text-green-600">28 consultas ↗</span>
              </div>
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">09:00 - 10:00</span>
                <span className="font-semibold">15 consultas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">14:00 - 15:00</span>
                <span className="font-semibold">18 consultas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">16:00 - 17:00</span>
                <span className="font-semibold text-green-600">22 consultas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">19:00 - 20:00</span>
                <span className="font-semibold">12 consultas</span>
              </div>
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
              <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
              <div className="text-sm text-gray-600">Taxa de Comparecimento</div>
              <div className="text-xs text-green-600 mt-1">+5% vs mês anterior</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
              <div className="text-sm text-gray-600">Avaliação Média</div>
              <div className="text-xs text-blue-600 mt-1">Excelente desempenho</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">23</div>
              <div className="text-sm text-gray-600">Pacientes Ativos</div>
              <div className="text-xs text-purple-600 mt-1">+3 novos pacientes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
