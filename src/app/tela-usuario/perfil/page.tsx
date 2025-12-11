import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // buscar dados do usuário
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("*")
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

  const handleSaveProfile = async (updatedUser: Record<string, string>) => {
    "use server";
    
    // Filtrar campos vazios para evitar erros de validação no banco
    const filteredData: Record<string, string> = {};
    
    Object.entries(updatedUser).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        filteredData[key] = value;
      }
    });

    const supabase = await createClient();
    const { error } = await supabase
      .from("usuarios")
      .update(filteredData)
      .eq("id", user.id);

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw new Error("Erro ao salvar perfil");
    }
  };

  const userWithEmail = {
    ...usuario,
    email: user.email || ""
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <div className="mb-4">
          <BackButton href="/tela-usuario" texto="Voltar para Área do Paciente" />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-azul-escuro-secundario text-center">
            Meu Perfil
          </h1>
          <p className="mt-2 text-lg text-center text-azul-escuro">
            Gerencie suas informações pessoais, {usuario.nome}
          </p>
        </div>

        <EditProfileForm 
          user={userWithEmail} 
          userType="comum" 
          onSave={handleSaveProfile}
        />

        {/* Estatísticas */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Suas Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-gray-600">Total de Consultas</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2</div>
                  <div className="text-sm text-gray-600">Próximas Consultas</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">15/04/24</div>
                  <div className="text-sm text-gray-600">Última Consulta</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
