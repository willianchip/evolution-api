# 📧 Guia de Configuração de Email com Resend no Supabase

## ⚡ Configuração Rápida (15 minutos)

### Passo 1: Configurar Custom SMTP no Supabase Dashboard

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard/project/fegvbiomgoodcswveyqn
   - Navegue para: **Project Settings** → **Auth**

2. **Configure o SMTP:**
   - Scroll até a seção **"SMTP Settings"**
   - Clique em **"Enable Custom SMTP"**
   - Preencha os campos:
     ```
     Host:         smtp.resend.com
     Port:         465
     Username:     resend
     Password:     [Sua chave RESEND_API_KEY]
     Sender email: noreply@wsgba-zap.com.br
     Sender name:  Gestão WhatsApp
     ```
   - **Importante:** A senha é a mesma chave API do Resend que já está configurada nos secrets

3. **Salvar configurações:**
   - Clique em **"Save"**
   - Aguarde confirmação de sucesso

---

### Passo 2: Validar Domínio no Resend

1. **Acesse o Resend:**
   - Vá para: https://resend.com/domains

2. **Adicionar domínio:**
   - Clique em **"Add Domain"**
   - Digite: `wsgba-zap.com.br`

3. **Configurar DNS:**
   - Copie os registros DNS fornecidos pelo Resend:
     - **SPF Record** (TXT)
     - **DKIM Record** (TXT)
     - **DMARC Record** (TXT)
   
4. **Adicionar no seu provedor DNS:**
   - Acesse o painel do seu domínio (Registro.br, Hostinger, etc.)
   - Adicione os 3 registros TXT
   - Aguarde propagação (pode levar até 48h, geralmente 15-30 minutos)

5. **Verificar no Resend:**
   - Volte para https://resend.com/domains
   - Clique em **"Verify"** ao lado do domínio
   - Status deve mudar para ✅ **"Verified"**

---

### Passo 3: Configurar Email Templates no Supabase

1. **Acesse os templates:**
   - Dashboard → **Authentication** → **Email Templates**

2. **Template: Confirm Signup (Verificação de Email)**
   
   Clique em **"Confirm signup"** e cole o template abaixo:

   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Confirme seu Email - Gestão WhatsApp</title>
   </head>
   <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0f1e;">
     <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f1e; padding: 40px 20px;">
       <tr>
         <td align="center">
           <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1f35 0%, #0f1729 100%); border: 1px solid #00d9ff; border-radius: 12px; box-shadow: 0 0 30px rgba(0, 217, 255, 0.2);">
             <!-- Header -->
             <tr>
               <td style="padding: 40px 40px 20px 40px; text-align: center;">
                 <div style="display: inline-block; padding: 15px; background: rgba(0, 217, 255, 0.1); border-radius: 50%; margin-bottom: 20px;">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#00d9ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                     <path d="M2 17L12 22L22 17" stroke="#00d9ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                     <path d="M2 12L12 17L22 12" stroke="#00d9ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                   </svg>
                 </div>
                 <h1 style="color: #00d9ff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);">
                   Gestão WhatsApp
                 </h1>
               </td>
             </tr>
             
             <!-- Content -->
             <tr>
               <td style="padding: 20px 40px;">
                 <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                   Confirme seu Email 📧
                 </h2>
                 <p style="color: #a8b3cf; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                   Obrigado por se cadastrar! Para começar a usar o <strong style="color: #00d9ff;">Gestão WhatsApp</strong>, precisamos verificar seu endereço de email.
                 </p>
                 <p style="color: #a8b3cf; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                   Clique no botão abaixo para confirmar seu cadastro:
                 </p>
                 
                 <!-- CTA Button -->
                 <table width="100%" cellpadding="0" cellspacing="0">
                   <tr>
                     <td align="center">
                       <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00d9ff 0%, #0099cc 100%); color: #0a0f1e; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 217, 255, 0.4); transition: all 0.3s;">
                         ✅ Confirmar Email
                       </a>
                     </td>
                   </tr>
                 </table>
                 
                 <p style="color: #8a9ab0; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6;">
                   Ou copie e cole este link no seu navegador:
                 </p>
                 <p style="color: #00d9ff; margin: 10px 0 0 0; font-size: 13px; word-break: break-all; background: rgba(0, 217, 255, 0.05); padding: 12px; border-radius: 6px; border: 1px solid rgba(0, 217, 255, 0.2);">
                   {{ .ConfirmationURL }}
                 </p>
               </td>
             </tr>
             
             <!-- Security Note -->
             <tr>
               <td style="padding: 20px 40px; background: rgba(255, 193, 7, 0.05); border-top: 1px solid rgba(255, 193, 7, 0.2);">
                 <p style="color: #ffc107; margin: 0; font-size: 14px; line-height: 1.6;">
                   ⚠️ <strong>Importante:</strong> Se você não criou uma conta no Gestão WhatsApp, ignore este email com segurança.
                 </p>
               </td>
             </tr>
             
             <!-- Footer -->
             <tr>
               <td style="padding: 30px 40px; text-align: center; border-top: 1px solid rgba(0, 217, 255, 0.1);">
                 <p style="color: #6b7a99; margin: 0 0 10px 0; font-size: 13px;">
                   Este link expira em <strong style="color: #00d9ff;">24 horas</strong>
                 </p>
                 <p style="color: #4a5568; margin: 0; font-size: 12px;">
                   © 2024 Gestão WhatsApp. Todos os direitos reservados.
                 </p>
               </td>
             </tr>
           </table>
         </td>
       </tr>
     </table>
   </body>
   </html>
   ```

3. **Template: Reset Password (Recuperação de Senha)**
   
   Clique em **"Reset password"** e cole:

   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Redefinir Senha - Gestão WhatsApp</title>
   </head>
   <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0f1e;">
     <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f1e; padding: 40px 20px;">
       <tr>
         <td align="center">
           <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1f35 0%, #0f1729 100%); border: 1px solid #00d9ff; border-radius: 12px; box-shadow: 0 0 30px rgba(0, 217, 255, 0.2);">
             <!-- Header -->
             <tr>
               <td style="padding: 40px 40px 20px 40px; text-align: center;">
                 <div style="display: inline-block; padding: 15px; background: rgba(0, 217, 255, 0.1); border-radius: 50%; margin-bottom: 20px;">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#00d9ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                     <path d="M2 17L12 22L22 17" stroke="#00d9ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                     <path d="M2 12L12 17L22 12" stroke="#00d9ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                   </svg>
                 </div>
                 <h1 style="color: #00d9ff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);">
                   Gestão WhatsApp
                 </h1>
               </td>
             </tr>
             
             <!-- Content -->
             <tr>
               <td style="padding: 20px 40px;">
                 <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                   Redefinir Senha 🔐
                 </h2>
                 <p style="color: #a8b3cf; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                   Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color: #00d9ff;">Gestão WhatsApp</strong>.
                 </p>
                 <p style="color: #a8b3cf; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                   Clique no botão abaixo para criar uma nova senha:
                 </p>
                 
                 <!-- CTA Button -->
                 <table width="100%" cellpadding="0" cellspacing="0">
                   <tr>
                     <td align="center">
                       <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00d9ff 0%, #0099cc 100%); color: #0a0f1e; text-decoration: none; font-weight: 700; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0, 217, 255, 0.4);">
                         🔓 Redefinir Senha
                       </a>
                     </td>
                   </tr>
                 </table>
                 
                 <p style="color: #8a9ab0; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6;">
                   Ou copie e cole este link no seu navegador:
                 </p>
                 <p style="color: #00d9ff; margin: 10px 0 0 0; font-size: 13px; word-break: break-all; background: rgba(0, 217, 255, 0.05); padding: 12px; border-radius: 6px; border: 1px solid rgba(0, 217, 255, 0.2);">
                   {{ .ConfirmationURL }}
                 </p>
               </td>
             </tr>
             
             <!-- Security Note -->
             <tr>
               <td style="padding: 20px 40px; background: rgba(239, 68, 68, 0.05); border-top: 1px solid rgba(239, 68, 68, 0.2);">
                 <p style="color: #ef4444; margin: 0; font-size: 14px; line-height: 1.6;">
                   🚨 <strong>Segurança:</strong> Se você não solicitou esta redefinição, ignore este email e sua senha permanecerá inalterada. Considere ativar 2FA para maior segurança.
                 </p>
               </td>
             </tr>
             
             <!-- Footer -->
             <tr>
               <td style="padding: 30px 40px; text-align: center; border-top: 1px solid rgba(0, 217, 255, 0.1);">
                 <p style="color: #6b7a99; margin: 0 0 10px 0; font-size: 13px;">
                   Este link expira em <strong style="color: #00d9ff;">1 hora</strong>
                 </p>
                 <p style="color: #4a5568; margin: 0; font-size: 12px;">
                   © 2024 Gestão WhatsApp. Todos os direitos reservados.
                 </p>
               </td>
             </tr>
           </table>
         </td>
       </tr>
     </table>
   </body>
   </html>
   ```

