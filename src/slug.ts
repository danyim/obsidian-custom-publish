/** Turns a note's name into a page slug and a published URL. */

export type SlugStyle = 'kebab' | 'title-kebab' | 'title-case' | 'camel-case';

export const SLUG_STYLES: readonly SlugStyle[] = [
  'kebab',
  'title-kebab',
  'title-case',
  'camel-case',
];

/** The placeholder in the URL template that the slug replaces. */
export const PAGE_PLACEHOLDER = '${PAGE}';

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Splits `name` into words on spaces, underscores and hyphens, drops every
 * other non-word character, and joins the words in `style`.
 */
export function toSlug(name: string, style: SlugStyle): string {
  const words = name
    .replace(/[^\w\s-]/g, '')
    .trim()
    .split(/[\s_-]+/)
    .filter((w) => w.length > 0);

  switch (style) {
    case 'kebab':
      return words.map((w) => w.toLowerCase()).join('-');
    case 'title-kebab':
      return words.map(capitalize).join('-');
    case 'title-case':
      return words.map(capitalize).join('');
    case 'camel-case':
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : capitalize(w)))
        .join('');
  }
}

/** Fills every `${PAGE}` in `template` with the slug of `name`. */
export function publishedUrl(
  template: string,
  name: string,
  style: SlugStyle
): string {
  return template.split(PAGE_PLACEHOLDER).join(toSlug(name, style));
}
