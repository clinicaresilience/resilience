"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

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

interface ExpandableUserTableProps {
  users: Usuario[];
  expandedRows: Set<string>;
  onToggleExpansion: (userId: string) => void;
  onToggleActive: (user: Usuario) => void;
  onResetPassword: (user: Usuario) => void;
  userType: "profissional" | "paciente";
}

export function ExpandableUserTable({
  users,
  expandedRows,
  onToggleExpansion,
  onToggleActive,
  onResetPassword,
  userType,
}: ExpandableUserTableProps) {
  const renderExpandedContent = (user: Usuario) => {
    if (userType === "profissional") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Área:</span>
            <p className="text-gray-600 mt-1">{user.informacoes_adicionais?.area || "-"}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Especialidade:</span>
            <p className="text-gray-600 mt-1">{user.informacoes_adicionais?.especialidade || "-"}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Criado em:</span>
            <p className="text-gray-600 mt-1">{new Date(user.criado_em).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Criado em:</span>
          <p className="text-gray-600 mt-1">{new Date(user.criado_em).toLocaleDateString("pt-BR")}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Última atualização:</span>
          <p className="text-gray-600 mt-1">{new Date(user.atualizado_em).toLocaleDateString("pt-BR")}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm min-w-[600px]">
        <thead>
          <tr className="text-left border-b border-gray-200">
            <th className="pb-3 font-semibold text-gray-900 w-8"></th>
            <th className="pb-3 font-semibold text-gray-900 w-40">Nome</th>
            <th className="pb-3 font-semibold text-gray-900 w-56">Email</th>
            <th className="pb-3 font-semibold text-gray-900 w-20">Acesso</th>
            <th className="pb-3 font-semibold text-gray-900 w-28">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => {
            const isExpanded = expandedRows.has(user.id);
            return (
              <>
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleExpansion(user.id)}
                      className="h-6 w-6 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-gray-900">{user.nome}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="text-gray-600">{user.email}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.ativo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {user.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onToggleActive(user)}
                        className="text-xs"
                      >
                        {user.ativo ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onResetPassword(user)}
                        className="text-xs"
                      >
                        Resetar
                      </Button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr key={`${user.id}-expanded`} className="bg-gray-50">
                    <td colSpan={5} className="px-4 py-4">
                      {renderExpandedContent(user)}
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
