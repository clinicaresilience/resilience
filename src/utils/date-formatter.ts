import { DateTime } from 'luxon'

// Timezone padrão do Brasil
const TIMEZONE = 'America/Sao_Paulo'

/**
 * Utilitário universal para formatação de datas e horários usando Luxon
 * Garante consistência em todo o frontend e evita problemas de timezone
 */
export class DateFormatter {
  /**
   * Parse seguro de string de data, lidando com diferentes formatos
   */
  private static parseDate(dateString: string): DateTime {
    if (!dateString || dateString === 'undefined' || dateString === 'null') {
      return DateTime.now().setZone(TIMEZONE)
    }

    // Se contém 'T', é uma data ISO completa
    if (dateString.includes('T')) {
      // Para designações presenciais, extrair data e hora separadamente
      const [datePart, timePart] = dateString.split('T')
      const [year, month, day] = datePart.split('-')
      const [hour, minute] = (timePart || '08:00:00').split(':')
      
      return DateTime.fromObject({
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour) || 8,
        minute: parseInt(minute) || 0,
        second: 0
      }, { zone: TIMEZONE })
    }
    
    // Se contém '-', é uma data simples (YYYY-MM-DD)
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-')
      return DateTime.fromObject({
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: 8,
        minute: 0,
        second: 0
      }, { zone: TIMEZONE })
    }

    // Fallback: tentar parsing direto
    const parsed = DateTime.fromISO(dateString, { zone: TIMEZONE })
    
    // Se não conseguiu fazer parse, usar data atual
    if (!parsed.isValid) {
      console.error('Data inválida, usando data atual:', dateString)
      return DateTime.now().setZone(TIMEZONE)
    }

    return parsed
  }

  /**
   * Formatar apenas o horário (HH:mm)
   */
  static formatTime(dateString: string): string {
    const dt = this.parseDate(dateString)
    return dt.toFormat('HH:mm')
  }

  /**
   * Formatar apenas a data (dd/MM/yyyy)
   */
  static formatDate(dateString: string): string {
    const dt = this.parseDate(dateString)
    return dt.toFormat('dd/MM/yyyy')
  }

  /**
   * Formatar data e hora completas (dd/MM/yyyy às HH:mm)
   */
  static formatDateTime(dateString: string): string {
    const dt = this.parseDate(dateString)
    return dt.toFormat('dd/MM/yyyy \'às\' HH:mm')
  }

  /**
   * Formatar data por extenso (segunda-feira, 16 de setembro de 2025)
   */
  static formatDateLong(dateString: string): string {
    const dt = this.parseDate(dateString)
    return dt.setLocale('pt-BR').toFormat('cccc, dd \'de\' MMMM \'de\' yyyy')
  }

  /**
   * Formatar data por extenso com horário (segunda-feira, 16 de setembro de 2025 às 14:30)
   */
  static formatDateTimeLong(dateString: string): string {
    const dt = this.parseDate(dateString)
    return dt.setLocale('pt-BR').toFormat('cccc, dd \'de\' MMMM \'de\' yyyy \'às\' HH:mm')
  }

  /**
   * Obter apenas a parte da data no formato ISO (YYYY-MM-DD)
   */
  static getDateOnly(dateString: string): string {
    if (dateString.includes('T')) {
      return dateString.split('T')[0]
    }
    const dt = this.parseDate(dateString)
    return dt.toISODate() || DateTime.now().toISODate()!
  }

  /**
   * Verificar se uma data é válida
   */
  static isValidDate(dateString: string): boolean {
    const dt = this.parseDate(dateString)
    return dt.isValid
  }

  /**
   * Comparar duas datas (retorna true se são do mesmo dia)
   */
  static isSameDay(date1: string, date2: string): boolean {
    const dt1 = this.parseDate(date1)
    const dt2 = this.parseDate(date2)
    return dt1.hasSame(dt2, 'day')
  }

  /**
   * Retornar objeto com data e hora separadas para compatibilidade
   */
  static formatDateTimeObject(dateString: string): { date: string; time: string } {
    const dt = this.parseDate(dateString)
    return {
      date: dt.toFormat('dd/MM/yyyy'),
      time: dt.toFormat('HH:mm')
    }
  }

  /**
   * Formatar data curta para uso em listas (dd/MM)
   */
  static formatDateShort(dateString: string): string {
    const dt = this.parseDate(dateString)
    return dt.toFormat('dd/MM')
  }
}

// Exportar também funções individuais para conveniência
export const formatTime = (dateString: string) => DateFormatter.formatTime(dateString)
export const formatDate = (dateString: string) => DateFormatter.formatDate(dateString)
export const formatDateTime = (dateString: string) => DateFormatter.formatDateTime(dateString)
export const formatDateLong = (dateString: string) => DateFormatter.formatDateLong(dateString)
export const formatDateTimeLong = (dateString: string) => DateFormatter.formatDateTimeLong(dateString)
export const getDateOnly = (dateString: string) => DateFormatter.getDateOnly(dateString)
export const isValidDate = (dateString: string) => DateFormatter.isValidDate(dateString)
export const isSameDay = (date1: string, date2: string) => DateFormatter.isSameDay(date1, date2)
export const formatDateTimeObject = (dateString: string) => DateFormatter.formatDateTimeObject(dateString)
export const formatDateShort = (dateString: string) => DateFormatter.formatDateShort(dateString)
