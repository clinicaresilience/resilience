import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    if (!usuario || usuario.tipo_usuario !== 'administrador') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar todas as compras de pacotes com informações relacionadas
    const { data: compras, error: comprasError } = await supabase
      .from('compras_pacotes')
      .select(`
        id,
        status,
        valor_pago,
        created_at,
        sessoes_total,
        sessoes_utilizadas,
        agendamentos_criados,
        primeiro_horario_data,
        modalidade,
        paciente:paciente_id (
          id,
          nome,
          email
        ),
        profissional:profissional_id (
          id,
          nome,
          email
        ),
        pacote:pacote_id (
          id,
          quantidade_sessoes,
          preco_total,
          desconto_percentual
        )
      `)
      .order('created_at', { ascending: false });

    if (comprasError) {
      console.error('Erro ao buscar compras:', comprasError);
      return NextResponse.json({ error: comprasError.message }, { status: 500 });
    }

    // Buscar pagamentos do Mercado Pago para cada compra
    const comprasComPagamento = await Promise.all(
      (compras || []).map(async (compra) => {
        const { data: pagamento } = await supabase
          .from('pagamentos_mercadopago')
          .select('*')
          .eq('compra_pacote_id', compra.id)
          .single();

        return {
          ...compra,
          pagamento_mp: pagamento || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: comprasComPagamento,
    });
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pagamentos' },
      { status: 500 }
    );
  }
}
