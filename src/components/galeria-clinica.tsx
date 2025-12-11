import Image from "next/image";
import { Building2 } from "lucide-react";

export default function GaleriaClinica() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 bg-[#02b1aa] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#029fdf] rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-gradient-to-r from-[#02b1aa]/10 to-[#029fdf]/10 rounded-full px-6 py-2 mb-6">
            <Building2 className="w-4 h-4 text-[#02b1aa] mr-2" />
            <span className="text-[#02b1aa] font-semibold text-sm">NOSSO ESPAÇO</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            <span className="bg-gradient-to-r from-[#02b1aa] via-[#029fdf] to-[#01c2e3] bg-clip-text text-transparent">
              Ambiente
            </span>
            {" "}Profissional
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-[#02b1aa] to-[#029fdf] mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conheça nosso espaço dedicado ao cuidado com a saúde mental organizacional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#02b1aa]/20 to-[#029fdf]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
            <Image
              src="/fotossite/clinica-1.jpeg"
              alt="Clínica Resilience - Ambiente"
              width={400}
              height={300}
              className="w-full h-[32rem] object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          <div className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7762b6]/20 to-[#f5b26b]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
            <Image
              src="/fotossite/clinica-2.jpeg"
              alt="Clínica Resilience - Espaço de Atendimento"
              width={400}
              height={300}
              className="w-full h-[32rem] object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          <div className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#01c2e3]/20 to-[#02b1aa]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
            <Image
              src="/fotossite/clinica-3.jpeg"
              alt="Clínica Resilience - Recepção"
              width={400}
              height={300}
              className="w-full h-[32rem] object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
