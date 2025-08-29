"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ProfissionalMock = {
  id: string
  nome: string
  email: string
  especialidade: string
  createdAt?: string
}

function carregarProfissionais(): ProfissionalMock[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem("mock_profissionais")
    if (!raw) return []
    const parsed = JSON.parse(raw) as ProfissionalMock[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function ProfissionaisList() {
  const [items, setItems] = useState<ProfissionalMock[] | null>(null)

  useEffect(() => {
    // carga inicial
    setItems(carregarProfissionais())

    // ouvir atualizações vindas do modal de cadastro
    const handler = () => setItems(carregarProfissionais())
    window.addEventListener("profissionais-updated", handler as EventListener)
    return () => window.removeEventListener("profissionais-updated", handler as EventListener)
  }, [])

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Profissionais cadastrados (mock)</CardTitle>
      </CardHeader>
      <CardContent>
        {items === null && (
          <p className="text-gray-500">Carregando...</p>
        )}

        {items !== null && items.length === 0 && (
          <p className="text-gray-500">Nenhum profissional cadastrado ainda.</p>
        )}

        {items !== null && items.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {items.map((p) => (
              <li key={p.id} className="py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{p.nome}</p>
                    <p className="text-sm text-gray-600">{p.email}</p>
                    <p className="text-sm text-gray-600">
                      Especialidade: <span className="font-medium">{p.especialidade}</span>
                    </p>
                  </div>
                  {p.createdAt && (
                    <p className="text-xs text-gray-400">
                      Criado em {new Date(p.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
