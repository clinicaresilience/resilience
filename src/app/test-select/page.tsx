"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSelectPage() {
  const [status, setStatus] = useState("")
  const [profissional, setProfissional] = useState("")
  const [data, setData] = useState("")

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Teste dos Componentes Select</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Teste 1: Select de Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">Valor selecionado: {status || "Nenhum"}</p>
            </div>

            {/* Teste 2: Select de Profissionais */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Profissional</label>
              <Select value={profissional} onValueChange={setProfissional}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ana">Dra. Ana Paula</SelectItem>
                  <SelectItem value="bruno">Dr. Bruno Lima</SelectItem>
                  <SelectItem value="camila">Dra. Camila Rocha</SelectItem>
                  <SelectItem value="diego">Dr. Diego Santos</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">Valor selecionado: {profissional || "Nenhum"}</p>
            </div>

            {/* Teste 3: Select de Datas */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={data} onValueChange={setData}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as datas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                  <SelectItem value="ano">Este ano</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">Valor selecionado: {data || "Nenhum"}</p>
            </div>

            {/* Teste 4: Select Pequeno */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Pequeno</label>
              <Select>
                <SelectTrigger size="sm">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opcao1">Opção 1</SelectItem>
                  <SelectItem value="opcao2">Opção 2</SelectItem>
                  <SelectItem value="opcao3">Opção 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Teste 5: Select Desabilitado */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Desabilitado</label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Este select está desabilitado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opcao1">Opção 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
