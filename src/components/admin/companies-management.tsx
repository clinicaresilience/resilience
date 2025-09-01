"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getCompaniesClient,
  addCompanyClient,
  updateCompanyClient,
  type Company,
} from "@/lib/mocks/companies"

export function CompaniesManagement() {
  const [items, setItems] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  // form
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setItems(getCompaniesClient())
    setLoading(false)
  }, [])

  function refresh() {
    setItems(getCompaniesClient())
  }

  const totalAtivas = useMemo(() => items.filter(i => i.active).length, [items])

  function resetForm() {
    setName("")
    setCode("")
    setError(null)
    setSuccess(null)
  }

  function normalizeCode(v: string) {
    return v.toUpperCase().trim()
  }

  function onToggleActive(code: string) {
    try {
      const current = getCompaniesClient()
      const target = current.find(c => c.code === code)
      updateCompanyClient(code, { active: !(target?.active ?? true) })
      refresh()
    } catch (e: any) {
      setError(e?.message ?? "Falha ao atualizar empresa")
    }
  }

  function onAddCompany(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!name.trim() || !code.trim()) {
      setError("Informe Nome e Código da empresa.")
      return
    }
    try {
      addCompanyClient({ name: name.trim(), code: normalizeCode(code) })
      setSuccess("Empresa adicionada com sucesso.")
      refresh()
      setName("")
      setCode("")
    } catch (e: any) {
      setError(e?.message ?? "Falha ao adicionar empresa")
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Cadastrar nova empresa parceira</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddCompany} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Código (único)</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex.: ACME123"
                required
              />
            </div>

            {error && <p className="md:col-span-3 text-sm text-red-600">{error}</p>}
            {success && <p className="md:col-span-3 text-sm text-green-600">{success}</p>}

            <div className="md:col-span-3 flex gap-2">
              <Button type="submit" className="text-white bg-azul-escuro">Adicionar</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Limpar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Empresas ({items.length}) — Ativas: {totalAtivas}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-gray-500">Carregando...</p>}
          {!loading && items.length === 0 && <p className="text-gray-500">Nenhuma empresa cadastrada ainda.</p>}
          {!loading && items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 pr-3">Nome</th>
                    <th className="py-2 pr-3">Código</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 pr-3">{c.name}</td>
                      <td className="py-2 pr-3 font-mono">{c.code}</td>
                      <td className="py-2 pr-3">
                        <span className={`px-2 py-1 rounded text-xs ${c.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                          {c.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 space-x-2">
                        <Button size="sm" variant="outline" onClick={() => onToggleActive(c.code)}>
                          {c.active ? "Desativar" : "Ativar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                Observação: por se tratar de um mock, as empresas padrão (seed) estão sempre disponíveis no lado do servidor.
                As empresas criadas aqui ficam no localStorage do navegador.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
