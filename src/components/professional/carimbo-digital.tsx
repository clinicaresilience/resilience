interface CarimboDigitalProps {
  assinaturaDigital: {
    nome: string;
    crp: string;
    data: string;
  };
  formatarData: (dataISO: string) => string;
}

export function CarimboDigital({ assinaturaDigital, formatarData }: CarimboDigitalProps) {
  return (
    <div className="flex-shrink-0 w-32 min-h-20 bg-gradient-to-br from-blue-100 to-teal-100 border-2 border-blue-300 rounded-lg flex flex-col items-center justify-center p-2 shadow-sm">
      {/* Logo pequena */}
      <div className="w-3 h-3 mb-1 opacity-20">
        <img
          src="/logoResilience.png"
          alt="Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Texto do carimbo */}
      <div className="text-center">
        <p className="text-blue-700 text-[8px] leading-tight">
          Assinatura Digital
        </p>

        <div className="w-full border-t border-blue-300 mt-1 pt-1">
          {/* Nome do profissional */}
          <p className="text-blue-800 text-[11px] font-bold leading-tight">
            {assinaturaDigital.nome}
          </p>

          {/* CRP */}
          <p className="text-blue-700 text-[8px] leading-tight">
            CRP: {assinaturaDigital.crp}
          </p>

          {/* Data */}
          <p className="text-blue-600 text-[8px] font-medium">
            {formatarData(assinaturaDigital.data).split(" ")[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
