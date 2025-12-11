import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import Link from "next/link";
import { CompanyDetailsTabs } from "@/components/admin/company-details-tabs";

export default async function CompanyDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Buscar dados do usuário
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("tipo_usuario, nome")
    .eq("id", user.id)
    .single();

  if (error || !usuario) {
    redirect("/auth/login");
  }

  // Verificar se é administrador
  if (usuario.tipo_usuario !== "administrador") {
    if (usuario.tipo_usuario === "profissional") {
      redirect("/tela-profissional");
    } else {
      redirect("/tela-usuario");
    }
  }

  // Buscar dados da empresa
  const { data: empresa, error: empresaError } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", params.id)
    .single();

  if (empresaError || !empresa) {
    redirect("/painel-administrativo/empresas");
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <Link
            href="/painel-administrativo/empresas"
            className="hover:text-azul-escuro"
          >
            Empresas
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{empresa.nome}</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-azul-escuro">{empresa.nome}</h1>
        <p className="mt-2 text-lg text-gray-600">
          Código: <span className="font-mono font-semibold">{empresa.codigo}</span>
        </p>
      </div>

      {/* Tabs Component */}
      <CompanyDetailsTabs empresa={empresa} />
    </div>
  );
}
