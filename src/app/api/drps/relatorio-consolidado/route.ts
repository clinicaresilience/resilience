import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { DRPS_TOPICS, DrpsScore, QuestionStats, TopicScore, ConsolidatedReport } from '@/types/drps';

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
        { error: "Acesso negado. Apenas administradores podem visualizar relatórios DRPS." },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const tipo = url.searchParams.get('tipo') as 'empresa' | 'setor';
    const empresaId = url.searchParams.get('empresa_id');
    const setor = url.searchParams.get('setor');

    if (!tipo || (tipo !== 'empresa' && tipo !== 'setor')) {
      return NextResponse.json(
        { error: "Tipo de relatório inválido. Use 'empresa' ou 'setor'." },
        { status: 400 }
      );
    }

    if (!empresaId) {
      return NextResponse.json(
        { error: "empresa_id é obrigatório" },
        { status: 400 }
      );
    }

    if (tipo === 'setor' && !setor) {
      return NextResponse.json(
        { error: "setor é obrigatório para relatórios por setor" },
        { status: 400 }
      );
    }

    // Buscar informações da empresa
    const { data: empresaData, error: empresaError } = await supabase
      .from('empresas')
      .select('id, nome, cnpj')
      .eq('id', empresaId)
      .single();

    if (empresaError || !empresaData) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Construir query baseada no tipo
    let query = supabase
      .from('drps_submissions')
      .select('*')
      .eq('empresa_id', empresaId);

    if (tipo === 'setor') {
      query = query.eq('setor', setor);
    }

    const { data: submissions, error: fetchError } = await query.order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Erro ao buscar submissions:', fetchError);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma submissão encontrada para os critérios especificados" },
        { status: 404 }
      );
    }

    // Calcular agregações
    const respostasAgregadas: Record<string, Record<string, QuestionStats>> = {};
    const topicosScores: Record<string, TopicScore> = {};

    // Inicializar estruturas
    DRPS_TOPICS.forEach(topic => {
      respostasAgregadas[topic.id] = {};
      topic.questions.forEach(question => {
        respostasAgregadas[topic.id][question.id] = {
          media: 0,
          total_respostas: 0,
          distribuicao: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
        };
      });
      topicosScores[topic.id] = {
        total: 0,
        count: 0,
        average: 0
      };
    });

    // Agregar respostas
    submissions.forEach(submission => {
      const respostas = submission.respostas as Record<string, number>;

      DRPS_TOPICS.forEach(topic => {
        topic.questions.forEach(question => {
          const score = respostas[question.id];

          if (score !== undefined && score >= 0 && score <= 4) {
            const stats = respostasAgregadas[topic.id][question.id];
            stats.total_respostas++;
            stats.distribuicao[score as DrpsScore]++;
          }
        });
      });
    });

    // Calcular médias e scores por tópico
    DRPS_TOPICS.forEach(topic => {
      let topicTotal = 0;
      let topicCount = 0;

      topic.questions.forEach(question => {
        const stats = respostasAgregadas[topic.id][question.id];

        if (stats.total_respostas > 0) {
          // Calcular média ponderada
          let somaNotas = 0;
          (Object.keys(stats.distribuicao) as unknown as DrpsScore[]).forEach(score => {
            somaNotas += score * stats.distribuicao[score];
          });

          stats.media = somaNotas / stats.total_respostas;
          topicTotal += stats.media;
          topicCount++;
        }
      });

      if (topicCount > 0) {
        topicosScores[topic.id] = {
          total: topicTotal,
          count: topicCount,
          average: topicTotal / topicCount
        };
      }
    });

    // Calcular período
    const datas = submissions.map(s => new Date(s.created_at).getTime());
    const dataInicio = new Date(Math.min(...datas)).toISOString();
    const dataFim = new Date(Math.max(...datas)).toISOString();

    // Preparar lista de participantes com respostas individuais
    const participantes = submissions.map(s => ({
      id: s.id,
      nome: s.nome,
      funcao: s.funcao,
      setor: s.setor,
      data: s.created_at,
      respostas: s.respostas as Record<string, number>
    }));

    const relatorio: ConsolidatedReport = {
      tipo,
      empresa: {
        id: empresaData.id,
        nome: empresaData.nome,
        cnpj: empresaData.cnpj
      },
      setor: tipo === 'setor' ? setor : undefined,
      total_submissoes: submissions.length,
      periodo: {
        data_inicio: dataInicio,
        data_fim: dataFim
      },
      respostas_agregadas: respostasAgregadas,
      topicos_scores: topicosScores,
      participantes
    };

    return NextResponse.json(
      {
        success: true,
        data: relatorio
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro na API de relatório consolidado:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
