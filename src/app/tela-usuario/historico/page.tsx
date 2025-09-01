import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, Clock } from "lucide-react";

export default async function HistoricoPage() {
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

  // se for admin, encaminha pro painel administrativo
  if (usuario.tipo_usuario === "administrador") {
    redirect("/painel-administrativo");
  }

  // se for profissional, encaminha pra tela profissional
  if (usuario.tipo_usuario === "profissional") {
    redirect("/tela-profissional");
  }

  const historicoConsultas = [
    {
      id: 1,
      data: "2024-04-15",
      profissional: "Dr. João Silva",
      tipo: "Consulta de Rotina",
      status: "concluida",
      observacoes: "Paciente apresentou melhora significativa nos sintomas de ansiedade."
    },
    {
      id: 2,
      data: "2024-03-20",
      profissional: "Dr. João Silva",
      tipo: "Primeira Consulta",
      status: "concluida",
      observacoes: "Avaliação inicial. Identificados sintomas de ansiedade generalizada."
    },
    {
      id: 3,
      data: "2024-02-10",
      profissional: "Dra. Maria Santos",
      tipo: "Consulta de Emergência",
      status: "concluida",
      observacoes: "Atendimento de urgência. Paciente estabilizado."
    }
  ];

  return (
    <>
      <div className="mb-4">
        <BackButton href="/tela-usuario" texto="Voltar para Área do Paciente" />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-azul-escuro">Meu Histórico Médico</h1>
        <p className="mt-2 text-lg text-gray-600">
          Visualize seu histórico completo de consultas e tratamentos, {usuario.nome}
        </p>
      </div>

      {/* Resumo do Histórico */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Consultas</p>
                <p className="text-2xl font-bold text-azul-escuro">{historicoConsultas.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Última Consulta</p>
                <p className="text-lg font-bold text-green-600">15/04/2024</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profissionais</p>
                <p className="text-2xl font-bold text-purple-600">2</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista do Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historicoConsultas.map((consulta) => (
              <div key={consulta.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-azul-escuro">{consulta.tipo}</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {consulta.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{consulta.profissional}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(consulta.data).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    {consulta.observacoes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Observações:</strong> {consulta.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {new Date(consulta.data).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {historicoConsultas.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum histórico encontrado</h3>
              <p className="text-gray-600">
                Você ainda não possui consultas registradas em seu histórico.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
