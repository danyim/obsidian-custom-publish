import {MarkdownView, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, CustomPublishSettings, CustomPublishSettingTab} from "./settings";

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

		new Notice(`${key}: ${String(value)}`);
	}

	private async toggleProperty(key: string) {
		const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
		if (!file) return;

		let newValue = false;
		await this.app.fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
			newValue = !frontmatter[key];
			frontmatter[key] = newValue;
		});

		new Notice(`${key}: ${String(newValue)}`);
	}
}
