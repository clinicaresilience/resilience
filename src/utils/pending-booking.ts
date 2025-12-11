/**
 * Utilitário para gerenciar agendamentos pendentes de usuários não logados
 */

export interface PendingBookingData {
  profissionalId: string;
  profissionalNome: string;
  slot: {
    id: string;
    data: string;
    hora: string;
    disponivel: boolean;
  };
  modalidade: 'presencial' | 'online';
  codigoEmpresa: string;
  notas?: string;
  timestamp: number;
}

const PENDING_BOOKING_KEY = 'resilience_pending_booking';

export class PendingBookingManager {
  /**
   * Salva os dados de agendamento pendente no localStorage
   */
  static save(data: Omit<PendingBookingData, 'timestamp'>): void {
    const pendingData: PendingBookingData = {
      ...data,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(pendingData));
    } catch (error) {
      console.error('Erro ao salvar agendamento pendente:', error);
    }
  }

  /**
   * Recupera os dados de agendamento pendente do localStorage
   */
  static get(): PendingBookingData | null {
    try {
      const data = localStorage.getItem(PENDING_BOOKING_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data) as PendingBookingData;

      // Verifica se os dados não expiraram (24 horas)
      const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 horas em ms
      if (Date.now() - parsed.timestamp > EXPIRATION_TIME) {
        this.clear();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Erro ao recuperar agendamento pendente:', error);
      return null;
    }
  }

  /**
   * Remove os dados de agendamento pendente do localStorage
   */
  static clear(): void {
    try {
      localStorage.removeItem(PENDING_BOOKING_KEY);
    } catch (error) {
      console.error('Erro ao limpar agendamento pendente:', error);
    }
  }

  /**
   * Verifica se existe um agendamento pendente
   */
  static hasPending(): boolean {
    return this.get() !== null;
  }

  /**
   * Formata a data e hora do agendamento pendente para exibição
   */
  static formatPendingBooking(pending: PendingBookingData): {
    date: string;
    time: string;
    profissional: string;
  } {
    const date = new Date(pending.slot.data);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    return {
      date: formattedDate,
      time: pending.slot.hora,
      profissional: pending.profissionalNome,
    };
  }
}
