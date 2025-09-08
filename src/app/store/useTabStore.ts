// stores/useTabStore.ts
import { create } from "zustand"
import { Home, FileText, Calendar, TrendingUp, Users, Building2, Clock, LucideIcon } from "lucide-react"

export type adminTab = "dashboard" | "prontuarios" | "agendas" | "analytics" | "profissionais" | "usuarios" | "empresas"
export type profissionalTab = "dashboard" | "prontuarios" | "agendas" | "pacientes"
export type pacienteTab = "inicio" | "agendas"
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

export const useTabStore = create<TabStore>((set, get) => ({
    activeTab: "dashboard", // padrão
    setActiveTab: (tab) => {
        console.log("Setting active tab:", tab)
        set({ activeTab: tab })
    },
    syncTabFromPath: (pathname, userType) => {
        console.log("Syncing tab from path:", pathname, "userType:", userType)
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
            console.log("Found matching tab:", matchingTab.id)
            set({ activeTab: matchingTab.id })
        } else {
            // Se não encontrar correspondência, usa o padrão baseado no userType
            const defaultTab = userType === "comum" ? "inicio" : "dashboard"
            console.log("No matching tab found, using default:", defaultTab)
            set({ activeTab: defaultTab as TabType })
        }
    },
    getTabsByUserType: (userType) => {
        switch (userType) {
            case "administrador":
                return [
                    { id: "dashboard", label: "Dashboard", icon: Home, path: "/painel-administrativo" },
                    { id: "prontuarios", label: "Prontuários", icon: FileText, path: "/painel-administrativo/prontuarios" },
                    { id: "agendas", label: "Agendas", icon: Calendar, path: "/painel-administrativo/agendas" },
                    { id: "analytics", label: "Análises", icon: TrendingUp, path: "/painel-administrativo/analytics" },
                    { id: "usuarios", label: "Usuários", icon: Users, path: "/painel-administrativo/usuarios" },
                    { id: "empresas", label: "Empresas", icon: Building2, path: "/painel-administrativo/empresas" },
                ]
            case "profissional":
                return [
                    { id: "dashboard", label: "Dashboard", icon: Home, path: "/tela-profissional" },
                    { id: "prontuarios", label: "Prontuários", icon: FileText, path: "/tela-profissional/prontuarios" },
                    { id: "agendas", label: "Agendas", icon: Calendar, path: "/tela-profissional/agenda" },
                    { id: "pacientes", label: "Pacientes", icon: Users, path: "/tela-profissional/pacientes" },
                ]
            case "comum":
                return [
                    { id: "inicio", label: "Início", icon: Home, path: "/tela-usuario" },
                    { id: "agendas", label: "Agendamentos", icon: Clock, path: "/tela-usuario/agendamentos" },
                ]
            default:
                return []
        }
    },
}))
