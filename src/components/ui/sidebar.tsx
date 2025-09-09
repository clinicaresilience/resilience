"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, ChevronLeft, ChevronRight } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { useTabStore } from "../../app/store/useTabStore";
import Link from "next/link";

interface SidebarProps {
  userType: "administrador" | "profissional" | "comum";
  userName: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  userType,
  userName,
  onCollapseChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Call callback when collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  const pathname = usePathname();
  const { activeTab, setActiveTab, getTabsByUserType, syncTabFromPath } = useTabStore();
  const tabs = getTabsByUserType(userType);

  // Sincroniza a aba ativa com o pathname atual na inicialização e mudanças de rota
  useEffect(() => {
    syncTabFromPath(pathname, userType);
  }, [pathname, userType, syncTabFromPath]);

  // Força sincronização imediata no mount para casos de relogin
  useEffect(() => {
    syncTabFromPath(pathname, userType);
  }, []);

  const getUserTypeLabel = () => {
    switch (userType) {
      case "administrador":
        return "Administrador";
      case "profissional":
        return "Profissional";
      case "comum":
        return "Paciente";
      default:
        return "Usuário";
    }
  };

  const getUserTypeColor = () => {
    switch (userType) {
      case "administrador":
        return "from-purple-400 to-purple-600";
      case "profissional":
        return "from-blue-400 to-blue-600";
      case "comum":
        return "from-green-400 to-green-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-500 ease-in-out z-[9999]",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Collapse Button - Desktop only */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-6 hidden md:flex h-6 w-6 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow z-40"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-center">
            {!isCollapsed ? (
              <Image
                src="/logoResilience.png"
                alt="Logo Clínica Resilience"
                width={120}
                height={40}
                className="object-contain"
              />
            ) : (
              <Image
                src="/logoResilience.png"
                alt="Logo Clínica Resilience"
                width={32}
                height={32}
                className="object-contain"
              />
            )}
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r",
                  getUserTypeColor()
                )}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">{getUserTypeLabel()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.path!}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-1'} px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-azul-escuro text-white"
                    : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{tab.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-center">
              <LogoutButton
                className={cn(
                  "w-full",
                  isCollapsed ? "px-2" : "px-4"
                )}
              />
            </div>
            {!isCollapsed && (
              <div className="text-xs text-gray-500 text-center">
                © 2025 Clínica Resilience
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
