import { getResendClient, EmailConfig } from './resend';
import * as Templates from './templates';

export * from './resend';
export * from './templates';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: { name: string; value: string }[];
}

/**
 * Send a single email
 */
export async function sendEmail(params: SendEmailParams): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    const resend = getResendClient();

    const result = await resend.emails.send({
      from: params.from || EmailConfig.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo || EmailConfig.replyTo,
      cc: params.cc,
      bcc: params.bcc,
      tags: params.tags,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    console.log('✅ Email sent successfully:', result.data?.id);

    return {
      success: true,
      id: result.data?.id,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(params: {
  to: string;
  userName: string;
  loginUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const template = Templates.WelcomeEmail({
    userName: params.userName,
    loginUrl: params.loginUrl,
  });

  return await sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: [{ name: 'category', value: 'welcome' }],
  });
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(params: {
  to: string;
  code: string;
  expiresIn: string;
}): Promise<{ success: boolean; error?: string }> {
  const template = Templates.OTPEmail({
    code: params.code,
    expiresIn: params.expiresIn,
  });

  return await sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: [{ name: 'category', value: 'otp' }],
  });
}

/**
 * Send post published notification
 */
export async function sendPostPublishedEmail(params: {
  to: string;
  postTitle: string;
  postUrl: string;
  blogName: string;
}): Promise<{ success: boolean; error?: string }> {
  const template = Templates.PostPublishedEmail({
    postTitle: params.postTitle,
    postUrl: params.postUrl,
    blogName: params.blogName,
  });

  return await sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: [{ name: 'category', value: 'post-published' }],
  });
}

/**
 * Send team invitation
 */
export async function sendTeamInviteEmail(params: {
  to: string;
  inviterName: string;
  blogName: string;
  acceptUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const template = Templates.TeamInviteEmail({
    inviterName: params.inviterName,
    blogName: params.blogName,
    acceptUrl: params.acceptUrl,
  });

  return await sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: [{ name: 'category', value: 'team-invite' }],
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  expiresIn: string;
}): Promise<{ success: boolean; error?: string }> {
  const template = Templates.PasswordResetEmail({
    resetUrl: params.resetUrl,
    expiresIn: params.expiresIn,
  });

  return await sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: [{ name: 'category', value: 'password-reset' }],
  });
}

/**
 * Send subscription confirmation
 */
export async function sendSubscriptionConfirmEmail(params: {
  to: string;
  planName: string;
  amount: string;
  billingDate: string;
  manageUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const template = Templates.SubscriptionConfirmEmail({
    planName: params.planName,
    amount: params.amount,
    billingDate: params.billingDate,
    manageUrl: params.manageUrl,
  });

  return await sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: [{ name: 'category', value: 'subscription' }],
  });
}

/**
 * Send generic notification
 */
export async function sendNotificationEmail(params: {
  to: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}): Promise<{ success: boolean; error?: string }> {
  const template = Templates.NotificationEmail({
    title: params.title,
    message: params.message,
    actionUrl: params.actionUrl,
    actionText: params.actionText,
  });

  return await sendEmail({
    to: params.to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    tags: [{ name: 'category', value: 'notification' }],
  });
}

/**
 * Send batch emails (useful for newsletters)
 */
export async function sendBatchEmails(
  emails: SendEmailParams[]
): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of emails) {
    const result = await sendEmail(email);

    if (result.success) {
      success++;
    } else {
      failed++;
      if (result.error) {
        errors.push(result.error);
      }
    }
  }

  return { success, failed, errors };
}
