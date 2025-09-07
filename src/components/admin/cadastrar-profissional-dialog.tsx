"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { criarProfissional } from "../../app/actions/criar-profissional";
import { RefreshCw } from "lucide-react";

interface CadastrarProfissionalDialogProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function CadastrarProfissionalDialog({ onSuccess, onError }: CadastrarProfissionalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [crp, setCrp] = useState("");
  const [descricao, setDescricao] = useState("");
  const [senha, setSenha] = useState("");

  const resetForm = () => {
    setNome("");
    setEmail("");
    setArea("");
    setEspecialidade("");
    setCrp("");
    setDescricao("");
    setSenha("");
    setError(null);
    setSuccess(null);
  };

  const generatePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    setSenha(newPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!nome.trim() || !email.trim() || !especialidade.trim()) {
      setError("Preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      // Usar senha do estado ou gerar uma se estiver vazia
      const senhaFinal = senha.trim() || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      const result = await criarProfissional({
        nome,
        email,
        senha: senhaFinal,
        area,
        especialidade,
        crp,
        descricao,
      });

      setSuccess(`Profissional cadastrado com sucesso! Senha temporária: ${result.senha}`);
      onSuccess?.();
      setOpen(false);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao cadastrar profissional.";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-azul-escuro text-white">
          Cadastrar profissional
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Cadastrar profissional</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo profissional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="area">Área</Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="especialidade">Especialidade</Label>
            <Input
              id="especialidade"
              value={especialidade}
              onChange={(e) => setEspecialidade(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="crp">CRP</Label>
            <Input
              id="crp"
              value={crp}
              onChange={(e) => setCrp(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="senha">Senha</Label>
            <div className="flex gap-2">
              <Input
                id="senha"
                type="text"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Clique em gerar senha ou digite uma"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePassword}
                className="px-3"
                title="Gerar senha aleatória"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {senha ? "Senha definida" : "Será gerada automaticamente se não preenchida"}
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-azul-escuro text-white"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
