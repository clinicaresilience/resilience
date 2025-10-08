"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Company {
  id: string;
  nome: string;
  codigo: string;
  ativa: boolean;
  created_at?: string;
  updated_at?: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  nome_fantasia?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
}

export function CompaniesManagement() {
  const [items, setItems] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  // form - basic fields
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [nomeFantasia, setNomeFantasia] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [inscricaoEstadual, setInscricaoEstadual] = useState("")
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState("")
  
  // form - address fields (required)
  const [cep, setCep] = useState("")
  const [logradouro, setLogradouro] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  
  // form state
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loadingCep, setLoadingCep] = useState(false)
  
  // edit state
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  async function fetchCompanies() {
    try {
      setLoading(true)
      const response = await fetch('/api/companies')
      if (!response.ok) {
        throw new Error('Erro ao buscar empresas')
      }
      const companies = await response.json()
      setItems(companies)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar empresas")
    } finally {
      setLoading(false)
    }
  }

  const totalAtivas = useMemo(() => items.filter(i => i.ativa).length, [items])

  function resetForm() {
    setName("")
    setCode("")
    setNomeFantasia("")
    setCnpj("")
    setInscricaoEstadual("")
    setInscricaoMunicipal("")
    setCep("")
    setLogradouro("")
    setNumero("")
    setComplemento("")
    setBairro("")
    setCidade("")
    setEstado("")
    setError(null)
    setSuccess(null)
    setEditingCompany(null)
    setIsEditMode(false)
  }

  function startEdit(company: Company) {
    setEditingCompany(company)
    setIsEditMode(true)
    
    // Populate form with company data
    setName(company.nome)
    setCode(company.codigo)
    setNomeFantasia(company.nome_fantasia || "")
    setCnpj(formatCnpj(company.cnpj))
    setInscricaoEstadual(company.inscricao_estadual || "")
    setInscricaoMunicipal(company.inscricao_municipal || "")
    setCep(company.endereco_cep ? formatCep(company.endereco_cep) : "")
    setLogradouro(company.endereco_logradouro || "")
    setNumero(company.endereco_numero || "")
    setComplemento(company.endereco_complemento || "")
    setBairro(company.endereco_bairro || "")
    setCidade(company.endereco_cidade || "")
    setEstado(company.endereco_estado || "")
    setError(null)
    setSuccess(null)
  }

  function cancelEdit() {
    resetForm()
  }

  // CEP auto-fill functionality
  async function handleCepChange(value: string) {
    const cepValue = value.replace(/\D/g, "")
    setCep(cepValue)
    
    if (cepValue.length === 8) {
      setLoadingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setLogradouro(data.logradouro || "")
          setBairro(data.bairro || "")
          setCidade(data.localidade || "")
          setEstado(data.uf || "")
        } else {
          setError("CEP não encontrado")
        }
      } catch (error) {
        setError("Erro ao buscar informações do CEP")
      } finally {
        setLoadingCep(false)
      }
    }
  }

  // Format CNPJ
  function formatCnpj(value: string | null | undefined) {
    if (!value) return "";
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18)
  }

  // Format CEP
  function formatCep(value: string | null | undefined) {
    if (!value) return "";
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .substring(0, 9)
  }

  async function onToggleActive(companyId: string) {
    try {
      const company = items.find(c => c.id === companyId)
      if (!company) return

      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ativa: !company.ativa
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar empresa')
      }

      await fetchCompanies() // Refresh list
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao atualizar empresa")
    }
  }

  async function onSubmitCompany(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    // Validate required fields
    if (!name.trim() || !code.trim()) {
      setError("Informe Nome e Código da empresa.")
      return
    }

    if (!cnpj.trim()) {
      setError("O CNPJ é obrigatório.")
      return
    }

    if (!logradouro.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !estado.trim() || !cep.trim()) {
      setError("Todos os campos de endereço são obrigatórios.")
      return
    }

    // Check for duplicate name (excluding current company if editing)
    const existingCompany = items.find(c => 
      c.nome.toLowerCase() === name.trim().toLowerCase() && 
      c.id !== editingCompany?.id
    )
    if (existingCompany) {
      setError("Já existe uma empresa com este nome.")
      return
    }

    // Check for duplicate code (excluding current company if editing)
    const existingCode = items.find(c => 
      c.codigo.toLowerCase() === code.trim().toLowerCase() && 
      c.id !== editingCompany?.id
    )
    if (existingCode) {
      setError("Já existe uma empresa com este código.")
      return
    }

    try {
      const companyData = {
        nome: name.trim(),
        codigo: code.toUpperCase().trim(),
        nome_fantasia: nomeFantasia.trim() || null,
        cnpj: cnpj.replace(/\D/g, ""),
        inscricao_estadual: inscricaoEstadual.trim() || null,
        inscricao_municipal: inscricaoMunicipal.trim() || null,
        endereco_logradouro: logradouro.trim(),
        endereco_numero: numero.trim(),
        endereco_complemento: complemento.trim() || null,
        endereco_bairro: bairro.trim(),
        endereco_cidade: cidade.trim(),
        endereco_estado: estado.trim().toUpperCase(),
        endereco_cep: cep.replace(/\D/g, "")
      }

      const url = isEditMode ? `/api/companies/${editingCompany!.id}` : '/api/companies'
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} empresa`)
      }

      setSuccess(`Empresa ${isEditMode ? 'atualizada' : 'adicionada'} com sucesso.`)
      await fetchCompanies() // Refresh list
      resetForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} empresa`)
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            {isEditMode ? 'Editar empresa parceira' : 'Cadastrar nova empresa parceira'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitCompany} className="space-y-6">
            {/* Dados Básicos */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">Código (único) *</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex.: ACME123"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                  <Input
                    id="nomeFantasia"
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricaoEstadual"
                    value={inscricaoEstadual}
                    onChange={(e) => setInscricaoEstadual(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
                  <Input
                    id="inscricaoMunicipal"
                    value={inscricaoMunicipal}
                    onChange={(e) => setInscricaoMunicipal(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço *</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={formatCep(cep)}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    required
                  />
                  {loadingCep && <p className="text-xs text-blue-600">Buscando CEP...</p>}
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="logradouro">Logradouro *</Label>
                  <Input
                    id="logradouro"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    maxLength={2}
                    placeholder="SP"
                    required
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="text-white bg-azul-escuro">
                {isEditMode ? 'Atualizar' : 'Adicionar'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                {isEditMode ? 'Cancelar' : 'Limpar'}
              </Button>
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
                      <td className="py-2 pr-3">{c.nome}</td>
                      <td className="py-2 pr-3 font-mono">{c.codigo}</td>
                      <td className="py-2 pr-3">
                        <span className={`px-2 py-1 rounded text-xs ${c.ativa ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                          {c.ativa ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td className="py-2 pr-3 space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">Ver Detalhes</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Empresa</DialogTitle>
                              <DialogDescription>
                                Informações completas da empresa {c.nome}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Dados Básicos</h4>
                                  <div className="space-y-1 text-sm">
                                    <div><span className="font-medium">Nome:</span> {c.nome}</div>
                                    <div><span className="font-medium">Código:</span> {c.codigo}</div>
                                    {c.nome_fantasia && <div><span className="font-medium">Nome Fantasia:</span> {c.nome_fantasia}</div>}
                                    <div><span className="font-medium">CNPJ:</span> {formatCnpj(c.cnpj)}</div>
                                    {c.inscricao_estadual && <div><span className="font-medium">Inscrição Estadual:</span> {c.inscricao_estadual}</div>}
                                    {c.inscricao_municipal && <div><span className="font-medium">Inscrição Municipal:</span> {c.inscricao_municipal}</div>}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Endereço</h4>
                                  <div className="space-y-1 text-sm">
                                    {c.endereco_cep && <div><span className="font-medium">CEP:</span> {formatCep(c.endereco_cep)}</div>}
                                    {c.endereco_logradouro && <div><span className="font-medium">Logradouro:</span> {c.endereco_logradouro}, {c.endereco_numero}</div>}
                                    {c.endereco_complemento && <div><span className="font-medium">Complemento:</span> {c.endereco_complemento}</div>}
                                    {c.endereco_bairro && <div><span className="font-medium">Bairro:</span> {c.endereco_bairro}</div>}
                                    {c.endereco_cidade && c.endereco_estado && <div><span className="font-medium">Cidade:</span> {c.endereco_cidade} - {c.endereco_estado}</div>}
                                  </div>
                                </div>
                              </div>
                              <div className="pt-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Status:</span>
                                  <span className={`px-2 py-1 rounded text-xs ${c.ativa ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                                    {c.ativa ? "Ativa" : "Inativa"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
                          Editar
                        </Button>
                        
                        <Button size="sm" variant="outline" onClick={() => onToggleActive(c.id)}>
                          {c.ativa ? "Desativar" : "Ativar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
