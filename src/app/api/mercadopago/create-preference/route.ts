import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoService } from '@/services/mercadopago/mp.service';
import { PacotesService } from '@/services/database/pacotes.service';
import { createClient } from '@/lib/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const {
      pacote_id,
      profissional_id,
      primeiro_horario_data,
      primeiro_horario_slot_id,
      modalidade
    } = body;

    if (!pacote_id || !profissional_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes' },
        { status: 400 }
      );
    }

    if (!primeiro_horario_data || !primeiro_horario_slot_id) {
      return NextResponse.json(
        { error: 'Primeiro horário é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar informações do pacote
    const pacote = await PacotesService.buscarPacotePorId(pacote_id);
    if (!pacote) {
      return NextResponse.json({ error: 'Pacote não encontrado' }, { status: 404 });
    }

    // Buscar informações do usuário
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('nome, email')
      .eq('id', user.id)
      .single();

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Criar compra de pacote
    const compra = await PacotesService.criarCompraPacote({
      paciente_id: user.id,
      profissional_id,
      pacote_id,
      valor_pago: pacote.preco_total,
      primeiro_horario_data,
      primeiro_horario_slot_id,
      modalidade: modalidade || 'online',
    });

    // Criar preferência no Mercado Pago
    const preference = await MercadoPagoService.criarPreferencia({
      compraPacoteId: compra.id,
      pacienteNome: usuario.nome,
      pacienteEmail: usuario.email || '',
      valor: pacote.preco_total,
      descricao: `Pacote de ${pacote.quantidade_sessoes} sessões - Clínica Resilience`,
    });

    return NextResponse.json({
      success: true,
      data: {
        compra_id: compra.id,
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      },
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar preferência',
      },
      { status: 500 }
    );
  }
}
