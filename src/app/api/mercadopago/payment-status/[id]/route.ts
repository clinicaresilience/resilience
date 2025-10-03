import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoService } from '@/services/mercadopago/mp.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID do pagamento não fornecido' }, { status: 400 });
    }

    const payment = await MercadoPagoService.consultarPagamento(id);

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao consultar pagamento',
      },
      { status: 500 }
    );
  }
}
