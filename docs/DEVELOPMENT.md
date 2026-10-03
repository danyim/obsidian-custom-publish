# Development

```bash
npm install
npm run dev     # rebuild main.js on change
npm run build   # type-check and produce main.js
npm run lint
```

The plugin is TypeScript bundled by esbuild (`config/esbuild.config.mjs`) into
`main.js`. Everything it runs lives in `src/`:

| File | What it does |
| --- | --- |
| `main.ts` | Plugin entry point: loads settings, registers the commands, and writes frontmatter and the clipboard. |
| `slug.ts` | Turns a note's name into a slug in one of the four styles, and fills the URL template with it. |
| `settings.ts` | The settings shape and defaults, and merging saved settings over them. |
| `settingsTab.ts` | The settings tab. |

`slug.ts` and `settings.ts` don't import `obsidian`, which is what lets the
unit tests run them directly. Keep them that way; anything that needs the
Obsidian API goes in the other modules.

To try a build in a real vault, copy or symlink `main.js`, `manifest.json` and
`styles.css` into `<vault>/.obsidian/plugins/custom-publish/` and enable the
plugin. Obsidian doesn't pick up a rebuilt `main.js` on its own: use the
[Hot Reload](https://github.com/pjeby/hot-reload) plugin, or toggle the plugin
off and on.

See [TESTING.md](TESTING.md) for running the test suite.
