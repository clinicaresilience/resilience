import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID da consulta e status são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é profissional e se a consulta pertence a ele
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    if (usuario?.tipo_usuario !== "profissional") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Verificar se a consulta existe e pertence ao profissional
    const { data: consulta } = await supabase
      .from("consultas")
      .select("id")
      .eq("id", id)
      .eq("profissional_id", user.id)
      .single();

    if (!consulta) {
      return NextResponse.json(
        { error: "Consulta não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar status
    const { data, error } = await supabase
      .from("consultas")
      .update({ status_consulta: status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar status:", error);
      return NextResponse.json(
        { error: "Erro ao atualizar status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error("Erro desconhecido:", err);
    return NextResponse.json({ error: "Erro desconhecido" }, { status: 500 });
  }
}
