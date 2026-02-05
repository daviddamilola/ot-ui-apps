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

  // Loading state
  getLoadingMessage(): Locator {
    return this.getSection().locator("text=Loading data. This may take some time...");
  }

  async isLoadingVisible(): Promise<boolean> {
    return await this.getLoadingMessage()
      .isVisible()
      .catch(() => false);
  }

  // Description section
  getDescription(): Locator {
    return this.getSection().locator("[data-testid='section-description']");
  }

  async getDescriptionText(): Promise<string | null> {
    return await this.getDescription()
      .textContent()
      .catch(() => null);
  }

  async isDescriptionVisible(): Promise<boolean> {
    return await this.getDescription()
      .isVisible()
      .catch(() => false);
  }

  // Body content
  getBodyContent(): Locator {
    return this.getSection().locator("[data-testid='gentrack-test-body']");
  }

  async isBodyContentVisible(): Promise<boolean> {
    return await this.getBodyContent()
      .isVisible()
      .catch(() => false);
  }

  // Wait for section to load
  async waitForSectionLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
  }

  // Wait for content to finish loading
  async waitForContentLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
    // Wait for loading message to disappear
    await this.page.waitForFunction(
      () => !document.querySelector("text=Loading data. This may take some time...")?.isVisible,
      { timeout: 30000 }
    ).catch(() => {
      // Continue if loading message check fails
    });
  }
}