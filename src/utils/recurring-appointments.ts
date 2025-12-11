import { AgendamentosService } from '@/services/database/agendamentos.service';
import type { Modalidade } from '@/services/database/agendamentos.service';

interface RecurringAppointmentData {
  usuario_id: string;
  profissional_id: string;
  data_primeira_consulta: string; // ISO 8601 em UTC
  modalidade: Modalidade;
  quantidade_sessoes: number;
  compra_pacote_id: string;
  notas?: string;
}

interface CreatedAppointment {
  id: string;
  data_consulta: string;
  numero_sessao: number;
}

export class RecurringAppointmentsHelper {
  /**
   * Cria agendamentos recorrentes semanais a partir de uma data inicial
   * @param data - Dados para criação dos agendamentos
   * @returns Array com IDs e datas dos agendamentos criados
   */
  static async criarAgendamentosRecorrentes(
    data: RecurringAppointmentData
  ): Promise<CreatedAppointment[]> {
    const agendamentosCriados: CreatedAppointment[] = [];
    const primeiraData = new Date(data.data_primeira_consulta);

    // Primeiro agendamento já foi criado na API principal
    agendamentosCriados.push({
      id: 'primeiro_agendamento',
      data_consulta: data.data_primeira_consulta,
      numero_sessao: 1,
    });

    // Criar agendamentos para as sessões restantes (semanal, mesmo dia/hora)
    for (let i = 1; i < data.quantidade_sessoes; i++) {
      const proximaData = new Date(primeiraData);
      proximaData.setDate(proximaData.getDate() + (i * 7)); // Adicionar 7 dias por semana

      const dataConsultaUTC = proximaData.toISOString();

      try {
        // Verificar disponibilidade antes de criar
        const disponivel = await AgendamentosService.checkAvailability(
          data.profissional_id,
          dataConsultaUTC
        );

        if (!disponivel) {
          console.warn(
            `Horário não disponível para sessão ${i + 1} em ${dataConsultaUTC}. Pulando...`
          );
          continue;
        }

        // Criar agendamento recorrente
        const agendamento = await AgendamentosService.createAgendamento({
          usuario_id: data.usuario_id,
          profissional_id: data.profissional_id,
          data_consulta: dataConsultaUTC,
          modalidade: data.modalidade,
          notas: data.notas || `Sessão ${i + 1} de ${data.quantidade_sessoes} - Agendamento automático`,
          tipo_paciente: 'fisica',
          compra_pacote_id: data.compra_pacote_id,
        });

        agendamentosCriados.push({
          id: agendamento.id,
          data_consulta: dataConsultaUTC,
          numero_sessao: i + 1,
        });

        console.log(
          `Agendamento recorrente criado: Sessão ${i + 1}/${data.quantidade_sessoes} em ${dataConsultaUTC}`
        );
      } catch (error) {
        console.error(
          `Erro ao criar agendamento recorrente para sessão ${i + 1}:`,
          error
        );
        // Continuar tentando criar os próximos agendamentos mesmo se um falhar
      }
    }

    return agendamentosCriados;
  }

  /**
   * Calcula as datas de todos os agendamentos recorrentes sem criá-los
   * @param dataInicial - Data ISO 8601 da primeira consulta
   * @param quantidade - Número total de sessões
   * @returns Array com as datas calculadas
   */
  static calcularDatasRecorrentes(
    dataInicial: string,
    quantidade: number
  ): string[] {
    const datas: string[] = [];
    const primeiraData = new Date(dataInicial);

    for (let i = 0; i < quantidade; i++) {
      const proximaData = new Date(primeiraData);
      proximaData.setDate(proximaData.getDate() + (i * 7));
      datas.push(proximaData.toISOString());
    }

    return datas;
  }

  /**
   * Verifica se todas as datas calculadas estão disponíveis
   * @param profissional_id - ID do profissional
   * @param datas - Array de datas em ISO 8601
   * @returns Objeto com disponibilidade de cada data
   */
  static async verificarDisponibilidadeDatas(
    profissional_id: string,
    datas: string[]
  ): Promise<Record<string, boolean>> {
    const disponibilidade: Record<string, boolean> = {};

    for (const data of datas) {
      try {
        const disponivel = await AgendamentosService.checkAvailability(
          profissional_id,
          data
        );
        disponibilidade[data] = disponivel;
      } catch (error) {
        console.error(`Erro ao verificar disponibilidade para ${data}:`, error);
        disponibilidade[data] = false;
      }
    }

    return disponibilidade;
  }
}
