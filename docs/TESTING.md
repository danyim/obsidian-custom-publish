# Testing

```bash
npm test
```

runs both layers:

- **Unit tests** (`npm run test:unit`): mocha under Node, via `tsx`, over the
  modules in `src/` that don't import Obsidian (slug styles, the URL template,
  and merging saved settings). They take well under a second and need no
  display, so run them on their own while working on that logic.
- **End-to-end tests** (`npm run test:e2e`): real Obsidian, driven by
  [wdio-obsidian-service](https://github.com/jesse-r-s-hines/wdio-obsidian-service),
  which downloads and sandboxes its own copies of the app.

Both `npm test` and `npm run test:e2e` build `main.js` first. Obsidian loads
whatever build is in the checkout, and a stale one silently tests the wrong
code.

## What the e2e specs cover

- `properties.e2e.ts`: each frontmatter command run on a real note, checked
  against the file's text on disk, including that other properties survive
  and that the property names come from the settings.
- `copyUrl.e2e.ts`: the copy URL command, with the clipboard stubbed so the
  spec can read what was written.
- `settings.e2e.ts`: the settings tab renders and saves what's typed into it.

Commands run through `app.commands.executeCommandById`, the same path the
command palette takes, so their `checkCallback` decides whether they run.

## Versions

By default the e2e suite runs against Obsidian 1.12.4 and `latest`, each on
the desktop and emulated-mobile UI. Override with:

```bash
OBSIDIAN_VERSIONS="latest/latest" npm test
```

`latest` catches regressions against current Obsidian; the floor build confirms
the plugin still works on the oldest version it declares support for. The floor
is 1.12.4 rather than wdio's `earliest`, which resolves to the `minAppVersion`
of 1.12.2: Obsidian 1.12.0 through 1.12.3 were insiders-only releases with no
public installer, so downloading them needs Catalyst credentials.

Each run writes renderings of the settings tab per Obsidian version and
platform into `test/screenshots/`. CI uploads them as build artifacts.

A scheduled workflow re-runs the suite whenever a new Obsidian version ships.
To include Obsidian beta builds, add `OBSIDIAN_EMAIL` and `OBSIDIAN_PASSWORD`
repository secrets for an Insiders account with 2FA disabled.

## Display

On Linux, Obsidian needs a display. `npm test` handles this itself:
`scripts/xvfb-wm.sh` starts Xvfb with a window manager (matching CI's "Set up
virtual graphics" step) whenever `DISPLAY` isn't already set. It needs:

```bash
sudo apt-get install xvfb herbstluftwm
```

## Things that trip up new specs

- **Frontmatter is written after the command returns.** The commands call
  `processFrontMatter` without awaiting it, so read the note with
  `waitForNoteText()` rather than once.
- **Every note gets a fresh name** unless the spec passes one, so a spec never
  sees a note an earlier one left open. Pass a name when the notice or the
  slug depends on it.
- **Stub the clipboard with `stubClipboard()`.** Writing the real one needs
  the window focused, which a test run can't promise.
- **Desktop settings open in their own window.** `captureRendering(name,
  { window: 'newest' })` screenshots that window instead of the main one.
