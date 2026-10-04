import assert from 'node:assert/strict';

import { DEFAULT_SETTINGS, mergeSettings } from '../../src/settings';

describe('mergeSettings', () => {
  it('uses the defaults when nothing is saved', () => {
    assert.deepEqual(mergeSettings(null), DEFAULT_SETTINGS);
    assert.deepEqual(mergeSettings(undefined), DEFAULT_SETTINGS);
  });

  it('keeps saved values over the defaults', () => {
    const saved = {
      publishProperty: 'live',
      visibilityProperty: 'hidden',
      publishUrl: 'https://x.test/${PAGE}',
      slugStyle: 'camel-case',
    };
    assert.deepEqual(mergeSettings(saved), saved);
  });

  it('fills in settings missing from older saves', () => {
    assert.deepEqual(mergeSettings({ publishProperty: 'live' }), {
      ...DEFAULT_SETTINGS,
      publishProperty: 'live',
    });
  });

  it('drops values of the wrong type and unknown slug styles', () => {
    assert.deepEqual(
      mergeSettings({ publishProperty: 3, slugStyle: 'snake' }),
      DEFAULT_SETTINGS
    );
  });

  it("doesn't share the defaults object", () => {
    const settings = mergeSettings(null);
    settings.publishProperty = 'changed';
    assert.equal(DEFAULT_SETTINGS.publishProperty, 'publish');
  });
});
