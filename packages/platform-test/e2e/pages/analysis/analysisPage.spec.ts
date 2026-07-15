import { expect, test } from "../../../fixtures";
import { AnalysisPage } from "../../../POM/page/analysis/analysispage";

test.describe("Analysis Page - Gene Set Enrichment Analysis", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/analysis`);
  });

  test.describe("Page Header", () => {
    test("Analysis page loads successfully", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const isLoaded = await analysisPage.isPageLoaded();
      expect(isLoaded).toBe(true);
    });

    test("Page title is visible and contains GSEA text", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const isTitleVisible = await analysisPage.isPageTitleVisible();
      expect(isTitleVisible).toBe(true);

      const titleText = await analysisPage.getPageTitleText();
      expect(titleText).toBeTruthy();
      expect(titleText?.trim().length).toBeGreaterThan(0);
      expect(titleText?.toLowerCase()).toContain("gene set enrichment analysis");
    });

    test("Page subtitle is visible and descriptive", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const isSubtitleVisible = await analysisPage.isPageSubtitleVisible();
      expect(isSubtitleVisible).toBe(true);

      const subtitleText = await analysisPage.getPageSubtitleText();
      expect(subtitleText).toBeTruthy();
      expect(subtitleText?.trim().length).toBeGreaterThan(0);
    });

    test("Page title is an h4 heading element", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const titleLocator = analysisPage.getPageTitle();
      await expect(titleLocator).toBeVisible();

      const tagName = await titleLocator.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe("h4");
    });

    test("Page header container is present", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const header = analysisPage.getPageHeader();
      await expect(header).toBeVisible();
    });

    test("Page title text is non-empty and meaningful", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const titleText = await analysisPage.getPageTitleText();
      expect(titleText).not.toBeNull();
      expect(titleText?.trim()).not.toBe("");
      expect(titleText?.trim().length).toBeGreaterThan(5);
    });

    test("Page subtitle provides GSEA functionality description", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const subtitleText = await analysisPage.getPageSubtitleText();
      expect(subtitleText).not.toBeNull();
      expect(subtitleText?.trim()).not.toBe("");
      expect(subtitleText?.trim().length).toBeGreaterThan(5);
    });
  });

  test.describe("Direct Navigation", () => {
    test("Can navigate directly to the analysis page", async ({ page, baseURL }) => {
      const analysisPage = new AnalysisPage(page);

      await analysisPage.goToAnalysisPage();
      await analysisPage.waitForPageLoad();

      const isLoaded = await analysisPage.isPageLoaded();
      expect(isLoaded).toBe(true);
    });

    test("URL contains /analysis route after navigation", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const isOnPage = await analysisPage.isOnAnalysisPage();
      expect(isOnPage).toBe(true);
    });

    test("Current URL matches the analysis route", async ({ page, baseURL }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const currentUrl = analysisPage.getCurrentUrl();
      expect(currentUrl).toContain("/analysis");
    });

    test("Page remains on analysis route after load", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      await expect(page).toHaveURL(/\/analysis/);
    });

    test("Navigating to /analysis via goToAnalysisPage method works correctly", async ({
      page,
    }) => {
      const analysisPage = new AnalysisPage(page);

      await analysisPage.goToAnalysisPage();

      const isOnPage = await analysisPage.isOnAnalysisPage();
      expect(isOnPage).toBe(true);

      const isLoaded = await analysisPage.isPageLoaded();
      expect(isLoaded).toBe(true);
    });
  });

  test.describe("Page Title and Meta", () => {
    test("Document title is set for the analysis page", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.trim().length).toBeGreaterThan(0);
    });

    test("Page renders without JavaScript errors", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => {
        errors.push(error.message);
      });

      const analysisPage = new AnalysisPage(page);
      await analysisPage.goToAnalysisPage();
      await analysisPage.waitForPageLoad();

      expect(errors).toHaveLength(0);
    });

    test("Page has correct heading hierarchy with h4 title", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const h4Elements = page.locator("h4");
      const count = await h4Elements.count();
      expect(count).toBeGreaterThanOrEqual(1);

      const titleLocator = analysisPage.getPageTitle();
      await expect(titleLocator).toBeVisible();
    });

    test("Analysis page content is fully rendered after network idle", async ({ page }) => {
      const analysisPage = new AnalysisPage(page);
      await analysisPage.waitForPageLoad();

      const isTitleVisible = await analysisPage.isPageTitleVisible();
      const isSubtitleVisible = await analysisPage.isPageSubtitleVisible();

      expect(isTitleVisible).toBe(true);
      expect(isSubtitleVisible).toBe(true);
    });
  });
});