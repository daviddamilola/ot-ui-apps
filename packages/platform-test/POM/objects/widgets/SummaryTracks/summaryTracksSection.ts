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
    return this.page.locator("[data-testid='summaryTracks-description']");
  }

  async getDescriptionText(): Promise<string | null> {
    return await this.getDescription().textContent();
  }

  async isDescriptionVisible(): Promise<boolean> {
    return await this.getDescription().isVisible();
  }

  // Genomic track visualization
  getGenomicTrack(): Locator {
    return this.getSection().locator("[data-testid='genomic-track']");
  }

  async isGenomicTrackVisible(): Promise<boolean> {
    return await this.getGenomicTrack()
      .isVisible()
      .catch(() => false);
  }

  // Chart/visualization container
  getVisualizationContainer(): Locator {
    return this.getSection().locator("svg, canvas, .chart-container");
  }

  async isVisualizationVisible(): Promise<boolean> {
    return await this.getVisualizationContainer()
      .isVisible()
      .catch(() => false);
  }

  // Tooltip interactions
  async hoverOnTrackElement(elementIndex: number = 0): Promise<void> {
    const trackElements = this.getSection().locator("[data-track-element]");
    if (await trackElements.count() > elementIndex) {
      await trackElements.nth(elementIndex).hover();
    }
  }

  getTooltip(): Locator {
    return this.page.locator("[data-testid='genomic-tooltip'], .tooltip");
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

  // Page info
  getPageInfo(): Locator {
    return this.getSection().locator("[data-testid='page-info'], .pagination-info");
  }

  async getPageInfoText(): Promise<string | null> {
    return await this.getPageInfo()
      .textContent()
      .catch(() => null);
  }

  // Loading states
  getLoadingIndicator(): Locator {
    return this.getSection().locator("[data-testid='section-loader'], .loading");
  }

  async isLoading(): Promise<boolean> {
    return await this.getLoadingIndicator()
      .isVisible()
      .catch(() => false);
  }

  // Wait for section to load
  async waitForSectionLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
    // Wait for loading to complete
    await this.page.waitForFunction(
      () => !document.querySelector("[data-testid='section-loader']"),
      { timeout: 30000 }
    );
    await this.page.waitForTimeout(500);
  }

  // Wait for visualization to render
  async waitForVisualizationLoad(): Promise<void> {
    await this.getVisualizationContainer().waitFor({ state: "visible" });
    await this.page.waitForTimeout(1000); // Allow time for chart rendering
  }

  // Variant data interactions
  getVariantElements(): Locator {
    return this.getSection().locator("[data-variant-id]");
  }

  async getVariantCount(): Promise<number> {
    return await this.getVariantElements().count();
  }

  async clickVariant(variantIndex: number): Promise<void> {
    await this.getVariantElements().nth(variantIndex).click();
  }

  // Credible set data
  getCredibleSetInfo(): Locator {
    return this.getSection().locator("[data-testid='credible-set-info']");
  }

  async getCredibleSetData(): Promise<string | null> {
    return await this.getCredibleSetInfo()
      .textContent()
      .catch(() => null);
  }
}