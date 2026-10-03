import { browser, expect } from '@wdio/globals';

import {
  PLUGIN_ID,
  captureRendering,
  getSettings,
  resetPlugin,
} from '../helpers';

async function openSettings() {
  await browser.executeObsidian(({ app }, id) => {
    const setting = (app as any).setting;
    setting.open();
    setting.openTabById(id);
  }, PLUGIN_ID);
  await browser.waitUntil(
    async () => (await settingsText()).includes('Slug style'),
    { timeout: 10000, timeoutMsg: 'settings tab did not render' }
  );
}

function settingsText(): Promise<string> {
  return browser.executeObsidian(({ app }) => {
    const el = (app as any).setting.activeTab?.containerEl as
      HTMLElement | undefined;
    return el?.innerText ?? '';
  });
}

async function closeSettings() {
  await browser.executeObsidian(({ app }) => (app as any).setting.close());
}

/** Types `value` into the text box of the setting named `name`. */
async function typeInto(name: string, value: string) {
  await browser.executeObsidian(
    ({ app }, name, value) => {
      const el = (app as any).setting.activeTab.containerEl as HTMLElement;
      const row = Array.from(el.querySelectorAll('.setting-item')).find(
        (r) => r.querySelector('.setting-item-name')?.textContent === name
      );
      const input = row?.querySelector('input');
      if (!input) throw new Error(`No text box for ${name}`);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    },
    name,
    value
  );
}

describe('Settings tab', function () {
  beforeEach(async function () {
    await resetPlugin();
  });

  afterEach(async function () {
    await closeSettings();
  });

  it('shows every setting', async function () {
    await openSettings();
    const text = await settingsText();
    for (const name of [
      'Publish property',
      'Visibility property',
      'Publish URL template',
      'Slug style',
    ]) {
      expect(text).toContain(name);
    }
    // Let the settings open animation finish before the capture.
    await browser.pause(500);
    await captureRendering('settings', { window: 'newest' });
  });

  it('saves the text settings', async function () {
    await openSettings();
    await typeInto('Publish property', 'live');
    await typeInto('Publish URL template', 'https://blog.test/${PAGE}');
    await browser.waitUntil(
      async () => {
        const s = await getSettings();
        return (
          s.publishProperty === 'live' &&
          s.publishUrl === 'https://blog.test/${PAGE}'
        );
      },
      { timeoutMsg: 'text settings did not reach the settings' }
    );
    const saved = await browser.executeObsidian(
      ({ app }, id) => (app as any).plugins.plugins[id].loadData(),
      PLUGIN_ID
    );
    expect(saved.publishProperty).toBe('live');
    expect(saved.publishUrl).toBe('https://blog.test/${PAGE}');
  });

  it('saves the slug style', async function () {
    await openSettings();
    await browser.executeObsidian(({ app }) => {
      const el = (app as any).setting.activeTab.containerEl as HTMLElement;
      const select = el.querySelector('select');
      if (!select) throw new Error('No slug style dropdown');
      select.value = 'camel-case';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await browser.waitUntil(
      async () => (await getSettings()).slugStyle === 'camel-case',
      { timeoutMsg: 'slug style did not reach the settings' }
    );
  });
});
