import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

// Every email goes from hello@trailtotides.com (the domain must be verified in Resend).
// EMAIL_FROM can override it, e.g. for a staging sender.
const FROM = process.env.EMAIL_FROM || 'Trail to Tides <hello@trailtotides.com>';

/** Sent on sign-up: the account can't log in until this link is opened */
export async function sendVerificationEmail(email: string, link: string, name: string) {
  return send({
    to: email,
    subject: 'Verify your email for Trail to Tides',
    html: layout('Welcome to Trail to Tides', `Hi ${name}, confirm it's you`,
      `<p style="font-size: 15px; line-height: 1.6; margin: 0;">One tap to verify your email and you're in. Your fitness profile, wishlist and Group Match are saved to your account.</p>
       ${actionButton(link, 'Verify my email')}`,
      "The link works once and expires in 24 hours. If you didn't sign up, you can ignore this email."),
    text: `Hi ${name},\n\nVerify your email for Trail to Tides:\n${link}\n\nThe link works once and expires in 24 hours. If you didn't sign up, ignore this email.`,
  });
}

/** A big tap target, plus the raw link for mail apps that strip buttons */
function actionButton(link: string, label: string) {
  return `<p style="margin: 22px 0;"><a href="${link}" style="background-color: #ff5100; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">${label}</a></p>
    <p style="font-size: 13px; color: #666; margin: 0 0 4px;">If the button doesn't work, paste this link into your browser:</p>
    <p style="font-size: 13px; color: #ff5100; word-break: break-all; margin: 0;">${link}</p>`;
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
      from: FROM,
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

/** Forgot password: the link signs them in on the reset page, where they choose a new one */
export async function sendPasswordResetEmail(email: string, link: string) {
  return send({
    to: email,
    subject: 'Reset your Trail to Tides password',
    html: layout('Password reset', 'Choose a new password',
      `<p style="font-size: 15px; line-height: 1.6; margin: 0;">Someone asked to reset the password for this account. If it was you, use the button below.</p>
       ${actionButton(link, 'Reset my password')}`,
      "The link works once and expires in 1 hour. If you didn't ask for this, ignore this email: your password stays the same."),
    text: `Reset your Trail to Tides password:\n${link}\n\nThe link works once and expires in 1 hour. If you didn't ask for this, ignore this email.`,
  });
}

// ── Account emails: alerts and quote requests ────────────────────────────────

const SITE = 'https://trailtotides.com';

/** One look for every account email: a short eyebrow, a heading, a body, and a way to change settings */
function layout(eyebrow: string, heading: string, body: string, footer: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #ff5100; margin: 0 0 8px;">${escapeHtml(eyebrow)}</p>
      <h1 style="font-size: 22px; margin: 0 0 16px;">${escapeHtml(heading)}</h1>
      ${body}
      <hr style="margin: 28px 0 14px; border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #999; margin: 0;">${footer}</p>
    </div>`;
}

async function send(msg: { to: string | string[]; subject: string; html: string; text: string; replyTo?: string }) {
  if (!resend) return { error: 'Email service not configured' };
  try {
    const { data, error } = await resend.emails.send({ from: FROM, ...msg });
    return error ? { error: error.message } : { success: true, data };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'An unknown error occurred' };
  }
}

export interface AlertItem { name: string; slug: string; line: string }

/** The daily digest: wishlist news and new matches for saved searches, in one email */
export async function sendAlertDigest(to: string, name: string, wishlist: AlertItem[], searches: { name: string; link: string; items: AlertItem[] }[]) {
  const row = (i: AlertItem) => `
    <li style="margin: 0 0 10px;">
      <a href="${SITE}/experiences/${encodeURIComponent(i.slug)}" style="color: #ff5100; font-weight: bold; text-decoration: none;">${escapeHtml(i.name)}</a>
      <span style="color: #666;"> · ${escapeHtml(i.line)}</span>
    </li>`;
  const parts: string[] = [];
  const text: string[] = [];
  if (wishlist.length) {
    parts.push(`<h2 style="font-size: 15px; margin: 20px 0 8px;">On your wishlist</h2><ul style="padding-left: 18px; margin: 0;">${wishlist.map(row).join('')}</ul>`);
    text.push('On your wishlist:', ...wishlist.map((i) => `- ${i.name}: ${i.line} (${SITE}/experiences/${i.slug})`));
  }
  for (const s of searches) {
    parts.push(`<h2 style="font-size: 15px; margin: 20px 0 8px;">New for “${escapeHtml(s.name)}”</h2><ul style="padding-left: 18px; margin: 0;">${s.items.map(row).join('')}</ul>
      <p style="margin: 8px 0 0;"><a href="${s.link}" style="color: #ff5100;">See this search on the map</a></p>`);
    text.push('', `New for "${s.name}":`, ...s.items.map((i) => `- ${i.name}: ${i.line}`), s.link);
  }
  const count = wishlist.length + searches.reduce((n, s) => n + s.items.length, 0);
  return send({
    to,
    subject: wishlist.length && !searches.length
      ? `${wishlist[0].name}${wishlist.length > 1 ? ` and ${wishlist.length - 1} more` : ''}: news from your wishlist`
      : `${count} new ${count === 1 ? 'adventure' : 'adventures'} for your saved searches`,
    html: layout('Your adventure alerts', `Hi ${name}, here's what changed`, parts.join(''),
      `You get this because alerts are on for your wishlist or saved searches. <a href="${SITE}/settings" style="color: #999;">Change alerts</a>`),
    text: `${text.join('\n')}\n\nChange alerts: ${SITE}/settings`,
  });
}

