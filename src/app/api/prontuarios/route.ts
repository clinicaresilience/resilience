import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { ProntuariosService } from '@/services/database/prontuarios.service';

// GET /api/prontuarios
// Buscar prontuários do profissional ou todos (se admin)
export async function GET(req: NextRequest) {
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

    // Buscar dados do usuário
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

    let prontuarios;

    if (userData.tipo_usuario === "admin" || userData.tipo_usuario === "administrador") {
      // Admin pode ver todos os prontuários
      prontuarios = await ProntuariosService.listarTodosProntuarios();
    } else if (userData.tipo_usuario === "profissional") {
      // Profissional vê apenas os que tem acesso
      prontuarios = await ProntuariosService.listarProntuariosProfissional(user.id);
    } else {
      return NextResponse.json(
        { error: "Tipo de usuário não autorizado" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prontuarios,
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar prontuários:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/prontuarios
// Criar novo registro no prontuário
export async function POST(req: NextRequest) {
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

    // Verificar se é profissional
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.tipo_usuario !== "profissional") {
      return NextResponse.json(
        { error: "Apenas profissionais podem criar registros" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { paciente_id, texto, cpf_profissional } = body;

    // Buscar dados completos do profissional para validar CPF
    const { data: profissionalCompleto, error: profissionalError } = await supabase
      .from('usuarios')
      .select('id, cpf')
      .eq('id', user.id)
      .single();

    if (profissionalError || !profissionalCompleto) {
      return NextResponse.json(
        { error: "Erro ao validar dados do profissional" },
        { status: 500 }
      );
    }

    // Validar CPF informado com CPF registrado
    const cpfLimpo = cpf_profissional.replace(/\D/g, '');
    const cpfRegistrado = profissionalCompleto.cpf;

    if (cpfRegistrado && cpfRegistrado !== cpfLimpo) {
      return NextResponse.json(
        { error: "CPF informado não confere com o CPF cadastrado no sistema" },
        { status: 400 }
      );
    }

    if (!cpfRegistrado && !cpfLimpo) {
      return NextResponse.json(
        { error: "CPF é obrigatório para assinatura digital" },
        { status: 400 }
      );
    }

    if (!paciente_id || !texto) {
      return NextResponse.json(
        { error: "paciente_id e texto são obrigatórios" },
        { status: 400 }
      );
    }

    if (!cpf_profissional) {
      return NextResponse.json(
        { error: "CPF do profissional é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o paciente existe (pode ser qualquer tipo de usuário)
    const { data: paciente, error: pacienteError } = await supabase
      .from('usuarios')
      .select('id, tipo_usuario')
      .eq('id', paciente_id)
      .single();

    if (pacienteError || !paciente) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Criar registro
    const registro = await ProntuariosService.criarRegistro(
      user.id,
      paciente_id,
      texto,
      cpf_profissional
    );

    return NextResponse.json({
      success: true,
      data: registro,
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar registro:', error);
    
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
