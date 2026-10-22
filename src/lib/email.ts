import { Resend } from 'resend';
import { EMAIL_ALERTS } from './features';

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
    ['Your wishlist', EMAIL_ALERTS ? 'Save adventures and hear when their season opens or the price drops.' : 'Keep the adventures you want to do in one place, ready when you are.'],
    ['Compass.AI', 'Ask for a trip in your own words and get picks that fit.'],
  ];
  return {
    subject: 'Confirm your email to start exploring',
    html: layout('Welcome aboard', `You're one tap from the trail, ${name}.`,
      `<p class="c-body" style="${P}">Confirm your email to finish creating your Trail to Tides account. It takes a second, and it keeps your account yours.</p>
       ${actionButton(link, 'Verify my email')}
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="c-panel" style="background: ${C.panel}; border: 1px solid ${C.line}; border-radius: 18px;">
         <tr><td class="c-muted" style="padding: 20px 20px 4px; font: 700 11px/1 ${SANS}; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.muted};">What's waiting for you</td></tr>
         ${perks.map(([t, d], i) => `<tr><td style="padding: 12px 20px 4px;">
           <table role="presentation" cellpadding="0" cellspacing="0"><tr>
             <td valign="top" style="width: 34px; padding-right: 14px;"><div class="c-chip" style="width: 34px; height: 34px; border-radius: 10px; background: ${C.orangeTint}; border: 1px solid ${C.orangeLine}; text-align: center; font: 800 12px/34px ${SANS}; color: ${C.orange};">0${i + 1}</div></td>
             <td valign="top"><span class="c-text" style="font: 700 14px/1.4 ${SANS}; color: ${C.text};">${t}</span><br>
               <span class="c-body" style="font: 400 13px/1.5 ${SANS}; color: ${C.body};">${d}</span></td>
           </tr></table>
         </td></tr>`).join('')}
         <tr><td style="height: 16px;"></td></tr>
       </table>`,
      `The link works once and expires in 1 hour. If it runs out, just log in and we'll send a fresh one. Didn't sign up? Ignore this email and nothing happens.`,
      { banner: { src: WELCOME, height: 320, alt: 'From Mountain TRAIL, to Ocean TIDES' }, preheader: 'One tap to confirm your email and your Trail to Tides account is ready.', link, signoff: true }),
    text: `Hi ${name},\n\nYou're one tap from the trail. Confirm your email to finish creating your Trail to Tides account:\n${link}\n\nThe link works once and expires in 1 hour. If it runs out, log in and we'll send a fresh one. Didn't sign up? Ignore this email.\n\nTrail to Tides · ${SITE}`,
  };
}

export async function sendVerificationEmail(email: string, link: string, name: string) {
  return send({ to: email, ...verificationEmail(link, name) });
}

/**
 * A big pill button that works in every mail app. Outlook on Windows ignores padding on links,
 * so it gets a drawn (VML) button of its own; everyone else gets the styled link, whose whole
 * pill is clickable. The plain-text part of each email carries the link too.
 */
