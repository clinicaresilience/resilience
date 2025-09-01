import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";

export default async function ContatoPage() {
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

  return (
    <>
      <div className="mb-4">
        <BackButton href="/tela-usuario" texto="Voltar para Área do Paciente" />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-azul-escuro">Entre em Contato</h1>
        <p className="mt-2 text-lg text-gray-600">
          Precisa de ajuda? Entre em contato conosco, {usuario.nome}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Envie uma Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value={usuario.nome} readOnly />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || ""} readOnly />
                </div>
              </div>
              
              <div>
                <Label htmlFor="assunto">Assunto</Label>
                <select id="assunto" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="">Selecione um assunto</option>
                  <option value="agendamento">Agendamento de Consulta</option>
                  <option value="cancelamento">Cancelamento</option>
                  <option value="reagendamento">Reagendamento</option>
                  <option value="duvida">Dúvida Geral</option>
                  <option value="emergencia">Emergência</option>
                  <option value="suporte">Suporte Técnico</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea 
                  id="mensagem" 
                  placeholder="Descreva sua dúvida ou solicitação..."
                  rows={5}
                />
              </div>

              <Button className="w-full flex items-center gap-2">
                <Send className="h-4 w-4" />
                Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-azul-escuro" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-sm text-gray-600">(11) 3456-7890</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-azul-escuro" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">contato@clinicaresilience.com.br</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-azul-escuro" />
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-sm text-gray-600">
                    Rua das Flores, 123<br />
                    Centro - São Paulo, SP<br />
                    CEP: 01234-567
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horário de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Segunda a Sexta</span>
                  <span className="font-medium">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábado</span>
                  <span className="font-medium">08:00 - 12:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <span className="text-red-600">Fechado</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 mb-2">
                  <strong>Em caso de emergência:</strong>
                </p>
                <p className="text-sm text-red-700 mb-2">
                  • Ligue para 192 (SAMU)
                </p>
                <p className="text-sm text-red-700 mb-2">
                  • Ou procure o hospital mais próximo
                </p>
                <p className="text-sm text-red-700">
                  • Plantão 24h: (11) 9999-8888
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Rápido */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-azul-escuro mb-2">Como posso agendar uma consulta?</h4>
              <p className="text-sm text-gray-600">
                Você pode agendar através da área "Agendamentos" no seu painel ou entrando em contato conosco.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-azul-escuro mb-2">Posso cancelar ou reagendar uma consulta?</h4>
              <p className="text-sm text-gray-600">
                Sim, você pode cancelar ou reagendar com até 24 horas de antecedência através do seu painel.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-azul-escuro mb-2">Como funciona a teleconsulta?</h4>
              <p className="text-sm text-gray-600">
                As teleconsultas são realizadas através de videochamada. Você receberá o link por email antes da consulta.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-azul-escuro mb-2">Qual o tempo de resposta para mensagens?</h4>
              <p className="text-sm text-gray-600">
                Respondemos todas as mensagens em até 24 horas durante dias úteis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
