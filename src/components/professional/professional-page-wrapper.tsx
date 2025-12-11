"use client";

import { WelcomeScreen } from "@/components/welcome-screen";
import { useWelcomeScreen } from "@/hooks/useWelcomeScreen";

interface ProfessionalPageWrapperProps {
  children: React.ReactNode;
  usuario: {
    nome: string;
  };
  userEmail: string;
}

export function ProfessionalPageWrapper({ children, usuario, userEmail }: ProfessionalPageWrapperProps) {
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
        userType="profissional"
      />
    </>
  );
}
