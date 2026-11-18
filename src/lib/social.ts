// Trail to Tides' social accounts, in one place. `live: false` shows the icon as "coming soon"
// (no link, so nobody lands on a "profile not found" page), and keeps it out of emails and of the
// structured data that tells Google which profiles are ours. When an account is made, check the
// address and set `live: true`.
export interface SocialAccount {
  name: string;
  href: string;
  live: boolean;
}

export const SOCIAL_ACCOUNTS: SocialAccount[] = [
  { name: "Instagram", href: "https://instagram.com/trailtotides", live: true },
  { name: "X", href: "https://x.com/trailtotides", live: false },
  { name: "YouTube", href: "https://youtube.com/@trailtotides", live: false },
  { name: "LinkedIn", href: "https://linkedin.com/company/trailtotides", live: false },
];

export const LIVE_SOCIAL = SOCIAL_ACCOUNTS.filter((s) => s.live);
