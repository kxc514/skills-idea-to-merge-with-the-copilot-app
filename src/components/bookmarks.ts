export interface Bookmark {
  url: string;
  slug: string;
}

export const STORAGE_KEY = 'mona-bookmarks';
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error('Enter a URL to save.');

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed);
  const candidate = trimmed.startsWith('//')
    ? `https:${trimmed}`
    : hasScheme && !/^[^/:]+:\d+(?:[/?#]|$)/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error('Enter a valid website URL, such as example.com.');
  }
  if (!['https:', 'http:'].includes(url.protocol) || !url.hostname) {
    throw new Error('Use an HTTP or HTTPS website URL.');
  }
  return url.href;
}

export function loadBookmarks(raw: string | null): {
  bookmarks: Bookmark[];
  recovered: boolean;
} {
  if (raw === null || raw.trim() === '') return { bookmarks: [], recovered: false };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { bookmarks: [], recovered: true };
  }
  if (!Array.isArray(parsed)) return { bookmarks: [], recovered: true };

  const bookmarks: Bookmark[] = [];
  const slugs = new Set<string>();
  for (const item of parsed) {
    if (
      typeof item !== 'object' || item === null ||
      !('url' in item) || typeof item.url !== 'string' ||
      !('slug' in item) || typeof item.slug !== 'string' ||
      !/^mona-[0-9a-zA-Z]{4,8}$/.test(item.slug) || slugs.has(item.slug)
    ) continue;

    try {
      const url = normalizeUrl(item.url);
      bookmarks.push({ url, slug: item.slug });
      slugs.add(item.slug);
    } catch {
      // Invalid stored URLs are discarded, never rendered as links.
    }
  }
  return { bookmarks, recovered: bookmarks.length !== parsed.length };
}

export function generateSlug(bookmarks: readonly Bookmark[], seed: number): string {
  const used = new Set(bookmarks.map(({ slug }) => slug));
  let value = seed;
  let slug: string;
  do {
    let remaining = value++;
    let encoded = '';
    do {
      encoded = BASE62[remaining % 62] + encoded;
      remaining = Math.floor(remaining / 62);
    } while (remaining > 0);
    slug = `mona-${encoded.padStart(4, '0')}`;
  } while (used.has(slug));
  return slug;
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}
