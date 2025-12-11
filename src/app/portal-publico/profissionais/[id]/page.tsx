"use client";

import { PerfilProfissionalClient } from "./client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

type Profissional = {
  id: string;
  nome: string;
  avatar_url?: string;
  bio?: string;
  especialidade?: string;
  area?: string;
  crp?: string;
};

type Agenda = {
  id: string;
  data: string;
  hora: string;
  disponivel: boolean;
};

export default function PerfilProfissional() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<{profissional: Profissional; agendas: Agenda[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function getProfissional() {
      try {
        const res = await fetch(`/api/profissionais/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setError(true);
          return;
        }

        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching professional:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getProfissional();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02b1aa] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando profissional...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Profissional não encontrado.</p>
      </div>
    );
  }

  const { profissional, agendas } = data;

  return (
    <PerfilProfissionalClient 
      profissional={profissional} 
      agendas={agendas} 
    />
  );
}
