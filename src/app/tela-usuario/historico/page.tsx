"use client";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, Clock } from "lucide-react";
import { useEffect, useState } from "react";

type Consulta = {
  id: string;
  profissional_nome: string;
  data_consulta: string;
  modalidade?: string;
  status?: string;
};

export default function HistoricoPage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [usuario, setUsuario] = useState<string>("");

  useEffect(() => {
    async function fetchHistorico() {
      const res = await fetch("/api/agendamentos/passados");
      const data = await res.json();
      if (data.success) {
        setConsultas(data.data);
        setUsuario(data.usuario);
      }
    }
    fetchHistorico();
  }, []);

  return (
    <>
      <div className="mb-4">
        <BackButton href="/tela-usuario" texto="Voltar para Área do Paciente" />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-azul-escuro">
          Meu Histórico Médico
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Visualize seu histórico completo de consultas e tratamentos, {usuario}
        </p>
      </div>

      {/* Resumo do Histórico */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Consultas</p>
                <p className="text-2xl font-bold text-azul-escuro">
                  {consultas.length}
                </p>
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
                <p className="text-lg font-bold text-green-600">
                  {consultas[0]
                    ? new Date(consultas[0].data_consulta).toLocaleDateString(
                        "pt-BR"
                      )
                    : "-"}
                </p>
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
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(consultas.map((c) => c.profissional_nome)).size}
                </p>
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
            {consultas.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum histórico encontrado
                </h3>
                <p className="text-gray-600">
                  Você ainda não possui consultas registradas em seu histórico.
                </p>
              </div>
            )}

            {consultas.map((consulta) => (
              <div
                key={consulta.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-azul-escuro">
                        {consulta.modalidade || "Consulta"}
                      </h3>
                      <Badge className="bg-green-100 text-green-800">
                        {consulta.status === 'concluido' ? 'Concluída' : consulta.status}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{consulta.profissional_nome}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(consulta.data_consulta).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {new Date(consulta.data_consulta).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
