/**
 * Serviço de Email para Notificações Automáticas de Agendamentos
 * 
 * Este serviço é responsável por enviar notificações por email automáticas
 * para pacientes e profissionais quando agendamentos são criados, cancelados
 * ou reagendados.
 * 
 * Funcionalidades:
 * - Envio de emails de confirmação de agendamento
 * - Envio de emails de cancelamento de agendamento
 * - Envio de emails de reagendamento
 * - Templates HTML personalizados para cada tipo de notificação
 * - Suporte a múltiplos destinatários (paciente e profissional)
 */

import { createClient } from '@/lib/server';
import { TimezoneUtils } from '@/utils/timezone';

// Tipos para dados de agendamento
export interface AgendamentoEmailData {
  id: string;
  paciente: {
    id: string;
    nome: string;
    email: string;
  };
  profissional: {
    id: string;
    nome: string;
    email: string;
    especialidade?: string;
  };
  data_consulta: string;
  modalidade: 'presencial' | 'online';
  status: string;
  notas?: string;
  justificativa_cancelamento?: string;
}

// Tipos de notificação
export type TipoNotificacao = 'criacao' | 'cancelamento' | 'reagendamento';

// Interface para configuração de email
export interface EmailConfig {
  from: string;
  replyTo?: string;
  serviceUrl?: string;
}

export class EmailService {
  private static config: EmailConfig = {
    "from": "noreply@marcosgac.icu", // Usar domínio verificado do Resend para testes
    replyTo: 'contato@clinicaresilience.com.br',
    // URL do serviço de email - sempre usar REST API do Resend
    serviceUrl: 'https://api.resend.com/emails'
  };

  /**
   * Envia notificação de email para agendamento criado
   */
  static async enviarNotificacaoCriacao(agendamento: AgendamentoEmailData): Promise<void> {
    try {
      console.log(`Enviando notificação de criação de agendamento: ${agendamento.id}`);

      // Enviar email para o paciente
      await this.enviarEmailPaciente(agendamento, 'criacao');

      // Enviar email para o profissional
      await this.enviarEmailProfissional(agendamento, 'criacao');

      console.log(`Notificações de criação enviadas com sucesso para agendamento: ${agendamento.id}`);
    } catch (error) {
      console.error('Erro ao enviar notificações de criação:', error);
      throw error;
    }
  }

  /**
   * Envia notificação de email para agendamento cancelado
   */
  static async enviarNotificacaoCancelamento(agendamento: AgendamentoEmailData): Promise<void> {
    try {
      console.log(`Enviando notificação de cancelamento de agendamento: ${agendamento.id}`);

      // Enviar email para o paciente
      await this.enviarEmailPaciente(agendamento, 'cancelamento');

      // Enviar email para o profissional
      await this.enviarEmailProfissional(agendamento, 'cancelamento');

      console.log(`Notificações de cancelamento enviadas com sucesso para agendamento: ${agendamento.id}`);
    } catch (error) {
      console.error('Erro ao enviar notificações de cancelamento:', error);
      throw error;
    }
  }

  /**
   * Envia notificação de email para agendamento reagendado
   */
  static async enviarNotificacaoReagendamento(agendamento: AgendamentoEmailData): Promise<void> {
    try {
      console.log(`Enviando notificação de reagendamento de agendamento: ${agendamento.id}`);

      // Enviar email para o paciente
      await this.enviarEmailPaciente(agendamento, 'reagendamento');

      // Enviar email para o profissional
      await this.enviarEmailProfissional(agendamento, 'reagendamento');

      console.log(`Notificações de reagendamento enviadas com sucesso para agendamento: ${agendamento.id}`);
    } catch (error) {
      console.error('Erro ao enviar notificações de reagendamento:', error);
      throw error;
    }
  }

  /**
   * Envia email para o paciente
   */
  private static async enviarEmailPaciente(
    agendamento: AgendamentoEmailData,
    tipo: TipoNotificacao
  ): Promise<void> {
    const assunto = this.gerarAssuntoPaciente(tipo, agendamento);
    const conteudo = this.gerarTemplatePaciente(tipo, agendamento);

    await this.enviarEmail({
      to: agendamento.paciente.email,
      subject: assunto,
      html: conteudo,
      destinatario: 'paciente',
      agendamentoId: agendamento.id
    });
  }

