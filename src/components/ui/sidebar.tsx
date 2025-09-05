"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { User, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigation } from "@/features/navigation/hooks/use-navigation"
import type { Role } from "@/features/auth/types"

interface SidebarProps {
  userType: Role
  userName: string
}



export function Sidebar({ userType, userName }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)


  const { navItems, isActive: navIsActive } = useNavigation(userType)

  const getUserTypeLabel = () => {
    switch (userType) {
      case "administrador": return "Administrador"
      case "profissional": return "Profissional"
      case "comum": return "Paciente"
      default: return "Usuário"
    }
  }


  const getUserTypeColor = () => {
    switch (userType) {
      case "administrador": return "from-purple-400 to-purple-600"
      case "profissional": return "from-blue-400 to-blue-600"
      case "comum": return "from-green-400 to-green-600"
      default: return "from-gray-400 to-gray-600"
    }
  }


  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-20 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "relative bg-white border-r border-gray-200 shadow-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Collapse Button - Desktop only */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-6 hidden md:flex h-6 w-6 rounded-full border border-gray-200 bg-white shadow-sm z-20"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        <div className="flex flex-col h-full">

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r",
                getUserTypeColor()
              )}>
                <User className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getUserTypeLabel()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = navIsActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-azul-escuro text-white"
                      : "text-gray-600 hover:text-azul-escuro hover:bg-gray-100"
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-3")} />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.title}</div>
                      {item.description && (
                        <div className="text-xs opacity-75 truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!isCollapsed && (
              <div className="text-xs text-gray-500 text-center">
                © 2025 Clínica Resilience
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
