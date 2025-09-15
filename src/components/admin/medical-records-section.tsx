"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText } from "lucide-react";
import { NovoProntuarioClient } from "@/components/professional/novo-prontuario-client";

interface Professional {
  id: string;
  nome: string;
  especialidade: string;
  tipo_usuario: string;
}

interface Prontuario {
  id: string;
  paciente_id: string;
  profissional_atual_id: string;
  criado_em: string;
  atualizado_em: string;
  paciente: {
    id: string;
    nome: string;
    email: string;
  };
  registros: Array<{
    id: string;
    texto: string;
    criado_em: string;
    profissional_id: string;
    assinatura_digital: {
      nome: string;
      cpf: string;
      crp: string;
      data: string;
    };
  }>;
}

// Wrapper do componente profissional com funcionalidades de admin
function AdminProntuariosWrapper() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [transferModal, setTransferModal] = useState<{ prontuario: Prontuario; newProfessionalId: string } | null>(null);
  const [transferring, setTransferring] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await fetch("/api/profissionais");
        if (response.ok) {
          const data = await response.json();
          setProfessionals(data.filter((p: Professional) => p.tipo_usuario === 'profissional') || []);
        }
      } catch (error) {
        console.error("Erro ao buscar profissionais:", error);
      }
    };
    
    fetchProfessionals();
  }, []);

  // Transferir paciente para novo profissional
  const transferPatient = async (prontuarioId: string, newProfessionalId: string) => {
    if (transferring) return;

    try {
      setTransferring(prontuarioId);
      
      const response = await fetch('/api/prontuarios/transferir-paciente', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prontuario_id: prontuarioId,
          novo_profissional_id: newProfessionalId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setTransferModal(null);
        alert('Paciente transferido com sucesso!');
        // Recarregar a página para atualizar os dados
        window.location.reload();
      } else {
        alert(result.error || 'Erro ao transferir paciente');
      }
    } catch (error) {
      console.error('Erro ao transferir paciente:', error);
      alert('Erro ao transferir paciente');
    } finally {
      setTransferring(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho especial para admin */}
      <div className="bg-gradient-to-r from-azul-escuro to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Gerenciamento de Prontuários - Administrador</h2>
        </div>
        <p className="text-blue-100 text-sm">
          Como administrador, você tem acesso completo a todos os prontuários e pode transferir pacientes entre profissionais
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="bg-white/10 px-3 py-1 rounded-full">
            ✓ Visualizar todos os prontuários
          </span>
          <span className="bg-white/10 px-3 py-1 rounded-full">
            ✓ Gerenciar PDFs
          </span>
          <span className="bg-white/10 px-3 py-1 rounded-full">
            ✓ Transferir pacientes
          </span>
        </div>
      </div>

      {/* Componente de prontuários com funcionalidades completas */}
      <NovoProntuarioClient 
        profissionalNome="Administrador" 
        profissionalId="admin" 
        isAdmin={true}
      />

      {/* Modal de transferência (mantido para funcionalidade admin) */}
      {transferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="text-xl font-bold">Transferir Paciente</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Paciente:</strong> {transferModal.prontuario.paciente.nome}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Profissional atual:</strong> {professionals.find(p => p.id === transferModal.prontuario.profissional_atual_id)?.nome || 'Nome não encontrado'}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Novo profissional:</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-azul-escuro focus:border-transparent text-sm"
                  value={transferModal.newProfessionalId}
                  onChange={(e) => setTransferModal({ ...transferModal, newProfessionalId: e.target.value })}
                >
                  <option value="">Selecione um profissional</option>
                  {professionals
                    .filter(prof => prof.id !== transferModal.prontuario.profissional_atual_id)
                    .map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.nome} - {professional.especialidade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-700">
                    <p className="font-medium mb-2">Atenção:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>O prontuário será transferido para o novo profissional</li>
                      <li>O profissional anterior manterá acesso aos registros já criados</li>
                      <li>Apenas o novo profissional poderá adicionar novos registros</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setTransferModal(null)}
                disabled={transferring === transferModal.prontuario.id}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => transferPatient(transferModal.prontuario.id, transferModal.newProfessionalId)}
                disabled={!transferModal.newProfessionalId || transferring === transferModal.prontuario.id}
                className="bg-azul-escuro hover:bg-azul-escuro/90"
              >
                {transferring === transferModal.prontuario.id ? 'Transferindo...' : 'Confirmar Transferência'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MedicalRecordsSection() {
  return <AdminProntuariosWrapper />;
}
