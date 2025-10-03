import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoService } from '@/services/mercadopago/mp.service';
import { MercadoPagoWebhookValidator } from '@/utils/mercadopago-webhook-validator';

export async function POST(req: NextRequest) {
  try {
    // 1. Extrair headers necessários para validação
    const xSignature = req.headers.get('x-signature');
    const xRequestId = req.headers.get('x-request-id');

    // 2. Extrair query params
    const url = new URL(req.url);
    const dataId = url.searchParams.get('data.id');

    // 3. Ler body
    const body = await req.json();

    console.log('Webhook recebido do Mercado Pago:', {
      headers: { xSignature, xRequestId },
      queryParams: { dataId },
      body
    });

    // 4. Validar assinatura (se configurada)
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret !== 'WEBHOOK_SECRET_KEY_HERE') {
      if (!xSignature || !xRequestId || !dataId) {
        console.error('Headers ou query params ausentes para validação');
        return NextResponse.json(
          { success: false, error: 'Headers inválidos' },
          { status: 400 }
        );
      }

      const isValid = MercadoPagoWebhookValidator.validateSignature({
        xSignature,
        xRequestId,
        dataId,
        secret: webhookSecret,
      });

      if (!isValid) {
        console.error('Assinatura do webhook inválida');
        return NextResponse.json(
          { success: false, error: 'Assinatura inválida' },
          { status: 401 }
        );
      }

      // Validar timestamp (tolerância de 5 minutos)
      const ts = MercadoPagoWebhookValidator.extractTimestamp(xSignature);
      if (ts) {
        const isTimestampValid = MercadoPagoWebhookValidator.validateTimestamp(ts);
        if (!isTimestampValid) {
          console.warn('Webhook com timestamp fora da tolerância, mas processando mesmo assim');
        }
      }

      console.log('✅ Assinatura do webhook validada com sucesso');
    } else {
      console.warn('⚠️ Webhook secret não configurada - pulando validação de assinatura');
    }

    // 5. Processar webhook de forma assíncrona
    await MercadoPagoService.processarWebhook(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    // Retornar 200 mesmo com erro para evitar reenvios desnecessários
    return NextResponse.json({ success: false, error: 'Erro ao processar webhook' });
  }
}

// Aceitar GET também (MP às vezes envia GET para verificar)
export async function GET() {
  return NextResponse.json({ status: 'webhook endpoint ativo' });
}
