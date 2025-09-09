"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shuffle } from "lucide-react";

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

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario | null;
  onConfirm: (userId: string, password: string) => void;
}

function genPassword(): string {
  const part = Math.random().toString(36).slice(-6);
  const num = Math.floor(100 + Math.random() * 900).toString();
  return `${part}${num}`;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  user,
  onConfirm,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");

  const handleGeneratePassword = () => {
    setPassword(genPassword());
  };

  const handleConfirm = () => {
    if (user && password.trim()) {
      onConfirm(user.id, password.trim());
      onClose();
      setPassword("");
    }
  };

  const handleClose = () => {
    onClose();
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resetar Senha</DialogTitle>
          <DialogDescription>
            Defina uma nova senha para o usuário {user?.nome}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Nova Senha</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGeneratePassword}
                title="Gerar senha aleatória"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Clique no ícone para gerar uma senha aleatória
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!password.trim()}
            >
              Resetar Senha
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
