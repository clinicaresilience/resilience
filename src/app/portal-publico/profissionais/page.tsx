// src/app/portal-publico/profissionais/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import logo from "../../assets/icones/logo.png";
import Image from "next/image";
import { CheckCircle, Users } from "lucide-react";
import { useState, useEffect } from "react";

type Profissional = {
  id: string;
  nome: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  especialidade?: string;
  area?: string;
  crp?: string;
};

export default function ProfissionaisAgendamentos() {
  const [data, setData] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfissionais() {
      try {
        setLoading(true);
        const response = await fetch('/api/profissionais');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Erro ao carregar profissionais');
        }
        
        setData(result.data || []);
      } catch (err) {
        console.error('Erro ao buscar profissionais:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchProfissionais();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#02b1aa] mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando profissionais...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-500 mb-2">Erro ao carregar profissionais</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-[#02b1aa] hover:bg-[#029fdf]"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Nenhum profissional encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid font-['Red_Hat_Display'] sm:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-7xl">
      {data.map((prof) => (
        <div key={prof.id} className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-3xl blur opacity-20 group-hover:opacity-25 transition duration-1000"></div>
          <Card className="relative bg-white rounded-3xl shadow-2xl p-8 border border-[#edfffe] hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col justify-between text-center h-[600px]">
            {/* Foto */}
            <div className="w-40 h-40 -mt-16 mb-6 rounded-full overflow-hidden border-4 border-[#02b1aa] shadow-lg bg-gray-100 mx-auto group-hover:border-[#029fdf] transition-colors duration-300">
              {prof.avatar_url ? (
                <img
                  src={prof.avatar_url}
                  alt={`Foto de ${prof.nome}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Image
                  src={logo}
                  alt={`Foto de ${prof.nome}`}
                  className="object-cover w-full h-full"
                />
              )}
            </div>

            {/* Cabeçalho */}
            <CardHeader className="p-0 w-full mb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {prof.nome}
              </CardTitle>

              <p className="text-base text-[#02b1aa] font-semibold mb-1">
                {prof.especialidade || "Psicólogo"}
              </p>

              <p className="text-sm text-gray-500">
                {prof.crp ? `CRP: ${prof.crp}` : "Profissional Certificado"}
              </p>
            </CardHeader>

            {/* Conteúdo */}
            <CardContent className="p-0 mt-4 flex flex-col flex-1">
              <div className="text-gray-700 text-base mb-6 leading-relaxed flex-1 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                maxHeight: '6rem'
              }}>
                {prof.bio || "Profissional experiente em sua área de atuação."}
              </div>

              <div className="mt-6 flex items-center text-[#02b1aa] font-semibold text-sm mb-4">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Especialista Certificado</span>
              </div>

              <Button
                className="w-full mt-auto bg-gradient-to-r from-[#02b1aa] to-[#029fdf] text-white font-semibold rounded-xl hover:from-[#029fdf] hover:to-[#01c2e3] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                asChild
              >
                <Link
                  className="w-full py-3"
                  href={`/portal-publico/profissionais/${prof.id}`}
                >
                  Ver Agenda
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
