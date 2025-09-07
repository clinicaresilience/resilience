"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/client";
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

type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: "administrador" | "profissional" | "comum";
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  informacoes_adicionais: {
    area?: string;
    especialidade?: string;
    [key: string]: unknown;
  };
};

function genPassword(): string {
  const part = Math.random().toString(36).slice(-6);
  const num = Math.floor(100 + Math.random() * 900).toString();
  return `${part}${num}`;
}

export function UsersManagement() {
  const supabase = createClient();

  const [profissionais, setProfissionais] = useState<Usuario[]>([]);
  const [pacientes, setPacientes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros de busca
  const [searchProfissionais, setSearchProfissionais] = useState("");
  const [searchPacientes, setSearchPacientes] = useState("");

  // Estado para linhas expandidas
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

    // Buscar profissionais
    const { data: profData, error: profError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("tipo_usuario", "profissional")
      .order("criado_em", { ascending: false });

    // Buscar pacientes
    const { data: pacData, error: pacError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("tipo_usuario", "comum")
      .order("criado_em", { ascending: false });

    if (profError) {
      console.error("Erro ao buscar profissionais:", profError);
    } else {
      setProfissionais(profData as Usuario[]);
    }

    if (pacError) {
      console.error("Erro ao buscar pacientes:", pacError);
    } else {
      setPacientes(pacData as Usuario[]);
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
        (prof.informacoes_adicionais?.area?.toLowerCase().includes(termoLower)) ||
        (prof.informacoes_adicionais?.especialidade?.toLowerCase().includes(termoLower))
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
    const { error } = await supabase
      .from("usuarios")
      .update({ ativo: !u.ativo })
      .eq("id", u.id);

    if (!error) fetchUsers();
  }

  async function onResetPassword(u: Usuario) {
    const nova = genPassword();
    try {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        u.id,
        {
          password: nova,
        }
      );
      if (authError) throw authError;
      setSuccess(`Senha redefinida: ${nova}`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: unknown) {
      console.error("Erro ao resetar senha:", err);
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

  return (
    <div className="w-full space-y-6">
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
                    onResetPassword={onResetPassword}
                    userType="profissional"
                  />

                  <UserMobileCards
                    users={filteredProfissionais}
                    onToggleActive={onToggleActive}
                    onResetPassword={onResetPassword}
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
                    onResetPassword={onResetPassword}
                    userType="paciente"
                  />

                  <UserMobileCards
                    users={filteredPacientes}
                    onToggleActive={onToggleActive}
                    onResetPassword={onResetPassword}
                    userType="paciente"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
