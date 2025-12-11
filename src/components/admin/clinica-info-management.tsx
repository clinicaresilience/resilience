"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Globe,
  Phone,
  MessageCircle,
} from "lucide-react";

interface RedeSocial {
  id: number;
  nome: string;
  link: string;
  descricao?: string;
  tipo?: 'rede_social' | 'contato';
  created_at?: string;
  updated_at?: string;
}

export function ClinicaInfoManagement() {
  const [redesSociais, setRedesSociais] = useState<RedeSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRede, setEditingRede] = useState<RedeSocial | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [link, setLink] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<'rede_social' | 'contato'>('rede_social');
  const [usarOutroNome, setUsarOutroNome] = useState(false);
  const [nomePreDefinido, setNomePreDefinido] = useState("");

  useEffect(() => {
    fetchRedesSociais();
  }, []);

  const fetchRedesSociais = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/clinica-info");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar redes sociais");
      }

      setRedesSociais(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar redes sociais:", error);
      setError("Erro ao carregar redes sociais");
    } finally {
      setLoading(false);
    }
  };

  const redesSociaisPadrao = [
    { value: 'whatsapp', label: 'WhatsApp', tipo: 'contato' as const },
    { value: 'telefone', label: 'Telefone', tipo: 'contato' as const },
    { value: 'email', label: 'E-mail', tipo: 'contato' as const },
    { value: 'instagram', label: 'Instagram', tipo: 'rede_social' as const },
    { value: 'facebook', label: 'Facebook', tipo: 'rede_social' as const },
    { value: 'linkedin', label: 'LinkedIn', tipo: 'rede_social' as const },
    { value: 'twitter', label: 'Twitter', tipo: 'rede_social' as const },
    { value: 'youtube', label: 'YouTube', tipo: 'rede_social' as const },
    { value: 'tiktok', label: 'TikTok', tipo: 'rede_social' as const },
    { value: 'outro', label: 'Outro...', tipo: 'rede_social' as const },
  ];

  const detectTipo = (nome: string): 'rede_social' | 'contato' => {
    const lowerName = nome.toLowerCase();
    const contatos = ['whatsapp', 'telefone', 'phone', 'celular', 'fone', 'email', 'e-mail'];
    return contatos.some(contato => lowerName.includes(contato)) ? 'contato' : 'rede_social';
  };

  const resetForm = () => {
    setNome("");
    setLink("");
    setDescricao("");
    setTipo('rede_social');
    setUsarOutroNome(false);
    setNomePreDefinido("");
    setError("");
    setSuccess("");
    setEditingRede(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (rede: RedeSocial) => {
    setEditingRede(rede);
    setNome(rede.nome);
    setLink(rede.link);
    setDescricao(rede.descricao || "");
    setTipo(rede.tipo || detectTipo(rede.nome));
    
    // Verificar se é um nome pré-definido
    const preDefinido = redesSociaisPadrao.find(item => 
      item.label.toLowerCase() === rede.nome.toLowerCase()
    );
    
    if (preDefinido) {
      setNomePreDefinido(preDefinido.value);
      setUsarOutroNome(false);
    } else {
      setNomePreDefinido("outro");
      setUsarOutroNome(true);
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!nome.trim() || !link.trim()) {
        setError("Nome e link são obrigatórios");
        return;
      }

      const data = {
        nome: nome.trim(),
        link: link.trim(),
        descricao: descricao.trim() || undefined,
        tipo: detectTipo(nome.trim()),
      };

      const url = "/api/clinica-info";
      const method = editingRede ? "PUT" : "POST";
      const body = editingRede ? { ...data, id: editingRede.id } : data;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro ao ${editingRede ? "atualizar" : "criar"} item`);
      }

      setSuccess(`Item ${editingRede ? "atualizado" : "criado"} com sucesso!`);
      await fetchRedesSociais();
      closeModal();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erro ao salvar item:", error);
      setError(error instanceof Error ? error.message : "Erro ao salvar item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rede: RedeSocial) => {
    if (!confirm(`Tem certeza que deseja remover ${rede.nome}?`)) {
      return;
    }

    try {
      const response = await fetch("/api/clinica-info", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rede.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao remover item");
      }

      setSuccess("Item removido com sucesso!");
      await fetchRedesSociais();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erro ao remover item:", error);
      setError(error instanceof Error ? error.message : "Erro ao remover item");
    }
  };

  const getSocialIcon = (nome: string, tipo?: 'rede_social' | 'contato') => {
    const lowerName = nome.toLowerCase();
    const tipoDetectado = tipo || detectTipo(nome);
    
    if (tipoDetectado === 'contato') {
      if (lowerName.includes('whatsapp')) return <MessageCircle className="h-4 w-4 text-green-500" />;
      return <Phone className="h-4 w-4 text-gray-500" />;
    }
    
    // Redes sociais
    if (lowerName.includes('facebook')) return <div className="w-4 h-4 bg-blue-600 rounded-full"></div>;
    if (lowerName.includes('instagram')) return <div className="w-4 h-4 bg-pink-500 rounded-full"></div>;
    if (lowerName.includes('twitter')) return <div className="w-4 h-4 bg-blue-400 rounded-full"></div>;
    if (lowerName.includes('linkedin')) return <div className="w-4 h-4 bg-blue-700 rounded-full"></div>;
    if (lowerName.includes('youtube')) return <div className="w-4 h-4 bg-red-600 rounded-full"></div>;
    return <Globe className="h-4 w-4 text-gray-600" />;
  };

  const formatarExibicao = (item: RedeSocial) => {
    const tipoDetectado = item.tipo || detectTipo(item.nome);
    
    if (tipoDetectado === 'contato') {
      // Para contatos, mostra o valor direto (número de telefone)
      return <span className="text-sm text-gray-700">{item.link}</span>;
    } else {
      // Para redes sociais, mostra como link clicável
      return (
        <a 
          href={item.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm break-all"
        >
          {item.link}
        </a>
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Contatos e Redes Sociais
              </CardTitle>
              <CardDescription>
                Gerencie contatos e redes sociais da clínica
              </CardDescription>
            </div>
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Item
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Feedback Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Itens Cadastrados ({redesSociais.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : redesSociais.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum item cadastrado</p>
              <p className="text-sm mt-2">
                Clique em &ldquo;Novo Item&rdquo; para adicionar o primeiro
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {redesSociais.map((rede) => (
                <div
                  key={rede.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        {getSocialIcon(rede.nome, rede.tipo)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{rede.nome}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              (rede.tipo || detectTipo(rede.nome)) === 'contato' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {(rede.tipo || detectTipo(rede.nome)) === 'contato' ? 'Contato' : 'Rede Social'}
                            </span>
                          </div>
                          {rede.descricao && (
                            <p className="text-sm text-gray-600">{rede.descricao}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-7">
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        <div className="text-sm">
                          {formatarExibicao(rede)}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 ml-7">
                        Criado em: {new Date(rede.created_at || '').toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(rede)}
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(rede)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRede ? "Editar Item" : "Novo Item"}
            </DialogTitle>
            <DialogDescription>
              {editingRede
                ? "Atualize as informações do item"
                : "Adicione um novo contato ou rede social da clínica"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Select 
                value={nomePreDefinido} 
                onValueChange={(value) => {
                  setNomePreDefinido(value);
                  if (value === 'outro') {
                    setUsarOutroNome(true);
                    setNome("");
                  } else {
                    setUsarOutroNome(false);
                    const item = redesSociaisPadrao.find(item => item.value === value);
                    if (item) {
                      setNome(item.label);
                      setTipo(item.tipo);
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  {redesSociaisPadrao.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {usarOutroNome && (
                <div className="mt-2">
                  <Input
                    id="nome-personalizado"
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value);
                      setTipo(detectTipo(e.target.value));
                    }}
                    placeholder="Digite o nome personalizado..."
                    required
                  />
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Tipo: {tipo === 'contato' ? 'Contato' : 'Rede Social'}
              </p>
            </div>

            <div>
              <Label htmlFor="link">
                {tipo === 'contato' ? 'Número/Contato *' : 'Link/URL *'}
              </Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={tipo === 'contato' ? 'Ex: (11) 99999-9999 ou 5511999999999' : 'https://...'}
                required
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição sobre este canal"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Salvando..."
                  : editingRede
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
