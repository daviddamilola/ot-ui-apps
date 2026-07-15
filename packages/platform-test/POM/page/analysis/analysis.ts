import type { Locator, Page } from "@playwright/test";

/**
 * Analysis Page Object Model
 * Handles navigation and interactions on the Analysis page (Gene Set Enrichment Analysis)
 */
export class AnalysisPage {
  page: Page;
  originalURL: string;

  constructor(page: Page) {
    this.page = page;
    this.originalURL = page.url();
  }

  /**
   * Navigate to the Analysis page
   */
  async goToAnalysisPage(): Promise<void> {
    await this.page.goto("/analysis");
    await this.page.waitForLoadState("networkidle");
  }

  // Page header elements

  /**
   * Get the main page title (Gene Set Enrichment Analysis h4 heading)
   */
  getPageTitle(): Locator {
    return this.page.locator("h4").filter({ hasText: /gene set enrichment analysis/i });
  }

  /**
   * Get the text content of the main page title
   */
  async getPageTitleText(): Promise<string | null> {
    return await this.getPageTitle().textContent();
  }

  /**
   * Get the descriptive subtitle about GSEA functionality
   */
  getPageSubtitle(): Locator {
    return this.page.locator("h4 + *").first();
  }

  /**
   * Get the text content of the descriptive subtitle
   */
  async getPageSubtitleText(): Promise<string | null> {
    return await this.getPageSubtitle().textContent();
  }

  /**
   * Get the page header container element
   */
  getPageHeader(): Locator {
    return this.page.locator("header, [data-testid='page-header'], main > *").first();
  }

  /**
   * Check if the page title is visible
   */
  async isPageTitleVisible(): Promise<boolean> {
    return await this.getPageTitle()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Check if the subtitle is visible
   */
  async isPageSubtitleVisible(): Promise<boolean> {
    return await this.getPageSubtitle()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Wait for the Analysis page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForSelector("h4", {
      state: "visible",
    });
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if the page has loaded (title heading is visible)
   */
  async isPageLoaded(): Promise<boolean> {
    return await this.getPageTitle()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get the current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Check if the current URL matches the analysis route
   */
  async isOnAnalysisPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes("/analysis");
  }
}