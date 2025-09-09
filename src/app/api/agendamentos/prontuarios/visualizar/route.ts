import { NextResponse, NextRequest } from "next/server"
import { createClient } from "@/lib/server"

// GET /api/agendamentos/prontuarios/visualizar
// Visualizar PDF de um prontuário
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário é um profissional ou admin
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    if (!userData || (userData.tipo_usuario !== "profissional" && userData.tipo_usuario !== "admin" && userData.tipo_usuario !== "administrador")) {
      return NextResponse.json({ error: "Acesso restrito a profissionais e administradores" }, { status: 403 });
    }

    const url = new URL(req.url);
    const prontuarioId = url.searchParams.get('prontuarioId');

    if (!prontuarioId) {
      return NextResponse.json(
        { error: "prontuarioId é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar o prontuário com verificação de acesso
    let ownershipCheck, ownershipError;

    if (userData.tipo_usuario === "admin" || userData.tipo_usuario === "administrador") {
      // Admin pode ver qualquer prontuário
      const result = await supabase
        .from("prontuarios")
        .select(`
          id,
          arquivo,
          agendamentos!inner(
            profissional_id
          )
        `)
        .eq("id", prontuarioId)
        .single();
      
      ownershipCheck = result.data;
      ownershipError = result.error;
    } else {
      // Profissional só pode ver seus próprios prontuários
      const result = await supabase
        .from("prontuarios")
        .select(`
          id,
          arquivo,
          agendamentos!inner(
            profissional_id
          )
        `)
        .eq("id", prontuarioId)
        .eq("agendamentos.profissional_id", user.id)
        .single();
      
      ownershipCheck = result.data;
      ownershipError = result.error;
    }

    if (ownershipError || !ownershipCheck) {
      console.log("PDF viewing access check failed:", ownershipError);
      return NextResponse.json(
        { error: "Acesso negado: prontuário não encontrado ou sem permissão" },
        { status: 403 }
      );
    }

    const prontuarioTyped = ownershipCheck as unknown as {
      id: string;
      arquivo: Buffer | Uint8Array | number[] | string;
      agendamentos: { profissional_id: string };
    };

    // Verificar se há arquivo PDF
    console.log("PDF buffer info:", {
      exists: !!prontuarioTyped.arquivo,
      length: prontuarioTyped.arquivo?.length,
      isBuffer: Buffer.isBuffer(prontuarioTyped.arquivo),
      type: typeof prontuarioTyped.arquivo,
      constructor: prontuarioTyped.arquivo?.constructor?.name
    });

    if (!prontuarioTyped.arquivo || prontuarioTyped.arquivo.length === 0) {
      console.log("PDF buffer is empty or null");
      return NextResponse.json(
        { error: "Nenhum arquivo PDF encontrado neste prontuário" },
        { status: 404 }
      );
    }

    // Converter para Buffer se necessário (Supabase pode retornar diferentes tipos)
    let pdfBuffer: Buffer;
    if (Buffer.isBuffer(prontuarioTyped.arquivo)) {
      pdfBuffer = prontuarioTyped.arquivo;
    } else if (prontuarioTyped.arquivo instanceof Uint8Array) {
      pdfBuffer = Buffer.from(prontuarioTyped.arquivo);
    } else if (Array.isArray(prontuarioTyped.arquivo)) {
      pdfBuffer = Buffer.from(prontuarioTyped.arquivo);
    } else if (typeof prontuarioTyped.arquivo === 'string') {
      // Supabase pode retornar bytea como string - analisar os primeiros caracteres
      console.log("String data sample:", prontuarioTyped.arquivo.substring(0, 100));

      // Verificar se é uma string hex-encoded (começa com \x)
      if (prontuarioTyped.arquivo.startsWith('\\x')) {
        try {
          console.log("Detected hex-encoded string, converting...");
          // Remove o prefixo \x e converte de hex para buffer
          const hexString = prontuarioTyped.arquivo.substring(2);
          // Converter hex para string primeiro para depois parsear JSON
          const decodedString = Buffer.from(hexString, 'hex').toString();
          console.log("Hex decoded string sample:", decodedString.substring(0, 100));
          
          // Agora verificar se é um JSON-serialized Buffer
          if (decodedString.startsWith('{"type":"Buffer","data":[')) {
            const bufferJson = JSON.parse(decodedString);
            if (bufferJson.type === 'Buffer' && Array.isArray(bufferJson.data)) {
              pdfBuffer = Buffer.from(bufferJson.data);
              console.log("Successfully parsed hex-encoded JSON Buffer, length:", pdfBuffer.length);
            } else {
              throw new Error("Invalid Buffer JSON format");
            }
          } else {
            // Se não é JSON, tratar como dados binários diretos
            pdfBuffer = Buffer.from(decodedString, 'binary');
          }
        } catch (error) {
          console.log("Hex decoding failed:", error);
          // Fallback para outros formatos
          pdfBuffer = Buffer.from(prontuarioTyped.arquivo, 'binary');
        }
      } else if (prontuarioTyped.arquivo.startsWith('{\"type\":\"Buffer\",\"data\":[')) {
        try {
          console.log("Detected JSON-serialized Buffer, parsing...");
          const bufferJson = JSON.parse(prontuarioTyped.arquivo);
          if (bufferJson.type === 'Buffer' && Array.isArray(bufferJson.data)) {
            pdfBuffer = Buffer.from(bufferJson.data);
            console.log("Successfully parsed JSON Buffer, length:", pdfBuffer.length);
          } else {
            throw new Error("Invalid Buffer JSON format");
          }
        } catch (error) {
          console.log("JSON Buffer parsing failed:", error);
          // Fallback para outros formatos
          pdfBuffer = Buffer.from(prontuarioTyped.arquivo, 'binary');
        }
      } else {
        // Verificar se parece ser base64 (contém apenas caracteres válidos para base64)
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        const isBase64Like = base64Regex.test(prontuarioTyped.arquivo.replace(/\s/g, ''));

        if (isBase64Like) {
          try {
            pdfBuffer = Buffer.from(prontuarioTyped.arquivo, 'base64');
            console.log("Decoded as base64, buffer length:", pdfBuffer.length);
          } catch (error) {
            console.log("Base64 decode failed, trying binary:", error);
            pdfBuffer = Buffer.from(prontuarioTyped.arquivo, 'binary');
          }
        } else {
          // Não parece base64, tentar como dados binários diretos
          console.log("Treating as binary string");
          pdfBuffer = Buffer.from(prontuarioTyped.arquivo, 'binary');
        }
      }
    } else {
      // Tentar conversão genérica
      console.log("Unknown type, attempting generic conversion");
      pdfBuffer = Buffer.from(prontuarioTyped.arquivo as unknown as ArrayBuffer);
    }

    console.log("Final conversion result:", {
      originalType: prontuarioTyped.arquivo?.constructor?.name || 'unknown',
      convertedType: pdfBuffer.constructor.name,
      length: pdfBuffer.length,
      isBuffer: Buffer.isBuffer(pdfBuffer),
      firstBytes: pdfBuffer.subarray(0, 10).toString('hex')
    });

    // Verificar se o buffer resultante parece válido (deve começar com %PDF)
    if (pdfBuffer.length < 4 || !pdfBuffer.subarray(0, 4).equals(Buffer.from('%PDF'))) {
      console.log("Buffer does not start with %PDF, might be corrupted");
      console.log("First 20 bytes:", pdfBuffer.subarray(0, 20).toString('hex'));
    }

    // Retornar o PDF com headers apropriados
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="prontuario.pdf"',
        'Cache-Control': 'private, no-cache',
      },
    });

  } catch (error: unknown) {
    console.error("Erro ao visualizar PDF:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Erro ao visualizar PDF", detail: errorMessage },
      { status: 500 }
    );
  }
}
