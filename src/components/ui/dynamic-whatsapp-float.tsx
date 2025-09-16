"use client";

import { useState, useEffect } from "react";
import { WhatsAppFloat } from "./whatsapp-float";

export function DynamicWhatsAppFloat() {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        console.log("🔍 Buscando número do WhatsApp da clínica...");
        const response = await fetch("/api/clinica-info");
        const data = await response.json();

        console.log("📊 Resposta da API:", data);

        if (response.ok && data.data) {
          // Procura por uma rede social WhatsApp na lista
          const whatsappRede = data.data.find((rede: { nome: string; link: string }) => 
            rede.nome.toLowerCase().includes('whatsapp')
          );
          
          console.log("📱 WhatsApp encontrado:", whatsappRede);
          
          if (whatsappRede?.link) {
            // Usa diretamente o número/link cadastrado na tabela
            console.log("✅ Usando número do banco:", whatsappRede.link);
            setPhoneNumber(whatsappRede.link);
          } else {
            console.log("⚠️ WhatsApp não encontrado, ícone não será exibido");
            setPhoneNumber(null);
          }
        } else {
          console.log("❌ Erro na resposta da API:", data);
        }
      } catch (error) {
        console.error("💥 Erro ao buscar número do WhatsApp:", error);
        // Mantém o número padrão em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchWhatsAppNumber();
  }, []);

  // Não renderiza nada enquanto está carregando para evitar flash
  if (loading) {
    return null;
  }

  // Só renderiza o botão se houver um número cadastrado
  if (!phoneNumber) {
    return null;
  }

  return (
    <WhatsAppFloat 
      phoneNumber={phoneNumber}
      message="Olá! Gostaria de mais informações sobre a Clínica Resilience."
    />
  );
}
