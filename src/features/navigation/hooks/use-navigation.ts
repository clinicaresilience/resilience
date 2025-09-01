"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import type { Role } from "@/features/auth/types";
import { NAV_BY_ROLE, type NavItem } from "@/features/navigation/config";
import { ROUTES } from "@/config/routes";

/**
 * Define quais rotas são consideradas raiz para não ativar pelo startsWith
 * Ex.: quando estiver em /tela-profissional/consultas não marcar /tela-profissional como ativo.
 */
const ROOT_ROUTES = new Set<string>([
  ROUTES.professional.root,
  ROUTES.user.root,
  ROUTES.admin.root,
]);

type UseNavigationResult = {
  navItems: NavItem[];
  isActive: (href: string) => boolean;
};

export function useNavigation(role: Role | null | undefined): UseNavigationResult {
  const pathname = usePathname();

  const navItems = useMemo<NavItem[]>(() => {
    if (!role) return [];
    return NAV_BY_ROLE[role] ?? [];
  }, [role]);

  const isActive = useMemo(() => {
    return (href: string) => {
      if (!href) return false;
      // se a rota é raiz, só ativa com match exato
      if (ROOT_ROUTES.has(href)) {
        return pathname === href;
      }
      // para sub-rotas, ativa com startsWith
      return pathname === href || pathname.startsWith(href);
    };
  }, [pathname]);

  return { navItems, isActive };
}
