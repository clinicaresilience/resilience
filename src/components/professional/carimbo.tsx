import { formatarDataHora } from "@/utils/timezone";

type Registro = {
  assinatura_digital: {
    nome: string;
    cpf: string;
    crp: string;
    data: string;
  };
};

export default function Carimbo({ registro }: { registro: Registro }) {
  return (
    <div
      style={{
        width: "96px",
        height: "64px",
        background: "linear-gradient(135deg, #dbeafe 0%, #a7f3d0 100%)",
        border: "2px solid #3b82f6",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Logo pequena */}
      <div
        style={{
          width: "16px",
          height: "16px",
          marginBottom: "4px",
          opacity: 0.2,
        }}
      >
        <img
          src="/logoResilience.png"
          alt="Logo"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* Texto do carimbo */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            color: "#1e40af",
            fontSize: "8px",
            fontWeight: "bold",
            lineHeight: "1.1",
            margin: 0,
          }}
        >
          CLÍNICA RESILIENCE
        </p>
        <p
          style={{
            color: "#1d4ed8",
            fontSize: "6px",
            lineHeight: "1.1",
            margin: "2px 0",
          }}
        >
          Assinatura Digital
        </p>
        <div
          style={{
            width: "100%",
            borderTop: "1px solid #3b82f6",
            marginTop: "2px",
            paddingTop: "2px",
          }}
        >
          <p
            style={{
              color: "#2563eb",
              fontSize: "6px",
              fontWeight: 500,
              margin: 0,
            }}
          >
            {formatarDataHora(registro.assinatura_digital.data).split(" ")[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
