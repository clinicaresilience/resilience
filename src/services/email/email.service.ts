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
import { gerarEmailBoasVindasProfissional } from '@/components/email/email-template';

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
   * Envia email de boas-vindas para profissional recém-cadastrado
   */
  static async enviarBoasVindasProfissional(dados: {
    nome: string;
    email: string;
    senha: string;
    especialidade: string;
    crp: string;
  }): Promise<void> {
    try {
      console.log(`Enviando email de boas-vindas para profissional: ${dados.email}`);

      const htmlContent = gerarEmailBoasVindasProfissional(dados);
      
      await this.enviarEmail({
        to: dados.email,
        subject: 'Bem-vindo à Clínica Resilience - Dados de Acesso',
        html: htmlContent,
        destinatario: 'profissional',
        agendamentoId: 'boas-vindas-' + Date.now()
      });

      console.log(`✅ Email de boas-vindas enviado com sucesso para: ${dados.email}`);
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      throw error;
    }
  }

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
   * Gera template HTML minimalista para email do paciente
   */
  private static gerarTemplatePaciente(tipo: TipoNotificacao, agendamento: AgendamentoEmailData): string {
    const dataFormatada = TimezoneUtils.formatForDisplay(agendamento.data_consulta);
    const horaFormatada = TimezoneUtils.formatForDisplay(agendamento.data_consulta, undefined, 'time');

    let titulo: string;
    let corHeader: string;
    let mensagem: string;
    let informacoesExtras: string = '';

    switch (tipo) {
      case 'criacao':
        titulo = 'Agendamento Confirmado';
        corHeader = '#28a745'; // Verde para sucesso
        mensagem = 'Seu agendamento foi confirmado com sucesso!';
        informacoesExtras = agendamento.modalidade === 'presencial' 
          ? '<div class="note">📍 <strong>Consulta Presencial:</strong> Chegue com 15 minutos de antecedência.</div>'
          : '<div class="note">💻 <strong>Consulta Online:</strong> O link será enviado 30 minutos antes.</div>';
        break;
      case 'cancelamento':
        titulo = 'Agendamento Cancelado';
        corHeader = '#dc3545'; // Vermelho para cancelamento
        mensagem = 'Informamos que seu agendamento foi cancelado.';
        informacoesExtras = '<div class="note">Para reagendar sua consulta, entre em contato conosco.</div>';
        break;
      case 'reagendamento':
        titulo = 'Agendamento Reagendado';
        corHeader = '#456dc6'; // Azul para reagendamento
        mensagem = 'Seu agendamento foi reagendado com sucesso!';
        break;
      default:
        titulo = 'Notificação de Agendamento';
        corHeader = '#456dc6';
        mensagem = 'Este é um email de notificação sobre seu agendamento.';
        break;
    }

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${titulo} | Clínica Resilience</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .header {
            background: ${corHeader};
            padding: 25px 20px;
            text-align: center;
            color: white;
          }
          
          .logo {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .content {
            padding: 25px 20px;
          }
          
          .title {
            color: ${corHeader};
            font-size: 18px;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .info-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 18px;
            margin: 18px 0;
          }
          
          .info-item {
            margin: 8px 0;
            font-size: 14px;
          }
          
          .info-label {
            font-weight: bold;
            color: #555;
          }
          
          .info-value {
            color: ${corHeader};
            font-weight: 600;
            margin-left: 10px;
          }
          
          .note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 12px;
            margin: 15px 0;
            font-size: 14px;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 18px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e9ecef;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Clínica Resilience</div>
            <p>Sistema de Gestão Clínica</p>
          </div>
          
          <div class="content">
            <h2 class="title">${titulo}</h2>
            
            <p>Olá <strong>${agendamento.paciente.nome}</strong>,</p>
            <p>${mensagem}</p>
            
            <div class="info-box">
              <div class="info-item">
                <span class="info-label">Profissional:</span>
                <span class="info-value">${agendamento.profissional.nome}</span>
              </div>
              ${agendamento.profissional.especialidade ? `
              <div class="info-item">
                <span class="info-label">Especialidade:</span>
                <span class="info-value">${agendamento.profissional.especialidade}</span>
              </div>` : ''}
              <div class="info-item">
                <span class="info-label">Data:</span>
                <span class="info-value">${dataFormatada}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Horário:</span>
                <span class="info-value">${horaFormatada}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Modalidade:</span>
                <span class="info-value">${agendamento.modalidade === 'presencial' ? '🏥 Presencial' : '💻 Online'}</span>
              </div>
              ${agendamento.notas ? `
              <div class="info-item">
                <span class="info-label">Observações:</span>
                <span class="info-value">${agendamento.notas}</span>
              </div>` : ''}
              ${agendamento.justificativa_cancelamento ? `
              <div class="info-item">
                <span class="info-label">Motivo do Cancelamento:</span>
                <span class="info-value">${agendamento.justificativa_cancelamento}</span>
              </div>` : ''}
            </div>
            
            ${informacoesExtras}
          </div>
          
          <div class="footer">
            <p><strong>Clínica Resilience</strong></p>
            <p>contato@clinicaresilience.com.br | (11) 99999-9999</p>
            <p>Este é um email automático. Não responda a esta mensagem.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Gera template HTML minimalista para email do profissional
   */
  private static gerarTemplateProfissional(tipo: TipoNotificacao, agendamento: AgendamentoEmailData): string {
    const dataFormatada = TimezoneUtils.formatForDisplay(agendamento.data_consulta);
    const horaFormatada = TimezoneUtils.formatForDisplay(agendamento.data_consulta, undefined, 'time');

    let titulo: string;
    let corHeader: string;
    let mensagem: string;
    let informacoesExtras: string = '';

    switch (tipo) {
      case 'criacao':
        titulo = 'Novo Agendamento';
        corHeader = '#28a745'; // Verde para sucesso
        mensagem = 'Você tem um novo agendamento confirmado.';
        break;
      case 'cancelamento':
        titulo = 'Agendamento Cancelado';
        corHeader = '#dc3545'; // Vermelho para cancelamento
        mensagem = 'Um agendamento foi cancelado.';
        informacoesExtras = '<div class="note">O horário foi liberado automaticamente em sua agenda.</div>';
        break;
      case 'reagendamento':
        titulo = 'Agendamento Reagendado';
        corHeader = '#456dc6'; // Azul para reagendamento
        mensagem = 'Um agendamento foi reagendado.';
        break;
      default:
        titulo = 'Notificação de Agendamento';
        corHeader = '#456dc6';
        mensagem = 'Esta é uma notificação sobre um agendamento.';
        break;
    }

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${titulo} | Clínica Resilience</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .header {
            background: ${corHeader};
            padding: 25px 20px;
            text-align: center;
            color: white;
          }
          
          .logo {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .content {
            padding: 25px 20px;
          }
          
          .title {
            color: ${corHeader};
            font-size: 18px;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .patient-box {
            background: #e8f4f8;
            border: 1px solid #bee5eb;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
          }
          
          .info-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 18px;
            margin: 18px 0;
          }
          
          .info-item {
            margin: 8px 0;
            font-size: 14px;
          }
          
          .info-label {
            font-weight: bold;
            color: #555;
          }
          
          .info-value {
            color: ${corHeader};
            font-weight: 600;
            margin-left: 10px;
          }
          
          .note {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 4px;
            padding: 12px;
            margin: 15px 0;
            font-size: 14px;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 18px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e9ecef;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Clínica Resilience</div>
            <p>Notificação Profissional</p>
          </div>
          
          <div class="content">
            <h2 class="title">${titulo}</h2>
            
            <p>Olá <strong>Dr(a). ${agendamento.profissional.nome}</strong>,</p>
            <p>${mensagem}</p>
            
            <div class="patient-box">
              <strong>👤 Paciente:</strong>
              <div class="info-item">
                <span class="info-label">Nome:</span>
                <span class="info-value">${agendamento.paciente.nome}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">${agendamento.paciente.email}</span>
              </div>
            </div>
            
            <div class="info-box">
              <div class="info-item">
                <span class="info-label">Data:</span>
                <span class="info-value">${dataFormatada}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Horário:</span>
                <span class="info-value">${horaFormatada}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Modalidade:</span>
                <span class="info-value">${agendamento.modalidade === 'presencial' ? '🏥 Presencial' : '💻 Online'}</span>
              </div>
              ${agendamento.notas ? `
              <div class="info-item">
                <span class="info-label">Observações:</span>
                <span class="info-value">${agendamento.notas}</span>
              </div>` : ''}
              ${agendamento.justificativa_cancelamento ? `
              <div class="info-item">
                <span class="info-label">Motivo do Cancelamento:</span>
                <span class="info-value">${agendamento.justificativa_cancelamento}</span>
              </div>` : ''}
            </div>
            
            ${informacoesExtras}
          </div>
          
          <div class="footer">
            <p><strong>Clínica Resilience</strong></p>
            <p>Sistema de Gestão Clínica</p>
            <p>Este é um email automático de notificação.</p>
          </div>
        </div>
      </body>
      </html>
    `;
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
