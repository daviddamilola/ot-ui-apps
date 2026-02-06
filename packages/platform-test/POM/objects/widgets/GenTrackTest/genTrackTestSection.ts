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

  // Chart/Visualization container
  getVisualizationContainer(): Locator {
    return this.getSection().locator("[data-gentrack-provider]");
  }

  async isVisualizationVisible(): Promise<boolean> {
    return await this.getVisualizationContainer()
      .isVisible()
      .catch(() => false);
  }

  // SVG elements for track visualization
  getTrackSvg(): Locator {
    return this.getVisualizationContainer().locator("svg");
  }

  async isTrackSvgVisible(): Promise<boolean> {
    return await this.getTrackSvg()
      .isVisible()
      .catch(() => false);
  }

  // Long rectangles (track elements)
  getLongRectangles(): Locator {
    return this.getTrackSvg().locator("rect[data-track-type='long']");
  }

  async getLongRectangleCount(): Promise<number> {
    return await this.getLongRectangles().count();
  }

  // Short rectangles (data points)
  getShortRectangles(): Locator {
    return this.getTrackSvg().locator("rect[data-track-type='short']");
  }

  async getShortRectangleCount(): Promise<number> {
    return await this.getShortRectangles().count();
  }

  // Bar chart elements
  getBars(): Locator {
    return this.getTrackSvg().locator("rect[data-track-type='bar']");
  }

  async getBarCount(): Promise<number> {
    return await this.getBars().count();
  }

  // Tooltip interactions
  getTooltip(): Locator {
    return this.page.locator("[data-gentrack-tooltip]");
  }

  async isTooltipVisible(): Promise<boolean> {
    return await this.getTooltip()
      .isVisible()
      .catch(() => false);
  }

  async hoverOnVisualizationElement(elementIndex: number = 0): Promise<void> {
    const elements = this.getShortRectangles();
    if (await elements.count() > elementIndex) {
      await elements.nth(elementIndex).hover();
    }
  }

  async getTooltipContent(): Promise<string | null> {
    return await this.getTooltip().textContent();
  }

  // Track interaction methods
  async clickOnTrackElement(elementIndex: number = 0): Promise<void> {
    const elements = this.getShortRectangles();
    if (await elements.count() > elementIndex) {
      await elements.nth(elementIndex).click();
    }
  }

  async clickOnBar(barIndex: number = 0): Promise<void> {
    const bars = this.getBars();
    if (await bars.count() > barIndex) {
      await bars.nth(barIndex).click();
    }
  }

  // Wait for section and visualization to load
  async waitForSectionLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
    await this.page.waitForTimeout(500);
  }

  async waitForVisualizationLoad(): Promise<void> {
    await this.getVisualizationContainer().waitFor({ state: "visible" });
    await this.getTrackSvg().waitFor({ state: "visible" });
    await this.page.waitForTimeout(1000); // Allow time for data rendering
  }

  // Zoom and pan interactions (if supported by GenTrack)
  async zoomIn(): Promise<void> {
    await this.getVisualizationContainer().press("Control+=");
  }

  async zoomOut(): Promise<void> {
    await this.getVisualizationContainer().press("Control+-");
  }

  async panLeft(): Promise<void> {
    await this.getVisualizationContainer().press("ArrowLeft");
  }

  async panRight(): Promise<void> {
    await this.getVisualizationContainer().press("ArrowRight");
  }
}