import { ROUTES } from "@/config/routes";
import type { Role } from "@/features/auth/types";
import {
  Calendar,
  Users,
  FileText,
  Clock,
  TrendingUp,
  User,
  Heart,
  Phone,
  Home,
} from "lucide-react";
import type React from "react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
};

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  profissional: [
    {
      title: "Início",
      href: ROUTES.professional.root,
      icon: Home,
      description: "Visão geral da sua área",
    },
    {
      title: "Consultas",
      href: ROUTES.professional.consultas,
      icon: Calendar,
      description: "Gerencie suas consultas",
    },
    {
      title: "Pacientes",
      href: ROUTES.professional.pacientes,
      icon: Users,
      description: "Histórico dos pacientes",
    },
    {
      title: "Prontuários",
      href: ROUTES.professional.prontuarios,
      icon: FileText,
      description: "Acesse prontuários médicos",
    },
    {
      title: "Agenda",
      href: ROUTES.professional.agenda,
      icon: Clock,
      description: "Visualize sua agenda",
    },
    {
      title: "Estatísticas",
      href: ROUTES.professional.estatisticas,
      icon: TrendingUp,
      description: "Métricas e desempenho",
    },
  ],
  usuario: [
    {
      title: "Início",
      href: ROUTES.user.root,
      icon: Home,
      description: "Sua área principal",
    },
    {
      title: "Agendamentos",
      href: ROUTES.user.agendamentos,
      icon: Calendar,
      description: "Suas consultas marcadas",
    },
    {
      title: "Perfil",
      href: ROUTES.user.perfil,
      icon: User,
      description: "Suas informações pessoais",
    },
    {
      title: "Histórico",
      href: ROUTES.user.historico,
      icon: FileText,
      description: "Histórico médico",
    },
    {
      title: "Bem-estar",
      href: ROUTES.user.recursos,
      icon: Heart,
      description: "Recursos de bem-estar",
    },
    {
      title: "Contato",
      href: ROUTES.user.contato,
      icon: Phone,
      description: "Entre em contato",
    },
  ],
  administrador: [
    {
      title: "Dashboard",
      href: ROUTES.admin.root,
      icon: TrendingUp,
      description: "Visão geral do sistema",
    },
    {
      title: "Profissionais",
      href: ROUTES.admin.profissionais,
      icon: Users,
      description: "Gerencie profissionais",
    },
    {
      title: "Pacientes",
      href: ROUTES.admin.pacientes,
      icon: User,
      description: "Gerencie pacientes",
    },
    {
      title: "Consultas",
      href: ROUTES.admin.consultas,
      icon: Calendar,
      description: "Todas as consultas",
    },
    {
      title: "Relatórios",
      href: ROUTES.admin.relatorios,
      icon: FileText,
      description: "Relatórios do sistema",
    },
  ],
};
