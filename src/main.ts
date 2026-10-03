import { MarkdownView, Notice, Plugin, TFile } from 'obsidian';

import { CustomPublishSettings, mergeSettings } from './settings';
import { CustomPublishSettingTab } from './settingsTab';
import { publishedUrl } from './slug';

export default class CustomPublishPlugin extends Plugin {
  settings: CustomPublishSettings;

  async onload() {
    await this.loadSettings();

    this.addFileCommand('publish-page', 'Publish page', (file) =>
      this.setProperty(file, this.settings.publishProperty, true)
    );
    this.addFileCommand('unpublish-page', 'Unpublish page', (file) =>
      this.setProperty(file, this.settings.publishProperty, false)
    );
    this.addFileCommand('toggle-publish-page', 'Toggle publish page', (file) =>
      this.toggleProperty(file, this.settings.publishProperty)
    );
    this.addFileCommand('toggle-visibility', 'Toggle visibility', (file) =>
      this.toggleProperty(file, this.settings.visibilityProperty)
    );
    this.addFileCommand(
      'copy-published-page-url',
      'Copy published page URL',
      (file) => this.copyPublishedUrl(file),
      () => this.settings.publishUrl !== ''
    );

    this.addSettingTab(new CustomPublishSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = mergeSettings(await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * Registers a command that acts on the note in the active markdown view,
   * and is hidden from the palette when there isn't one or `available` says
   * no.
   */
  private addFileCommand(
    id: string,
    name: string,
    run: (file: TFile) => Promise<void>,
    available: () => boolean = () => true
  ) {
    this.addCommand({
      id,
      name,
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
        if (!file || !available()) return false;
        if (!checking) void run(file);
        return true;
      },
    });
  }

  private async setProperty(file: TFile, key: string, value: boolean) {
    await this.app.fileManager.processFrontMatter(
      file,
      (frontmatter: Record<string, unknown>) => {
        frontmatter[key] = value;
      }
    );
    new Notice(`${file.basename}: ${key} ${value ? 'enabled' : 'disabled'}`);
  }

  private async toggleProperty(file: TFile, key: string) {
    let value = false;
    await this.app.fileManager.processFrontMatter(
      file,
      (frontmatter: Record<string, unknown>) => {
        value = !frontmatter[key];
        frontmatter[key] = value;
      }
    );
    new Notice(`${file.basename}: ${key} ${value ? 'enabled' : 'disabled'}`);
  }

  private async copyPublishedUrl(file: TFile) {
    const url = publishedUrl(
      this.settings.publishUrl,
      file.basename,
      this.settings.slugStyle
    );
    await navigator.clipboard.writeText(url);
    new Notice(`URL copied: ${url}`);
  }
}
