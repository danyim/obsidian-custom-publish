import { browser, expect } from '@wdio/globals';

import {
  clearNotices,
  clipboardWrites,
  closeAllNotes,
  commandAvailable,
  notices,
  openNote,
  resetPlugin,
  runCommand,
  setSettings,
  stubClipboard,
} from '../helpers';

describe('Copy published page URL', function () {
  beforeEach(async function () {
    await resetPlugin();
    await clearNotices();
    await stubClipboard();
  });

  it('is unavailable until a URL template is set', async function () {
    await openNote('Body\n');
    expect(await commandAvailable('copy-published-page-url')).toBe(false);
    await setSettings({ publishUrl: 'https://blog.test/${PAGE}' });
    expect(await commandAvailable('copy-published-page-url')).toBe(true);
  });

  it('is unavailable with no note open', async function () {
    await setSettings({ publishUrl: 'https://blog.test/${PAGE}' });
    await closeAllNotes();
    expect(await commandAvailable('copy-published-page-url')).toBe(false);
  });

  it("copies the URL with the note's slug", async function () {
    await setSettings({ publishUrl: 'https://blog.test/posts/${PAGE}.html' });
    await openNote('Body\n', 'My First Post.md');
    expect(await runCommand('copy-published-page-url')).toBe(true);
    const url = 'https://blog.test/posts/My-First-Post.html';
    await browser.waitUntil(async () => (await clipboardWrites()).length > 0);
    expect(await clipboardWrites()).toEqual([url]);
    expect(await notices()).toContain(`URL copied: ${url}`);
  });

  it('uses the slug style from the settings', async function () {
    await setSettings({
      publishUrl: 'https://blog.test/${PAGE}',
      slugStyle: 'kebab',
    });
    await openNote('Body\n', "What's New_in 2026.md");
    await runCommand('copy-published-page-url');
    await browser.waitUntil(async () => (await clipboardWrites()).length > 0);
    expect(await clipboardWrites()).toEqual([
      'https://blog.test/whats-new-in-2026',
    ]);
  });
});
