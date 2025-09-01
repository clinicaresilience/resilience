"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  href: string
  texto?: string
  className?: string
}

export function BackButton({ href, texto = "Voltar", className = "" }: BackButtonProps) {
  return (
    <Link href={href}>
      <Button 
        variant="ghost" 
        className={`flex items-center space-x-2 text-gray-600 hover:text-azul-escuro hover:bg-gray-100 ${className}`}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{texto}</span>
      </Button>
    </Link>
  )
}
