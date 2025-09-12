import { DateTime, Settings } from 'luxon';

// Configurar Luxon para usar português brasileiro por padrão
Settings.defaultLocale = 'pt-BR';

// Timezone padrão para o Brasil
export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

/**
 * Utilitários para manipulação de datas e fusos horários usando Luxon
 */
export class TimezoneUtils {
  /**
   * Converte uma data/hora local para UTC
   * @param localDateTime - Data/hora no formato local (ISO string ou Date)
   * @param timezone - Fuso horário do usuário (padrão: America/Sao_Paulo)
   * @returns Data/hora em UTC (ISO string)
   */
  static toUTC(localDateTime: string | Date, timezone: string = DEFAULT_TIMEZONE): string {
    const dt = typeof localDateTime === 'string' 
      ? DateTime.fromISO(localDateTime, { zone: timezone })
      : DateTime.fromJSDate(localDateTime, { zone: timezone });
    
    return dt.toUTC().toISO()!;
  }

  /**
   * Converte uma data/hora UTC para um fuso horário específico
   * @param utcDateTime - Data/hora em UTC (ISO string)
   * @param timezone - Fuso horário de destino (padrão: America/Sao_Paulo)
   * @returns DateTime no fuso horário especificado
   */
  static fromUTC(utcDateTime: string, timezone: string = DEFAULT_TIMEZONE): DateTime {
    return DateTime.fromISO(utcDateTime, { zone: 'utc' }).setZone(timezone);
  }

