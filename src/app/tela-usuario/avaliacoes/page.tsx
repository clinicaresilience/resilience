"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { AvaliacaoProfissional } from "@/components/patient/avaliacao-profissional";
import { Loader2 } from "lucide-react";

export default function AvaliacoesPage() {
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Erro ao obter usuário:', error);
          return;
        }
        
        setUserId(user.id);
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Erro ao carregar dados do usuário</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <AvaliacaoProfissional pacienteId={userId} />
    </div>
  );
}
