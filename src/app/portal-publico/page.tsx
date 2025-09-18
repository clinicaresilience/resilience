// src/app/portal-publico/page.tsx
import {
  Users,
  Target,
  Heart,
  Award,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import LogoResilience from "../../app/assets/icones/logoResilience.png";
import ProfissionaisAgendamentos from "./profissionais/page";

export default async function AgendamentosPublico() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Chama sua API interna (sem precisar de SITE_URL)
  const res = await fetch(`${baseUrl}/api/profissionais`, {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Erro ao buscar profissionais:", res.statusText);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#edfffe] to-[#f5b26b]/10 relative overflow-hidden font-['Red_Hat_Display']">
        {/* Logo no canto inferior direito */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition duration-500"></div>
            <div className="relative bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-2xl">
              <Image
                src={LogoResilience}
                alt="Logo Clínica Resilience"
                width={80}
                height={40}
                className="opacity-90 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#02b1aa] rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-[#029fdf] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-[#01c2e3] rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-[#7762b6] rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/3 left-1/2 w-24 h-24 bg-[#f5b26b] rounded-full blur-2xl"></div>
        </div>

   
        {/* Main Content */}
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full px-6 py-2 mb-6">
              <span className="text-[#02b1aa] font-medium text-sm">
                CONHEÇA NOSSA EQUIPE
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Profissionais{" "}
              <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
                Especializados
              </span>
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Conheça nossos psicólogos certificados e agende sua consulta.
            </p>
          </div>

          <p className="text-red-500 text-center">Erro ao carregar profissionais.</p>
        </div>
      </div>
    );
  }

  const profissionais = await res.json();

  return (
    <div className="min-h-screen bg-gradient-to-br py-16 from-slate-50 via-[#edfffe] to-[#f5b26b]/10 relative overflow-hidden font-['Red_Hat_Display']">
      {/* Logo no canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#02b1aa]/30 to-[#029fdf]/30 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition duration-500"></div>
          <div className="relative bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-2xl">
            <Image
              src={LogoResilience}
              alt="Logo Clínica Resilience"
              width={80}
              height={40}
              className="opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#02b1aa] rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-[#029fdf] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-[#01c2e3] rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-[#7762b6] rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/3 left-1/2 w-24 h-24 bg-[#f5b26b] rounded-full blur-2xl"></div>
      </div>

      {/* Hero Section */}
   

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full px-6 py-2 mb-6">
            <span className="text-[#02b1aa] font-medium text-sm">
              CONHEÇA NOSSA EQUIPE
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Profissionais{" "}
            <span className="bg-gradient-to-r from-[#02b1aa] to-[#029fdf] bg-clip-text text-transparent">
              Especializados
            </span>
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Conheça nossos psicólogos certificados e agende sua consulta.
          </p>
        </div>

        <ProfissionaisAgendamentos />
      </div>
    </div>
  );
}