function actionButton(link: string, label: string) {
  const width = 70 + label.length * 10;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px 0 14px;"><tr><td>
      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${link}" style="height:52px;v-text-anchor:middle;width:${width}px;" arcsize="50%" stroke="f" fillcolor="${C.orange}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${label} &rarr;</center></v:roundrect><![endif]-->
      <!--[if !mso]><!--><a href="${link}" style="display: inline-block; padding: 18px 34px; border-radius: 999px; background: ${C.orange}; box-shadow: 0 10px 30px rgba(255, 81, 0, 0.35); font: 700 16px/16px ${SANS}; color: #ffffff; text-decoration: none; mso-hide: all;">${label} &rarr;</a><!--<![endif]-->
    </td></tr></table>
    <p class="c-muted" style="font: 400 12px/1.7 ${SANS}; color: ${C.muted}; margin: 0 0 26px;">Still stuck? <a href="${SITE}/contact" class="c-link" style="color: ${C.link};">Contact us &rarr;</a></p>`;
}

/** Every contact message lands here; replying goes straight back to the sender */
export const CONTACT_INBOX = 'hello@trailtotides.com';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export interface ContactMessage { name: string; email: string; topic?: string; message: string; page?: string }

/** A contact-form message, to our inbox */
export function contactEmail(msg: ContactMessage) {
  const topic = msg.topic?.trim();
  return {
    subject: `New message from ${msg.name}${topic ? ` · ${topic}` : ''}`,
    text: `${msg.message}\n\n— ${msg.name} <${msg.email}>${topic ? `\nTopic: ${topic}` : ''}${msg.page ? `\nSent from: ${msg.page}` : ''}`,
    html: layout(`New message${topic ? ` · ${topic}` : ''}`, msg.name,
      `<p class="c-body" style="${P} margin-bottom: 18px;"><a href="mailto:${escapeHtml(msg.email)}" class="c-link" style="color: ${C.link}; font-weight: 700; text-decoration: none;">${escapeHtml(msg.email)}</a></p>
       <div class="c-panel c-text" style="font: 400 15px/1.65 ${SANS}; color: ${C.text}; white-space: pre-wrap; padding: 18px 20px; background: ${C.panel}; border: 1px solid ${C.line}; border-radius: 16px;">${escapeHtml(msg.message)}</div>`,
      `Reply to this email to answer ${escapeHtml(msg.name)} directly.${msg.page ? ` Sent from ${escapeHtml(msg.page)}.` : ''}`,
      { preheader: msg.message.slice(0, 120) }),
  };
}

export async function sendContactEmail(msg: ContactMessage) {
  return send({ to: CONTACT_INBOX, replyTo: msg.email, ...contactEmail(msg) });
}

/** Forgot password: the link signs them in on the reset page, where they choose a new one */
export function passwordResetEmail(link: string) {
  return {
    subject: 'Reset your Trail to Tides password',
    html: layout('Password reset', 'Lost the trail? Pick a new password.',
      `<p class="c-body" style="${P}">We got a request to reset the password for this account. Use the button below to choose a new one. You'll be signed in when you're done.</p>
       ${actionButton(link, 'Reset my password')}
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="c-note" style="background: ${C.panel}; border: 1px solid ${C.line}; border-left: 3px solid ${C.orange}; border-radius: 14px;"><tr>
         <td class="c-body" style="padding: 16px 20px; font: 400 13px/1.6 ${SANS}; color: ${C.body};">
           <b class="c-text" style="color: ${C.text};">Didn't ask for this?</b> You can ignore this email. Your password stays the same, and nobody can use this link once it expires.
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
// White by default (inline, so every mail app gets it); the site's dark theme when the reader's
// mail app is in dark mode (DARK_CSS below). Solid colours, so apps without rgba get them right.
const C = {
  page: '#ffffff', card: '#ffffff', panel: '#f7f4f0', line: '#ebe5de',
  text: '#141210', body: '#4a443e', muted: '#8a8177',
  orange: '#ff5100', link: '#e04800', orangeTint: '#fff1e9', orangeLine: '#ffd6c2',
};
const D = {
  page: '#0a0a0a', card: '#131110', panel: '#1b1815', line: '#2a2622',
  text: '#ffffff', body: '#b3aca5', muted: '#7d766f',
  link: '#ff7d47', orangeTint: '#2a1408', orangeLine: '#4a2210',
};
// Each element names its role with a class; dark mode swaps the colours by role. Apple Mail,
// iOS Mail and Outlook follow prefers-color-scheme; Outlook.com marks its dark mode with
// data-ogsc / data-ogsb. Gmail ignores both and always shows the white version.
const DARK_RULES = `
  .c-page { background: ${D.page} !important; }
  .c-card { background: ${D.card} !important; border-color: ${D.line} !important; }
  .c-panel { background: ${D.panel} !important; border-color: ${D.line} !important; }
  .c-note { background: ${D.panel} !important; border-top-color: ${D.line} !important; border-right-color: ${D.line} !important; border-bottom-color: ${D.line} !important; }
  .c-chip { background: ${D.orangeTint} !important; border-color: ${D.orangeLine} !important; }
  .c-rule { border-color: ${D.line} !important; }
  .c-text { color: ${D.text} !important; }
  .c-body { color: ${D.body} !important; }
  .c-muted { color: ${D.muted} !important; }
  .c-link { color: ${D.link} !important; }
  .only-light { display: none !important; }
  .only-dark { display: block !important; max-height: none !important; overflow: visible !important; }`;
const DARK_CSS = `@media (prefers-color-scheme: dark) {${DARK_RULES}
}
${DARK_RULES.replace(/\n  \./g, '\n[data-ogsc] .').replace(/\[data-ogsc\] \.(c-page|c-card|c-panel|c-note|c-chip)/g, '[data-ogsb] .$1')}`;
const P = `font: 400 15px/1.65 ${SANS}; color: ${C.body}; margin: 0;`;
// The home page headline over mountain trail meeting ocean tide (about 85 KB)
const WELCOME = `${ASSETS}/welcome.jpg`;

/** A pair of images: one for the white email, one for dark mode (e.g. the logo's lettering) */
function themedImage(light: string, dark: string, attrs: string, style: string) {
  return `<img class="only-light" src="${light}" ${attrs} style="display: block; ${style}">`
    + `<!--[if !mso]><!--><img class="only-dark" src="${dark}" ${attrs} style="display: none; max-height: 0; overflow: hidden; mso-hide: all; ${style}"><!--<![endif]-->`;
}
const SOCIAL = [
  ['Instagram', 'https://instagram.com/trailtotides'],
  ['YouTube', 'https://youtube.com/@trailtotides'],
  ['X', 'https://twitter.com/trailtotides'],
];

/**
 * One look for every email: white, or the website's dark theme when the reader's mail app is in
 * dark mode. The logo on the page, then a card with an optional photo (the home page headline),
 * an eyebrow, a serif heading, the body and a handwritten sign-off, then the small print and the
 * footer. Tables and inline styles, so it holds up in Gmail, Outlook and Apple Mail; with images
 * off the alt text still names us.
 */
function layout(eyebrow: string, heading: string, body: string, footer: string, opts: { banner?: { src: string; height: number; alt: string }; preheader?: string; link?: string; signoff?: boolean } = {}) {
  const b = opts.banner;
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${escapeHtml(heading)}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&family=Fraunces:opsz,wght@9..144,700&display=swap" rel="stylesheet">
<style>
:root { color-scheme: light dark; supported-color-schemes: light dark; }
@media (max-width: 480px) { .card { padding: 28px 22px 24px !important; } .h1 { font-size: 25px !important; } }
${DARK_CSS}
</style></head>
<body class="c-page" style="margin: 0; padding: 0; background: ${C.page}; color: ${C.body}; -webkit-text-size-adjust: 100%;">
${opts.preheader ? `<div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(opts.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.page}" class="c-page" style="background: ${C.page};"><tr><td align="center" style="padding: 28px 12px 40px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
    <tr><td style="padding: 0 6px 20px;">
      <a href="${SITE}" style="text-decoration: none;">${themedImage(`${ASSETS}/logo-light.png`, `${ASSETS}/logo.png`, 'width="171" height="30" alt="TRAIL to TIDES"', `border: 0; font: 800 16px/30px ${SANS}; letter-spacing: 0.08em; color: ${C.text};`)}</a>
    </td></tr>
    <tr><td bgcolor="${C.card}" class="c-card" style="background: ${C.card}; border: 1px solid ${C.line}; border-radius: 24px; overflow: hidden;">
      ${b ? `<div style="line-height: 0; font-size: 0;">${opts.link ? `<a href="${opts.link}">` : ''}<img src="${b.src}" width="560" height="${b.height}" alt="${escapeHtml(b.alt)}" style="display: block; width: 100%; max-width: 560px; height: auto; border: 0; border-radius: 23px 23px 0 0; color: ${C.text}; font: 800 22px/1.3 ${SANS};">${opts.link ? '</a>' : ''}</div>` : ''}
      <div class="card" style="padding: ${b ? '26px' : '36px'} 32px 28px;">
        <p style="font: 700 11px/1 ${SANS}; letter-spacing: 0.22em; text-transform: uppercase; color: ${C.orange}; margin: 0 0 12px;">${escapeHtml(eyebrow)}</p>
        <h1 class="h1 c-text" style="font: 700 29px/1.18 ${SERIF}; color: ${C.text}; margin: 0 0 14px;">${escapeHtml(heading)}</h1>
        ${body}
        ${opts.signoff ? `<div style="margin-top: 28px;">${themedImage(`${ASSETS}/signoff-light.png`, `${ASSETS}/signoff.png`, 'width="120" height="31" alt="See you out there, Team Trail to Tides"', `border: 0; color: ${C.link}; font: 700 13px/1.4 ${SANS};`)}</div>` : ''}
        <p class="c-muted c-rule" style="font: 400 12px/1.6 ${SANS}; color: ${C.muted}; margin: 24px 0 0; padding-top: 18px; border-top: 1px solid ${C.line};">${footer}</p>
      </div>
    </td></tr>
    <tr><td align="center" class="c-muted" style="padding: 26px 20px 0; font: 400 12px/1.9 ${SANS}; color: ${C.muted};">
      ${SOCIAL.map(([name, url]) => `<a href="${url}" class="c-text" style="color: ${C.text}; text-decoration: none; font-weight: 700;">${name}</a>`).join(` &nbsp;<span style="color: ${C.orange};">&#9679;</span>&nbsp; `)}<br>
      Find, compare and book adventures matched to your fitness.<br>
      <a href="${SITE}" class="c-body" style="color: ${C.body}; text-decoration: none; font-weight: 600;">trailtotides.com</a> &nbsp;&middot;&nbsp; <a href="${SITE}/contact" class="c-body" style="color: ${C.body}; text-decoration: none;">hello@trailtotides.com</a> &nbsp;&middot;&nbsp; Mumbai, India
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
export type AlertSearch = { name: string; link: string; items: AlertItem[] };

export async function sendAlertDigest(to: string, name: string, wishlist: AlertItem[], searches: AlertSearch[]) {
  return send({ to, ...alertDigestEmail(name, wishlist, searches) });
}

export function alertDigestEmail(name: string, wishlist: AlertItem[], searches: AlertSearch[]) {
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
  return {
    subject: wishlist.length && !searches.length
      ? `${wishlist[0].name}${wishlist.length > 1 ? ` and ${wishlist.length - 1} more` : ''}: news from your wishlist`
      : `${count} new ${count === 1 ? 'adventure' : 'adventures'} for your saved searches`,
    html: layout('Your adventure alerts', `Hi ${name}, here's what changed`, parts.join(''),
      `You get this because alerts are on for your wishlist or saved searches. <a href="${SITE}/settings" style="color: #999;">Change alerts</a>`),
    text: `${text.join('\n')}\n\nChange alerts: ${SITE}/settings`,
  };
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
  return send({ to, replyTo: q.traveller.email, ...quoteRequestEmail(q) });
}

export function quoteRequestEmail(q: QuoteEmail) {
  const facts = quoteFacts(q).map(([k, v]) => `<tr><td style="padding: 4px 12px 4px 0; color: #888;">${k}</td><td style="padding: 4px 0;">${escapeHtml(v)}</td></tr>`).join('');
  return {
    subject: `Quote request: ${q.adventure.name} for ${q.groupSize}, from ${q.startDate}`,
    html: layout('Quote request', `${q.traveller.name} would like a price`,
      `<table style="font-size: 14px; border-collapse: collapse;">${facts}</table>
       ${q.message ? `<div style="font-size: 15px; line-height: 1.6; white-space: pre-wrap; padding: 16px; background: #f7f4ee; border-radius: 10px; margin-top: 16px;">${escapeHtml(q.message)}</div>` : ''}`,
      `Reply to this email to answer ${escapeHtml(q.traveller.name)} directly. Sent through Trail to Tides from ${SITE}/experiences/${encodeURIComponent(q.adventure.slug)}`),
    text: `${quoteFacts(q).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${q.message}\n\nReply to this email to answer ${q.traveller.name} directly.`,
  };
}

/** The traveller's copy, so they know what was sent and to whom */
export async function sendQuoteCopy(q: QuoteEmail) {
  return send({ to: q.traveller.email, ...quoteCopyEmail(q) });
}

export function quoteCopyEmail(q: QuoteEmail) {
  const facts = quoteFacts(q).map(([k, v]) => `<tr><td style="padding: 4px 12px 4px 0; color: #888;">${k}</td><td style="padding: 4px 0;">${escapeHtml(v)}</td></tr>`).join('');
  return {
    subject: `Your quote request for ${q.adventure.name} is on its way`,
    html: layout('Quote request sent', 'Operators will reply to you by email',
      `<p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px;">We've sent your request to ${q.operators.length === 1 ? 'the operator' : `${q.operators.length} verified operators`}. Their replies come straight to this inbox.</p>
       <table style="font-size: 14px; border-collapse: collapse;">${facts}</table>`,
      `See your requests any time on <a href="${SITE}/profile" style="color: #999;">your profile</a>.`),
    text: `We've sent your request. Operators will reply to you by email.\n\n${quoteFacts(q).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
  };
}
