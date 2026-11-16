/**
 * JSON for a <script type="application/ld+json"> tag. Escapes <, > and & so text inside the
 * data (a story title, an author name) can never close the tag and run as script.
 */
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
