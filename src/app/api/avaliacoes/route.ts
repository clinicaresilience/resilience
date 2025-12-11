import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { AvaliacoesService } from '@/services/database/avaliacoes.service';

// GET /api/avaliacoes
// Buscar avaliações (apenas para admins) ou agendamentos para avaliar (para pacientes)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar dados do usuário
    const { data: userData, error: userDataError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const profissionalId = searchParams.get('profissional_id');
    const action = searchParams.get('action');

    // Para administradores - buscar avaliações
    if (userData.tipo_usuario === 'administrador') {
      if (action === 'medias') {
        // Buscar médias de todos os profissionais
        const medias = await AvaliacoesService.buscarMediasProfissionais();
        return NextResponse.json({ success: true, data: medias });
      } else if (profissionalId) {
        // Buscar avaliações de um profissional específico
        const avaliacoes = await AvaliacoesService.buscarAvaliacoesPorProfissional(profissionalId);
        return NextResponse.json({ success: true, data: avaliacoes });
      } else {
        // Buscar todas as avaliações
        const todasAvaliacoes = await AvaliacoesService.buscarTodasAvaliacoes();
        return NextResponse.json({ success: true, data: todasAvaliacoes });
      }
    }

    // Para pacientes - buscar agendamentos para avaliar
    if (userData.tipo_usuario === 'comum') {
      const agendamentosParaAvaliar = await AvaliacoesService.buscarAgendamentosParaAvaliar(user.id);
      return NextResponse.json({ success: true, data: agendamentosParaAvaliar });
    }

    return NextResponse.json({ error: 'Tipo de usuário não autorizado' }, { status: 403 });

  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', detail: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/avaliacoes
// Criar uma nova avaliação (apenas para pacientes)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é paciente
    const { data: userData, error: userDataError } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (userData.tipo_usuario !== 'comum') {
      return NextResponse.json({ error: 'Apenas pacientes podem criar avaliações' }, { status: 403 });
    }

    // Validar dados da requisição
    const body = await req.json();
    const { agendamento_id, profissional_id, nota, comentario } = body;

    if (!agendamento_id || !profissional_id || nota === undefined) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: agendamento_id, profissional_id, nota' },
        { status: 400 }
      );
    }

    // Validar nota
    if (typeof nota !== 'number' || nota < 0 || nota > 5) {
      return NextResponse.json(
        { error: 'A nota deve ser um número entre 0 e 5' },
        { status: 400 }
      );
    }

    // Criar avaliação
    const dadosAvaliacao = {
      agendamento_id: agendamento_id.toString(),
      profissional_id,
      paciente_id: user.id,
      nota,
      comentario: comentario || undefined
    };

    const novaAvaliacao = await AvaliacoesService.criarAvaliacao(dadosAvaliacao);

    return NextResponse.json({
      success: true,
      message: 'Avaliação criada com sucesso',
      data: novaAvaliacao
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Tratar erros específicos do service
    if (errorMessage.includes('não está concluída')) {
      return NextResponse.json(
        { error: 'Só é possível avaliar consultas concluídas' },
        { status: 400 }
      );
    }
    
    if (errorMessage.includes('Já existe uma avaliação')) {
      return NextResponse.json(
        { error: 'Esta consulta já foi avaliada' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor', detail: errorMessage },
      { status: 500 }
    );
  }
}
