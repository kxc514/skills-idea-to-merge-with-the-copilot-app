import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  STORAGE_KEY, normalizeUrl, loadBookmarks, generateSlug, formatBookmark,
} from './bookmarks.ts';

test('storage key is mona-bookmarks', () => {
  assert.equal(STORAGE_KEY, 'mona-bookmarks');
});

test('URLs with and without HTTPS normalize to the same saved value', () => {
  assert.equal(normalizeUrl('www.example.com'), normalizeUrl('https://www.example.com'));
  assert.equal(normalizeUrl('  example.com/path?q=1#part  '), 'https://example.com/path?q=1#part');
  assert.equal(normalizeUrl('//example.com'), 'https://example.com/');
  assert.equal(normalizeUrl('http://example.com'), 'http://example.com/');
  assert.equal(normalizeUrl('localhost:4321/path'), 'https://localhost:4321/path');
});

test('empty, corrupted, legacy and non-array storage recovers without throwing', () => {
  for (const raw of [null, '', '  ', '{broken', 'null', '{}', '42', '"legacy"', 'true',
    '["https://example.com"]', '[{"originalUrl":"https://example.com","shortCode":"old"}]']) {
    assert.deepEqual(loadBookmarks(raw).bookmarks, [], String(raw));
  }
  assert.equal(loadBookmarks('{broken').recovered, true);
  assert.equal(loadBookmarks('[]').recovered, false);
});

test('only validated fresh bookmark objects leave the storage layer', () => {
  const raw = JSON.stringify([
    { url: 'example.com', slug: 'mona-7fk2', extra: 'ignored' },
    null, 7, {}, { url: 3, slug: 'mona-abcd' },
    { url: 'https://example.com', slug: 'old-slug' },
    { url: 'javascript:alert(1)', slug: 'mona-abcd' },
    { url: 'not a url', slug: 'mona-efgh' },
    { url: 'https://duplicate.com', slug: 'mona-7fk2' },
    { url: 'https://other.com/page', slug: 'mona-Ab12' },
  ]);
  assert.deepEqual(loadBookmarks(raw), {
    bookmarks: [
      { url: 'https://example.com/', slug: 'mona-7fk2' },
      { url: 'https://other.com/page', slug: 'mona-Ab12' },
    ],
    recovered: true,
  });
});

test('invalid and unsafe URLs are rejected', () => {
  for (const url of ['', ' ', 'not a url', 'https://', 'javascript:alert(1)', 'data:text/html,hello']) {
    assert.throws(() => normalizeUrl(url), Error);
  }
});

test('slugs are short base62 strings and avoid existing collisions', () => {
  for (const seed of [0, 61, 62, 4294967295]) {
    const slug = generateSlug([], seed);
    assert.match(slug, /^mona-[0-9a-zA-Z]{4,6}$/);
    assert.notEqual(generateSlug([{ url: 'https://example.com/', slug }], seed), slug);
  }
});

test('saved bookmarks format with the exact visible separator', () => {
  const bookmark = { url: 'https://www.example.com', slug: 'mona-7fk2' };
  assert.equal(formatBookmark(bookmark), 'https://www.example.com :: mona-7fk2');
  assert.deepEqual(loadBookmarks(JSON.stringify([bookmark])).bookmarks, [
    { ...bookmark, url: 'https://www.example.com/' },
  ]);
});
