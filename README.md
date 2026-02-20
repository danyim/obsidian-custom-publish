# Custom Publish

An Obsidian plugin that exposes command palette actions to set frontmatter properties for publishing workflows. It doesn't tie itself to a specific hosting provider — it assumes you already have a system that scans notes and publishes based on frontmatter properties.

## Commands

| Command | Action |
|---------|--------|
| **Custom Publish: Publish page** | Sets the publish property to `true` |
| **Custom Publish: Unpublish page** | Sets the publish property to `false` |
| **Custom Publish: Toggle publish page** | Flips the publish property |
| **Custom Publish: Toggle visibility** | Flips the visibility property |

If the target property doesn't exist on the note, it will be added automatically.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Publish property | `publish` | Frontmatter key used to mark a page as published |
| Visibility property | `private` | Frontmatter key used to control page visibility |

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
```

## Installation

Copy `main.js`, `styles.css`, and `manifest.json` to your vault at `.obsidian/plugins/obsidian-custom-publish/`.
