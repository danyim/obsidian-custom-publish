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
				if (!checking) this.setProperty(this.settings.publishProperty, true);
				return true;
			}
		});

		this.addCommand({
			id: 'unpublish-page',
			name: 'Unpublish page',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
				if (!file) return false;
				if (!checking) this.setProperty(this.settings.publishProperty, false);
				return true;
			}
		});

		this.addCommand({
			id: 'toggle-publish-page',
			name: 'Toggle publish page',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
				if (!file) return false;
				if (!checking) this.toggleProperty(this.settings.publishProperty);
				return true;
			}
		});

		this.addCommand({
			id: 'toggle-visibility',
			name: 'Toggle visibility',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
				if (!file) return false;
				if (!checking) this.toggleProperty(this.settings.visibilityProperty);
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

		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			frontmatter[key] = value;
		});

		new Notice(`${key}: ${value}`);
	}

	private async toggleProperty(key: string) {
		const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
		if (!file) return;

		let newValue: boolean;
		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			newValue = !frontmatter[key];
			frontmatter[key] = newValue;
		});

		new Notice(`${key}: ${newValue!}`);
	}
}