4. **Salvar templates:**
   - Clique em **"Save"** em cada template

---

### Passo 4: Testar Configuração

1. **Enviar email de teste:**
   - Vá para: Dashboard → **Authentication** → **Email Templates**
   - Clique em **"Send Test Email"** no template "Confirm signup"
   - Digite seu email pessoal
   - Verifique se recebeu o email

2. **Testar registro real:**
   - Acesse: `/register` no seu app
   - Crie uma conta de teste
   - Verifique inbox e spam
   - Clique no link de confirmação

---

## 🔍 Troubleshooting

### Erro: "Error sending confirmation email"

**Causa:** SMTP não configurado corretamente

**Solução:**
1. Verifique se a chave Resend está correta no SMTP password
2. Confirme que o domínio está verificado no Resend
3. Verifique se os registros DNS estão propagados

### Emails não chegam

**Possíveis causas:**
1. Domínio não verificado no Resend
2. Email na pasta de spam
3. SMTP configurado com porta errada (use 465)

**Solução:**
1. Verifique status do domínio: https://resend.com/domains
2. Verifique pasta de spam
3. Revise configurações SMTP

### Emails vão para spam

**Solução:**
1. Certifique-se que SPF, DKIM e DMARC estão configurados
2. Use "noreply@wsgba-zap.com.br" como sender (nunca @gmail.com)
3. Aguarde reputação do domínio melhorar (1-2 dias)

---

## ✅ Checklist Final

- [ ] Custom SMTP configurado no Supabase
- [ ] Chave Resend adicionada no SMTP password
- [ ] Domínio `wsgba-zap.com.br` verificado no Resend
- [ ] Registros DNS (SPF, DKIM, DMARC) configurados
- [ ] Template "Confirm signup" personalizado
- [ ] Template "Reset password" personalizado
- [ ] Email de teste enviado e recebido
- [ ] Registro de teste concluído com sucesso
- [ ] Link de confirmação funcionando

---

## 📚 Recursos Adicionais

- **Resend Documentation:** https://resend.com/docs
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **DNS Checker:** https://dnschecker.org/

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique logs no Supabase: Dashboard → Logs → Auth
2. Verifique logs no Resend: https://resend.com/emails
3. Consulte este guia novamente passo a passo
