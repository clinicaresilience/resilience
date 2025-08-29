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
  
  // Verifica se a rota atual é uma rota autenticada
  const eRotaAutenticada = rotasAutenticadas.some(rota => pathname.startsWith(rota))
  
  // Se for rota autenticada, mostra cabeçalho de usuário logado
  if (eRotaAutenticada) {
    return <AuthenticatedHeader />
  }
  
  // Para rotas públicas (incluindo páginas de auth), mostra a navegação normal
  return (
    <>
      <header className="w-full shadow-sm">
        <Navegacao />
      </header>
      <div className="pt-24" /> {/* Espaçamento para compensar header fixo */}
    </>
  )
}
