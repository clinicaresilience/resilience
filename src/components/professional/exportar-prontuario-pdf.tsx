import jsPDF from "jspdf";
import { ProntuarioCompleto } from "@/services/database/prontuarios.service";

interface ExportarProntuarioPDFProps {
  prontuario: ProntuarioCompleto;
  formatarData: (dataISO: string) => string;
}

export const exportarProntuarioPDF = async ({ prontuario, formatarData }: ExportarProntuarioPDFProps) => {
  try {
    // Criar PDF diretamente sem html2canvas para melhor controle
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let currentY = margin;

    // Função para adicionar nova página se necessário
    const checkPageBreak = (requiredHeight: number) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }
    };

    // Função para quebrar texto longo
    const addWrappedText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      fontSize: number = 10
    ) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      const lineHeight = fontSize * 0.5;

      for (let i = 0; i < lines.length; i++) {
        checkPageBreak(lineHeight);
        pdf.text(lines[i], x, currentY);
        currentY += lineHeight;
      }
      return currentY;
    };

    // Cabeçalho
    pdf.setFontSize(18);
    pdf.setTextColor(37, 99, 235); // Azul
    pdf.setFont("helvetica", "bold");
    pdf.text("CLÍNICA RESILIENCE", pageWidth / 2, currentY, {
      align: "center",
    });
    currentY += 8;

    pdf.setFontSize(14);
    pdf.setTextColor(55, 65, 81);
    pdf.setFont("helvetica", "normal");
    pdf.text("PRONTUÁRIO MÉDICO", pageWidth / 2, currentY, {
      align: "center",
    });
      currentY += 15;

    // Linha separadora
    pdf.setDrawColor(37, 99, 235);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // Informações do Paciente
    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont("helvetica", "bold");
    pdf.text("INFORMAÇÕES DO PACIENTE", margin, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);

    pdf.setFont("helvetica", "bold");
    pdf.text("Nome:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(prontuario.paciente.nome, margin + 20, currentY);
    currentY += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Email:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(prontuario.paciente.email, margin + 20, currentY);
    currentY += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Data de Criação:", margin, currentY);
    pdf.setFont("helvetica", "normal");
    pdf.text(formatarData(prontuario.criado_em), margin + 35, currentY);
    currentY += 15;

    // Registros Médicos
    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      `REGISTROS MÉDICOS (${prontuario.registros.length})`,
      margin,
      currentY
    );
    currentY += 10;

    // Iterar pelos registros
    prontuario.registros.forEach((registro, index) => {
      checkPageBreak(40); // Verificar se há espaço para o registro

      // Cabeçalho do registro
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, currentY - 4, contentWidth, 12, "F");

      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        `Registro #${prontuario.registros.length - index}`,
        margin + 2,
        currentY + 2
      );

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(107, 114, 128);
      const dataFormatada = formatarData(registro.criado_em);
      pdf.text(
        dataFormatada,
        pageWidth - margin - pdf.getTextWidth(dataFormatada) - 2,
        currentY + 2
      );
      currentY += 12;

      // Conteúdo do registro
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      currentY = addWrappedText(
        registro.texto,
        margin + 2,
        currentY + 5,
        contentWidth - 4,
        9
      );
      currentY += 8;

      // Assinatura digital
      checkPageBreak(25);


      pdf.setFontSize(8);
      pdf.setTextColor(55, 65, 81);
      pdf.setFont("helvetica", "bold");
      pdf.text("ASSINATURA DIGITAL", margin + 2, currentY);
      currentY += 5;

      pdf.setFontSize(7);
      pdf.setTextColor(107, 114, 128);
      pdf.setFont("helvetica", "normal");

      pdf.setFont("helvetica", "bold");
      pdf.text("Profissional:", margin + 2, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(registro.assinatura_digital.nome, margin + 25, currentY);
      currentY += 4;

      pdf.setFont("helvetica", "bold");
      pdf.text("CPF:", margin + 2, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(registro.assinatura_digital.cpf, margin + 25, currentY);
      currentY += 4;

      pdf.setFont("helvetica", "bold");
      pdf.text("CRP:", margin + 2, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(registro.assinatura_digital.crp, margin + 25, currentY);
      currentY += 4;

      pdf.setFont("helvetica", "bold");
      pdf.text("Data/Hora:", margin + 2, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        formatarData(registro.assinatura_digital.data),
        margin + 25,
        currentY
      );

      // === Carimbo no canto direito alinhado com assinatura digital ===
      const carimboX = pageWidth - margin - 45; // alinhado à direita
      const carimboY = currentY - 15; // fixo ao final do registro

      // Fundo arredondado (simulando gradient com cor intermediária)
      pdf.setFillColor(224, 242, 254); // azul-claro-teal (#E0F2FE)
      pdf.setDrawColor(147, 197, 253); // border-blue-300
      pdf.setLineWidth(0.6);
      pdf.roundedRect(carimboX, carimboY, 40, 30, 3, 3, "FD");

      // Logo pequena (precisa já estar carregada como base64)
      try {
        pdf.addImage("/logocomprimida.png", "PNG", carimboX + 17.2, carimboY + 2.5, 5.6, 4.2);
      } catch (e) {
        // fallback: circulo transparente
        pdf.setFillColor(180, 220, 255);
        pdf.circle(carimboX + 20, carimboY + 4.5, 1.4, "F");
      }

      // "Assinatura Digital"
      pdf.setFontSize(6);
      pdf.setTextColor(29, 78, 216); // blue-700
      pdf.text("Assinatura Digital", carimboX + 20, carimboY + 12, { align: "center" });

      // Linha divisória
      pdf.setDrawColor(147, 197, 253); // border-blue-300
      pdf.setLineWidth(0.2);
      pdf.line(carimboX + 4, carimboY + 14, carimboX + 36, carimboY + 14);

      // Nome do profissional com abreviação inteligente
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 64, 175); // blue-800
      
      // Função para abreviar nome se necessário
      const abreviarNome = (nomeCompleto: string, maxWidth: number) => {
        const nomes = nomeCompleto.trim().split(' ');
        
        // Se só tem 1 ou 2 nomes, retorna como está
        if (nomes.length <= 2) {
          return nomeCompleto;
        }
        
        // Testa se o nome completo cabe
        if (pdf.getTextWidth(nomeCompleto) <= maxWidth) {
          return nomeCompleto;
        }
        
        // Pega os dois primeiros nomes + iniciais dos demais
        const primeirosNomes = nomes.slice(0, 2).join(' ');
        const iniciaisRestantes = nomes.slice(2).map(nome => nome.charAt(0).toUpperCase()).join(' ');
        
        return `${primeirosNomes} ${iniciaisRestantes}`;
      };
      
      const nomeAbreviado = abreviarNome(registro.assinatura_digital.nome, 35); // largura máxima do carimbo
      pdf.text(nomeAbreviado, carimboX + 20, carimboY + 19, { align: "center" });

      // CRP
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(29, 78, 216); // blue-700
      pdf.text(`CRP: ${registro.assinatura_digital.crp}`, carimboX + 20, carimboY + 23, { align: "center" });

      // Data
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(37, 99, 235); // blue-600
      const dataCarimbo = formatarData(registro.assinatura_digital.data).split(" ")[0];
      pdf.text(dataCarimbo, carimboX + 20, carimboY + 27, { align: "center" });

      currentY += 20; // mais espaço para acomodar o carimbo
    });

    // Rodapé
    checkPageBreak(20);
    currentY += 10;
    pdf.setDrawColor(229, 231, 235);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      "Este documento foi gerado automaticamente pelo Sistema Clínica Resilience",
      pageWidth / 2,
      currentY,
      { align: "center" }
    );
    currentY += 5;
    pdf.text(
      `Data de geração: ${formatarData(new Date().toISOString())}`,
      pageWidth / 2,
      currentY,
      { align: "center" }
    );

    // Salvar PDF
    const fileName = `Prontuario_${prontuario.paciente.nome.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Erro ao gerar PDF. Tente novamente.");
  }
};
