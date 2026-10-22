import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

// Every email goes from hello@trailtotides.com (the domain must be verified in Resend).
// EMAIL_FROM can override it, e.g. for a staging sender.
const FROM = process.env.EMAIL_FROM || 'Trail to Tides <hello@trailtotides.com>';

/** Sign-up: the account can't log in until this link is opened */
export function verificationEmail(link: string, name: string) {
  const perks = [
    ['Adventure Matchmaker', 'Answer a few questions and see every adventure rated for your body.'],
    ['Your wishlist', 'Save adventures and hear when their season opens or the price drops.'],
    ['Compass.AI', 'Ask for a trip in your own words and get picks that fit.'],
  ];
  return {
    subject: 'Confirm your email to start exploring',
    html: layout('Welcome aboard', `You're one tap from the trail, ${name}.`,
      `<p style="${P}">Confirm your email to finish creating your Trail to Tides account. It takes a second, and it keeps your account yours.</p>
       ${actionButton(link, 'Verify my email')}
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f7f3ec; border-radius: 16px;">
         <tr><td style="padding: 18px 20px 6px; font: 700 11px/1 ${SANS}; letter-spacing: 0.16em; text-transform: uppercase; color: #8a8177;">What's waiting for you</td></tr>
         ${perks.map(([t, d]) => `<tr><td style="padding: 8px 20px;">
           <span style="font: 700 14px/1.4 ${SANS}; color: #1c1814;"><span style="color: #ff5100;">&#9679;</span>&nbsp; ${t}</span><br>
           <span style="font: 400 13px/1.5 ${SANS}; color: #6b655e; padding-left: 18px; display: inline-block;">${d}</span>
         </td></tr>`).join('')}
         <tr><td style="height: 12px;"></td></tr>
       </table>`,
      `The link works once and expires in 1 hour. If it runs out, just log in and we'll send a fresh one. Didn't sign up? Ignore this email and nothing happens.`,
      { hero: HERO, preheader: 'One tap to confirm your email and your Trail to Tides account is ready.', link, signoff: true }),
    text: `Hi ${name},\n\nYou're one tap from the trail. Confirm your email to finish creating your Trail to Tides account:\n${link}\n\nThe link works once and expires in 1 hour. If it runs out, log in and we'll send a fresh one. Didn't sign up? Ignore this email.\n\nTrail to Tides · ${SITE}`,
  };
}

export async function sendVerificationEmail(email: string, link: string, name: string) {
  return send({ to: email, ...verificationEmail(link, name) });
}

/** A big pill button that survives every mail app, plus the raw link for ones that strip it */
function actionButton(link: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 26px 0 10px;"><tr>
      <td style="border-radius: 999px; background: #ff5100;">
        <a href="${link}" style="display: inline-block; padding: 15px 32px; border-radius: 999px; font: 700 16px/1 ${SANS}; color: #ffffff; text-decoration: none;">${label} &rarr;</a>
      </td></tr></table>
    <p style="font: 400 12px/1.5 ${SANS}; color: #8a8177; margin: 0 0 24px;">Button not working? <a href="${link}" style="color: #e04800; word-break: break-all;">Open this link</a></p>`;
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
      html: layout(`New message${topic ? ` · ${topic}` : ''}`, msg.name,
        `<p style="${P} margin-bottom: 18px;"><a href="mailto:${escapeHtml(msg.email)}" style="color: #e04800; font-weight: 700; text-decoration: none;">${escapeHtml(msg.email)}</a></p>
         <div style="font: 400 15px/1.65 ${SANS}; color: #1c1814; white-space: pre-wrap; padding: 18px 20px; background: #f7f3ec; border-radius: 16px;">${escapeHtml(msg.message)}</div>`,
        `Reply to this email to answer ${escapeHtml(msg.name)} directly.${msg.page ? ` Sent from ${escapeHtml(msg.page)}.` : ''}`,
        { preheader: msg.message.slice(0, 120) }),
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
export function passwordResetEmail(link: string) {
  return {
    subject: 'Reset your Trail to Tides password',
    html: layout('Password reset', 'Lost the trail? Pick a new password.',
      `<p style="${P}">We got a request to reset the password for this account. Use the button below to choose a new one. You'll be signed in when you're done.</p>
       ${actionButton(link, 'Reset my password')}
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f7f3ec; border-radius: 16px;"><tr>
         <td style="padding: 16px 20px; font: 400 13px/1.55 ${SANS}; color: #4a443e;">
           <b style="color: #1c1814;">Didn't ask for this?</b> You can ignore this email. Your password stays the same, and nobody can use this link once it expires.
         </td></tr></table>`,
      `The link works once and expires in 1 hour. Need a new one? Ask again from the login page.`,
      { preheader: 'Use this link within the hour to choose a new password.', link, signoff: true }),
    text: `Reset your Trail to Tides password:\n${link}\n\nThe link works once and expires in 1 hour. Didn't ask for this? Ignore this email: your password stays the same.\n\nTrail to Tides · ${SITE}`,
  };
}

