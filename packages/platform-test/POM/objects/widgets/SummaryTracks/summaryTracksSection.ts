import type { Locator, Page } from "@playwright/test";

export class SummaryTracksSection {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Section container
  getSection(): Locator {
    return this.page.locator("[data-testid='section-summaryTracks']");
  }

  async isSectionVisible(): Promise<boolean> {
    return await this.getSection().isVisible();
  }

  // Section header
  getSectionHeader(): Locator {
    return this.page.locator("[data-testid='section-summaryTracks-header']");
  }

  async getSectionTitle(): Promise<string | null> {
    return await this.getSectionHeader().textContent();
  }

  // Loading state
  getLoader(): Locator {
    return this.page.locator("[data-testid='summary-tracks-loader']");
  }

  async isLoaderVisible(): Promise<boolean> {
    return await this.getLoader()
      .isVisible()
      .catch(() => false);
  }

  // Description
  getDescription(): Locator {
    return this.getSection().locator("[data-testid='summary-tracks-description']");
  }

  async getDescriptionText(): Promise<string | null> {
    return await this.getDescription()
      .textContent()
      .catch(() => null);
  }

  // Body content
  getBodyContent(): Locator {
    return this.getSection().locator("[data-testid='summary-tracks-body']");
  }

  async isBodyContentVisible(): Promise<boolean> {
    return await this.getBodyContent()
      .isVisible()
      .catch(() => false);
  }

  // Summary item
  getSummaryItem(): Locator {
    return this.getSection().locator("[data-testid='summary-tracks-summary']");
  }

  async isSummaryItemVisible(): Promise<boolean> {
    return await this.getSummaryItem()
      .isVisible()
      .catch(() => false);
  }

  // Error state
  getErrorState(): Locator {
    return this.getSection().locator("[data-testid='summary-tracks-error']");
  }

  async isErrorStateVisible(): Promise<boolean> {
    return await this.getErrorState()
      .isVisible()
      .catch(() => false);
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

  // Wait for section to load
  async waitForSectionLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
  }

  // Wait for data to finish loading
  async waitForDataLoad(): Promise<void> {
    await this.getLoader().waitFor({ state: "hidden" }).catch(() => {});
    await this.getBodyContent().waitFor({ state: "visible" });
  }
}