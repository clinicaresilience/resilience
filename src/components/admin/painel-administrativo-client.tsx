"use client"

import { useState } from "react"
import { CadastrarProfissionalDialog } from "@/components/admin/cadastrar-profissional-dialog"
import { ProfissionaisList } from "@/components/admin/profissionais-list"
import { AdminDashboard } from "@/components/admin/dashboard"
import { MedicalRecordsSection } from "@/components/admin/medical-records-section"
import { SchedulesSection } from "@/components/admin/schedules-section"
import { ProfessionalAnalytics } from "@/components/admin/professional-analytics"
import { 
  BarChart3, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Users,
  Home
} from "lucide-react"

type TabType = "dashboard" | "prontuarios" | "agendas" | "analytics" | "profissionais"

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
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-azul-escuro">Painel Administrativo</h1>
            <p className="mt-1 text-gray-600">
              Bem-vindo, <span className="font-semibold">{usuario.nome}</span> ({userEmail})
            </p>
          </div>
          <div className="flex gap-2">
            <CadastrarProfissionalDialog />
          </div>
        </div>

        {/* Navegação por Abas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${isActive
                        ? 'border-azul-escuro text-azul-escuro'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Descrição da Aba Ativa */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
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
