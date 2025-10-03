"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, ChevronLeft, ChevronRight, Stethoscope } from "lucide-react";
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

  const getUserTypeConfig = () => {
    switch (userType) {
      case "administrador":
        return {
          gradient: "from-purple-500 via-purple-600 to-indigo-600",
          bg: "bg-purple-50",
          text: "text-purple-700",
          icon: User,
        };
      case "profissional":
        return {
          gradient: "from-[#02b1aa] via-[#029fdf] to-[#01c2e3]",
          bg: "bg-cyan-50",
          text: "text-[#02b1aa]",
          icon: Stethoscope,
        };
      case "comum":
        return {
          gradient: "from-emerald-500 via-green-500 to-teal-500",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          icon: User,
        };
      default:
        return {
          gradient: "from-gray-500 to-gray-600",
          bg: "bg-gray-50",
          text: "text-gray-700",
          icon: User,
        };
    }
  };

  const userConfig = getUserTypeConfig();
  const IconComponent = userConfig.icon;

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-white via-gray-50/30 to-white border-r border-gray-200/80 shadow-xl transition-all duration-300 ease-in-out z-20 backdrop-blur-sm",
          isCollapsed ? "w-20" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Collapse Button - Desktop only */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute -right-4 top-6 hidden md:flex h-8 w-8 rounded-full border-2 border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 z-50 hover:scale-110",
            "hover:border-[#02b1aa] hover:bg-gradient-to-r hover:from-[#02b1aa]/10 hover:to-[#029fdf]/10"
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-700" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-700" />
          )}
        </Button>

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-gray-200/60 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#02b1aa]/5 via-transparent to-[#029fdf]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            {!isCollapsed ? (
              <div className="relative">
                <Image
                  src="/logoResilience.png"
                  alt="Logo Clínica Resilience"
                  width={140}
                  height={48}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="relative p-2 rounded-xl bg-gradient-to-br from-[#02b1aa]/10 to-[#029fdf]/10">
                <Image
                  src="/logoResilience.png"
                  alt="Logo Clínica Resilience"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className={cn("p-4 border-b border-gray-200/60", isCollapsed && "px-2")}>
            <div className={cn(
              "flex items-center rounded-xl p-3 transition-all duration-300",
              userConfig.bg,
              isCollapsed ? "justify-center" : "space-x-3"
            )}>
              <div className="relative group/avatar">
                <div className={cn(
                  "absolute -inset-1 rounded-full bg-gradient-to-r opacity-75 blur-sm group-hover/avatar:opacity-100 transition-opacity duration-300",
                  userConfig.gradient
                )}></div>
                <div
                  className={cn(
                    "relative w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg",
                    userConfig.gradient
                  )}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {userName}
                  </p>
                  <p className={cn("text-xs font-medium", userConfig.text)}>
                    {getUserTypeLabel()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
            isCollapsed && "px-2"
          )}>
            {tabs.map((tab) => (
              tab.path ? (
                <Link
                  key={tab.id}
                  href={tab.path}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-300",
                    isCollapsed ? 'justify-center px-3 py-3.5' : 'space-x-3 px-4 py-3',
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white shadow-lg shadow-[#02b1aa]/30"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-[#02b1aa]/10 hover:via-[#029fdf]/10 hover:to-[#01c2e3]/10 hover:text-[#02b1aa] hover:shadow-md"
                  )}
                >
                  {activeTab === tab.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                  <tab.icon className={cn(
                    "flex-shrink-0 transition-transform duration-300",
                    isCollapsed ? "w-5 h-5" : "w-5 h-5",
                    activeTab !== tab.id && "group-hover:scale-110"
                  )} />
                  {!isCollapsed && (
                    <span className="truncate font-medium">{tab.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-6 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                      {tab.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </Link>
              ) : (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-300 w-full text-left",
                    isCollapsed ? 'justify-center px-3 py-3.5' : 'space-x-3 px-4 py-3',
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white shadow-lg shadow-[#02b1aa]/30"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-[#02b1aa]/10 hover:via-[#029fdf]/10 hover:to-[#01c2e3]/10 hover:text-[#02b1aa] hover:shadow-md"
                  )}
                >
                  {activeTab === tab.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                  <tab.icon className={cn(
                    "flex-shrink-0 transition-transform duration-300",
                    isCollapsed ? "w-5 h-5" : "w-5 h-5",
                    activeTab !== tab.id && "group-hover:scale-110"
                  )} />
                  {!isCollapsed && (
                    <span className="truncate font-medium">{tab.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-6 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                      {tab.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </button>
              )
            ))}
          </nav>

          {/* Footer */}
          <div className={cn(
            "p-4 border-t border-gray-200/60 space-y-3 bg-gradient-to-t from-gray-50/50 to-transparent",
            isCollapsed && "px-2"
          )}>
            <div className="flex justify-center">
              <LogoutButton
                className={cn(
                  "w-full transition-all duration-300",
                  isCollapsed ? "px-2" : "px-4"
                )}
              />
            </div>
            {!isCollapsed && (
              <div className="text-xs text-gray-500 text-center font-medium">
                © 2025 Clínica Resilience
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
