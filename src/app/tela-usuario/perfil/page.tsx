import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react";

export default async function PerfilPage() {
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
        <h1 className="text-2xl font-bold text-azul-escuro">Meu Perfil</h1>
        <p className="mt-2 text-lg text-gray-600">
          Gerencie suas informações pessoais, {usuario.nome}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Pessoais */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" value={usuario.nome} readOnly />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || ""} readOnly />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <Label htmlFor="nascimento">Data de Nascimento</Label>
                  <Input id="nascimento" type="date" />
                </div>
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" placeholder="Rua, número, bairro, cidade" />
              </div>

              <div className="flex gap-2">
                <Button className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Salvar Alterações
                </Button>
                <Button variant="outline">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo da Conta */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Paciente</p>
                  <p className="text-sm text-blue-700">Conta ativa</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Membro desde Janeiro 2024</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>Telefone não informado</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Suas Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Consultas</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Próximas Consultas</span>
                  <span className="font-semibold text-green-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Última Consulta</span>
                  <span className="font-semibold">15/04/2024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
