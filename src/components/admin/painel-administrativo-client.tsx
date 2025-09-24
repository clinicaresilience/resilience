"use client";

import React, { useState } from "react";
import { useTabStore, TabType } from "../../app/store/useTabStore";
import { useSidebar } from "@/components/layout/authenticated-layout";
import { MobileHamburgerMenu } from "./mobile-hamburger-menu";

import { AdminDashboard } from "@/components/admin/dashboard";
import { MedicalRecordsSection } from "@/components/admin/medical-records-section";
import { SchedulesSection } from "@/components/admin/schedules-section";
import { ProfessionalAnalytics } from "@/components/admin/professional-analytics";
import { UsersManagement } from "@/components/admin/users-management";
import { CompaniesManagement } from "@/components/admin/companies-management";
import { ExceptionLimitsManagement } from "@/components/admin/exception-limits-management";
import { AvaliacoesManagement } from "@/components/admin/avaliacoes-management";
import { PacientesListClient } from "@/components/admin/pacientes-list-client";
import DrpsAdminPage from "@/app/painel-administrativo/drps/page";
import {
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Home,
  Building2,
  UserCheck,
  User,
  Menu,
  Timer,
  Star,
  ClipboardList,
} from "lucide-react";

interface PainelAdministrativoClientProps {
  usuario: {
    nome: string;
  };
  userEmail: string;
  sidebarCollapsed?: boolean;
}

export function PainelAdministrativoClient({
  usuario,
  userEmail,
}: PainelAdministrativoClientProps) {
  const { activeTab, setActiveTab } = useTabStore();
  const { collapsed } = useSidebar();
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

  const tabs = [
    {
      id: "dashboard" as TabType,
      label: "Dashboard",
      icon: Home,
      description: "Visão geral e métricas principais",
    },
    {
      id: "pacientes" as TabType,
      label: "Pacientes",
      icon: UserCheck,
      description: "Gerenciar pacientes e histórico ",
    },
    {
      id: "prontuarios" as TabType,
      label: "Prontuários",
      icon: FileText,
      description: "Acesso a todos os prontuários ",
    },
    {
      id: "agendas" as TabType,
      label: "Agendas",
      icon: Calendar,
      description: "Gestão de agendas e atendimento presencial",
    },
    {
      id: "usuarios" as TabType,
      label: "Usuários",
      icon: Users,
      description: "Gerenciar usuários do sistema",
    },
    {
      id: "perfil" as TabType,
      label: "Perfil",
      icon: User,
      description: "Gerenciar perfil pessoal",
    },
    {
      id: "analytics" as TabType,
      label: "Análises",
      icon: TrendingUp,
      description: "Análises detalhadas por profissional",
    },
    {
      id: "avaliacoes" as TabType,
      label: "Avaliações",
      icon: Star,
      description: "Visualizar avaliações e médias dos profissionais",
    },
    {
      id: "empresas" as TabType,
      label: "Empresas",
      icon: Building2,
      description: "Empresas parceiras e códigos",
    },
    {
      id: "limites-excecao" as TabType,
      label: "Limites",
      icon: Timer,
      description: "Configure limites de exceção diários para profissionais",
    },
    {
      id: "drps" as TabType,
      label: "DRPS",
      icon: ClipboardList,
      description: "Diagnóstico de Riscos Psicossociais - Gerenciar avaliações",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "pacientes":
        return <PacientesListClient />;
      case "prontuarios":
        return <MedicalRecordsSection />;
      case "agendas":
        return <SchedulesSection />;
      case "analytics":
        return <ProfessionalAnalytics />;
      case "usuarios":
        return <UsersManagement />;
      case "empresas":
        return <CompaniesManagement />;
      case "limites-excecao":
        return <ExceptionLimitsManagement />;
      case "avaliacoes":
        return <AvaliacoesManagement />;
      case "drps":
        return <DrpsAdminPage />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Fixed Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex justify-center items-center h-16 relative">
            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center space-x-6 xl:space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-azul-escuro text-white"
                        : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-center leading-tight">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden absolute right-0">
              <span className="text-sm font-medium text-azul-escuro">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-1">
          {tabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${
                  isActive
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs mt-0.5 leading-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsHamburgerMenuOpen(true)}
            className="flex flex-col items-center justify-center p-1 rounded-lg transition-colors text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
          >
            <Menu className="h-4 w-4" />
            <span className="text-xs mt-0.5 leading-tight">Menu</span>
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out w-full ${
          collapsed ? "px-2 sm:px-4" : "mx-auto px-4 sm:px-6"
        } py-6 md:pb-6 pb-20`}
      >
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-gray-600">
                Bem-vindo, <span className="font-semibold">{usuario.nome}</span>{" "}
                ({userEmail})
              </p>
            </div>
          </div>
        </div>

        {/* Content Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {tabs.find((tab) => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Conteúdo da Aba Ativa */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Hamburger Menu */}
      <MobileHamburgerMenu
        isOpen={isHamburgerMenuOpen}
        onToggle={() => setIsHamburgerMenuOpen(false)}
      />
    </div>
  );
}
