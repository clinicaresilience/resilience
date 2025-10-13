"use client";

import { useState, useEffect } from "react";
import { CompanySector } from "@/types/company-sectors";

interface CompanySectorsManagementProps {
  empresaId: string;
}

export function CompanySectorsManagement({
  empresaId,
}: CompanySectorsManagementProps) {
  const [setores, setSetores] = useState<CompanySector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectorName, setNewSectorName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Buscar setores
  const fetchSetores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/companies/${empresaId}/setores`);

      if (!response.ok) {
        throw new Error("Erro ao buscar setores");
      }

      const data = await response.json();
      setSetores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetores();
  }, [empresaId]);

  // Adicionar novo setor
  const handleAddSetor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSectorName.trim()) {
      alert("Nome do setor é obrigatório");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/companies/${empresaId}/setores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: newSectorName.trim(),
          ativo: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar setor");
      }

      setNewSectorName("");
      setShowAddForm(false);
      await fetchSetores();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar setor");
    } finally {
      setSubmitting(false);
    }
  };

  // Editar setor
  const handleEditSetor = async (setorId: string) => {
    if (!editingName.trim()) {
      alert("Nome do setor é obrigatório");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/companies/${empresaId}/setores/${setorId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: editingName.trim(),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar setor");
      }

      setEditingId(null);
      setEditingName("");
      await fetchSetores();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar setor");
    } finally {
      setSubmitting(false);
    }
  };

  // Alternar status ativo/inativo
  const handleToggleAtivo = async (setor: CompanySector) => {
    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/companies/${empresaId}/setores/${setor.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ativo: !setor.ativo,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar setor");
      }

      await fetchSetores();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar setor");
    } finally {
      setSubmitting(false);
    }
  };

  // Deletar setor
  const handleDeleteSetor = async (setorId: string) => {
    if (!confirm("Tem certeza que deseja deletar este setor?")) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/companies/${empresaId}/setores/${setorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar setor");
      }

      await fetchSetores();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar setor");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-escuro"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erro: {error}</p>
        <button
          onClick={fetchSetores}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-azul-escuro">
          Gerenciar Setores
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-azul-escuro text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          disabled={submitting}
        >
          {showAddForm ? "Cancelar" : "Adicionar Setor"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSetor}
          className="bg-gray-50 rounded-lg p-4 mb-6"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={newSectorName}
              onChange={(e) => setNewSectorName(e.target.value)}
              placeholder="Nome do novo setor"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-escuro focus:border-transparent text-gray-900"
              disabled={submitting}
              autoFocus
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      {/* Setores List */}
      {setores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            Nenhum setor cadastrado para esta empresa.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-azul-escuro hover:underline"
          >
            Adicionar o primeiro setor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {setores.map((setor) => (
            <div
              key={setor.id}
              className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              {editingId === setor.id ? (
                // Edit Mode
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-escuro focus:border-transparent text-gray-900"
                    disabled={submitting}
                    autoFocus
                  />
                  <button
                    onClick={() => handleEditSetor(setor.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    disabled={submitting}
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-medium">
                      {setor.nome}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        setor.ativo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {setor.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(setor.id);
                        setEditingName(setor.nome);
                      }}
                      className="text-azul-escuro hover:text-opacity-80 px-3 py-1 rounded transition-colors"
                      disabled={submitting}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleAtivo(setor)}
                      className={`px-3 py-1 rounded transition-colors ${
                        setor.ativo
                          ? "text-yellow-600 hover:text-yellow-700"
                          : "text-green-600 hover:text-green-700"
                      }`}
                      disabled={submitting}
                    >
                      {setor.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      onClick={() => handleDeleteSetor(setor.id)}
                      className="text-red-600 hover:text-red-700 px-3 py-1 rounded transition-colors"
                      disabled={submitting}
                    >
                      Deletar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
