// src/app/portal-publico/page.tsx
"use client";

import Image from "next/image";
// Remove import since we'll use src directly
import ProfissionaisAgendamentos from "./profissionais/page";
import Navegacao from "@/components/navegacao";
import WhatsAppFloatButton from "@/components/whatsapp-float-button";

export default function AgendamentosPublico() {
  return (
    <>
      <Navegacao />
      <WhatsAppFloatButton />
      <div className="min-h-screen bg-gradient-to-br py-8 md:py-12 lg:py-16 from-slate-50 via-[#edfffe]/40 to-[#f5b26b]/8 relative overflow-hidden font-['Red_Hat_Display']">

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#02b1aa]/15 to-[#029fdf]/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-[#7762b6]/10 to-[#f5b26b]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-[#01c2e3] rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-[#7762b6] rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/3 left-1/2 w-24 h-24 bg-[#f5b26b] rounded-full blur-2xl"></div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full px-4 md:px-6 py-2 mb-4 md:mb-6">
              <span className="text-[#02b1aa] font-medium text-xs md:text-sm">
                PROFISSIONAIS ESPECIALIZADOS
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-4 md:mb-6 leading-tight px-4">
              Profissionais{" "}
              <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                Especializados
              </span>
            </h2>
            <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-6 md:mb-8"></div>
            <p className="text-sm md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Conheça nossos psicólogos certificados e agende sua consulta.
            </p>
          </div>

          <ProfissionaisAgendamentos />
        </div>
      </div>
    </>
  );
}
