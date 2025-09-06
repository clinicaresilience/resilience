"use client"

import { useState } from "react"
import { CadastrarProfissionalDialog } from "@/components/admin/cadastrar-profissional-dialog"
import { ProfissionaisList } from "@/components/admin/profissionais-list"
import { AdminDashboard } from "@/components/admin/dashboard"
import { MedicalRecordsSection } from "@/components/admin/medical-records-section"
import { SchedulesSection } from "@/components/admin/schedules-section"
import { ProfessionalAnalytics } from "@/components/admin/professional-analytics"
import { UsersManagement } from "@/components/admin/users-management"
import { CompaniesManagement } from "@/components/admin/companies-management"
import {
  BarChart3,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Home,
  Building2
} from "lucide-react"

type TabType = "dashboard" | "prontuarios" | "agendas" | "analytics" | "profissionais" | "usuarios" | "empresas"

interface PainelAdministrativoClientProps {
  usuario: {
    nome: string
  }
  userEmail: string
}

export function PainelAdministrativoClient({ usuario, userEmail }: PainelAdministrativoClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")

  const tabs = [
    {
      id: "dashboard" as TabType,
      label: "Dashboard",
      icon: Home,
      description: "Visão geral e métricas principais"
    },
    {
      id: "prontuarios" as TabType,
      label: "Prontuários",
      icon: FileText,
      description: "Acesso a todos os prontuários médicos"
    },
    {
      id: "agendas" as TabType,
      label: "Agendas",
      icon: Calendar,
      description: "Calendário e horários dos profissionais"
    },
    {
      id: "analytics" as TabType,
      label: "Análises",
      icon: TrendingUp,
      description: "Análises detalhadas por profissional"
    },
    {
      id: "profissionais" as TabType,
      label: "Profissionais",
      icon: Users,
      description: "Gerenciar profissionais cadastrados"
    },
    {
      id: "usuarios" as TabType,
      label: "Usuários",
      icon: Users,
      description: "Gerenciar usuários do sistema"
    },
    {
      id: "empresas" as TabType,
      label: "Empresas",
      icon: Building2,
      description: "Empresas parceiras e códigos"
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />
      case "prontuarios":
        return <MedicalRecordsSection />
      case "agendas":
        return <SchedulesSection />
      case "analytics":
        return <ProfessionalAnalytics />
      case "profissionais":
        return <ProfissionaisList />
      case "usuarios":
        return <UsersManagement />
      case "empresas":
        return <CompaniesManagement />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Fixed Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-azul-escuro">Painel Administrativo</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-azul-escuro text-white'
                        : 'text-gray-600 hover:text-azul-escuro hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <span className="text-sm font-medium text-azul-escuro">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-2">
          {tabs.slice(0, 5).map((tab) => { // Limit to 5 tabs for mobile
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-azul-escuro text-white'
                    : 'text-gray-600 hover:text-azul-escuro hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 md:pb-6 pb-20">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-gray-600">
                Bem-vindo, <span className="font-semibold">{usuario.nome}</span> ({userEmail})
              </p>
            </div>
            <div className="flex gap-2">
              <CadastrarProfissionalDialog />
            </div>
          </div>
        </div>

        {/* Content Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Conteúdo da Aba Ativa */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
