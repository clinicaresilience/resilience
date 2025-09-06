// stores/useTabStore.ts
import { create } from "zustand"

export type TabType = "dashboard" | "prontuarios" | "agendas" | "analytics" | "profissionais" | "usuarios" | "empresas"

interface TabStore {
    activeTab: TabType
    setActiveTab: (tab: TabType) => void
}

export const useTabStore = create<TabStore>((set) => ({
    activeTab: "dashboard",
    setActiveTab: (tab) => set({ activeTab: tab }),
}))
