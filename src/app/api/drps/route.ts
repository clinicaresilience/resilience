import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { DrpsFormData } from '@/types/drps';

// POST /api/drps
// Salvar resposta do formulário DRPS (público - sem autenticação necessária)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const body: DrpsFormData = await req.json();
    const { nome, email, telefone, funcao, setor, respostas } = body;

    // Validação dos campos obrigatórios
    if (!nome || !email || !telefone || !funcao || !setor) {
      return NextResponse.json(
        { error: "Nome, email, telefone, função e setor são obrigatórios" },
        { status: 400 }
      );
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Validação do telefone (formato básico)
    const telefoneRegex = /^[\d\s()+-]{10,}$/;
    if (!telefoneRegex.test(telefone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: "Telefone inválido" },
        { status: 400 }
      );
    }

    // Validação das respostas
    if (!respostas || typeof respostas !== 'object') {
      return NextResponse.json(
        { error: "Respostas são obrigatórias" },
        { status: 400 }
      );
    }

    // Verificar se há pelo menos algumas respostas
    const numRespostas = Object.keys(respostas).length;
    if (numRespostas < 10) {
      return NextResponse.json(
        { error: "Preencha pelo menos as perguntas básicas do formulário" },
        { status: 400 }
      );
    }

    // Validar se os valores das respostas são válidos (0-4)
    for (const [questionId, score] of Object.entries(respostas)) {
      if (typeof score !== 'number' || score < 0 || score > 4) {
        return NextResponse.json(
          { error: `Resposta inválida para a pergunta ${questionId}` },
          { status: 400 }
        );
      }
    }

    // Inserir no banco de dados
    const { data, error } = await supabase
      .from('drps_submissions')
      .insert([
        {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          telefone: telefone.trim(),
          funcao: funcao.trim(),
          setor: setor.trim(),
          respostas: respostas,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar DRPS:', error);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Formulário DRPS enviado com sucesso!",
        id: data.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro na API DRPS:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET /api/drps
// Listar todas as submissões DRPS (apenas para administradores)
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

    // Verificar se é administrador
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.tipo_usuario !== 'administrador') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem visualizar as respostas DRPS." },
        { status: 403 }
      );
    }

    // Buscar todas as submissões
    const { data: submissions, error: fetchError } = await supabase
      .from('drps_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Erro ao buscar submissions DRPS:', fetchError);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: submissions || []
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro na API DRPS GET:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/drps
// Deletar uma submissão DRPS (apenas para administradores)
export async function DELETE(req: NextRequest) {
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

    // Verificar se é administrador
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id, tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.tipo_usuario !== 'administrador') {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem deletar respostas DRPS." },
        { status: 403 }
      );
    }

    // Obter o ID da submissão da URL
    const url = new URL(req.url);
    const submissionId = url.searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json(
        { error: "ID da submissão é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a submissão existe
    const { data: existing, error: checkError } = await supabase
      .from('drps_submissions')
      .select('id')
      .eq('id', submissionId)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: "Submissão não encontrada" },
        { status: 404 }
      );
    }

    // Deletar a submissão
    const { error: deleteError } = await supabase
      .from('drps_submissions')
      .delete()
      .eq('id', submissionId);

    if (deleteError) {
      console.error('Erro ao deletar submission DRPS:', deleteError);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Submissão DRPS deletada com sucesso!"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro na API DRPS DELETE:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
