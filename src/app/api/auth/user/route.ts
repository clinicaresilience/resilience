import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar dados do usuário
    const { data: userData, error: dbError } = await supabase
      .from("usuarios")
      .select("id, nome, email, tipo_usuario")
      .eq("id", user.id)
      .single();

    if (dbError || !userData) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: userData,
    }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
