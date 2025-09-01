"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/client"
import { Sidebar } from "@/components/ui/sidebar"
import ConditionalNavigation from "@/components/conditional-navigation"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

type Usuario = {
  nome: string
  email: string
  tipo_usuario: "administrador" | "profissional" | "usuario"
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    async function carregarUsuario() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: userData } = await supabase
          .from("usuarios")
          .select("nome, tipo_usuario")
          .eq("id", user.id)
          .single()
        
        if (userData) {
          setUsuario({
            nome: userData.nome,
            email: user.email || "",
            tipo_usuario: userData.tipo_usuario
          })
        }
      }
      setLoading(false)
    }
    
    carregarUsuario()
  }, [])

  // Verificar se deve mostrar a sidebar
  const rotasComSidebar = [
    '/painel-administrativo',
    '/tela-usuario',
    '/tela-profissional'
  ]
  
  const mostrarSidebar = rotasComSidebar.some(rota => pathname.startsWith(rota))

  // Rotas que não devem mostrar nenhum cabeçalho (páginas de auth)
  const rotasSemCabecalho = [
    '/auth/login',
    '/auth/cadastro',
    '/auth/forgot-password',
    '/auth/update-password',
    '/auth/sign-up-success',
    '/auth/error'
  ]
  
  const eRotaSemCabecalho = rotasSemCabecalho.some(rota => pathname.startsWith(rota))

  if (loading && mostrarSidebar) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-azul-escuro"></div>
      </div>
    )
  }

  // Para rotas sem cabeçalho ou sem sidebar, renderiza apenas o children
  if (eRotaSemCabecalho || !mostrarSidebar) {
    return (
      <>
        <ConditionalNavigation />
        <main className="flex-1 pt-24 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </>
    )
  }

  // Para rotas com sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      <ConditionalNavigation />
      {usuario && (
        <div className="flex">
          <Sidebar 
            userType={usuario.tipo_usuario} 
            userName={usuario.nome}
          />
          <main className="flex-1 ml-0 md:ml-64 transition-all duration-300 pt-16">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      )}
    </div>
  )
}
