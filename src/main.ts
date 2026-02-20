import {MarkdownView, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, CustomPublishSettings, CustomPublishSettingTab} from "./settings";
import type {SlugStyle} from "./settings";

export default class CustomPublishPlugin extends Plugin {
	settings: CustomPublishSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'publish-page',
			name: 'Publish page',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
				if (!file) return false;
				if (!checking) void this.setProperty(this.settings.publishProperty, true);
				return true;
			}
		});

		this.addCommand({
			id: 'unpublish-page',
			name: 'Unpublish page',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
				if (!file) return false;
				if (!checking) void this.setProperty(this.settings.publishProperty, false);
				return true;
			}
		});

		this.addCommand({
			id: 'toggle-publish-page',
			name: 'Toggle publish page',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
				if (!file) return false;
				if (!checking) void this.toggleProperty(this.settings.publishProperty);
				return true;
			}
		});

		this.addCommand({
			id: 'toggle-visibility',
			name: 'Toggle visibility',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
				if (!file) return false;
				if (!checking) void this.toggleProperty(this.settings.visibilityProperty);
				return true;
			}
		});

		this.addCommand({
			id: 'copy-published-page-url',
			name: 'Copy published page URL',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
				if (!file || !this.settings.publishUrl) return false;
				if (!checking) void this.copyPublishedUrl();
				return true;
			}
		});

		this.addSettingTab(new CustomPublishSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<CustomPublishSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private async setProperty(key: string, value: boolean) {
		const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
		if (!file) return;

		await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
			frontmatter[key] = value;
		});

		new Notice(`${file.basename}: ${key} ${value ? 'enabled' : 'disabled'}`);
	}

	private async copyPublishedUrl() {
		const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
		if (!file) return;

		const slug = this.toSlug(file.basename, this.settings.slugStyle);
		const url = this.settings.publishUrl.replace('${PAGE}', slug);
		await navigator.clipboard.writeText(url);
		new Notice(`URL copied: ${url}`);
	}

	private toSlug(name: string, style: SlugStyle): string {
		// Split into words: handle spaces, underscores, hyphens, and strip special chars
		const words = name
			.replace(/[^\w\s-]/g, '')
			.trim()
			.split(/[\s_-]+/)
			.filter(w => w.length > 0);

		switch (style) {
			case 'kebab':
				return words.map(w => w.toLowerCase()).join('-');
			case 'title-kebab':
				return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('-');
			case 'title-case':
				return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
			case 'camel-case':
				return words.map((w, i) =>
					i === 0
						? w.toLowerCase()
						: w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
				).join('');
		}
	}

	private async toggleProperty(key: string) {
		const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
		if (!file) return;

		let newValue = false;
		await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
			newValue = !frontmatter[key];
			frontmatter[key] = newValue;
		});

		new Notice(`${file.basename}: ${key} ${newValue ? 'enabled' : 'disabled'}`);
	}
}
