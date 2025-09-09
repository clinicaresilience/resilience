// stores/useTabStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Home, FileText, Calendar, TrendingUp, Users, Building2, Clock, User, LucideIcon } from "lucide-react"

export type adminTab = "dashboard" | "pacientes" | "prontuarios" | "agendas" | "analytics" | "profissionais" | "usuarios" | "empresas" | "perfil"
export type profissionalTab = "dashboard" | "prontuarios" | "agendas" | "pacientes" | "perfil"
export type pacienteTab = "inicio" | "agendas" | "perfil"
export type TabType = adminTab | profissionalTab | pacienteTab

interface Tab {
    id: TabType
    label: string
    icon: LucideIcon
    path?: string
}

interface TabStore {
    activeTab: TabType
    setActiveTab: (tab: TabType) => void
    syncTabFromPath: (pathname: string, userType: "administrador" | "profissional" | "comum") => void
    getTabsByUserType: (userType: "administrador" | "profissional" | "comum") => Tab[]
}

export const useTabStore = create<TabStore>()(
    persist(
        (set, get) => ({
            activeTab: "dashboard", // padrão
            setActiveTab: (tab) => set({ activeTab: tab }),
            syncTabFromPath: (pathname, userType) => {
                const tabs = get().getTabsByUserType(userType)
                
                // Encontra a aba correspondente ao path atual com lógica melhorada
                let matchingTab = null
                
                // Primeiro: busca correspondência exata
                matchingTab = tabs.find(tab => tab.path === pathname)
                
                // Segundo: busca por subpaths (ex: /tela-usuario/agendamentos -> /tela-usuario/agendamentos)
                if (!matchingTab) {
                    matchingTab = tabs.find(tab => {
                        if (!tab.path) return false
                        // Verifica se o pathname começa com o path da tab
                        return pathname.startsWith(tab.path + '/') || pathname === tab.path
                    })
                }
                
                if (matchingTab) {
                    set({ activeTab: matchingTab.id })
                } else {
                    // Se não encontrar correspondência, usa o padrão baseado no userType
                    const defaultTab = userType === "comum" ? "inicio" : "dashboard"
                    set({ activeTab: defaultTab as TabType })
                }
            },
            getTabsByUserType: (userType) => {
                switch (userType) {
                    case "administrador":
                        return [
                            { id: "dashboard", label: "Dashboard", icon: Home, path: "/painel-administrativo" },
                            { id: "pacientes", label: "Pacientes", icon: Users, path: "/painel-administrativo/pacientes" },
                            { id: "prontuarios", label: "Prontuários", icon: FileText, path: "/painel-administrativo/prontuarios" },
                            { id: "agendas", label: "Agendas", icon: Calendar, path: "/painel-administrativo/agendas" },
                            { id: "analytics", label: "Análises", icon: TrendingUp, path: "/painel-administrativo/analytics" },
                            { id: "usuarios", label: "Usuários", icon: Users, path: "/painel-administrativo/usuarios" },
                            { id: "empresas", label: "Empresas", icon: Building2, path: "/painel-administrativo/empresas" },
                            { id: "perfil", label: "Perfil", icon: User, path: "/painel-administrativo/perfil" },
                        ]
                    case "profissional":
                        return [
                            { id: "dashboard", label: "Dashboard", icon: Home, path: "/tela-profissional" },
                            { id: "prontuarios", label: "Prontuários", icon: FileText, path: "/tela-profissional/prontuarios" },
                            { id: "agendas", label: "Agendas", icon: Calendar, path: "/tela-profissional/agenda" },
                            { id: "pacientes", label: "Pacientes", icon: Users, path: "/tela-profissional/pacientes" },
                            { id: "perfil", label: "Perfil", icon: User, path: "/tela-profissional/perfil" },
                        ]
                    case "comum":
                        return [
                            { id: "inicio", label: "Início", icon: Home, path: "/tela-usuario" },
                            { id: "agendas", label: "Agendamentos", icon: Clock, path: "/tela-usuario/agendamentos" },
                            { id: "perfil", label: "Perfil", icon: User, path: "/tela-usuario/perfil" },
                        ]
                    default:
                        return []
                }
            },
        }),
        {
            name: 'tab-store', // nome único para o localStorage
            // Só persiste o activeTab, não as funções
            partialize: (state) => ({ activeTab: state.activeTab }),
        }
    )
)