  /**
   * Formata uma data/hora UTC para exibição em português brasileiro
   * @param utcDateTime - Data/hora em UTC (ISO string)
   * @param timezone - Fuso horário para exibição (padrão: America/Sao_Paulo)
   * @param format - Formato de exibição ('full', 'date', 'time', 'datetime')
   * @returns String formatada em pt-BR
   */
  static formatForDisplay(
    utcDateTime: string, 
    timezone: string = DEFAULT_TIMEZONE,
    format: 'full' | 'date' | 'time' | 'datetime' = 'datetime'
  ): string {
    const dt = this.fromUTC(utcDateTime, timezone);
    
    switch (format) {
      case 'full':
        return dt.toLocaleString({
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'date':
        return dt.toLocaleString({
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      case 'time':
        return dt.toLocaleString({
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'datetime':
      default:
        return dt.toLocaleString({
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  }

  /**
   * Cria uma data/hora completa combinando data e hora locais
   * @param date - Data no formato YYYY-MM-DD
   * @param time - Hora no formato HH:mm
   * @param timezone - Fuso horário (padrão: America/Sao_Paulo)
   * @returns Data/hora em UTC (ISO string)
   */
  static createDateTime(
    date: string, 
    time: string, 
    timezone: string = DEFAULT_TIMEZONE
  ): string {
    const dateTimeString = `${date}T${time}:00`;
    const dt = DateTime.fromISO(dateTimeString, { zone: timezone });
    return dt.toUTC().toISO()!;
  }

  /**
   * Extrai a data no formato YYYY-MM-DD de um timestamp UTC
   * @param utcDateTime - Data/hora em UTC (ISO string)
   * @param timezone - Fuso horário para extração (padrão: America/Sao_Paulo)
   * @returns Data no formato YYYY-MM-DD
   */
  static extractDate(utcDateTime: string, timezone: string = DEFAULT_TIMEZONE): string {
    const dt = this.fromUTC(utcDateTime, timezone);
    return dt.toISODate()!;
  }

  /**
   * Extrai a hora no formato HH:mm de um timestamp UTC
   * @param utcDateTime - Data/hora em UTC (ISO string)
   * @param timezone - Fuso horário para extração (padrão: America/Sao_Paulo)
   * @returns Hora no formato HH:mm
   */
  static extractTime(utcDateTime: string, timezone: string = DEFAULT_TIMEZONE): string {
    const dt = this.fromUTC(utcDateTime, timezone);
    return dt.toFormat('HH:mm');
  }

  /**
   * Verifica se uma data/hora está no passado
   * @param utcDateTime - Data/hora em UTC (ISO string)
   * @param timezone - Fuso horário para comparação (padrão: America/Sao_Paulo)
   * @returns true se a data está no passado
   */
  static isPast(utcDateTime: string, timezone: string = DEFAULT_TIMEZONE): boolean {
    const dt = this.fromUTC(utcDateTime, timezone);
    const now = DateTime.now().setZone(timezone);
    return dt < now;
  }

  /**
   * Verifica se uma data/hora está no futuro
   * @param utcDateTime - Data/hora em UTC (ISO string)
   * @param timezone - Fuso horário para comparação (padrão: America/Sao_Paulo)
   * @returns true se a data está no futuro
   */
  static isFuture(utcDateTime: string, timezone: string = DEFAULT_TIMEZONE): boolean {
    const dt = this.fromUTC(utcDateTime, timezone);
    const now = DateTime.now().setZone(timezone);
    return dt > now;
  }

  /**
   * Verifica se duas datas/horas estão no mesmo dia
   * @param utcDateTime1 - Primeira data/hora em UTC
   * @param utcDateTime2 - Segunda data/hora em UTC
   * @param timezone - Fuso horário para comparação (padrão: America/Sao_Paulo)
   * @returns true se estão no mesmo dia
   */
  static isSameDay(
    utcDateTime1: string, 
    utcDateTime2: string, 
    timezone: string = DEFAULT_TIMEZONE
  ): boolean {
    const dt1 = this.fromUTC(utcDateTime1, timezone);
    const dt2 = this.fromUTC(utcDateTime2, timezone);
    return dt1.hasSame(dt2, 'day');
  }

  /**
   * Obtém o timestamp atual em UTC
   * @returns Timestamp atual em UTC (ISO string)
   */
  static now(): string {
    return DateTime.now().toUTC().toISO()!;
  }

  /**
   * Obtém o timestamp atual em um fuso horário específico
   * @param timezone - Fuso horário (padrão: America/Sao_Paulo)
   * @returns DateTime no fuso horário especificado
   */
  static nowInTimezone(timezone: string = DEFAULT_TIMEZONE): DateTime {
    return DateTime.now().setZone(timezone);
  }

  /**
   * Adiciona tempo a uma data/hora UTC
   * @param utcDateTime - Data/hora base em UTC
   * @param amount - Quantidade a adicionar
   * @param unit - Unidade de tempo ('minutes', 'hours', 'days', etc.)
   * @returns Nova data/hora em UTC (ISO string)
   */
  static addTime(
    utcDateTime: string, 
    amount: number, 
    unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
  ): string {
    const dt = DateTime.fromISO(utcDateTime, { zone: 'utc' });
    return dt.plus({ [unit]: amount }).toISO()!;
  }

  /**
   * Calcula a diferença entre duas datas/horas em minutos
   * @param utcDateTime1 - Primeira data/hora em UTC
   * @param utcDateTime2 - Segunda data/hora em UTC
   * @returns Diferença em minutos
   */
  static diffInMinutes(utcDateTime1: string, utcDateTime2: string): number {
    const dt1 = DateTime.fromISO(utcDateTime1, { zone: 'utc' });
    const dt2 = DateTime.fromISO(utcDateTime2, { zone: 'utc' });
    return dt2.diff(dt1, 'minutes').minutes;
  }

  /**
   * Valida se uma string é um timestamp UTC válido
   * @param dateTimeString - String a ser validada
   * @returns true se é um timestamp válido
   */
  static isValidUTCTimestamp(dateTimeString: string): boolean {
    const dt = DateTime.fromISO(dateTimeString, { zone: 'utc' });
    return dt.isValid;
  }

  /**
   * Converte um timestamp do banco (timestamptz) para UTC
   * Útil para garantir que dados vindos do Supabase estão em UTC
   * @param dbTimestamp - Timestamp do banco de dados
   * @returns Timestamp em UTC (ISO string)
   */
  static dbTimestampToUTC(dbTimestamp: string): string {
    // Se já está em formato ISO válido, apenas garante que está em UTC
    const dt = DateTime.fromISO(dbTimestamp);
    return dt.toUTC().toISO()!;
  }

  /**
   * Prepara um timestamp UTC para inserção no banco
   * @param utcDateTime - Data/hora em UTC
   * @returns String formatada para inserção no banco
   */
  static prepareForDatabase(utcDateTime: string): string {
    const dt = DateTime.fromISO(utcDateTime, { zone: 'utc' });
    return dt.toISO()!;
  }
}

/**
 * Função de conveniência para formatar datas rapidamente
 * @param utcDateTime - Data/hora em UTC
 * @param timezone - Fuso horário (opcional)
 * @returns String formatada para exibição
 */
export function formatarDataHora(
  utcDateTime: string, 
  timezone?: string
): string {
  return TimezoneUtils.formatForDisplay(utcDateTime, timezone);
}

/**
 * Função de conveniência para criar timestamps UTC
 * @param date - Data YYYY-MM-DD
 * @param time - Hora HH:mm
 * @param timezone - Fuso horário (opcional)
 * @returns Timestamp UTC
 */
export function criarTimestamp(
  date: string, 
  time: string, 
  timezone?: string
): string {
  return TimezoneUtils.createDateTime(date, time, timezone);
}