export async function sendPasswordResetEmail(email: string, link: string) {
  return send({ to: email, ...passwordResetEmail(link) });
}

// ── Account emails: alerts and quote requests ────────────────────────────────

const SITE = 'https://trailtotides.com';
// Built by scripts/build-email-assets.mjs and served from the live site
const ASSETS = 'https://www.trailtotides.com/email';
// The site's own fonts where the mail app loads them (Apple Mail, iOS), close fallbacks elsewhere
const SANS = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Fraunces, Georgia, 'Times New Roman', serif";
const P = `font: 400 15px/1.65 ${SANS}; color: #4a443e; margin: 0;`;
// Mountain trail meets ocean tide, from our own region photos (about 60 KB)
const HERO = `${ASSETS}/hero.jpg`;
const SOCIAL = [
  ['Instagram', 'https://instagram.com/trailtotides'],
  ['YouTube', 'https://youtube.com/@trailtotides'],
  ['X', 'https://twitter.com/trailtotides'],
];

/**
 * One look for every account email: the dark header with the real logo, an optional photo with
 * the brand line under it, a white card with an eyebrow, a serif heading, the body and a
 * sign-off, then a small print line and the footer. Tables and inline styles only, so it holds
 * up in Gmail, Outlook and Apple Mail; with images off the logo's alt text still names us.
 */
function layout(eyebrow: string, heading: string, body: string, footer: string, opts: { hero?: string; preheader?: string; link?: string; signoff?: boolean } = {}) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"><title>${escapeHtml(heading)}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&family=Fraunces:opsz,wght@9..144,700&display=swap" rel="stylesheet">
<style>@media (max-width: 480px) { .card { padding: 28px 22px 22px !important; } .h1 { font-size: 24px !important; } }</style></head>
<body style="margin: 0; padding: 0; background: #efe9df; -webkit-text-size-adjust: 100%;">
${opts.preheader ? `<div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(opts.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #efe9df;"><tr><td align="center" style="padding: 28px 12px 36px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
    <tr><td style="background: #0f0d0b; border-radius: 20px 20px 0 0; padding: 22px 28px;">
      <a href="${SITE}" style="text-decoration: none;"><img src="${ASSETS}/logo.png" width="171" height="30" alt="TRAIL to TIDES" style="display: block; border: 0; font: 800 16px/30px ${SANS}; letter-spacing: 0.08em; color: #ffffff;"></a>
    </td></tr>
    ${opts.hero ? `<tr><td style="background: #0f0d0b; line-height: 0; font-size: 0;">${opts.link ? `<a href="${opts.link}">` : ''}<img src="${opts.hero}" width="560" alt="A Himalayan peak on one side, a sunset beach on the other" style="display: block; width: 100%; max-width: 560px; height: auto; border: 0;">${opts.link ? '</a>' : ''}</td></tr>
    <tr><td align="center" style="background: #0f0d0b; padding: 13px 20px 15px; font: 700 10px/1 ${SANS}; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(255,255,255,0.62);">Mountain trails <span style="color: #ff5100;">&nbsp;&#9679;&nbsp;</span> Ocean tides</td></tr>` : ''}
    <tr><td class="card" style="background: #ffffff; padding: 34px 30px 26px; border-radius: 0 0 20px 20px;">
      <p style="font: 700 11px/1 ${SANS}; letter-spacing: 0.2em; text-transform: uppercase; color: #ff5100; margin: 0 0 12px;">${escapeHtml(eyebrow)}</p>
      <h1 class="h1" style="font: 700 27px/1.2 ${SERIF}; color: #1c1814; margin: 0 0 14px;">${escapeHtml(heading)}</h1>
      ${body}
      ${opts.signoff ? `<p style="${P} margin-top: 24px;">See you out there,<br><b style="color: #1c1814;">The Trail to Tides team</b></p>` : ''}
      <p style="font: 400 12px/1.55 ${SANS}; color: #8a8177; margin: 24px 0 0; padding-top: 18px; border-top: 1px solid #efe9df;">${footer}</p>
    </td></tr>
    <tr><td align="center" style="padding: 24px 20px 0; font: 400 12px/1.8 ${SANS}; color: #8a8177;">
      ${SOCIAL.map(([name, url]) => `<a href="${url}" style="color: #4a443e; text-decoration: none; font-weight: 700;">${name}</a>`).join(' &nbsp;&middot;&nbsp; ')}<br>
      Find, compare and book adventures matched to your fitness.<br>
      <a href="${SITE}" style="color: #6b655e; text-decoration: none; font-weight: 600;">trailtotides.com</a> &nbsp;&middot;&nbsp; <a href="mailto:hello@trailtotides.com" style="color: #6b655e; text-decoration: none;">hello@trailtotides.com</a> &nbsp;&middot;&nbsp; Mumbai, India
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
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
