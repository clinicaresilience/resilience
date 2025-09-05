"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/client";

export default function PrimeiroAcessoModal({
  primeiroAcesso,
  userId,
  userEmail, 
}: {
  primeiroAcesso: boolean;
  userId: string;
  userEmail: string;
}) {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [tentarSalvar, setTentarSalvar] = useState(false);

  const senhasIguais = senha && confirmarSenha && senha === confirmarSenha;

  async function handleSalvar() {
    setTentarSalvar(true);

    if (!senhasIguais) return;
    setLoading(true);

    try {
      // 1. Chama API para mudar a senha e marcar primeiro_acesso=false
      const res = await fetch("/api/alterar-senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword: senha }),
      });

      if (!res.ok) throw new Error("Erro ao alterar senha");

      // 2. Reautentica o usuário com a senha nova
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: senha,
      });

      if (error) throw error;

      // 3. Recarrega a página já logado com a senha nova
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Não foi possível alterar a senha");
    } finally {
      setLoading(false);
    }
  }

  if (!primeiroAcesso) return null;

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Redefina sua senha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Digite sua nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirme sua nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
          {tentarSalvar && !senhasIguais && (
            <p className="text-red-500 text-sm">As senhas não coincidem</p>
          )}
          <Button onClick={handleSalvar} disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
