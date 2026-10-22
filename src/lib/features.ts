// Switches for features that rely on emails we don't send yet. For now the site only emails
// account links (verification, password reset) and contact messages to our own inbox.
// Turning one back on brings its UI, API and emails back together.

/** "Get quotes" on adventure pages: emails the request to operators and a copy to the traveller */
export const QUOTE_REQUESTS = false;

/** The daily digest of wishlist news and saved-search matches, and the settings that control it */
export const EMAIL_ALERTS = false;
