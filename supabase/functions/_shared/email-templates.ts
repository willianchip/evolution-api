// Professional Email Templates for Gestão de WhatsApp
// All templates use the verified domain: wsgba-zap.com.br

const brandColors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  dark: '#1e293b',
  light: '#f8fafc',
};

export const baseTemplate = (content: string, previewText: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>Gestão de WhatsApp</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f1f5f9;
    }
    .preview-text {
      display: none;
      max-height: 0;
      overflow: hidden;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      transition: opacity 0.3s;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
    .divider {
      height: 1px;
      background-color: #e2e8f0;
      margin: 30px 0;
    }
    h1 {
      color: ${brandColors.dark};
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    p {
      color: #475569;
      line-height: 1.6;
      margin: 0 0 15px 0;
    }
    .alert {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert p {
      margin: 0;
      color: #92400e;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="preview-text">${previewText}</div>
  <div class="container">
    <div class="header">
      <h1 class="logo">🚀 Gestão de WhatsApp</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>
        <strong>Gestão de WhatsApp AI Manager</strong><br>
        Automatize suas conversas com inteligência artificial
      </p>
      <p style="margin-top: 15px;">
        <a href="https://wsgba-zap.com.br" style="color: ${brandColors.primary}; text-decoration: none;">wsgba-zap.com.br</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

export const welcomeEmailTemplate = (name: string) => {
  const content = `
    <h1>Bem-vindo ao Gestão de WhatsApp! 🎉</h1>
    <p>Olá ${name || 'amigo'},</p>
    <p>
      Estamos muito felizes em tê-lo conosco! Você acaba de se juntar à plataforma mais poderosa 
      para gerenciar suas conversas do WhatsApp com inteligência artificial.
    </p>
    
    <h2 style="color: #3b82f6; font-size: 18px; margin-top: 30px;">🚀 Comece agora mesmo:</h2>
    <ul style="color: #475569; line-height: 1.8;">
      <li><strong>Conecte seu WhatsApp</strong> - Configure sua primeira conexão</li>
      <li><strong>Configure automações</strong> - Crie respostas automáticas inteligentes</li>
      <li><strong>Chat com IA</strong> - Converse com o Gemini para análises e insights</li>
      <li><strong>Agende mensagens</strong> - Programe envios para datas específicas</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${Deno.env.get('APP_URL')}/dashboard" class="button">
        Acessar Dashboard
      </a>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #64748b;">
      Precisa de ajuda? Entre em contato conosco respondendo este e-mail ou acesse nossa 
      <a href="${Deno.env.get('APP_URL')}/help" style="color: #3b82f6;">central de ajuda</a>.
    </p>
  `;

  return baseTemplate(content, 'Bem-vindo ao Gestão de WhatsApp! Comece agora.');
};

export const verificationEmailTemplate = (verificationUrl: string) => {
  const content = `
    <h1>Confirme seu e-mail 📧</h1>
    <p>
      Para começar a usar o Gestão de WhatsApp, precisamos confirmar que este é realmente o seu e-mail.
    </p>
    <p>
      Clique no botão abaixo para verificar sua conta:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" class="button">
        Verificar E-mail
      </a>
    </div>

    <p style="font-size: 14px; color: #64748b;">
      Ou copie e cole este link no seu navegador:<br>
      <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
    </p>

    <div class="alert">
      <p><strong>⏰ Este link expira em 24 horas</strong></p>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #64748b;">
      Se você não criou uma conta, pode ignorar este e-mail com segurança.
    </p>
  `;

  return baseTemplate(content, 'Confirme seu e-mail para continuar');
};

export const passwordResetTemplate = (resetUrl: string, userName?: string) => {
  const content = `
    <h1>Redefinir sua senha 🔐</h1>
    <p>Olá ${userName || 'usuário'},</p>
    <p>
      Recebemos uma solicitação para redefinir a senha da sua conta no Gestão de WhatsApp.
    </p>
    <p>
      Clique no botão abaixo para criar uma nova senha:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" class="button">
        Redefinir Senha
      </a>
    </div>

    <p style="font-size: 14px; color: #64748b;">
      Ou copie e cole este link no seu navegador:<br>
      <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
    </p>

    <div class="alert">
      <p><strong>⏰ Este link expira em 1 hora</strong></p>
    </div>

    <div class="divider"></div>

    <h2 style="color: #ef4444; font-size: 16px; margin-top: 30px;">🔒 Segurança da Conta</h2>
    <p style="font-size: 14px; color: #64748b;">
      Se você <strong>não solicitou</strong> esta alteração, alguém pode estar tentando acessar sua conta. 
      Neste caso, <strong>não clique no link</strong> e entre em contato conosco imediatamente.
    </p>
  `;

  return baseTemplate(content, 'Redefinição de senha solicitada');
};

export const notificationEmailTemplate = (
  title: string,
  message: string,
  ctaText?: string,
  ctaUrl?: string,
  type: 'success' | 'warning' | 'error' | 'info' = 'info'
) => {
  const iconMap = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };

  const colorMap = {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  };

  const content = `
    <h1 style="color: ${colorMap[type]};">${iconMap[type]} ${title}</h1>
    <p>${message}</p>

    ${ctaText && ctaUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${ctaUrl}" class="button">
          ${ctaText}
        </a>
      </div>
    ` : ''}

    <div class="divider"></div>

    <p style="font-size: 14px; color: #64748b;">
      Esta é uma notificação automática do sistema. Você pode gerenciar suas preferências de 
      notificações no <a href="${Deno.env.get('APP_URL')}/settings" style="color: #3b82f6;">painel de configurações</a>.
    </p>
  `;

  return baseTemplate(content, title);
};

export const twoFactorCodeTemplate = (code: string, userName?: string) => {
  const content = `
    <h1>Código de Autenticação 🔐</h1>
    <p>Olá ${userName || 'usuário'},</p>
    <p>
      Seu código de autenticação de dois fatores é:
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <div style="
        display: inline-block;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        padding: 20px 40px;
        border-radius: 12px;
      ">
        <span style="
          color: #ffffff;
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        ">${code}</span>
      </div>
    </div>

    <div class="alert">
      <p><strong>⏰ Este código expira em 5 minutos</strong></p>
    </div>

    <div class="divider"></div>

    <h2 style="color: #ef4444; font-size: 16px; margin-top: 30px;">🔒 Não foi você?</h2>
    <p style="font-size: 14px; color: #64748b;">
      Se você não tentou fazer login, alguém pode estar tentando acessar sua conta. 
      Recomendamos que você <strong>altere sua senha imediatamente</strong> e entre em contato conosco.
    </p>

    <div style="text-align: center; margin: 20px 0;">
      <a href="${Deno.env.get('APP_URL')}/change-password" style="
        color: #ef4444;
        text-decoration: none;
        font-weight: 600;
      ">
        Alterar Senha Agora →
      </a>
    </div>
  `;

  return baseTemplate(content, `Seu código: ${code}`);
};
