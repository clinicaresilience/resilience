"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { ROUTES } from "@/config/routes";

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
    <Button className="px-4 py-2 bg-azul-medio" onClick={logout}>
      Logout
    </Button>
  );
}
