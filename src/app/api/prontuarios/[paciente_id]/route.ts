import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { ProntuariosService } from '@/services/database/prontuarios.service';

// GET /api/prontuarios/[paciente_id]
// Buscar prontuário específico de um paciente
export async function GET(
  req: NextRequest,
  { params }: { params: { paciente_id: string } }
) {
  try {
    const supabase = await createClient();
    const { paciente_id } = params;

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

    // Buscar prontuário completo
    const prontuario = await ProntuariosService.obterProntuarioCompleto(
      paciente_id,
      user.id
    );

    if (!prontuario) {
      return NextResponse.json(
        { error: "Prontuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prontuario,
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar prontuário:', error);
    
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
