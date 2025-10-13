"use client";

import { useState } from "react";
import { CompanySectorsManagement } from "./company-sectors-management";

interface Company {
  id: string;
  nome: string;
  cnpj: string;
  codigo: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

interface CompanyDetailsTabsProps {
  empresa: Company;
}

export function CompanyDetailsTabs({ empresa }: CompanyDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState<"detalhes" | "setores">("detalhes");

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("detalhes")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === "detalhes"
                  ? "border-azul-escuro text-azul-escuro"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab("setores")}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === "setores"
                  ? "border-azul-escuro text-azul-escuro"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Setores
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "detalhes" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-azul-escuro mb-6">
              Informações da Empresa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-gray-900">{empresa.nome}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <p className="text-gray-900 font-mono">{empresa.cnpj}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <p className="text-gray-900 font-mono font-semibold">
                  {empresa.codigo}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      empresa.ativa
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {empresa.ativa ? "Ativa" : "Inativa"}
                  </span>
                </p>
              </div>

              {empresa.endereco && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <p className="text-gray-900">{empresa.endereco}</p>
                </div>
              )}

              {empresa.cidade && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <p className="text-gray-900">{empresa.cidade}</p>
                </div>
              )}

              {empresa.estado && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <p className="text-gray-900">{empresa.estado}</p>
                </div>
              )}

              {empresa.cep && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <p className="text-gray-900 font-mono">{empresa.cep}</p>
                </div>
              )}

              {empresa.telefone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <p className="text-gray-900">{empresa.telefone}</p>
                </div>
              )}

              {empresa.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <p className="text-gray-900">{empresa.email}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Cadastro
                </label>
                <p className="text-gray-900">
                  {new Date(empresa.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Última Atualização
                </label>
                <p className="text-gray-900">
                  {new Date(empresa.updated_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "setores" && (
          <CompanySectorsManagement empresaId={empresa.id} />
        )}
      </div>
    </div>
  );
}
