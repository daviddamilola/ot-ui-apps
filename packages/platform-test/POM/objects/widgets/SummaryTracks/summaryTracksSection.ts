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
  getSectionLoader(): Locator {
    return this.getSection().locator("[data-testid='section-loader']");
  }

  async isLoading(): Promise<boolean> {
    return await this.getSectionLoader()
      .isVisible()
      .catch(() => false);
  }

  // Summary item
  getSummaryItem(): Locator {
    return this.getSection().locator("[data-testid='summary-item']");
  }

  async isSummaryVisible(): Promise<boolean> {
    return await this.getSummaryItem()
      .isVisible()
      .catch(() => false);
  }

  // Description section
  getDescription(): Locator {
    return this.getSection().locator("[data-testid='section-description']");
  }

  async getDescriptionText(): Promise<string | null> {
    return await this.getDescription().textContent();
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
    return this.getSection().locator("svg, canvas, .chart-container");
  }

  async isChartVisible(): Promise<boolean> {
    return await this.getChartContainer()
      .first()
      .isVisible()
      .catch(() => false);
  }

  // Tooltip interactions
  async hoverOnTrackElement(elementIndex: number = 0): Promise<void> {
    const trackElements = this.getGenTrackContainer().locator("[data-tooltip]");
    await trackElements.nth(elementIndex).hover();
  }

  getTooltip(): Locator {
    return this.page.locator("[data-testid='gen-track-tooltip'], .tooltip");
  }

  async isTooltipVisible(): Promise<boolean> {
    return await this.getTooltip()
      .isVisible()
      .catch(() => false);
  }

  async getTooltipContent(): Promise<string | null> {
    return await this.getTooltip().textContent();
  }

  // Pagination controls
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

  async isPaginationVisible(): Promise<boolean> {
    const nextButton = await this.getNextPageButton().isVisible().catch(() => false);
    const prevButton = await this.getPreviousPageButton().isVisible().catch(() => false);
    return nextButton || prevButton;
  }

  // Data loading and content
  async waitForDataLoad(): Promise<void> {
    // Wait for loading to disappear
    await this.getSectionLoader().waitFor({ state: "hidden" }).catch(() => {});
    // Wait for content to appear
    await this.getGenTrackContainer().waitFor({ state: "visible" }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  // Wait for section to load
  async waitForSectionLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
    await this.waitForDataLoad();
  }

  // Genomic track specific interactions
  async getTrackVariantCount(): Promise<number> {
    const variants = this.getGenTrackContainer().locator("[data-variant-id]");
    return await variants.count().catch(() => 0);
  }

  async clickVariant(variantIndex: number): Promise<void> {
    const variants = this.getGenTrackContainer().locator("[data-variant-id]");
    await variants.nth(variantIndex).click();
  }

  // Check for error states
  getErrorMessage(): Locator {
    return this.getSection().locator("[data-testid='error-message'], .error");
  }

  async hasError(): Promise<boolean> {
    return await this.getErrorMessage()
      .isVisible()
      .catch(() => false);
  }

  async getErrorText(): Promise<string | null> {
    return await this.getErrorMessage().textContent();
  }
}