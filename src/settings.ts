import {App, PluginSettingTab, Setting} from "obsidian";
import CustomPublishPlugin from "./main";

export type SlugStyle = 'kebab' | 'title-kebab' | 'title-case' | 'camel-case';

export const SLUG_STYLE_LABELS: Record<SlugStyle, string> = {
	'kebab': 'kebab-case (my-first-post)',
	'title-kebab': 'Title-Kebab-Case (My-First-Post)',
	'title-case': 'TitleCase (MyFirstPost)',
	'camel-case': 'camelCase (myFirstPost)',
};

export interface CustomPublishSettings {
	publishProperty: string;
	visibilityProperty: string;
	publishUrl: string;
	slugStyle: SlugStyle;
}

export const DEFAULT_SETTINGS: CustomPublishSettings = {
	publishProperty: 'publish',
	visibilityProperty: 'private',
	publishUrl: '',
	slugStyle: 'title-kebab',
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

		new Setting(containerEl)
			.setName('Publish URL template')
			.setDesc('URL template for published pages. Use ${PAGE} as a placeholder for the page name, which will be converted using the slug style below. Example: https://my.site/${PAGE}')
			.addText(text => text
				.setPlaceholder('https://my.site/${PAGE}')
				.setValue(this.plugin.settings.publishUrl)
				.onChange(async (value) => {
					this.plugin.settings.publishUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Slug style')
			.setDesc('How the page name is converted for the ${PAGE} placeholder in the URL template')
			.addDropdown(dropdown => {
				for (const [value, label] of Object.entries(SLUG_STYLE_LABELS)) {
					dropdown.addOption(value, label);
				}
				dropdown
					.setValue(this.plugin.settings.slugStyle)
					.onChange(async (value) => {
						this.plugin.settings.slugStyle = value as SlugStyle;
						await this.plugin.saveSettings();
					});
			});
	}
}
