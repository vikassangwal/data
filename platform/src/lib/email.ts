import nodemailer from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the configured SMTP server.
 */
export async function sendMail({ to, subject, html }: SendMailOptions) {
  try {
    // Determine configuration from environment variables
    const smtpHost = process.env.SMTP_HOST || '';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';
    
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('SMTP configuration is missing. Cannot send real email to:', to);
      console.warn('Subject:', subject);
      console.warn('--- EMAIL CONTENT ---');
      console.warn(html);
      console.warn('---------------------');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"DevFort Team" <${smtpUser}>`,
      to,
      subject,
      html,
    });

    console.log(`Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
