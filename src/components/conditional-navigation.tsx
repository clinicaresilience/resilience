"use client"

import { usePathname } from "next/navigation"
import Navegacao from "@/components/navegacao"
import AuthenticatedHeader from "@/components/authenticated-header"

export default function ConditionalNavigation() {
  const pathname = usePathname()
  
  // Rotas que devem mostrar o cabeçalho autenticado
  const rotasAutenticadas = [
    '/painel-administrativo',
    '/tela-usuario',
    '/tela-profissional',
    '/protected'
  ]
  
  // Rotas que não devem mostrar nenhum cabeçalho (páginas de auth)
  const rotasSemCabecalho = [
    '/auth/login',
    '/auth/cadastro',
    '/auth/forgot-password',
    '/auth/update-password',
    '/auth/sign-up-success',
    '/auth/error'
  ]
  
  // Verifica se a rota atual é uma rota autenticada
  const eRotaAutenticada = rotasAutenticadas.some(rota => pathname.startsWith(rota))
  
  // Verifica se é uma rota de auth que não deve ter cabeçalho
  const eRotaSemCabecalho = rotasSemCabecalho.some(rota => pathname.startsWith(rota))
  
  // Se for rota autenticada, mostra cabeçalho de usuário logado
  if (eRotaAutenticada) {
    return <AuthenticatedHeader />
  }
  
  // Se for rota de auth, não mostra cabeçalho
  if (eRotaSemCabecalho) {
    return null
  }
  
  // Para rotas públicas (home, portal público), mostra a navegação normal
  return (
    <>
      <header className="w-full shadow-sm">
        <Navegacao />
      </header>
    </>
  )
}
