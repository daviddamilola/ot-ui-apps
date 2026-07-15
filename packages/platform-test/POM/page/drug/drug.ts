import type { Locator, Page } from "@playwright/test";

/**
 * DrugPage Page Object Model
 * Handles navigation and interactions on the Drug page
 */
export class DrugPage {
  page: Page;
  originalURL: string;

  constructor(page: Page) {
    this.page = page;
    this.originalURL = page.url();
  }

  /**
   * Navigate to a drug page by ChEMBL ID
   * @param chemblId - ChEMBL identifier (e.g., "CHEMBL25")
   */
  async goToDrugPage(chemblId: string): Promise<void> {
    await this.page.goto(`/drug/${chemblId}`);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get the URL for the profile page
   */
  getProfilePageUrl(): string {
    return this.originalURL.replace(/\/drug\/[^/]+$/, "");
  }

  /**
   * Navigate to the profile tab
   */
  async goToProfilePage(): Promise<void> {
    await this.page.goto(this.originalURL);
    await this.page.waitForLoadState("networkidle");
  }

  // Tab navigation

  /**
   * Get the Profile tab element
   */
  getProfileTab(): Locator {
    return this.page.locator("[role='tab']").filter({ hasText: /profile/i });
  }

  /**
   * Click on the Profile tab
   */
  async clickProfileTab(): Promise<void> {
    await this.getProfileTab().click();
    await this.page.waitForURL(/\/drug\/[^/]+$/);
  }

  /**
   * Check if Profile tab is active
   */
  async isProfileTabActive(): Promise<boolean> {
    const tab = this.getProfileTab();
    const isSelected = await tab.getAttribute("aria-selected");
    return isSelected === "true";
  }

  // Header elements

  /**
   * Get the drug name (main title) in the header
   */
  getDrugName(): Locator {
    return this.page.locator("[data-testid='profile-page-header-text']");
  }

  /**
   * Get the drug name text
   */
  async getDrugNameText(): Promise<string | null> {
    return await this.getDrugName().textContent();
  }

  /**
   * Get the ChEMBL ID subtitle/fallback in the header
   */
  getChemblIdSubtitle(): Locator {
    return this.page.locator("[data-testid='profile-page-header-block'] h5");
  }

  /**
   * Get the ChEMBL ID subtitle text
   */
  async getChemblIdSubtitleText(): Promise<string | null> {
    return await this.getChemblIdSubtitle().textContent();
  }

  // External links

  /**
   * Get the ChEMBL external link
   */
  getChemblLink(): Locator {
    return this.page.locator('a[href*="ebi.ac.uk/chembl/compound_report_card"]');
  }

  /**
   * Get the ChEMBL link href attribute
   */
  async getChemblLinkHref(): Promise<string | null> {
    return await this.getChemblLink().getAttribute("href");
  }

  /**
   * Check if the ChEMBL link is visible
   */
  async isChemblLinkVisible(): Promise<boolean> {
    return await this.getChemblLink()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get the DrugBank external link (conditional)
   */
  getDrugBankLink(): Locator {
    return this.page.locator('a[href*="drugbank.ca"]');
  }

  /**
   * Get the DrugBank link href attribute (if available)
   */
  async getDrugBankLinkHref(): Promise<string | null> {
    const isVisible = await this.getDrugBankLink()
      .isVisible()
      .catch(() => false);
    if (!isVisible) return null;
    return await this.getDrugBankLink().getAttribute("href");
  }

  /**
   * Check if the DrugBank link is visible
   */
  async isDrugBankLinkVisible(): Promise<boolean> {
    return await this.getDrugBankLink()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get the ChEBI external link (conditional)
   */
  getChEBILink(): Locator {
    return this.page.locator('a[href*="ebi.ac.uk/chebi"]');
  }

  /**
   * Get the ChEBI link href attribute (if available)
   */
  async getChEBILinkHref(): Promise<string | null> {
    const isVisible = await this.getChEBILink()
      .isVisible()
      .catch(() => false);
    if (!isVisible) return null;
    return await this.getChEBILink().getAttribute("href");
  }

  /**
   * Check if the ChEBI link is visible
   */
  async isChEBILinkVisible(): Promise<boolean> {
    return await this.getChEBILink()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get the DailyMed external link (conditional)
   */
  getDailyMedLink(): Locator {
    return this.page.locator('a[href*="dailymed.nlm.nih.gov"]');
  }

  /**
   * Get the DailyMed link href attribute (if available)
   */
  async getDailyMedLinkHref(): Promise<string | null> {
    const isVisible = await this.getDailyMedLink()
      .isVisible()
      .catch(() => false);
    if (!isVisible) return null;
    return await this.getDailyMedLink().getAttribute("href");
  }

  /**
   * Check if the DailyMed link is visible
   */
  async isDailyMedLinkVisible(): Promise<boolean> {
    return await this.getDailyMedLink()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get the DrugCentral external link (conditional)
   */
  getDrugCentralLink(): Locator {
    return this.page.locator('a[href*="drugcentral.org"]');
  }

  /**
   * Get the DrugCentral link href attribute (if available)
   */
  async getDrugCentralLinkHref(): Promise<string | null> {
    const isVisible = await this.getDrugCentralLink()
      .isVisible()
      .catch(() => false);
    if (!isVisible) return null;
    return await this.getDrugCentralLink().getAttribute("href");
  }

  /**
   * Check if the DrugCentral link is visible
   */
  async isDrugCentralLinkVisible(): Promise<boolean> {
    return await this.getDrugCentralLink()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get the Wikipedia external link (conditional)
   */
  getWikipediaLink(): Locator {
    return this.page.locator('a[href*="wikipedia.org"]');
  }

  /**
   * Get the Wikipedia link href attribute (if available)
   */
  async getWikipediaLinkHref(): Promise<string | null> {
    const isVisible = await this.getWikipediaLink()
      .isVisible()
      .catch(() => false);
    if (!isVisible) return null;
    return await this.getWikipediaLink().getAttribute("href");
  }

  /**
   * Check if the Wikipedia link is visible
   */
  async isWikipediaLinkVisible(): Promise<boolean> {
    return await this.getWikipediaLink()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get the Probes & Drugs external link (conditional)
   */
  getProbesAndDrugsLink(): Locator {
    return this.page.locator('a[href*="probes-drugs.org"]');
  }

  /**
   * Get the Probes & Drugs link href attribute (if available)
   */
  async getProbesAndDrugsLinkHref(): Promise<string | null> {
    const isVisible = await this.getProbesAndDrugsLink()
      .isVisible()
      .catch(() => false);
    if (!isVisible) return null;
    return await this.getProbesAndDrugsLink().getAttribute("href");
  }

  /**
   * Check if the Probes & Drugs link is visible
   */
  async isProbesAndDrugsLinkVisible(): Promise<boolean> {
    return await this.getProbesAndDrugsLink()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get all external links in the header
   */
  getExternalLinks(): Locator {
    return this.page.locator("[data-testid='external-links'] a");
  }

  /**
   * Get the count of all external links
   */
  async getExternalLinksCount(): Promise<number> {
    return await this.getExternalLinks().count();
  }

  /**
   * Get all visible external link hrefs
   */
  async getAllExternalLinkHrefs(): Promise<(string | null)[]> {
    const links = this.getExternalLinks();
    const count = await links.count();
    const hrefs: (string | null)[] = [];
    for (let i = 0; i < count; i++) {
      hrefs.push(await links.nth(i).getAttribute("href"));
    }
    return hrefs;
  }

  // Page load utilities

  /**
   * Wait for the drug page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForSelector("[data-testid='profile-page-header-text']", {
      state: "visible",
    });
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Check if the page has loaded (header is visible)
   */
  async isPageLoaded(): Promise<boolean> {
    return await this.getDrugName()
      .isVisible()
      .catch(() => false);
  }
}