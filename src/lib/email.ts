import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function sendVerificationEmail(email: string, link: string, name: string) {
  if (!resend) {
    console.error('RESEND_API_KEY is not set');
    return { error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'TRAIL TO TIDES <onboarding@resend.dev>', // User should change this to their domain
      to: email,
      subject: 'Verify your TRAIL TO TIDES account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #ff5100;">Welcome to the Wild, ${name}!</h1>
          <p style="font-size: 16px; line-height: 1.5;">
            Thank you for joining TRAIL TO TIDES. Before you can start exploring exclusive trails and expert advice, we need to verify your email address.
          </p>
          <div style="margin: 30px 0;">
            <a href="${link}" style="background-color: #ff5100; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            If the button above doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; color: #ff5100; word-break: break-all;">
            ${link}
          </p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            If you didn't create an account with TRAIL TO TIDES, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    return { error: message };
  }
}

/** Every contact message lands here; replying goes straight back to the sender */
export const CONTACT_INBOX = 'hello@trailtotides.com';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function sendContactEmail(msg: { name: string; email: string; topic?: string; message: string; page?: string }) {
  if (!resend) return { error: 'Email service not configured' };

  const topic = msg.topic?.trim();
  try {
    const { data, error } = await resend.emails.send({
      from: 'TRAIL TO TIDES <onboarding@resend.dev>',
      to: CONTACT_INBOX,
      replyTo: msg.email,
      subject: `New message from ${msg.name}${topic ? ` · ${topic}` : ''}`,
      text: `${msg.message}\n\n— ${msg.name} <${msg.email}>${topic ? `\nTopic: ${topic}` : ''}${msg.page ? `\nSent from: ${msg.page}` : ''}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #ff5100; margin: 0 0 8px;">New message${topic ? ` · ${escapeHtml(topic)}` : ''}</p>
          <h1 style="font-size: 20px; margin: 0 0 4px;">${escapeHtml(msg.name)}</h1>
          <p style="margin: 0 0 20px;"><a href="mailto:${escapeHtml(msg.email)}" style="color: #ff5100;">${escapeHtml(msg.email)}</a></p>
          <div style="font-size: 15px; line-height: 1.6; white-space: pre-wrap; padding: 16px; background: #f7f4ee; border-radius: 10px;">${escapeHtml(msg.message)}</div>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">Reply to this email to answer ${escapeHtml(msg.name)} directly.${msg.page ? ` Sent from ${escapeHtml(msg.page)}.` : ''}</p>
        </div>
      `,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    return { error: message };
  }
}

export async function sendPasswordResetEmail(email: string, link: string) {
  if (!resend) return { error: 'Email service not configured' };

  try {
    const { data, error } = await resend.emails.send({
      from: 'TRAIL TO TIDES <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your TRAIL TO TIDES password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #ff5100;">Password Reset Request</h1>
          <p style="font-size: 16px; line-height: 1.5;">
            We received a request to reset your password for your TRAIL TO TIDES account. Click the button below to set a new password.
          </p>
          <div style="margin: 30px 0;">
            <a href="${link}" style="background-color: #ff5100; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            © 2026 TRAIL TO TIDES
          </p>
        </div>
      `,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unknown error occurred';
    return { error: message };
  }
}
