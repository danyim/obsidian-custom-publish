import { App, PluginSettingTab, Setting } from 'obsidian';

import type CustomPublishPlugin from './main';
import { SlugStyle } from './slug';

const SLUG_STYLE_LABELS: Record<SlugStyle, string> = {
  kebab: 'kebab-case (my-first-post)',
  'title-kebab': 'Title-Kebab-Case (My-First-Post)',
  'title-case': 'TitleCase (MyFirstPost)',
  'camel-case': 'camelCase (myFirstPost)',
};

export class CustomPublishSettingTab extends PluginSettingTab {
  plugin: CustomPublishPlugin;

  constructor(app: App, plugin: CustomPublishPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.settings;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Publish property')
      .setDesc('The frontmatter property key used to mark a page as published')
      .addText((text) =>
        text
          .setPlaceholder('Publish')
          .setValue(settings.publishProperty)
          .onChange(async (value) => {
            settings.publishProperty = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Visibility property')
      .setDesc(
        'The frontmatter property key used to control page visibility, such as private or public'
      )
      .addText((text) =>
        text
          .setPlaceholder('Private')
          .setValue(settings.visibilityProperty)
          .onChange(async (value) => {
            settings.visibilityProperty = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Publish URL template')
      .setDesc(
        'URL template for published pages. Use ${PAGE} as a placeholder for the page name, which will be converted using the slug style below. Example: https://my.site/${PAGE}'
      )
      .addText((text) =>
        text
          .setPlaceholder('https://my.site/${PAGE}')
          .setValue(settings.publishUrl)
          .onChange(async (value) => {
            settings.publishUrl = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Slug style')
      .setDesc(
        'How the page name is converted for the ${PAGE} placeholder in the URL template'
      )
      .addDropdown((dropdown) => {
        for (const [value, label] of Object.entries(SLUG_STYLE_LABELS)) {
          dropdown.addOption(value, label);
        }
        dropdown.setValue(settings.slugStyle).onChange(async (value) => {
          settings.slugStyle = value as SlugStyle;
          await this.plugin.saveSettings();
        });
      });
  }
}
