import {App, PluginSettingTab, Setting} from "obsidian";
import CustomPublishPlugin from "./main";

export interface CustomPublishSettings {
	publishProperty: string;
	visibilityProperty: string;
}

export const DEFAULT_SETTINGS: CustomPublishSettings = {
	publishProperty: 'publish',
	visibilityProperty: 'private',
}

export class CustomPublishSettingTab extends PluginSettingTab {
	plugin: CustomPublishPlugin;

	constructor(app: App, plugin: CustomPublishPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Publish property')
			.setDesc('The frontmatter property key used to mark a page as published')
			.addText(text => text
				.setPlaceholder('Publish')
				.setValue(this.plugin.settings.publishProperty)
				.onChange(async (value) => {
					this.plugin.settings.publishProperty = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Visibility property')
			.setDesc('The frontmatter property key used to control page visibility (e.g. private/public)')
			.addText(text => text
				.setPlaceholder('Private')
				.setValue(this.plugin.settings.visibilityProperty)
				.onChange(async (value) => {
					this.plugin.settings.visibilityProperty = value;
					await this.plugin.saveSettings();
				}));
	}
}
