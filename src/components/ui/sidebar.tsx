"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User, ChevronLeft, ChevronRight, Stethoscope, Menu, X, Sparkles } from "lucide-react";
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
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

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
      {/* Sidebar - Modernizado 2025 */}
      <div
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-500 ease-out z-20",
          "bg-white/80 backdrop-blur-2xl border-r border-gray-200/50",
          "shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
          isCollapsed ? "w-20" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Gradient overlay sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#02b1aa]/[0.02] via-transparent to-[#029fdf]/[0.02] pointer-events-none" />

        {/* Collapse Button - Desktop only - Modernizado */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute -right-3 top-8 hidden md:flex h-7 w-7 rounded-full",
            "border border-gray-200/60 bg-white/95 backdrop-blur-md",
            "shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.08)]",
            "transition-all duration-300 z-50",
            "hover:scale-105 hover:border-[#02b1aa]/40 hover:bg-[#02b1aa]/5",
            "focus-visible:ring-2 focus-visible:ring-[#02b1aa]/20 focus-visible:ring-offset-2"
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
          )}
        </Button>

        <div className="flex flex-col h-full relative">
          {/* Logo - Modernizado */}
          <div className={cn(
            "p-6 border-b border-gray-100/80 flex items-center relative group",
            isCollapsed ? "justify-center" : "justify-center"
          )}>
            {!isCollapsed ? (
              <div className="relative transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/logoResilience.png"
                  alt="Logo Clínica Resilience"
                  width={140}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-[#02b1aa]/8 to-[#029fdf]/8 ring-1 ring-[#02b1aa]/10 transition-all duration-300 group-hover:ring-[#02b1aa]/20">
                <Image
                  src="/logoResilience.png"
                  alt="Logo Clínica Resilience"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>

          {/* User Info - Modernizado */}
          <div className={cn("px-4 py-4 border-b border-gray-100/80", isCollapsed && "px-3")}>
            <div className={cn(
              "relative flex items-center rounded-2xl p-3 transition-all duration-300 overflow-hidden group/user",
              "bg-gradient-to-br",
              userType === "administrador" && "from-purple-50/80 to-indigo-50/80",
              userType === "profissional" && "from-cyan-50/80 to-blue-50/80",
              userType === "comum" && "from-emerald-50/80 to-teal-50/80",
              isCollapsed ? "justify-center" : "space-x-3"
            )}>
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/user:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <div className="relative group/avatar">
                <div
                  className={cn(
                    "relative w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm transition-all duration-300",
                    "group-hover/avatar:shadow-md group-hover/avatar:scale-105",
                    userConfig.gradient
                  )}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                    {userName}
                  </p>
                  <p className={cn("text-xs font-medium mt-0.5", userConfig.text)}>
                    {getUserTypeLabel()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation - Modernizado */}
          <nav className={cn(
            "flex-1 px-3 py-4 space-y-1 overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300",
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
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#02b1aa]/20 focus-visible:ring-offset-2",
                    isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-3.5 py-2.5',
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white shadow-md shadow-[#02b1aa]/20"
                      : "text-gray-600 hover:text-[#02b1aa] hover:bg-gray-50/80"
                  )}
                >
                  {activeTab === tab.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}
                  <tab.icon className={cn(
                    "flex-shrink-0 transition-all duration-300",
                    isCollapsed ? "w-5 h-5" : "w-5 h-5",
                    activeTab === tab.id ? "scale-105" : "group-hover:scale-110 group-hover:rotate-3"
                  )} />
                  {!isCollapsed && (
                    <span className="truncate font-medium">{tab.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                      {tab.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900/95" />
                    </div>
                  )}
                </Link>
              ) : (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-300 w-full text-left",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#02b1aa]/20 focus-visible:ring-offset-2",
                    isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-3.5 py-2.5',
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] text-white shadow-md shadow-[#02b1aa]/20"
                      : "text-gray-600 hover:text-[#02b1aa] hover:bg-gray-50/80"
                  )}
                >
                  {activeTab === tab.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}
                  <tab.icon className={cn(
                    "flex-shrink-0 transition-all duration-300",
                    isCollapsed ? "w-5 h-5" : "w-5 h-5",
                    activeTab === tab.id ? "scale-105" : "group-hover:scale-110 group-hover:rotate-3"
                  )} />
                  {!isCollapsed && (
                    <span className="truncate font-medium">{tab.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
                      {tab.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900/95" />
                    </div>
                  )}
                </button>
              )
            ))}
          </nav>

          {/* Footer - Modernizado */}
          <div className={cn(
            "p-4 border-t border-gray-100/80 space-y-2.5",
            isCollapsed && "px-2"
          )}>
            <div className="flex justify-center">
              <LogoutButton
                className={cn(
                  "w-full transition-all duration-300 rounded-xl",
                  isCollapsed ? "px-2" : "px-4"
                )}
              />
            </div>
            {!isCollapsed && (
              <div className="text-[11px] text-gray-400 text-center font-medium tracking-wide">
                © 2025 Clínica Resilience
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Mobile Bottom Navigation - Modernizado */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_12px_rgb(0,0,0,0.05)]">
        <div className="flex justify-around items-center py-2 px-1 safe-area-inset-bottom">
          {tabs.slice(0, Math.min(5, tabs.length)).map((tab) => (
            tab.path ? (
              <Link
                key={tab.id}
                href={tab.path}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center px-2 py-2 rounded-xl transition-all duration-300 min-w-0 flex-1",
                  activeTab === tab.id
                    ? "text-[#02b1aa]"
                    : "text-gray-500"
                )}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#02b1aa]/10 to-[#029fdf]/10 rounded-xl" />
                )}
                <tab.icon className={cn(
                  "h-5 w-5 flex-shrink-0 relative transition-transform duration-300",
                  activeTab === tab.id && "scale-110"
                )} />
                <span className={cn(
                  "text-[10px] mt-0.5 leading-tight truncate w-full text-center relative font-medium",
                  activeTab === tab.id && "text-[#02b1aa]"
                )}>
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-b-full" />
                )}
              </Link>
            ) : (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center px-2 py-2 rounded-xl transition-all duration-300 min-w-0 flex-1",
                  activeTab === tab.id
                    ? "text-[#02b1aa]"
                    : "text-gray-500"
                )}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#02b1aa]/10 to-[#029fdf]/10 rounded-xl" />
                )}
                <tab.icon className={cn(
                  "h-5 w-5 flex-shrink-0 relative transition-transform duration-300",
                  activeTab === tab.id && "scale-110"
                )} />
                <span className={cn(
                  "text-[10px] mt-0.5 leading-tight truncate w-full text-center relative font-medium",
                  activeTab === tab.id && "text-[#02b1aa]"
                )}>
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] rounded-b-full" />
                )}
              </button>
            )
          ))}

          {/* Hamburger Menu Button - Modernizado */}
          {tabs.length > 5 && (
            <button
              onClick={() => setIsHamburgerMenuOpen(true)}
              className="relative flex flex-col items-center justify-center px-2 py-2 rounded-xl transition-all duration-300 text-gray-500 hover:text-[#02b1aa] hover:bg-gray-50/80 min-w-0 flex-1"
            >
              <Menu className="h-5 w-5 flex-shrink-0" />
              <span className="text-[10px] mt-0.5 leading-tight truncate w-full text-center font-medium">Menu</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Hamburger Menu Overlay - Modernizado */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isHamburgerMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={() => setIsHamburgerMenuOpen(false)}
      />

      {/* Mobile Hamburger Menu Panel - Modernizado */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-2xl shadow-2xl z-50 md:hidden transform transition-all duration-500 ease-out",
        isHamburgerMenuOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">Menu</h3>
          <button
            onClick={() => setIsHamburgerMenuOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-[#02b1aa] hover:bg-gray-100/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-3 px-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 81px)' }}>
          {tabs.slice(5).map((tab) => (
            tab.path ? (
              <Link
                key={tab.id}
                href={tab.path}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsHamburgerMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center px-4 py-3 mb-1 rounded-xl text-left transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-50/80 hover:text-[#02b1aa]"
                )}
              >
                <tab.icon className={cn(
                  "h-5 w-5 mr-3 flex-shrink-0 transition-transform duration-300",
                  activeTab === tab.id && "scale-110"
                )} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{tab.label}</div>
                  {tab.description && (
                    <div className={cn(
                      "text-xs mt-0.5",
                      activeTab === tab.id ? "text-white/80" : "text-gray-500"
                    )}>
                      {tab.description}
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsHamburgerMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center px-4 py-3 mb-1 rounded-xl text-left transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-50/80 hover:text-[#02b1aa]"
                )}
              >
                <tab.icon className={cn(
                  "h-5 w-5 mr-3 flex-shrink-0 transition-transform duration-300",
                  activeTab === tab.id && "scale-110"
                )} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{tab.label}</div>
                  {tab.description && (
                    <div className={cn(
                      "text-xs mt-0.5",
                      activeTab === tab.id ? "text-white/80" : "text-gray-500"
                    )}>
                      {tab.description}
                    </div>
                  )}
                </div>
              </button>
            )
          ))}
        </div>
      </div>
    </>
  );
}
