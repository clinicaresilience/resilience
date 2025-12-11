"use client";

import { WelcomeScreen } from "@/components/welcome-screen";
import { useWelcomeScreen } from "@/hooks/useWelcomeScreen";

interface AdminPageWrapperProps {
  children: React.ReactNode;
  usuario: {
    nome: string;
  };
  userEmail: string;
}

export function AdminPageWrapper({ children, usuario, userEmail }: AdminPageWrapperProps) {
  const { showWelcome, hideWelcome, disableWelcomeForever, loading } = useWelcomeScreen();

  // Don't render anything while loading
  if (loading) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <WelcomeScreen
        isOpen={showWelcome}
        onClose={hideWelcome}
        onDisableForever={disableWelcomeForever}
        userName={usuario.nome}
        userType="administrador"
      />
    </>
  );
}
