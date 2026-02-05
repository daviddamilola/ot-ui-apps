import type { Locator, Page } from "@playwright/test";

export class GenTrackTestSection {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Section container
  getSection(): Locator {
    return this.page.locator("[data-testid='section-genTrackTest']");
  }

  async isSectionVisible(): Promise<boolean> {
    return await this.getSection().isVisible();
  }

  // Section header
  getSectionHeader(): Locator {
    return this.page.locator("[data-testid='section-genTrackTest-header']");
  }

  async getSectionTitle(): Promise<string | null> {
    return await this.getSectionHeader().textContent();
  }

  // Description
  getDescription(): Locator {
    return this.getSection().locator("[data-testid='section-description']");
  }

  async getDescriptionText(): Promise<string | null> {
    return await this.getDescription()
      .textContent()
      .catch(() => null);
  }

  // Loading message
  getLoadingMessage(): Locator {
    return this.getSection().locator("text=Loading data. This may take some time...");
  }

  async isLoadingMessageVisible(): Promise<boolean> {
    return await this.getLoadingMessage()
      .isVisible()
      .catch(() => false);
  }

  // Body content container
  getBodyContent(): Locator {
    return this.getSection().locator("[data-testid='body-content']");
  }

  async isBodyContentVisible(): Promise<boolean> {
    return await this.getBodyContent()
      .isVisible()
      .catch(() => false);
  }

  // Wait for section to load
  async waitForSectionLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
    // Wait for loading message to disappear if present
    await this.getLoadingMessage()
      .waitFor({ state: "hidden", timeout: 30000 })
      .catch(() => {});
  }

  // Wait for data to load completely
  async waitForDataLoad(): Promise<void> {
    await this.waitForSectionLoad();
    await this.page.waitForTimeout(1000);
  }
}