import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';
import { EmpresaComSubmissoes } from '@/types/drps';

// GET /api/drps/empresas
// Listar todas as empresas com submissões DRPS (apenas para administradores)
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
        { error: "Acesso negado. Apenas administradores podem visualizar as empresas DRPS." },
        { status: 403 }
      );
    }

    // Buscar todas as submissões com empresa
    const { data: submissions, error: fetchError } = await supabase
      .from('drps_submissions')
      .select('id, empresa_id, nome_empresa, setor, respostas, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Erro ao buscar submissions:', fetchError);
      return NextResponse.json(
        { error: "Erro interno do servidor" },
        { status: 500 }
      );
    }

    if (!submissions || submissions.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: []
        },
        { status: 200 }
      );
    }

    // Buscar dados das empresas
    const empresaIds = [...new Set(submissions.map(s => s.empresa_id).filter(Boolean))];
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nome, cnpj')
      .in('id', empresaIds);

    if (empresasError) {
      console.error('Erro ao buscar empresas:', empresasError);
    }

    const empresasMap = new Map(empresas?.map(e => [e.id, e]) || []);

    // Agregar dados por empresa
    const empresasComSubmissoes = new Map<string, EmpresaComSubmissoes>();

    submissions.forEach(submission => {
      const empresaId = submission.empresa_id || 'sem-empresa';
      const nomeEmpresa = submission.empresa_id ?
        empresasMap.get(submission.empresa_id)?.nome || submission.nome_empresa :
        submission.nome_empresa;

      if (!empresasComSubmissoes.has(empresaId)) {
        empresasComSubmissoes.set(empresaId, {
          id: empresaId,
          nome: nomeEmpresa,
          cnpj: empresasMap.get(submission.empresa_id || '')?.cnpj,
          total_submissoes: 0,
          setores: [],
          risco_geral: 'Baixo',
          ultima_submissao: submission.created_at
        });
      }

      const empresa = empresasComSubmissoes.get(empresaId)!;
      empresa.total_submissoes++;

      // Atualizar última submissão
      if (new Date(submission.created_at) > new Date(empresa.ultima_submissao)) {
        empresa.ultima_submissao = submission.created_at;
      }

      // Agregar setores
      const setorExistente = empresa.setores.find(s => s.nome === submission.setor);
      if (setorExistente) {
        setorExistente.total++;
      } else {
        empresa.setores.push({
          nome: submission.setor,
          total: 1
        });
      }
    });

    // Calcular risco geral para cada empresa (média simples das respostas)
    empresasComSubmissoes.forEach((empresa, empresaId) => {
      const submissoesEmpresa = submissions.filter(s =>
        (s.empresa_id || 'sem-empresa') === empresaId
      );

      let somaTotal = 0;
      let contagemTotal = 0;

      submissoesEmpresa.forEach(submission => {
        const respostas = submission.respostas as Record<string, number>;
        Object.values(respostas).forEach(score => {
          if (typeof score === 'number' && score >= 0 && score <= 4) {
            somaTotal += score;
            contagemTotal++;
          }
        });
      });

      const mediaGeral = contagemTotal > 0 ? somaTotal / contagemTotal : 0;

      // Classificar risco
      if (mediaGeral <= 1) {
        empresa.risco_geral = 'Baixo';
      } else if (mediaGeral <= 2) {
        empresa.risco_geral = 'Médio';
      } else if (mediaGeral <= 3) {
        empresa.risco_geral = 'Alto';
      } else {
        empresa.risco_geral = 'Crítico';
      }
    });

    const resultado = Array.from(empresasComSubmissoes.values())
      .sort((a, b) => b.total_submissoes - a.total_submissoes);

    return NextResponse.json(
      {
        success: true,
        data: resultado
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro na API de empresas DRPS:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
