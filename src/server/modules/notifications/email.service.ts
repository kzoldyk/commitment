import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailEnv {
  GMAIL_USER?: string;
  GMAIL_APP_PASSWORD?: string;
  BREVO_API_KEY?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  NODE_ENV?: string;
}

export class EmailService {
  private resendKey?: string;
  private brevoKey?: string;
  private gmailUser?: string;
  private gmailPassword?: string;
  private fromAddress: string;

  constructor(envOrApiKey?: EmailEnv | string, fromAddress?: string) {
    const envObj: any = typeof envOrApiKey === 'object' && envOrApiKey !== null ? envOrApiKey : {};
    const apiKey = typeof envOrApiKey === 'string' ? envOrApiKey : undefined;
    const proc = typeof process !== 'undefined' ? process.env : {} as any;

    this.resendKey = apiKey || envObj.RESEND_API_KEY || proc.RESEND_API_KEY;
    this.brevoKey = envObj.BREVO_API_KEY || proc.BREVO_API_KEY;
    this.gmailUser = envObj.GMAIL_USER || proc.GMAIL_USER;
    this.gmailPassword = envObj.GMAIL_APP_PASSWORD || proc.GMAIL_APP_PASSWORD;
    this.fromAddress =
      fromAddress ||
      envObj.EMAIL_FROM ||
      proc.EMAIL_FROM ||
      (this.gmailUser ? `Commitment <${this.gmailUser}>` : 'Commitment <notifications@commitment.app>');
  }

  getFromAddress(): string {
    return this.fromAddress;
  }

  getProviderName(): string {
    if (this.brevoKey && !this.brevoKey.startsWith('xkeysib-mock')) {
      return 'Brevo REST API';
    }
    if (this.resendKey && !this.resendKey.startsWith('re_123456789') && this.resendKey !== 'mock') {
      return 'Resend REST API';
    }
    if (this.gmailUser && this.gmailPassword && !this.gmailPassword.startsWith('mock')) {
      return `Gmail SMTP (${this.gmailUser})`;
    }
    return 'Local Console Mock';
  }

  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (process.env.NODE_ENV === 'test') {
      return { success: true, messageId: `test-${Date.now()}` };
    }

    console.log(`\n======================================================`);
    console.log(`📨 [DISPATCHING EMAIL]`);
    console.log(`   From: ${this.fromAddress}`);
    console.log(`   To: ${payload.to}`);
    console.log(`   Subject: ${payload.subject}`);
    console.log(`   Provider: ${this.getProviderName()}`);
    console.log(`======================================================`);

    // 1. Brevo REST API (Fastest on Cloudflare Workers, allows personal @gmail.com senders)
    if (this.brevoKey && !this.brevoKey.startsWith('xkeysib-mock')) {
      try {
        const senderMatch = this.fromAddress.match(/<([^>]+)>/) || [null, this.fromAddress];
        const senderEmail = senderMatch[1] || this.fromAddress;
        const senderName = this.fromAddress.includes('<') ? this.fromAddress.split('<')[0].trim() : 'Commitment';

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': this.brevoKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: payload.to }],
            subject: payload.subject,
            textContent: payload.text,
            htmlContent: payload.html || `<pre style="font-family: sans-serif; font-size: 14px; line-height: 1.6;">${payload.text.replace(/\n/g, '<br/>')}</pre>`,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [BREVO API ERROR] (${response.status}):`, errorText);
          return { success: false, error: `Brevo API error (${response.status}): ${errorText}` };
        }

        const data = (await response.json()) as { messageId?: string };
        console.log(`✅ [EMAIL DELIVERED VIA BREVO] Message ID: ${data.messageId} -> To: ${payload.to}\n`);
        return { success: true, messageId: data.messageId };
      } catch (err: any) {
        console.error(`❌ [BREVO NETWORK ERROR]:`, err.message || err);
        return { success: false, error: err.message || 'Network failure with Brevo' };
      }
    }

    // 2. Resend REST API (HTTPS fetch)
    if (this.resendKey && !this.resendKey.startsWith('re_123456789') && this.resendKey !== 'mock') {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.fromAddress,
            to: payload.to,
            subject: payload.subject,
            text: payload.text,
            html: payload.html,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ [RESEND API ERROR] (${response.status}):`, errorText);
          return { success: false, error: `Resend API error (${response.status}): ${errorText}` };
        }

        const data = (await response.json()) as { id?: string };
        console.log(`✅ [EMAIL DELIVERED VIA RESEND] ID: ${data.id} -> To: ${payload.to}\n`);
        return { success: true, messageId: data.id };
      } catch (err: any) {
        console.error(`❌ [RESEND NETWORK ERROR]:`, err.message || err);
        return { success: false, error: err.message || 'Network failure with Resend' };
      }
    }

    // 3. Gmail SMTP via Nodemailer (For local development server)
    if (this.gmailUser && this.gmailPassword && !this.gmailPassword.startsWith('mock')) {
      try {
        const cleanPassword = this.gmailPassword.replace(/\s+/g, '');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: this.gmailUser,
            pass: cleanPassword,
          },
          connectionTimeout: 3500,
          greetingTimeout: 3500,
          socketTimeout: 3500,
        });

        const info = await transporter.sendMail({
          from: this.fromAddress,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html || `<pre style="font-family: sans-serif; font-size: 14px; line-height: 1.6;">${payload.text.replace(/\n/g, '<br/>')}</pre>`,
        });

        console.log(`✅ [EMAIL DELIVERED VIA GMAIL SMTP] Message ID: ${info.messageId} -> To: ${payload.to}\n`);
        return { success: true, messageId: info.messageId };
      } catch (err: any) {
        console.error(`❌ [GMAIL SMTP SEND ERROR] Failed sending to ${payload.to}:`, err.message || err);
        return { success: false, error: err.message || 'Failed to send email via Gmail SMTP' };
      }
    }

    // 4. Fallback: Log to local server console for testing
    console.log(`   [LOCAL MOCK LOG] Body:`);
    console.log(`   ${payload.text.replace(/\n/g, '\n   ')}\n`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }
}