export interface QuoteEmail {
  traveller: { name: string; email: string };
  adventure: { name: string; slug: string };
  operators: string[];
  startDate: string;
  flexible: boolean;
  groupSize: number;
  message: string;
}

const quoteFacts = (q: QuoteEmail) => [
  ['Adventure', q.adventure.name],
  ['Starting', `${q.startDate}${q.flexible ? ' (flexible)' : ''}`],
  ['Group size', String(q.groupSize)],
  ['Operators asked', q.operators.join(', ')],
];

/** To the operators asked (and our inbox, which forwards to operators who aren't on the platform yet) */
export async function sendQuoteRequest(to: string[], q: QuoteEmail) {
  const facts = quoteFacts(q).map(([k, v]) => `<tr><td style="padding: 4px 12px 4px 0; color: #888;">${k}</td><td style="padding: 4px 0;">${escapeHtml(v)}</td></tr>`).join('');
  return send({
    to,
    replyTo: q.traveller.email,
    subject: `Quote request: ${q.adventure.name} for ${q.groupSize}, from ${q.startDate}`,
    html: layout('Quote request', `${q.traveller.name} would like a price`,
      `<table style="font-size: 14px; border-collapse: collapse;">${facts}</table>
       ${q.message ? `<div style="font-size: 15px; line-height: 1.6; white-space: pre-wrap; padding: 16px; background: #f7f4ee; border-radius: 10px; margin-top: 16px;">${escapeHtml(q.message)}</div>` : ''}`,
      `Reply to this email to answer ${escapeHtml(q.traveller.name)} directly. Sent through Trail to Tides from ${SITE}/experiences/${encodeURIComponent(q.adventure.slug)}`),
    text: `${quoteFacts(q).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${q.message}\n\nReply to this email to answer ${q.traveller.name} directly.`,
  });
}

/** The traveller's copy, so they know what was sent and to whom */
export async function sendQuoteCopy(q: QuoteEmail) {
  const facts = quoteFacts(q).map(([k, v]) => `<tr><td style="padding: 4px 12px 4px 0; color: #888;">${k}</td><td style="padding: 4px 0;">${escapeHtml(v)}</td></tr>`).join('');
  return send({
    to: q.traveller.email,
    subject: `Your quote request for ${q.adventure.name} is on its way`,
    html: layout('Quote request sent', 'Operators will reply to you by email',
      `<p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px;">We've sent your request to ${q.operators.length === 1 ? 'the operator' : `${q.operators.length} verified operators`}. Their replies come straight to this inbox.</p>
       <table style="font-size: 14px; border-collapse: collapse;">${facts}</table>`,
      `See your requests any time on <a href="${SITE}/profile" style="color: #999;">your profile</a>.`),
    text: `We've sent your request. Operators will reply to you by email.\n\n${quoteFacts(q).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
  });
}