  /**
   * Envia email para o profissional
   */
  private static async enviarEmailProfissional(
    agendamento: AgendamentoEmailData,
    tipo: TipoNotificacao
  ): Promise<void> {
    const assunto = this.gerarAssuntoProfissional(tipo, agendamento);
    const conteudo = this.gerarTemplateProfissional(tipo, agendamento);

    await this.enviarEmail({
      to: agendamento.profissional.email,
      subject: assunto,
      html: conteudo,
      destinatario: 'profissional',
      agendamentoId: agendamento.id
    });
  }

  /**
   * Função principal de envio de email
   */
  private static async enviarEmail(params: {
    to: string;
    subject: string;
    html: string;
    destinatario: 'paciente' | 'profissional';
    agendamentoId: string;
  }): Promise<void> {
    try {
      // Por enquanto, apenas log do email que seria enviado
      // Em produção, aqui seria integrado com serviço real de email (Resend, SendGrid, etc.)
      console.log('=== EMAIL NOTIFICATION ===');
      console.log(`Para: ${params.to}`);
      console.log(`Assunto: ${params.subject}`);
      console.log(`Destinatário: ${params.destinatario}`);
      console.log(`Agendamento ID: ${params.agendamentoId}`);
      console.log('=========================');

      // Implementar integração com serviço real de email
      // Exemplo com Resend:
      if (process.env.RESEND_API_KEY && this.config.serviceUrl) {
        try {
          const response = await fetch(this.config.serviceUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: this.config.from,
              to: params.to,
              subject: params.subject,
              html: params.html,
              reply_to: this.config.replyTo
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.warn(`Resend API Error: ${response.status} - ${response.statusText}. Response: ${errorText}`);
            // Não falhar - apenas registrar o erro
          } else {
            console.log(`✅ Email enviado com sucesso via Resend para: ${params.to}`);
          }
        } catch (fetchError) {
          console.warn('Erro ao conectar com Resend API:', fetchError);
          // Não falhar - apenas registrar o erro
        }
      } else {
        console.log('📧 Email simulado (Resend API key não configurada)');
      }

      // Registrar envio no banco de dados para auditoria (opcional)
      try {
        await this.registrarEnvioEmail({
          destinatario_email: params.to,
          tipo_destinatario: params.destinatario,
          agendamento_id: params.agendamentoId,
          assunto: params.subject,
          status: 'enviado'
        });
      } catch (dbError) {
        console.warn('Aviso: Não foi possível registrar email no banco (tabela pode não existir):', dbError);
        // Não falhar por erro de auditoria
      }

    } catch (error) {
      console.error('Erro ao enviar email:', error);

      // Registrar erro no banco
      await this.registrarEnvioEmail({
        destinatario_email: params.to,
        tipo_destinatario: params.destinatario,
        agendamento_id: params.agendamentoId,
        assunto: params.subject,
        status: 'erro',
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      throw error;
    }
  }

  /**
   * Registra o envio do email no banco de dados para auditoria
   */
  private static async registrarEnvioEmail(dados: {
    destinatario_email: string;
    tipo_destinatario: 'paciente' | 'profissional';
    agendamento_id: string;
    assunto: string;
    status: 'enviado' | 'erro';
    erro?: string;
  }): Promise<void> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from('email_notifications')
        .insert({
          agendamento_id: dados.agendamento_id,
          destinatario_email: dados.destinatario_email,
          tipo_destinatario: dados.tipo_destinatario,
          assunto: dados.assunto,
          status: dados.status,
          erro: dados.erro,
          enviado_em: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao registrar envio de email:', error);
        // Não falhar o processo principal por erro de auditoria
      }
    } catch (error) {
      console.error('Erro ao registrar envio de email:', error);
      // Não falhar o processo principal por erro de auditoria
    }
  }

  /**
   * Gera assunto do email para paciente
   */
  private static gerarAssuntoPaciente(tipo: TipoNotificacao, agendamento: AgendamentoEmailData): string {
    const dataFormatada = TimezoneUtils.formatForDisplay(agendamento.data_consulta);

    switch (tipo) {
      case 'criacao':
        return `Agendamento Confirmado - ${dataFormatada} | Clínica Resilience`;
      case 'cancelamento':
        return `Agendamento Cancelado - ${dataFormatada} | Clínica Resilience`;
      case 'reagendamento':
        return `Agendamento Reagendado - Nova data: ${dataFormatada} | Clínica Resilience`;
      default:
        return `Notificação de Agendamento | Clínica Resilience`;
    }
  }

  /**
   * Gera assunto do email para profissional
   */
  private static gerarAssuntoProfissional(tipo: TipoNotificacao, agendamento: AgendamentoEmailData): string {
    const dataFormatada = TimezoneUtils.formatForDisplay(agendamento.data_consulta);

    switch (tipo) {
      case 'criacao':
        return `Novo Agendamento - ${agendamento.paciente.nome} - ${dataFormatada}`;
      case 'cancelamento':
        return `Agendamento Cancelado - ${agendamento.paciente.nome} - ${dataFormatada}`;
      case 'reagendamento':
        return `Agendamento Reagendado - ${agendamento.paciente.nome} - ${dataFormatada}`;
      default:
        return `Notificação de Agendamento - ${agendamento.paciente.nome}`;
    }
  }

  /**
   * Gera template HTML para email do paciente
   */
  private static gerarTemplatePaciente(tipo: TipoNotificacao, agendamento: AgendamentoEmailData): string {
    const dataFormatada = TimezoneUtils.formatForDisplay(agendamento.data_consulta);
    const horaFormatada = TimezoneUtils.formatForDisplay(agendamento.data_consulta, undefined, 'time');

    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clínica Resilience - Notificação</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #2c5aa0; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { margin-bottom: 25px; }
          .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5aa0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
          .btn { display: inline-block; padding: 12px 24px; background: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .alert { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Clínica Resilience</div>
            <p>Sistema de Gestão de Consultas</p>
          </div>
    `;

    const footer = `
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>Para dúvidas ou alterações, entre em contato conosco:</p>
            <p>📧 contato@clinicaresilience.com.br | 📱 (11) 99999-9999</p>
            <p>&copy; 2024 Clínica Resilience. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    switch (tipo) {
      case 'criacao':
        return baseTemplate + `
          <div class="content">
            <div class="success">
              <h2>✅ Agendamento Confirmado!</h2>
            </div>
            
            <p>Olá <strong>${agendamento.paciente.nome}</strong>,</p>
            
            <p>Seu agendamento foi confirmado com sucesso! Seguem os detalhes:</p>
            
            <div class="info-box">
              <h3>📅 Detalhes do Agendamento</h3>
              <p><strong>Profissional:</strong> ${agendamento.profissional.nome}</p>
              ${agendamento.profissional.especialidade ? `<p><strong>Especialidade:</strong> ${agendamento.profissional.especialidade}</p>` : ''}
              <p><strong>Data:</strong> ${dataFormatada}</p>
              <p><strong>Horário:</strong> ${horaFormatada}</p>
              <p><strong>Modalidade:</strong> ${agendamento.modalidade === 'presencial' ? '🏥 Presencial' : '💻 Online'}</p>
              ${agendamento.notas ? `<p><strong>Observações:</strong> ${agendamento.notas}</p>` : ''}
            </div>
            
            ${agendamento.modalidade === 'presencial' ? `
              <div class="info-box">
                <h3>📍 Informações Importantes</h3>
                <p><strong>Local:</strong> Clínica Resilience</p>
                <p><strong>Endereço:</strong> [Inserir endereço da clínica]</p>
                <p>Por favor, chegue com 15 minutos de antecedência.</p>
              </div>
            ` : `
              <div class="info-box">
                <h3>💻 Consulta Online</h3>
                <p>O link para a consulta será enviado por email 30 minutos antes do horário agendado.</p>
                <p>Certifique-se de ter uma conexão estável com a internet.</p>
              </div>
            `}
          </div>
        ` + footer;

      case 'cancelamento':
        return baseTemplate + `
          <div class="content">
            <div class="alert">
              <h2>❌ Agendamento Cancelado</h2>
            </div>
            
            <p>Olá <strong>${agendamento.paciente.nome}</strong>,</p>
            
            <p>Informamos que seu agendamento foi cancelado:</p>
            
            <div class="info-box">
              <h3>📅 Agendamento Cancelado</h3>
              <p><strong>Profissional:</strong> ${agendamento.profissional.nome}</p>
              <p><strong>Data:</strong> ${dataFormatada}</p>
              <p><strong>Horário:</strong> ${horaFormatada}</p>
              <p><strong>Modalidade:</strong> ${agendamento.modalidade === 'presencial' ? '🏥 Presencial' : '💻 Online'}</p>
              ${agendamento.justificativa_cancelamento ? `<p><strong>Motivo:</strong> ${agendamento.justificativa_cancelamento}</p>` : ''}
            </div>
            
            <p>Para reagendar sua consulta ou esclarecer dúvidas, entre em contato conosco.</p>
          </div>
        ` + footer;

      case 'reagendamento':
        return baseTemplate + `
          <div class="content">
            <div class="success">
              <h2>🔄 Agendamento Reagendado</h2>
            </div>
            
            <p>Olá <strong>${agendamento.paciente.nome}</strong>,</p>
            
            <p>Seu agendamento foi reagendado com sucesso! Seguem os novos detalhes:</p>
            
            <div class="info-box">
              <h3>📅 Nova Data e Horário</h3>
              <p><strong>Profissional:</strong> ${agendamento.profissional.nome}</p>
              <p><strong>Nova Data:</strong> ${dataFormatada}</p>
              <p><strong>Novo Horário:</strong> ${horaFormatada}</p>
              <p><strong>Modalidade:</strong> ${agendamento.modalidade === 'presencial' ? '🏥 Presencial' : '💻 Online'}</p>
              ${agendamento.notas ? `<p><strong>Observações:</strong> ${agendamento.notas}</p>` : ''}
            </div>
          </div>
        ` + footer;

      default:
        return baseTemplate + `
          <div class="content">
            <p>Olá <strong>${agendamento.paciente.nome}</strong>,</p>
            <p>Este é um email de notificação sobre seu agendamento.</p>
          </div>
        ` + footer;
    }
  }

  /**
   * Gera template HTML para email do profissional
   */
  private static gerarTemplateProfissional(tipo: TipoNotificacao, agendamento: AgendamentoEmailData): string {
    const dataFormatada = TimezoneUtils.formatForDisplay(agendamento.data_consulta);
    const horaFormatada = TimezoneUtils.formatForDisplay(agendamento.data_consulta, undefined, 'time');

    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clínica Resilience - Notificação Profissional</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #2c5aa0; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { margin-bottom: 25px; }
          .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2c5aa0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
          .professional { background: #e8f4f8; border-left-color: #17a2b8; }
          .alert { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Clínica Resilience</div>
            <p>Notificação Profissional</p>
          </div>
    `;

    const footer = `
          <div class="footer">
            <p>Sistema de Gestão Clínica Resilience</p>
            <p>Este é um email automático de notificação.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    switch (tipo) {
      case 'criacao':
        return baseTemplate + `
          <div class="content">
            <div class="success">
              <h2>📋 Novo Agendamento</h2>
            </div>
            
            <p>Olá <strong>Dr(a). ${agendamento.profissional.nome}</strong>,</p>
            
            <p>Você tem um novo agendamento confirmado:</p>
            
            <div class="info-box professional">
              <h3>👤 Dados do Paciente</h3>
              <p><strong>Nome:</strong> ${agendamento.paciente.nome}</p>
              <p><strong>Email:</strong> ${agendamento.paciente.email}</p>
            </div>
            
            <div class="info-box">
              <h3>📅 Detalhes da Consulta</h3>
              <p><strong>Data:</strong> ${dataFormatada}</p>
              <p><strong>Horário:</strong> ${horaFormatada}</p>
              <p><strong>Modalidade:</strong> ${agendamento.modalidade === 'presencial' ? '🏥 Presencial' : '💻 Online'}</p>
              ${agendamento.notas ? `<p><strong>Observações do Paciente:</strong> ${agendamento.notas}</p>` : ''}
            </div>
          </div>
        ` + footer;

      case 'cancelamento':
        return baseTemplate + `
          <div class="content">
            <div class="alert">
              <h2>❌ Agendamento Cancelado</h2>
            </div>
            
            <p>Olá <strong>Dr(a). ${agendamento.profissional.nome}</strong>,</p>
            
            <p>Um agendamento foi cancelado:</p>
            
            <div class="info-box professional">
              <h3>👤 Dados do Paciente</h3>
              <p><strong>Nome:</strong> ${agendamento.paciente.nome}</p>
              <p><strong>Email:</strong> ${agendamento.paciente.email}</p>
            </div>
            
            <div class="info-box">
              <h3>📅 Consulta Cancelada</h3>
              <p><strong>Data:</strong> ${dataFormatada}</p>
              <p><strong>Horário:</strong> ${horaFormatada}</p>
              <p><strong>Modalidade:</strong> ${agendamento.modalidade === 'presencial' ? '🏥 Presencial' : '💻 Online'}</p>
              ${agendamento.justificativa_cancelamento ? `<p><strong>Motivo:</strong> ${agendamento.justificativa_cancelamento}</p>` : ''}
            </div>
            
            <p>O horário foi liberado em sua agenda automaticamente.</p>
          </div>
        ` + footer;

      case 'reagendamento':
        return baseTemplate + `
          <div class="content">
            <div class="success">
              <h2>🔄 Agendamento Reagendado</h2>
            </div>
            
            <p>Olá <strong>Dr(a). ${agendamento.profissional.nome}</strong>,</p>
            
            <p>Um agendamento foi reagendado:</p>
            
            <div class="info-box professional">
              <h3>👤 Dados do Paciente</h3>
              <p><strong>Nome:</strong> ${agendamento.paciente.nome}</p>
              <p><strong>Email:</strong> ${agendamento.paciente.email}</p>
            </div>
            
            <div class="info-box">
              <h3>📅 Nova Data e Horário</h3>
              <p><strong>Nova Data:</strong> ${dataFormatada}</p>
              <p><strong>Novo Horário:</strong> ${horaFormatada}</p>
              <p><strong>Modalidade:</strong> ${agendamento.modalidade === 'presencial' ? '🏥 Presencial' : '💻 Online'}</p>
              ${agendamento.notas ? `<p><strong>Observações:</strong> ${agendamento.notas}</p>` : ''}
            </div>
          </div>
        ` + footer;

      default:
        return baseTemplate + `
          <div class="content">
            <p>Olá <strong>Dr(a). ${agendamento.profissional.nome}</strong>,</p>
            <p>Esta é uma notificação sobre um agendamento.</p>
          </div>
        ` + footer;
    }
  }

  /**
   * Busca dados completos do agendamento para envio de email
   */
  static async buscarDadosAgendamento(agendamentoId: string): Promise<AgendamentoEmailData | null> {
    try {
      const supabase = await createClient();

      const { data: agendamento, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_consulta,
          modalidade,
          status,
          notas,
          paciente:usuarios!agendamentos_paciente_id_fkey(id, nome, email),
          profissional:usuarios!agendamentos_profissional_id_fkey(id, nome, email, especialidade)
        `)
        .eq('id', agendamentoId)
        .single();

      if (error || !agendamento) {
        console.error('Erro ao buscar dados do agendamento para email:', error);
        return null;
      }

      // Acessar os dados corretamente dependendo da estrutura retornada
      const pacienteData = Array.isArray(agendamento.paciente) ? agendamento.paciente[0] : agendamento.paciente;
      const profissionalData = Array.isArray(agendamento.profissional) ? agendamento.profissional[0] : agendamento.profissional;

      return {
        id: agendamento.id,
        paciente: {
          id: pacienteData.id,
          nome: pacienteData.nome,
          email: pacienteData.email
        },
        profissional: {
          id: profissionalData.id,
          nome: profissionalData.nome,
          email: profissionalData.email,
          especialidade: profissionalData.especialidade
        },
        data_consulta: agendamento.data_consulta,
        modalidade: agendamento.modalidade,
        status: agendamento.status,
        notas: agendamento.notas
      };
    } catch (error) {
      console.error('Erro ao buscar dados do agendamento:', error);
      return null;
    }
  }
}
