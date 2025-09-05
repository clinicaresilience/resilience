"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/client";
import { criarProfissional } from "../../app/actions/criar-profissional"; // sua server action
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    [key: string]: any;
  };
};

function genPassword(): string {
  const part = Math.random().toString(36).slice(-6);
  const num = Math.floor(100 + Math.random() * 900).toString();
  return `${part}${num}`;
}

export function UsersManagement() {
  const supabase = createClient();

  const [items, setItems] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

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
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("tipo_usuario", "profissional")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao buscar usuários:", error);
    } else {
      setItems(data as Usuario[]);
    }
    setLoading(false);
  }

  const totalAtivos = useMemo(
    () => items.filter((i) => i.ativo).length,
    [items]
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
        `Usuário criado com sucesso! Senha temporária: ${senhaGerada}`
      );
      resetForm();
      fetchUsers();

      // Limpa a mensagem de sucesso após 5s
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error("Erro ao criar profissional:", err);
      setError(err.message || "Erro ao criar profissional");
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
    } catch (err) {
      console.error("Erro ao resetar senha:", err);
      setError("Erro ao resetar senha");
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* FORM */}
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar novo profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreateUser} className="grid gap-4">
            <div>
              <Label>Nome</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Área</Label>
              <Input value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div>
              <Label>Especialidade</Label>
              <Input
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
              />
            </div>
            <div>
              <Label>Senha gerada</Label>
              <div className="flex gap-2">
                <Input value={senhaGerada} readOnly />
                <Button
                  type="button"
                  onClick={() => setSenhaGerada(genPassword())}
                >
                  Gerar outra
                </Button>
              </div>
            </div>

            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            <div className="flex gap-2">
              <Button type="submit" className="bg-azul-escuro text-white">
                Criar
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* LISTA */}
      <Card>
        <CardHeader>
          <CardTitle>
            Profissionais ({items.length}) — Ativos: {totalAtivos}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Área</th>
                  <th>Especialidade</th>
                  <th>Acesso</th>
                  <th>Criado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>{u.informacoes_adicionais?.area || "-"}</td>
                    <td>{u.informacoes_adicionais?.especialidade || "-"}</td>
                    <td>{u.ativo ? "Ativo" : "Inativo"}</td>
                    <td>{new Date(u.criado_em).toLocaleString()}</td>
                    <td className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onToggleActive(u)}
                      >
                        {u.ativo ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onResetPassword(u)}
                      >
                        Resetar senha
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
