import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { LogoutButton } from "@/components/logout-button";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const role = user.app_metadata?.role || "user";
  console.log("role ", role);

  if (role !== "administrador") {
    redirect("/portal-publico");
  }

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>
        Bem vindo <span>{user.email}</span> (Administrador)
      </p>
      <LogoutButton />
    </div>
  );
}
