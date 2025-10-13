import nodemailer from 'nodemailer';

class EmailService {
  static createTransporter() {
    // Configuração para Gmail
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
    
    // Fallback para Ethereal (teste) se não tiver configuração
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  static async sendPasswordResetEmail(email, resetToken) {
    try {
      const transporter = this.createTransporter();
      
      // URL base da aplicação frontend (em desenvolvimento será localhost)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      const siteName = process.env.SITE_NAME || 'CineStream';
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@cinestream.com',
        to: email,
        subject: `Recuperação de Senha - ${siteName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🎬 ${siteName} - Recuperação de Senha</h2>
            <p>Você solicitou a recuperação de sua senha.</p>
            <p>Para redefinir sua senha, use o token abaixo no endpoint <strong>POST /api/auth/reset-password</strong>:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>Token:</strong> <code style="background-color: #e9e9e9; padding: 2px 4px;">${resetToken}</code>
            </div>
            
            <p><strong>⚠️ Importante:</strong></p>
            <ul>
              <li>Este token expira em <strong>1 hora</strong></li>
              <li>Use o token no Swagger em: <strong>POST /api/auth/reset-password</strong></li>
              <li>Se você não solicitou esta recuperação, ignore este email</li>
            </ul>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Este é um email automático, não responda.
            </p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email enviado:', info.messageId);
      
      // Para desenvolvimento, mostrar o link de preview do Ethereal
      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email de recuperação');
    }
  }
}

export default EmailService;
