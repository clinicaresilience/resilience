"use client";

import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  className?: string;
};

export function LogoutButton({ className }: Props) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button className="px-4 py-2 bg-azul-medio" onClick={logout}>
      Logout
    </Button>
  );
}
