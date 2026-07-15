import type { Locator, Page } from "@playwright/test";

/**
 * Projects Page Object Model
 * Handles navigation and interactions on the Projects page
 */
export class ProjectsPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the Projects page
   */
  async goToProjectsPage(): Promise<void> {
    await this.page.goto("/projects");
    await this.page.waitForLoadState("networkidle");
  }

  // Page header elements

  /**
   * Get the main page title (h1)
   */
  getPageTitle(): Locator {
    return this.page.locator("h1").filter({ hasText: /open targets projects/i });
  }

  /**
   * Get the main page title text
   */
  async getPageTitleText(): Promise<string | null> {
    return await this.getPageTitle().textContent();
  }

  /**
   * Get the description paragraph about OTAR projects
   */
  getDescriptionParagraph(): Locator {
    return this.page.locator("p").filter({ hasText: /OTAR/i }).first();
  }

  /**
   * Get the description paragraph text
   */
  async getDescriptionParagraphText(): Promise<string | null> {
    return await this.getDescriptionParagraph().textContent();
  }

  // External links

  /**
   * Get the external link to the Open Targets data-available page
   */
  getDataAvailableLink(): Locator {
    return this.page.locator('a[href="http://home.opentargets.org/data-available"]');
  }

  /**
   * Get the href attribute of the data-available external link
   */
  async getDataAvailableLinkHref(): Promise<string | null> {
    return await this.getDataAvailableLink().getAttribute("href");
  }

  /**
   * Check if the data-available link is visible
   */
  async isDataAvailableLinkVisible(): Promise<boolean> {
    return await this.getDataAvailableLink()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get the email link to datarequests@opentargets.org
   */
  getDataRequestsEmailLink(): Locator {
    return this.page.locator('a[href="mailto:datarequests@opentargets.org"]');
  }

  /**
   * Get the href attribute of the data requests email link
   */
  async getDataRequestsEmailLinkHref(): Promise<string | null> {
    return await this.getDataRequestsEmailLink().getAttribute("href");
  }

  /**
   * Check if the data requests email link is visible
   */
  async isDataRequestsEmailLinkVisible(): Promise<boolean> {
    return await this.getDataRequestsEmailLink()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get the external link to the PPP documentation page
   */
  getPPPDocumentationLink(): Locator {
    return this.page.locator('a[href="http://home.opentargets.org/ppp-documentation"]');
  }

  /**
   * Get the href attribute of the PPP documentation external link
   */
  async getPPPDocumentationLinkHref(): Promise<string | null> {
    return await this.getPPPDocumentationLink().getAttribute("href");
  }

  /**
   * Check if the PPP documentation link is visible
   */
  async isPPPDocumentationLinkVisible(): Promise<boolean> {
    return await this.getPPPDocumentationLink()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get all external links on the page (non-mailto)
   */
  getExternalLinks(): Locator {
    return this.page.locator('a[href^="http"]');
  }

  /**
   * Get the count of all external links on the page
   */
  async getExternalLinksCount(): Promise<number> {
    return await this.getExternalLinks().count();
  }

  /**
   * Get all mailto links on the page
   */
  getMailtoLinks(): Locator {
    return this.page.locator('a[href^="mailto"]');
  }

  /**
   * Get the count of all mailto links on the page
   */
  async getMailtoLinksCount(): Promise<number> {
    return await this.getMailtoLinks().count();
  }

  /**
   * Wait for the Projects page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForSelector("h1", { state: "visible" });
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if the page has loaded (h1 title is visible)
   */
  async isPageLoaded(): Promise<boolean> {
    return await this.getPageTitle()
      .isVisible()
      .catch(() => false);
  }
}