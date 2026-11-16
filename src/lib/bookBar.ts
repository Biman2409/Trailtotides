// The adventure page's phone Book bar and the site's bottom nav share the bottom of the screen.
// The bar sets this attribute on <html> while it shows and sends the event when that changes;
// the nav hides meanwhile, so the two never stack or overlap mid-swap.
export const BOOK_BAR_ATTR = "data-book-bar";
export const BOOK_BAR_EVENT = "ttt:book-bar";
