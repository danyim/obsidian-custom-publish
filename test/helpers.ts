import { browser } from '@wdio/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { obsidianPage } from 'wdio-obsidian-service';

import type { CustomPublishSettings } from '../src/settings';

export const PLUGIN_ID = 'custom-publish';

const SCREENSHOT_DIR = path.resolve('test/screenshots');

let noteCount = 0;

/**
 * Replaces the vault with one note holding `content` and opens it. Returns
 * the note's path. Each call gets a fresh name unless `name` is given, so a
 * spec never sees a note an earlier one left open.
 */
export async function openNote(
  content: string,
  name = `Scratch ${++noteCount}.md`
): Promise<string> {
  // resetVault reads an empty string as "no content given" and goes looking
  // for a source file instead.
  await obsidianPage.resetVault({ [name]: content || '\n' });
  await browser.executeObsidian(async ({ app }, name) => {
    const file = app.vault.getFileByPath(name);
    if (!file) throw new Error(`No such note: ${name}`);
    await app.workspace.getLeaf(false).openFile(file);
  }, name);
  return name;
}

/** Closes every tab, so no markdown view is active. */
export async function closeAllNotes(): Promise<void> {
  await browser.executeObsidian(({ app }) => {
    app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view.getViewType() === 'markdown') leaf.detach();
    });
  });
}

export async function noteText(name: string): Promise<string> {
  return await browser.executeObsidian(async ({ app }, name) => {
    const file = app.vault.getFileByPath(name);
    if (!file) throw new Error(`No such note: ${name}`);
    return app.vault.read(file);
  }, name);
}

/**
 * Waits for the note to read `expected`. The commands write frontmatter
 * asynchronously, after the command itself returns.
 */
export async function waitForNoteText(
  name: string,
  expected: string
): Promise<void> {
  let last = '';
  try {
    await browser.waitUntil(
      async () => (last = await noteText(name)) === expected
    );
  } catch {
    throw new Error(
      `${name} reads ${JSON.stringify(last)}, expected ${JSON.stringify(expected)}`
    );
  }
}

/**
 * Runs one of this plugin's commands the way the palette would. Returns
 * false when the command's check says it isn't available right now.
 */
export function runCommand(id: string): Promise<boolean> {
  return browser.executeObsidian(
    ({ app }, id) => (app as any).commands.executeCommandById(id),
    `${PLUGIN_ID}:${id}`
  );
}

/** Whether the command would show in the palette right now. */
export function commandAvailable(id: string): Promise<boolean> {
  return browser.executeObsidian(({ app }, id) => {
    const command = (app as any).commands.findCommand(id);
    if (!command) throw new Error(`No such command: ${id}`);
    return command.checkCallback(true) === true;
  }, `${PLUGIN_ID}:${id}`);
}

export async function setSettings(
  settings: Partial<CustomPublishSettings>
): Promise<void> {
  await browser.executeObsidian(
    async ({ app }, id, settings) => {
      const p = (app as any).plugins.plugins[id];
      p.settings = { ...p.settings, ...settings };
      await p.saveSettings();
    },
    PLUGIN_ID,
    settings
  );
}

export function getSettings(): Promise<CustomPublishSettings> {
  return browser.executeObsidian(({ app }, id) => {
    const p = (app as any).plugins.plugins[id];
    return JSON.parse(JSON.stringify(p.settings));
  }, PLUGIN_ID);
}

/** Restores the default settings. */
export async function resetPlugin(): Promise<void> {
  await browser.executeObsidian(async ({ app }, id) => {
    const p = (app as any).plugins.plugins[id];
    p.settings = {
      publishProperty: 'publish',
      visibilityProperty: 'private',
      publishUrl: '',
      slugStyle: 'title-kebab',
    };
    await p.saveSettings();
  }, PLUGIN_ID);
}

/**
 * Records what gets written to the clipboard instead of writing it. Writing
 * the real clipboard needs the window focused, which a test run can't
 * promise, and would clobber the clipboard of whoever runs the suite.
 */
export async function stubClipboard(): Promise<void> {
  await browser.executeObsidian(() => {
    const w = window as any;
    w.__clipboardWrites = [];
    Object.defineProperty(navigator.clipboard, 'writeText', {
      configurable: true,
      value: (text: string) => {
        w.__clipboardWrites.push(text);
        return Promise.resolve();
      },
    });
  });
}

export function clipboardWrites(): Promise<string[]> {
  return browser.executeObsidian(() => (window as any).__clipboardWrites ?? []);
}

/** The text of every notice currently on screen. */
export function notices(): Promise<string[]> {
  return browser.executeObsidian(() =>
    Array.from(document.querySelectorAll('.notice')).map(
      (el) => el.textContent ?? ''
    )
  );
}

export async function clearNotices(): Promise<void> {
  await browser.executeObsidian(() => {
    document.querySelectorAll('.notice').forEach((el) => el.remove());
  });
}

export function isMobile(): Promise<boolean> {
  return browser.executeObsidian(({ obsidian }) => obsidian.Platform.isMobile);
}

/**
 * Captures the screen, tagged with the Obsidian version and platform so a
 * run across the version matrix leaves one file per combination.
 */
export async function captureRendering(
  name: string,
  options: { window?: 'main' | 'newest' } = {}
): Promise<string> {
  const [version, mobile] = await Promise.all([
    browser.executeObsidian(({ obsidian }) => obsidian.apiVersion),
    isMobile(),
  ]);
  const platform = mobile ? 'mobile' : 'desktop';
  const file = path.join(SCREENSHOT_DIR, `${version}-${platform}-${name}.png`);
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  // Desktop Obsidian opens some things, settings included, in a window of
  // their own, which a screenshot of the main window doesn't show.
  const handles = await browser.getWindowHandles();
  const main = await browser.getWindowHandle();
  const target =
    options.window === 'newest' ? handles[handles.length - 1] : main;
  if (target !== main) await browser.switchToWindow(target);
  try {
    await browser.saveScreenshot(file);
  } finally {
    if (target !== main) await browser.switchToWindow(main);
  }
  return file;
}
