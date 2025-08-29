import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { PainelAdministrativoClient } from "@/components/admin/painel-administrativo-client"

export default async function PainelAdministrativo() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("tipo_usuario, nome")
    .eq("id", user.id)
    .single()

  if (error || !usuario || usuario.tipo_usuario !== "administrador") {
    redirect("/portal-publico")
  }

  return (
    <PainelAdministrativoClient 
      usuario={usuario} 
      userEmail={user.email || ""} 
    />
  )
}
