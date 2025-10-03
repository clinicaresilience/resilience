import crypto from 'crypto';

interface WebhookValidationParams {
  xSignature: string;
  xRequestId: string;
  dataId: string;
  secret: string;
}

/**
 * Valida a assinatura do webhook do Mercado Pago
 * Baseado na documentação oficial: https://www.mercadopago.com.br/developers/pt/docs/checkout-api-v2/notifications
 */
export class MercadoPagoWebhookValidator {
  /**
   * Valida a autenticidade de uma notificação webhook do Mercado Pago
   */
  static validateSignature(params: WebhookValidationParams): boolean {
    const { xSignature, xRequestId, dataId, secret } = params;

    try {
      // 1. Extrair ts e hash do header x-signature
      const parts = xSignature.split(',');
      let ts: string | null = null;
      let hash: string | null = null;

      for (const part of parts) {
        const [key, value] = part.split('=').map(s => s.trim());
        if (key === 'ts') {
          ts = value;
        } else if (key === 'v1') {
          hash = value;
        }
      }

      if (!ts || !hash) {
        console.error('Assinatura inválida: ts ou hash não encontrados');
        return false;
      }

      // 2. Gerar o manifest string
      // IMPORTANTE: data.id deve estar em minúsculas
      const dataIdLowerCase = dataId.toLowerCase();
      const manifest = `id:${dataIdLowerCase};request-id:${xRequestId};ts:${ts};`;

      // 3. Calcular HMAC SHA256
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(manifest);
      const calculatedHash = hmac.digest('hex');

      // 4. Comparar hash calculado com hash recebido
      const isValid = calculatedHash === hash;

      if (!isValid) {
        console.error('Validação de assinatura falhou', {
          expected: hash,
          calculated: calculatedHash,
          manifest
        });
      }

      return isValid;
    } catch (error) {
      console.error('Erro ao validar assinatura do webhook:', error);
      return false;
    }
  }

  /**
   * Valida o timestamp da notificação
   * @param ts Timestamp em milissegundos
   * @param toleranceMs Tolerância em milissegundos (padrão: 5 minutos)
   */
  static validateTimestamp(ts: string, toleranceMs: number = 5 * 60 * 1000): boolean {
    try {
      const notificationTime = parseInt(ts, 10);
      const currentTime = Date.now();
      const timeDiff = Math.abs(currentTime - notificationTime);

      if (timeDiff > toleranceMs) {
        console.warn('Notificação fora do prazo de tolerância', {
          notificationTime: new Date(notificationTime).toISOString(),
          currentTime: new Date(currentTime).toISOString(),
          diffMinutes: timeDiff / 60000
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar timestamp:', error);
      return false;
    }
  }

  /**
   * Extrai o timestamp do header x-signature
   */
  static extractTimestamp(xSignature: string): string | null {
    const parts = xSignature.split(',');
    for (const part of parts) {
      const [key, value] = part.split('=').map(s => s.trim());
      if (key === 'ts') {
        return value;
      }
    }
    return null;
  }
}
