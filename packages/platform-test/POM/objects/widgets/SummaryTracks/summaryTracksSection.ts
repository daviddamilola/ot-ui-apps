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

  // Description
  getDescription(): Locator {
    return this.getSection().locator("[data-testid='section-description']");
  }

  async getDescriptionText(): Promise<string | null> {
    return await this.getDescription()
      .textContent()
      .catch(() => null);
  }

  // Body content
  getBodyContent(): Locator {
    return this.getSection().locator("[data-testid='body-content']");
  }

  async isBodyContentVisible(): Promise<boolean> {
    return await this.getBodyContent()
      .isVisible()
      .catch(() => false);
  }

  // Table (if present in BodyContent)
  getTable(): Locator {
    return this.getSection().locator("table");
  }

  async isTableVisible(): Promise<boolean> {
    return await this.getTable()
      .isVisible()
      .catch(() => false);
  }

  getTableRows(): Locator {
    return this.getTable().locator("tbody tr");
  }

  async getRowCount(): Promise<number> {
    return await this.getTableRows().count();
  }

  getCell(rowIndex: number, columnIndex: number): Locator {
    return this.getTableRows().nth(rowIndex).locator("td").nth(columnIndex);
  }

  // Loading states
  getLoadingMessage(): Locator {
    return this.getSection().locator("[data-testid='loading-message']");
  }

  async isLoadingMessageVisible(): Promise<boolean> {
    return await this.getLoadingMessage()
      .isVisible()
      .catch(() => false);
  }

  async getLoadingMessageText(): Promise<string | null> {
    return await this.getLoadingMessage()
      .textContent()
      .catch(() => null);
  }

  // Wait for section to load
  async waitForSectionLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
    // Wait for loading to complete
    await this.page.waitForFunction(
      () => !document.querySelector("[data-testid='loading-message']")?.isVisible(),
      { timeout: 30000 }
    ).catch(() => {});
    await this.page.waitForTimeout(500);
  }
}