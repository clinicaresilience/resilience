"use client";

import { Button } from "@/components/ui/button";

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

interface UserMobileCardsProps {
  users: Usuario[];
  onToggleActive: (user: Usuario) => void;
  onOpenResetPasswordModal: (user: Usuario) => void;
  userType: "profissional" | "paciente";
}

export function UserMobileCards({
  users,
  onToggleActive,
  onOpenResetPasswordModal,
  userType,
}: UserMobileCardsProps) {
  return (
    <div className="md:hidden space-y-4">
      {users.map((user) => (
        <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{user.nome}</h3>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
              user.ativo
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
              {user.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>

          {userType === "profissional" && (
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="font-medium text-gray-700">Área:</span>
                <p className="text-gray-600 truncate">{user.informacoes_adicionais?.area || "-"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Especialidade:</span>
                <p className="text-gray-600 truncate">{user.informacoes_adicionais?.especialidade || "-"}</p>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 mb-3">
            Criado em: {new Date(user.criado_em).toLocaleDateString("pt-BR")}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleActive(user)}
              className="flex-1 text-xs"
            >
              {user.ativo ? "Desativar" : "Ativar"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onOpenResetPasswordModal(user)}
              className="flex-1 text-xs"
            >
              Resetar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
