import type { Locator, Page } from "@playwright/test";

/**
 * Interactor for the SummaryTracks section
 * Handles genomic track visualization with tooltip interactions and pagination
 */
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

  // Summary component
  getSummaryItem(): Locator {
    return this.getSection().locator("[data-testid='summary-item']");
  }

  async isSummaryVisible(): Promise<boolean> {
    return await this.getSummaryItem()
      .isVisible()
      .catch(() => false);
  }

  // Loading states
  getSectionLoader(): Locator {
    return this.getSection().locator("[data-testid='section-loader']");
  }

  async isLoading(): Promise<boolean> {
    return await this.getSectionLoader()
      .isVisible()
      .catch(() => false);
  }

  async getLoadingMessage(): Promise<string | null> {
    return await this.getSection()
      .locator("text=Loading data. This may take some time...")
      .textContent()
      .catch(() => null);
  }

  // Genomic track visualization
  getGenTrackContainer(): Locator {
    return this.getSection().locator("[data-testid='gen-track-container']");
  }

  async isGenTrackVisible(): Promise<boolean> {
    return await this.getGenTrackContainer()
      .isVisible()
      .catch(() => false);
  }

  // Chart/visualization elements
  getChartContainer(): Locator {
    return this.getSection().locator("svg, canvas, [data-testid='chart']");
  }

  async isChartVisible(): Promise<boolean> {
    return await this.getChartContainer()
      .first()
      .isVisible()
      .catch(() => false);
  }

  // Tooltip interactions
  getTooltip(): Locator {
    return this.page.locator("[data-testid='tooltip'], .tooltip");
  }

  async isTooltipVisible(): Promise<boolean> {
    return await this.getTooltip()
      .isVisible()
      .catch(() => false);
  }

  async getTooltipContent(): Promise<string | null> {
    return await this.getTooltip()
      .textContent()
      .catch(() => null);
  }

  async hoverOnChartElement(elementSelector: string): Promise<void> {
    await this.getChartContainer().locator(elementSelector).first().hover();
  }

  // Pagination (batch query based)
  getNextPageButton(): Locator {
    return this.getSection().locator("[data-testid='next-page-button'], button:has-text('Next')");
  }

  getPreviousPageButton(): Locator {
    return this.getSection().locator("[data-testid='previous-page-button'], button:has-text('Previous')");
  }

  async clickNextPage(): Promise<void> {
    await this.getNextPageButton().click();
  }

  async clickPreviousPage(): Promise<void> {
    await this.getPreviousPageButton().click();
  }

  async isNextPageEnabled(): Promise<boolean> {
    return await this.getNextPageButton()
      .isEnabled()
      .catch(() => false);
  }

  async isPreviousPageEnabled(): Promise<boolean> {
    return await this.getPreviousPageButton()
      .isEnabled()
      .catch(() => false);
  }

  // Description section
  getDescription(): Locator {
    return this.getSection().locator("[data-testid='description']");
  }

  async getDescriptionText(): Promise<string | null> {
    return await this.getDescription()
      .textContent()
      .catch(() => null);
  }

  // Wait for section to load completely
  async waitForSectionLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
    // Wait for loading to complete
    await this.page.waitForFunction(
      () => !document.querySelector("[data-testid='section-loader']"),
      { timeout: 30000 }
    );
    await this.page.waitForTimeout(500);
  }

  // Wait for genomic track to render
  async waitForGenTrackLoad(): Promise<void> {
    await this.getGenTrackContainer().waitFor({ state: "visible" });
    await this.page.waitForTimeout(1000); // Allow time for track rendering
  }

  // Variant-specific interactions (based on credibleSet data structure)
  getVariantElements(): Locator {
    return this.getChartContainer().locator("[data-variant-id]");
  }

  async getVariantCount(): Promise<number> {
    return await this.getVariantElements().count();
  }

  async clickVariant(variantId: string): Promise<void> {
    await this.getChartContainer()
      .locator(`[data-variant-id="${variantId}"]`)
      .click();
  }

  async hoverOnVariant(variantId: string): Promise<void> {
    await this.getChartContainer()
      .locator(`[data-variant-id="${variantId}"]`)
      .hover();
  }
}