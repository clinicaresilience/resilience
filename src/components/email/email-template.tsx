/**
 * Componente de Template de Email Padronizado
 * 
 * Este componente fornece um template HTML consistente para todos os emails
 * enviados pelo sistema, incluindo as cores da marca e logotipo.
 */

export interface EmailTemplateProps {
  titulo: string;
  destinatario: string;
  conteudo: string;
  tipo?: 'sucesso' | 'alerta' | 'info' | 'aviso';
  mostrarBotao?: boolean;
  textoBotao?: string;
  linkBotao?: string;
}

export function gerarTemplateEmail({
  titulo,
  destinatario,
  conteudo,
  tipo = 'info',
  mostrarBotao = false,
  textoBotao = '',
  linkBotao = ''
}: EmailTemplateProps): string {
  // Definir cores baseadas no tipo
  const coresTipo = {
    sucesso: {
      background: '#d4edda',
      border: '#01c2e3',
      text: '#155724',
      icon: '✅'
    },
    alerta: {
      background: '#f8d7da',
      border: '#dc3545',
      text: '#721c24',
      icon: '❌'
    },
    info: {
      background: '#e8f4f8',
      border: '#456dc6',
      text: '#0c5460',
      icon: '📧'
    },
    aviso: {
      background: '#fff3cd',
      border: '#f5b26b',
      text: '#856404',
      icon: '⚠️'
    }
  };

  const corAtual = coresTipo[tipo];

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${titulo} | Clínica Resilience</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Red Hat Display', Arial, sans-serif;
          line-height: 1.6;
          color: #232c55;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #edfffe 0%, #f8f9fa 100%);
        }
        
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(35, 44, 85, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #456dc6 0%, #01c2e3 100%);
          padding: 30px;
          text-align: center;
          color: white;
        }
        
        .logo {
          max-width: 180px;
          height: auto;
          margin-bottom: 15px;
        }
        
        .header h1 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header p {
          font-size: 16px;
          margin: 8px 0 0 0;
          opacity: 0.9;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 18px;
          margin-bottom: 25px;
          color: #232c55;
        }
        
        .message-box {
          background: ${corAtual.background};
          border-left: 4px solid ${corAtual.border};
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          position: relative;
        }
        
        .message-box::before {
          content: '${corAtual.icon}';
          font-size: 24px;
          position: absolute;
          top: 20px;
          right: 20px;
        }
        
        .message-box h2 {
          color: ${corAtual.text};
          font-size: 20px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .message-content {
          color: ${corAtual.text};
          font-size: 16px;
          line-height: 1.6;
        }
        
        .info-grid {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 25px;
          margin: 25px 0;
          border: 1px solid #e9ecef;
        }
        
        .info-grid h3 {
          color: #456dc6;
          font-size: 18px;
          margin-bottom: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 500;
          color: #232c55;
        }
        
        .info-value {
          color: #456dc6;
          font-weight: 600;
        }
        
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #456dc6 0%, #01c2e3 100%);
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(69, 109, 198, 0.3);
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(69, 109, 198, 0.4);
        }
        
        .footer {
          background: #232c55;
          color: white;
          padding: 30px;
          text-align: center;
          font-size: 14px;
        }
        
        .footer-logo {
          max-width: 120px;
          height: auto;
          margin-bottom: 15px;
          opacity: 0.8;
        }
        
        .footer p {
          margin: 8px 0;
          opacity: 0.9;
        }
        
        .contact-info {
          margin: 20px 0;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }
        
        .contact-info p {
          margin: 5px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #01c2e3, transparent);
          margin: 25px 0;
        }
        
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 8px;
          }
          
          .header, .content, .footer {
            padding: 20px;
          }
          
          .info-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header com logo e gradiente -->
        <div class="header">
          <img src="https://clinicaresilience.com.br/logoResilience.png" alt="Clínica Resilience" class="logo">
          <h1>${titulo}</h1>
          <p>Sistema de Gestão Clínica</p>
        </div>
        
        <!-- Conteúdo principal -->
        <div class="content">
          <div class="greeting">
            Olá <strong>${destinatario}</strong>,
          </div>
          
          <div class="message-box">
            <h2>${titulo}</h2>
            <div class="message-content">
              ${conteudo}
            </div>
          </div>
          
          ${mostrarBotao && linkBotao ? `
            <div class="button-container">
              <a href="${linkBotao}" class="btn">${textoBotao}</a>
            </div>
          ` : ''}
          
          <div class="divider"></div>
          
          <p style="color: #6c757d; font-size: 14px; margin-top: 20px;">
            Este é um email automático. Por favor, não responda diretamente a esta mensagem.
          </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <img src="https://clinicaresilience.com.br/logoResilience.png" alt="Clínica Resilience" class="footer-logo">
          
          <div class="contact-info">
            <p>📧 contato@clinicaresilience.com.br</p>
            <p>📱 (11) 99999-9999</p>
            <p>🌐 www.clinicaresilience.com.br</p>
          </div>
          
          <p>&copy; ${new Date().getFullYear()} Clínica Resilience. Todos os direitos reservados.</p>
          <p>Cuidando da sua saúde mental com excelência e dedicação.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template específico para boas-vindas a profissionais - Versão Simples
 */
