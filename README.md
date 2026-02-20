# Custom Publish

An Obsidian plugin that exposes command palette actions to set frontmatter properties for publishing workflows. It doesn't tie itself to a specific hosting provider — it assumes you already have a system that scans notes and publishes based on frontmatter properties.

## Commands

| Command | Action |
|---------|--------|
| **Custom Publish: Publish page** | Sets the publish property to `true` |
| **Custom Publish: Unpublish page** | Sets the publish property to `false` |
| **Custom Publish: Toggle publish page** | Flips the publish property |
| **Custom Publish: Toggle visibility** | Flips the visibility property |
| **Custom Publish: Copy published page URL** | Copies the published URL to the clipboard using the configured URL template |

If the target property doesn't exist on the note, it will be added automatically.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Publish property | `publish` | Frontmatter key used to mark a page as published |
| Visibility property | `private` | Frontmatter key used to control page visibility |
| Publish URL template | _(empty)_ | URL template for published pages. Use `${PAGE}` as a placeholder for the page name |
| Slug style | `title-kebab` | How the page name is converted for the `${PAGE}` placeholder |

### Publish URL template

The `${PAGE}` placeholder is replaced with the current note's filename, converted using the selected slug style. Special characters are stripped and words are split on spaces, underscores, and hyphens.

**Slug styles:**

| Style | Example input | `${PAGE}` output |
|-------|---------------|------------------|
| kebab-case | My First Post | `my-first-post` |
| Title-Kebab-Case | My First Post | `My-First-Post` |
| TitleCase | My First Post | `MyFirstPost` |
| camelCase | My First Post | `myFirstPost` |

**Configuration examples** (using kebab-case):

| Publish URL template | Result for "My First Post" |
|----------------------|----------------------------|
| `https://blog.example.com/${PAGE}` | `https://blog.example.com/my-first-post` |
| `https://example.com/posts/${PAGE}.html` | `https://example.com/posts/my-first-post.html` |
| `https://wiki.example.com/pages/${PAGE}/` | `https://wiki.example.com/pages/my-first-post/` |

> **Note:** The "Copy published page URL" command is only available when a Publish URL template is configured.

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
```

## Installation

Copy `main.js`, `styles.css`, and `manifest.json` to your vault at `.obsidian/plugins/obsidian-custom-publish/`.
