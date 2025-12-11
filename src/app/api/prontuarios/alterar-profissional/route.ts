import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { ProntuariosService } from '@/services/database/prontuarios.service';

// PUT /api/prontuarios/alterar-profissional
// Alterar profissional responsável por um prontuário
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Verificar se é profissional ou admin
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (userData.tipo_usuario !== "profissional" && 
        userData.tipo_usuario !== "admin" && 
        userData.tipo_usuario !== "administrador") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { prontuario_id, novo_profissional_id } = body;

    if (!prontuario_id || !novo_profissional_id) {
      return NextResponse.json(
        { error: "prontuario_id e novo_profissional_id são obrigatórios" },
        { status: 400 }
      );
    }

    // Se for admin, pode alterar qualquer prontuário
    // Se for profissional, só pode alterar se for o responsável atual
    let profissionalAtualId = user.id;

    if (userData.tipo_usuario === "admin" || userData.tipo_usuario === "administrador") {
      // Admin pode alterar qualquer prontuário, mas precisa buscar o profissional atual
      const { data: prontuario, error: prontuarioError } = await supabase
        .from('prontuarios')
        .select('profissional_atual_id')
        .eq('id', prontuario_id)
        .single();

      if (prontuarioError || !prontuario) {
        return NextResponse.json(
          { error: "Prontuário não encontrado" },
          { status: 404 }
        );
      }

      profissionalAtualId = prontuario.profissional_atual_id;
    }

    // Alterar profissional responsável
    const prontuarioAtualizado = await ProntuariosService.alterarProfissionalResponsavel(
      prontuario_id,
      novo_profissional_id,
      profissionalAtualId
    );

    return NextResponse.json({
      success: true,
      data: prontuarioAtualizado,
      message: "Profissional responsável alterado com sucesso"
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao alterar profissional responsável:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