export function gerarEmailBoasVindasProfissional(dados: {
  nome: string;
  email: string;
  senha: string;
  especialidade: string;
  crp: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo à Clínica Resilience</title>
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
          background: #456dc6;
          padding: 30px 20px;
          text-align: center;
          color: white;
        }
        
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .content {
          padding: 30px 20px;
        }
        
        .welcome-title {
          color: #456dc6;
          font-size: 20px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .access-box {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .access-item {
          margin: 10px 0;
          font-size: 14px;
        }
        
        .access-label {
          font-weight: bold;
          color: #555;
        }
        
        .access-value {
          color: #456dc6;
          font-weight: 600;
          margin-left: 10px;
        }
        
        .button {
          display: block;
          width: fit-content;
          margin: 25px auto;
          background: #456dc6;
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
        }
        
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e9ecef;
        }
        
        .note {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
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
          <h2 class="welcome-title">Bem-vindo, ${dados.nome}!</h2>
          
          <p>Seu cadastro foi realizado com sucesso. Acesse o sistema com os dados abaixo:</p>
          
          <div class="access-box">
            <div class="access-item">
              <span class="access-label">Email:</span>
              <span class="access-value">${dados.email}</span>
            </div>
            <div class="access-item">
              <span class="access-label">Senha temporária:</span>
              <span class="access-value">${dados.senha}</span>
            </div>
            <div class="access-item">
              <span class="access-label">Especialidade:</span>
              <span class="access-value">${dados.especialidade}</span>
            </div>
            <div class="access-item">
              <span class="access-label">CRP:</span>
              <span class="access-value">${dados.crp}</span>
            </div>
          </div>
          
          <a href="https://clinicaresilience.com.br/auth/login" class="button">
            Acessar Sistema
          </a>
          
          <div class="note">
            <strong>Importante:</strong> Altere sua senha no primeiro acesso e complete seu perfil profissional.
          </div>
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
 * Template para redefinição de senha
 */
export function gerarEmailRedefinicaoSenha(dados: {
  nome: string;
  linkRedefinicao: string;
}): string {
  return gerarTemplateEmail({
    titulo: 'Redefinição de Senha',
    destinatario: dados.nome,
    conteudo: `
      <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
      <p>Se você não fez esta solicitação, pode ignorar este email com segurança.</p>
      <p>Para redefinir sua senha, clique no botão abaixo:</p>
      <p><strong>Este link expira em 1 hora por motivos de segurança.</strong></p>
    `,
    tipo: 'info',
    mostrarBotao: true,
    textoBotao: 'Redefinir Senha',
    linkBotao: dados.linkRedefinicao
  });
}
