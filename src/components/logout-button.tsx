"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { ROUTES } from "@/config/routes";
import { LogOut } from "lucide-react";

type Props = {
  className?: string;
};

export function LogoutButton({ className }: Props) {
  const router = useRouter();
  const { signOut } = useAuth();

  const logout = async () => {
    await signOut();
    router.push(ROUTES.auth.login);
  };

  return (
    <Button className={`py-2 bg-azul-medio flex items-center justify-center ${className}`} onClick={logout}>
      <LogOut className="w-4 h-4" />
    </Button>
  );
}
