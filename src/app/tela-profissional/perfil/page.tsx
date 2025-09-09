import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { BackButton } from "@/components/ui/back-button";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfissionalPerfilPage() {
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

  // verificar se é profissional
  if (usuario.tipo_usuario !== "profissional") {
    redirect("/portal-publico");
  }

  const handleSaveProfile = async (
    updatedUser: Partial<{
      nome?: string;
      telefone?: string;
      data_nascimento?: string;
      endereco?: string;
      bio?: string;
      email?: string;
      avatar_url?: string;
    }>
  ) => {
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
    email: user.email || "",
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8">
        <div className="mb-4">
          <BackButton
            href="/tela-profissional"
            texto="Voltar para Área do Profissional"
          />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-azul-escuro-secundario text-center">
            Perfil do Profissional
          </h1>
          <p className="mt-2 text-lg text-center text-azul-escuro">
            Gerencie suas informações pessoais, {usuario.nome}
          </p>
        </div>

        <EditProfileForm
          user={userWithEmail}
          userType="profissional"
          onSave={handleSaveProfile}
        />
      </div>
    </div>
  );
}
