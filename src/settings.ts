/** The settings shape and defaults. */
import { SLUG_STYLES, SlugStyle } from './slug';

export interface CustomPublishSettings {
  /** Frontmatter key that marks a page as published. */
  publishProperty: string;
  /** Frontmatter key that marks a page as private. */
  visibilityProperty: string;
  /** URL of a published page, with `${PAGE}` where its slug goes. */
  publishUrl: string;
  slugStyle: SlugStyle;
}

export const DEFAULT_SETTINGS: CustomPublishSettings = {
  publishProperty: 'publish',
  visibilityProperty: 'private',
  publishUrl: '',
  slugStyle: 'title-kebab',
};

/**
 * Overlays saved settings on the defaults, dropping any value of the wrong
 * type so a hand-edited or corrupt data.json can't break the commands.
 */
export function mergeSettings(saved: unknown): CustomPublishSettings {
  const settings = { ...DEFAULT_SETTINGS };
  if (typeof saved !== 'object' || saved === null) return settings;
  const data = saved as Record<string, unknown>;

  for (const key of [
    'publishProperty',
    'visibilityProperty',
    'publishUrl',
  ] as const) {
    if (typeof data[key] === 'string') settings[key] = data[key];
  }
  if (SLUG_STYLES.includes(data.slugStyle as SlugStyle)) {
    settings.slugStyle = data.slugStyle as SlugStyle;
  }
  return settings;
}
