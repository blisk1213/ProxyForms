/**
 * Email templates for ProxyForms
 * These are simple HTML email templates that can be enhanced with React Email later
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Base email layout
 */
function EmailLayout(params: {
  title: string;
  content: string;
  footer?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #f0f0f0;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #000;
      color: #fff !important;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
    }
    .code {
      font-family: monospace;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 4px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 6px;
      display: inline-block;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ProxyForms</h1>
  </div>
  <div class="content">
    ${params.content}
  </div>
  <div class="footer">
    ${params.footer || `
      <p>ProxyForms - Headless CMS for Blogging</p>
      <p>This email was sent to you because you have an account with us.</p>
    `}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Welcome email template
 */
export function WelcomeEmail(params: {
  userName: string;
  loginUrl: string;
}): EmailTemplate {
  const content = `
    <h2>Welcome to ProxyForms! 👋</h2>
    <p>Hi ${params.userName},</p>
    <p>We're excited to have you on board! ProxyForms is a simple, fast headless blogging CMS designed to make content management effortless.</p>
    <p>Get started by creating your first blog:</p>
    <a href="${params.loginUrl}" class="button">Get Started</a>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Happy blogging!</p>
  `;

  return {
    subject: 'Welcome to ProxyForms!',
    html: EmailLayout({
      title: 'Welcome to ProxyForms',
      content,
    }),
    text: `Welcome to ProxyForms! Get started at ${params.loginUrl}`,
  };
}

/**
 * OTP verification email template
 */
export function OTPEmail(params: {
  code: string;
  expiresIn: string;
}): EmailTemplate {
  const content = `
    <h2>Verify your email address</h2>
    <p>Use this code to verify your email address:</p>
    <div class="code">${params.code}</div>
    <p>This code will expire in ${params.expiresIn}.</p>
    <p>If you didn't request this code, you can safely ignore this email.</p>
  `;

  return {
    subject: 'Verify your email address',
    html: EmailLayout({
      title: 'Verify your email',
      content,
    }),
    text: `Your verification code is: ${params.code}. Expires in ${params.expiresIn}.`,
  };
}

/**
 * Post published notification
 */
export function PostPublishedEmail(params: {
  postTitle: string;
  postUrl: string;
  blogName: string;
}): EmailTemplate {
  const content = `
    <h2>Your post has been published! 🎉</h2>
    <p>Your post "<strong>${params.postTitle}</strong>" has been successfully published on ${params.blogName}.</p>
    <a href="${params.postUrl}" class="button">View Post</a>
    <p>Share it with your audience!</p>
  `;

  return {
    subject: `Published: ${params.postTitle}`,
    html: EmailLayout({
      title: 'Post Published',
      content,
    }),
    text: `Your post "${params.postTitle}" has been published. View it at ${params.postUrl}`,
  };
}

/**
 * Team invitation email
 */
export function TeamInviteEmail(params: {
  inviterName: string;
  blogName: string;
  acceptUrl: string;
}): EmailTemplate {
  const content = `
    <h2>You've been invited to collaborate! 🤝</h2>
    <p>${params.inviterName} has invited you to collaborate on <strong>${params.blogName}</strong>.</p>
    <p>Accept the invitation to start creating content together:</p>
    <a href="${params.acceptUrl}" class="button">Accept Invitation</a>
  `;

  return {
    subject: `Invitation to collaborate on ${params.blogName}`,
    html: EmailLayout({
      title: 'Team Invitation',
      content,
    }),
    text: `${params.inviterName} invited you to collaborate on ${params.blogName}. Accept at ${params.acceptUrl}`,
  };
}

/**
 * Password reset email
 */
export function PasswordResetEmail(params: {
  resetUrl: string;
  expiresIn: string;
}): EmailTemplate {
  const content = `
    <h2>Reset your password</h2>
    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
    <a href="${params.resetUrl}" class="button">Reset Password</a>
    <p>This link will expire in ${params.expiresIn}.</p>
    <p>If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</p>
  `;

  return {
    subject: 'Reset your password',
    html: EmailLayout({
      title: 'Reset your password',
      content,
    }),
    text: `Reset your password at ${params.resetUrl}. Link expires in ${params.expiresIn}.`,
  };
}

/**
 * Subscription confirmation email
 */
export function SubscriptionConfirmEmail(params: {
  planName: string;
  amount: string;
  billingDate: string;
  manageUrl: string;
}): EmailTemplate {
  const content = `
    <h2>Subscription Confirmed! ✅</h2>
    <p>Thank you for subscribing to <strong>${params.planName}</strong>!</p>
    <p><strong>Amount:</strong> ${params.amount}</p>
    <p><strong>Next billing date:</strong> ${params.billingDate}</p>
    <p>Manage your subscription anytime:</p>
    <a href="${params.manageUrl}" class="button">Manage Subscription</a>
  `;

  return {
    subject: 'Subscription Confirmed',
    html: EmailLayout({
      title: 'Subscription Confirmed',
      content,
    }),
    text: `Subscription confirmed for ${params.planName} at ${params.amount}. Manage at ${params.manageUrl}`,
  };
}

/**
 * Generic notification email
 */
export function NotificationEmail(params: {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}): EmailTemplate {
  const content = `
    <h2>${params.title}</h2>
    <p>${params.message}</p>
    ${
      params.actionUrl && params.actionText
        ? `<a href="${params.actionUrl}" class="button">${params.actionText}</a>`
        : ''
    }
  `;

  return {
    subject: params.title,
    html: EmailLayout({
      title: params.title,
      content,
    }),
    text: `${params.title}: ${params.message}${params.actionUrl ? ` - ${params.actionUrl}` : ''}`,
  };
}
