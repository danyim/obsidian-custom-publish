import assert from 'node:assert/strict';

import { publishedUrl, toSlug } from '../../src/slug';

describe('toSlug', () => {
  it('writes each style', () => {
    assert.equal(toSlug('My First Post', 'kebab'), 'my-first-post');
    assert.equal(toSlug('My First Post', 'title-kebab'), 'My-First-Post');
    assert.equal(toSlug('My First Post', 'title-case'), 'MyFirstPost');
    assert.equal(toSlug('My First Post', 'camel-case'), 'myFirstPost');
  });

  it('splits words on spaces, underscores and hyphens', () => {
    assert.equal(toSlug('one_two-three  four', 'kebab'), 'one-two-three-four');
  });

  it('drops punctuation without splitting on it', () => {
    assert.equal(toSlug("What's new? (2026)", 'kebab'), 'whats-new-2026');
  });

  it('lowercases the rest of each word', () => {
    assert.equal(toSlug('USING THE API', 'title-kebab'), 'Using-The-Api');
    assert.equal(toSlug('USING THE API', 'camel-case'), 'usingTheApi');
  });

  it('ignores leading, trailing and repeated separators', () => {
    assert.equal(toSlug('  - a -- b _ ', 'kebab'), 'a-b');
  });

  it('keeps digits', () => {
    assert.equal(toSlug('Top 10 tips', 'title-case'), 'Top10Tips');
  });

  it('returns an empty slug for a name with no word characters', () => {
    assert.equal(toSlug('?!', 'kebab'), '');
  });
});

describe('publishedUrl', () => {
  it('replaces the placeholder with the slug', () => {
    assert.equal(
      publishedUrl(
        'https://blog.example.com/${PAGE}',
        'My First Post',
        'kebab'
      ),
      'https://blog.example.com/my-first-post'
    );
  });

  it('keeps what surrounds the placeholder', () => {
    assert.equal(
      publishedUrl(
        'https://example.com/posts/${PAGE}.html',
        'My First Post',
        'kebab'
      ),
      'https://example.com/posts/my-first-post.html'
    );
  });

  it('replaces every placeholder, not just the first', () => {
    assert.equal(
      publishedUrl('https://x.test/${PAGE}#${PAGE}', 'A B', 'kebab'),
      'https://x.test/a-b#a-b'
    );
  });

  it('leaves a template without a placeholder as it is', () => {
    assert.equal(
      publishedUrl('https://x.test/', 'A B', 'kebab'),
      'https://x.test/'
    );
  });
});
