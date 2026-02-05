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
    return this.getSection().locator("[data-testid='section-genTrackTest-description']");
  }

  async getDescriptionText(): Promise<string | null> {
    return await this.getDescription().textContent();
  }

  // Chart/Track visualization
  getTrackVisualization(): Locator {
    return this.getSection().locator("[data-testid='gentrack-container']");
  }

  async isTrackVisualizationVisible(): Promise<boolean> {
    return await this.getTrackVisualization()
      .isVisible()
      .catch(() => false);
  }

  // SVG elements for track visualization
  getTrackSvg(): Locator {
    return this.getTrackVisualization().locator("svg");
  }

  async isTrackSvgVisible(): Promise<boolean> {
    return await this.getTrackSvg()
      .isVisible()
      .catch(() => false);
  }

  // Long rectangles (track elements)
  getLongRects(): Locator {
    return this.getTrackSvg().locator("rect[data-type='long']");
  }

  async getLongRectsCount(): Promise<number> {
    return await this.getLongRects().count();
  }

  // Short rectangles (data points)
  getShortRects(): Locator {
    return this.getTrackSvg().locator("rect[data-type='short']");
  }

  async getShortRectsCount(): Promise<number> {
    return await this.getShortRects().count();
  }

  // Bars (histogram/chart elements)
  getBars(): Locator {
    return this.getTrackSvg().locator("rect[data-type='bar']");
  }

  async getBarsCount(): Promise<number> {
    return await this.getBars().count();
  }

  // Tooltip interactions
  getTooltip(): Locator {
    return this.page.locator("[data-testid='gentrack-tooltip']");
  }

  async isTooltipVisible(): Promise<boolean> {
    return await this.getTooltip()
      .isVisible()
      .catch(() => false);
  }

  async hoverOnTrackElement(elementIndex: number = 0): Promise<void> {
    const elements = this.getShortRects();
    if (await elements.count() > elementIndex) {
      await elements.nth(elementIndex).hover();
    }
  }

  async getTooltipContent(): Promise<string | null> {
    return await this.getTooltip().textContent();
  }

  // Loading states
  getLoadingIndicator(): Locator {
    return this.getSection().locator("[data-testid='loading-indicator']");
  }

  async isLoading(): Promise<boolean> {
    return await this.getLoadingIndicator()
      .isVisible()
      .catch(() => false);
  }

  async getLoadingMessage(): Promise<string | null> {
    return await this.getLoadingIndicator().textContent();
  }

  // Wait for section to load
  async waitForSectionLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
    // Wait for loading to complete
    await this.page.waitForFunction(
      () => !document.querySelector("[data-testid='loading-indicator']")?.isVisible,
      { timeout: 30000 }
    );
    await this.page.waitForTimeout(500);
  }

  // Wait for track visualization to render
  async waitForTrackVisualization(): Promise<void> {
    await this.getTrackVisualization().waitFor({ state: "visible" });
    await this.getTrackSvg().waitFor({ state: "visible" });
    // Wait for data elements to be rendered
    await this.page.waitForFunction(
      () => {
        const svg = document.querySelector("[data-testid='gentrack-container'] svg");
        return svg && svg.children.length > 0;
      },
      { timeout: 10000 }
    );
  }
}