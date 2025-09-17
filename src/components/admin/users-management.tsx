"use client";

import { useEffect, useMemo, useState } from "react";
import { criarProfissional } from "../../app/actions/criar-profissional"; // sua server action
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadastrarProfissionalDialog } from "@/components/admin/cadastrar-profissional-dialog";
import { Users, UserCheck } from "lucide-react";
import { ExpandableUserTable } from "./expandable-user-table";
import { UserMobileCards } from "./user-mobile-cards";
import { ResetPasswordModal } from "./reset-password-modal";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: "administrador" | "profissional" | "comum";
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  area?: string;
  especialidade?: string;
  bio?: string;
  crp?: string;
};

function genPassword(): string {
  const part = Math.random().toString(36).slice(-6);
  const num = Math.floor(100 + Math.random() * 900).toString();
  return `${part}${num}`;
}

export function UsersManagement() {
  const [profissionais, setProfissionais] = useState<Usuario[]>([]);
  const [pacientes, setPacientes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros de busca
  const [searchProfissionais, setSearchProfissionais] = useState("");
  const [searchPacientes, setSearchPacientes] = useState("");

  // Estado para linhas expandidas
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Estado para modal de reset de senha
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<Usuario | null>(null);

  // form
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senhaGerada, setSenhaGerada] = useState<string>(genPassword());
  const [area, setArea] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);

    try {
      // Buscar profissionais
      const profResponse = await fetch('/api/admin/usuarios?tipo_usuario=profissional');
      if (profResponse.ok) {
        const profData = await profResponse.json();
        setProfissionais(profData.usuarios as Usuario[]);
      } else {
        console.error("Erro ao buscar profissionais:", profResponse.statusText);
      }

      // Buscar pacientes
      const pacResponse = await fetch('/api/admin/usuarios?tipo_usuario=comum');
      if (pacResponse.ok) {
        const pacData = await pacResponse.json();
        setPacientes(pacData.usuarios as Usuario[]);
      } else {
        console.error("Erro ao buscar pacientes:", pacResponse.statusText);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }

    setLoading(false);
  }

  // Filtragem de profissionais
  const filteredProfissionais = useMemo(() => {
    if (!searchProfissionais.trim()) return profissionais;
    const termoLower = searchProfissionais.toLowerCase();
    return profissionais.filter(
      (prof) =>
        prof.nome.toLowerCase().includes(termoLower) ||
        prof.email.toLowerCase().includes(termoLower) ||
        (prof.area?.toLowerCase().includes(termoLower)) ||
        (prof.especialidade?.toLowerCase().includes(termoLower))
    );
  }, [profissionais, searchProfissionais]);

  // Filtragem de pacientes
  const filteredPacientes = useMemo(() => {
    if (!searchPacientes.trim()) return pacientes;
    const termoLower = searchPacientes.toLowerCase();
    return pacientes.filter(
      (pac) =>
        pac.nome.toLowerCase().includes(termoLower) ||
        pac.email.toLowerCase().includes(termoLower)
    );
  }, [pacientes, searchPacientes]);

  const totalProfissionaisAtivos = useMemo(
    () => filteredProfissionais.filter((i) => i.ativo).length,
    [filteredProfissionais]
  );

  const totalPacientesAtivos = useMemo(
    () => filteredPacientes.filter((i) => i.ativo).length,
    [filteredPacientes]
  );

  function resetForm() {
    setNome("");
    setEmail("");
    setArea("");
    setEspecialidade("");
    setSenhaGerada(genPassword());
    setError(null);
    setSuccess(null);
  }

  async function onCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nome.trim() || !email.trim() || !senhaGerada.trim()) {
      setError("Preencha Nome, E-mail e gere uma senha.");
      return;
    }

    try {
      await criarProfissional({
        nome,
        email,
        senha: senhaGerada,
        area,
        especialidade,
      });

      setSuccess(
        `Profissional criado com sucesso! Senha temporária: ${senhaGerada}`
      );
      resetForm();
      fetchUsers();

      // Limpa a mensagem de sucesso após 5s
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      console.error("Erro ao criar profissional:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar profissional");
    }
  }

  async function onToggleActive(u: Usuario) {
    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: u.id,
          ativo: !u.ativo
        }),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        console.error("Erro ao atualizar status do usuário:", response.statusText);
        setError("Erro ao atualizar status do usuário");
      }
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      setError("Erro ao atualizar status do usuário");
    }
  }

  async function onResetPassword(u: Usuario) {
    try {
      const response = await fetch('/api/admin/usuarios/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: u.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Senha redefinida: ${data.newPassword}`);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        console.error("Erro ao resetar senha:", response.statusText);
        setError("Erro ao resetar senha");
      }
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      setError("Erro ao resetar senha");
    }
  }

  // Função para alternar expansão de linha
  function toggleRowExpansion(userId: string) {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }

  // Função para abrir modal de reset de senha
  function onOpenResetPasswordModal(user: Usuario) {
    setSelectedUserForReset(user);
    setResetPasswordModalOpen(true);
  }

  // Função para confirmar reset de senha
  async function onConfirmResetPassword(userId: string, password: string) {
    try {
      const response = await fetch('/api/admin/usuarios/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Senha redefinida com sucesso: ${data.newPassword}`);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        console.error("Erro ao resetar senha:", response.statusText);
        setError("Erro ao resetar senha");
      }
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      setError("Erro ao resetar senha");
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccess(null)}
                className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho com gradiente */}
      <div className="bg-gradient-to-r from-azul-escuro to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">
            Gerenciamento de Usuários
          </h2>
        </div>
        <p className="text-blue-100 text-sm">
          Gerencie profissionais e pacientes do sistema
        </p>
      </div>

      {/* Tabs para Profissionais e Pacientes */}
      <Tabs defaultValue="profissionais" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profissionais" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Profissionais ({profissionais.length})
          </TabsTrigger>
          <TabsTrigger value="pacientes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pacientes ({pacientes.length})
          </TabsTrigger>
        </TabsList>

        {/* Aba Profissionais */}
        <TabsContent value="profissionais" className="space-y-6">
          {/* Botão de cadastro */}
          <div className="flex justify-end">
            <CadastrarProfissionalDialog
              onSuccess={() => {
                fetchUsers();
                setSuccess("Profissional cadastrado com sucesso!");
                setTimeout(() => setSuccess(null), 5000);
              }}
              onError={(error: string) => {
                setError(error);
              }}
            />
          </div>

          {/* Campo de busca para profissionais */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-azul-escuro/60" />
                </div>
                <Input
                  placeholder="Buscar por nome, email, área ou especialidade..."
                  value={searchProfissionais}
                  onChange={(e) => setSearchProfissionais(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 rounded-lg focus:border-azul-escuro focus:ring-2 focus:ring-azul-escuro/20 text-gray-900 placeholder-gray-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-azul-escuro" />
                Profissionais ({filteredProfissionais.length}) — Ativos: {totalProfissionaisAtivos}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-escuro"></div>
                </div>
              ) : profissionais.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum profissional encontrado.</p>
                </div>
              ) : (
                <>
                  <ExpandableUserTable
                    users={filteredProfissionais}
                    expandedRows={expandedRows}
                    onToggleExpansion={toggleRowExpansion}
                    onToggleActive={onToggleActive}
                    onOpenResetPasswordModal={onOpenResetPasswordModal}
                    userType="profissional"
                  />

                  <UserMobileCards
                    users={filteredProfissionais}
                    onToggleActive={onToggleActive}
                    onOpenResetPasswordModal={onOpenResetPasswordModal}
                    userType="profissional"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Pacientes */}
        <TabsContent value="pacientes" className="space-y-6">
          {/* Campo de busca para pacientes */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-azul-escuro/60" />
                </div>
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchPacientes}
                  onChange={(e) => setSearchPacientes(e.target.value)}
                  className="pl-10 h-12 border-2 border-gray-200 rounded-lg focus:border-azul-escuro focus:ring-2 focus:ring-azul-escuro/20 text-gray-900 placeholder-gray-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-azul-escuro" />
                Pacientes ({filteredPacientes.length}) — Ativos: {totalPacientesAtivos}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-escuro"></div>
                </div>
              ) : pacientes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum paciente encontrado.</p>
                </div>
              ) : (
                <>
                  <ExpandableUserTable
                    users={filteredPacientes}
                    expandedRows={expandedRows}
                    onToggleExpansion={toggleRowExpansion}
                    onToggleActive={onToggleActive}
                    onOpenResetPasswordModal={onOpenResetPasswordModal}
                    userType="paciente"
                  />

                  <UserMobileCards
                    users={filteredPacientes}
                    onToggleActive={onToggleActive}
                    onOpenResetPasswordModal={onOpenResetPasswordModal}
                    userType="paciente"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Reset de Senha */}
      <ResetPasswordModal
        isOpen={resetPasswordModalOpen}
        onClose={() => {
          setResetPasswordModalOpen(false);
          setSelectedUserForReset(null);
        }}
        user={selectedUserForReset}
        onConfirm={onConfirmResetPassword}
      />
    </div>
  );
}
