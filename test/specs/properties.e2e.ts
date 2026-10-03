import { browser, expect } from '@wdio/globals';

import {
  clearNotices,
  closeAllNotes,
  commandAvailable,
  notices,
  openNote,
  resetPlugin,
  runCommand,
  setSettings,
  waitForNoteText,
} from '../helpers';

describe('Publish and visibility commands', function () {
  beforeEach(async function () {
    await resetPlugin();
    await clearNotices();
  });

  it('publishes a note without frontmatter', async function () {
    const note = await openNote('Body\n', 'Plain.md');
    expect(await runCommand('publish-page')).toBe(true);
    await waitForNoteText(note, '---\npublish: true\n---\nBody\n');
    expect(await notices()).toContain('Plain: publish enabled');
  });

  it('unpublishes a published note', async function () {
    const note = await openNote('---\npublish: true\n---\nBody\n');
    await runCommand('unpublish-page');
    await waitForNoteText(note, '---\npublish: false\n---\nBody\n');
  });

  it('keeps the other properties as they are', async function () {
    const note = await openNote('---\ntitle: Hello\ntags:\n  - a\n---\nBody\n');
    await runCommand('publish-page');
    await waitForNoteText(
      note,
      '---\ntitle: Hello\ntags:\n  - a\npublish: true\n---\nBody\n'
    );
  });

  it('toggles publish on and back off', async function () {
    const note = await openNote('Body\n');
    await runCommand('toggle-publish-page');
    await waitForNoteText(note, '---\npublish: true\n---\nBody\n');
    await runCommand('toggle-publish-page');
    await waitForNoteText(note, '---\npublish: false\n---\nBody\n');
  });

  it('toggles visibility', async function () {
    const note = await openNote('---\nprivate: true\n---\nBody\n', 'Secret.md');
    await runCommand('toggle-visibility');
    await waitForNoteText(note, '---\nprivate: false\n---\nBody\n');
    expect(await notices()).toContain('Secret: private disabled');
  });

  it('writes the properties named in the settings', async function () {
    await setSettings({ publishProperty: 'live', visibilityProperty: 'draft' });
    const note = await openNote('Body\n');
    await runCommand('publish-page');
    await waitForNoteText(note, '---\nlive: true\n---\nBody\n');
    await runCommand('toggle-visibility');
    await waitForNoteText(note, '---\nlive: true\ndraft: true\n---\nBody\n');
  });

  it('is unavailable with no note open', async function () {
    await closeAllNotes();
    for (const id of [
      'publish-page',
      'unpublish-page',
      'toggle-publish-page',
      'toggle-visibility',
    ]) {
      expect(await commandAvailable(id)).toBe(false);
    }
  });

  it('registers no default hotkeys', async function () {
    // Obsidian's plugin guidelines ask plugins not to.
    const hotkeys = await browser.executeObsidian(({ app }) => {
      const commands = (app as any).commands.commands;
      return Object.keys(commands)
        .filter((id) => id.startsWith('custom-publish:'))
        .flatMap((id) => commands[id].hotkeys ?? []);
    });
    expect(hotkeys).toEqual([]);
  });
});
