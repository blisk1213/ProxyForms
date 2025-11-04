import { Resend } from 'resend';

// Resend client singleton
let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    resendClient = new Resend(apiKey);
    console.log('✅ Resend client initialized');
  }

  return resendClient;
}

// Default sender email
export const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'ProxyForms <noreply@proxyforms.com>';

// Email templates configuration
export const EmailConfig = {
  from: DEFAULT_FROM,
  replyTo: process.env.RESEND_REPLY_TO_EMAIL,
} as const;

export default getResendClient;
