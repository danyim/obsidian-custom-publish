# Custom Publish: agent instructions

Adapted from the [Obsidian sample plugin's `AGENTS.md`](https://github.com/obsidianmd/obsidian-sample-plugin/blob/master/AGENTS.md)
for this project's actual conventions. For anything not covered here, see
[`CONTRIBUTING.md`](CONTRIBUTING.md) (human-facing, more detail),
[`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) and
[`docs/TESTING.md`](docs/TESTING.md).

## Project overview

- Obsidian community plugin (TypeScript bundled to JavaScript). It adds
  command palette actions that set a note's publish and visibility
  frontmatter properties, and one that copies the note's published URL. It
  doesn't publish anything itself; it assumes some other system reads those
  properties.
- Entry point: `src/main.ts`, bundled to `main.js` by esbuild.
- Release artifacts: `main.js`, `manifest.json`, `styles.css`, plus a
  `custom-publish-<version>.zip` of the three for manual installs.
- Makes no network requests. Settings are the only persisted state, stored via
  `loadData()`/`saveData()`. The only things it writes are frontmatter (through
  `fileManager.processFrontMatter`) and the clipboard.

## Environment & tooling

- Node: 24.x (what CI runs; see `.github/workflows/test.yaml`).
- Package manager: npm.
- Bundler: esbuild, configured in `config/esbuild.config.mjs`.

```bash
npm install
npm run dev            # esbuild watch mode
npm run build          # tsc --noEmit + production esbuild
npm run check-types    # tsc --noEmit only
```

### Dependency overrides

Obsidian's community plugin review flags vulnerable packages anywhere in
`package-lock.json`, dev dependencies included. The `overrides` in
`package.json` lift transitive dependencies whose parents still pin a
vulnerable range. Keep `npm audit` at zero; if an override stops being
needed (the parent package caught up), drop it.

| Override | Pulled in by | Why |
| --- | --- | --- |
| `@puppeteer/browsers` `^3` | `@wdio/utils` | 2.x depends on `extract-zip` and `proxy-agent` → `basic-ftp`, which have no fixed release. 3.x drops both. |
| `@wdio/mocha-framework` → `mocha` `$mocha` | wdio | wdio pins mocha 10, whose `chokidar` 3 → `braces` has no fixed release. Mocha 12 removes a file wdio imports, so stay on 11. |
| `serialize-javascript` `^7.1.2` | mocha 11 | mocha 11 asks for `^6`, which is vulnerable. |
| `diff` `^8.0.3` | mocha 11 | mocha 11 asks for `^7`, which is vulnerable. |
| `moment` `^2.31.0` | `obsidian` (types) | The typings package pins a vulnerable `moment`; the plugin never bundles it. |

Overrides only apply to a fresh resolve: after changing them, delete
`node_modules` and `package-lock.json` and run `npm install`.

## Linting & formatting

- ESLint (`eslint.config.mts`) includes `eslint-plugin-obsidianmd`, which
  checks (among other things) that APIs used exist at the declared
  `minAppVersion`, that UI text is sentence case, and that commands have no
  default hotkeys.
- Prettier formats `src/` and `test/` with import sorting; config lives inline
  in `package.json`.

```bash
npm run lint
npm run lint:fix
npm run prettier
npm run clean         # prettier + lint:fix together
```

CI runs lint, type-check, and both test layers on every push and PR.

## File & folder conventions

See the table in [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md). The rule that
matters most: `slug.ts` and `settings.ts` must not import `obsidian`, because
the unit tests run them under plain Node.

Other top-level directories:

- `config/`: build and test tool configs.
- `scripts/`: `version-bump.mjs` (release tooling) and `xvfb-wm.sh` (virtual
  display for the e2e suite on Linux).
- `test/`: unit tests (`test/unit/`), e2e specs (`test/specs/`), shared
  helpers, and the vault the specs open.
- `docs/`: project docs beyond the README.

`styles.css` and `manifest.json` are committed source files. `main.js` is a
build artifact and is gitignored; never commit it.

## Manifest rules (`manifest.json`)

- `id` is `custom-publish`. Never change it; it's the plugin's stable identity
  in the community catalog. It can't contain "obsidian".
- `minAppVersion` must stay accurate for the APIs the code uses.
  `eslint-plugin-obsidianmd`'s `no-unsupported-api` rule enforces this.
  Raising it when a newer API is genuinely needed is expected; update the
  floor version in `config/wdio.conf.mts` with it.
- See the canonical requirements:
  https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/validate-plugin-entry.yml

## Testing

```bash
npm test                                    # unit + e2e, default version matrix
npm run test:unit                           # unit tests only, no display needed
OBSIDIAN_VERSIONS="latest/latest" npm test  # faster while iterating
```

New behavior should come with a test; a bug fix should come with one that
fails without the fix. Read the "Things that trip up new specs" section of
[`docs/TESTING.md`](docs/TESTING.md) before writing one.

## Commands & settings

- Commands are registered in `main.ts`'s `onload()` through `addFileCommand`,
  with stable, never-renamed ids (`publish-page`, `unpublish-page`,
  `toggle-publish-page`, `toggle-visibility`, `copy-published-page-url`) and
  no default hotkeys. Each is hidden from the palette when no markdown note
  is active.
- Settings render through `display()` in `settingsTab.ts`. `minAppVersion` is
  1.12.2, below the 1.13.0 that `getSettingDefinitions()` needs, which is why
  lint warns about it.

## Versioning & releases

For maintainers, not something an agent should do unprompted:

```bash
npm version <x.y.z>   # bump package.json, sync manifest.json + versions.json,
                      # commit, tag, push branch and tag
```

Pushing the tag triggers `.github/workflows/release.yml`, which builds the
plugin, zips the release files into a `custom-publish/` folder, attests
provenance for `main.js`, `styles.css` and the zip, and creates a **draft**
GitHub release that a maintainer reviews and publishes by hand.

## Security, privacy, and compliance

Follow Obsidian's [Developer Policies](https://docs.obsidian.md/Developer+policies)
and [Plugin Guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).
Specific to this plugin:

- No network requests, telemetry or analytics. Introducing any would need an
  opt-in setting and a README disclosure.
- Write frontmatter only through `processFrontMatter`, so the rest of the
  note and its other properties are left as they are.

## Coding conventions

- TypeScript with `noImplicitAny` and `strictNullChecks` on.
- Comments explain *why*, not *what*.
- Keep `main.ts` to plugin lifecycle and wiring; put logic in the other
  modules.
- `isDesktopOnly` is `false`: no Node or Electron APIs in `src/`.

## Agent do/don't

**Do**

- Keep command ids and the plugin `id` stable.
- Run `npm run lint`, `npm run check-types` and `npm run test:unit` before
  considering a change done; run the e2e suite for anything touching the
  commands or the settings tab.

**Don't**

- Commit `main.js` or other build output.
- Bump the plugin version unless asked.

## Troubleshooting

- **Plugin doesn't load after a manual install**: `main.js`, `manifest.json`
  and `styles.css` must sit at the top level of
  `<vault>/.obsidian/plugins/custom-publish/`.
- **e2e tests hang or fail to download Obsidian**: the first run downloads
  real Obsidian builds and needs a display on Linux (`scripts/xvfb-wm.sh`
  handles it; install `xvfb` and `herbstluftwm`).
