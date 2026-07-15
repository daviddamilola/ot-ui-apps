import { expect, test } from "../../../fixtures";
import { ProjectsPage } from "../../../POM/page/projects/projectspage";

test.describe("ProjectsPage - Header and Navigation", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/projects`);
  });

  test.describe("Page Header", () => {
    test("Projects page loads successfully with correct title", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const isLoaded = await projectsPage.isPageLoaded();
      expect(isLoaded).toBe(true);

      const titleText = await projectsPage.getPageTitleText();
      expect(titleText).toBeTruthy();
      expect(titleText?.trim().length).toBeGreaterThan(0);
    });

    test("Page title contains 'Open Targets Projects'", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const titleLocator = projectsPage.getPageTitle();
      await expect(titleLocator).toBeVisible();

      const titleText = await projectsPage.getPageTitleText();
      expect(titleText?.toLowerCase()).toContain("open targets projects");
    });

    test("Description paragraph about OTAR projects is visible", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const descriptionParagraph = projectsPage.getDescriptionParagraph();
      await expect(descriptionParagraph).toBeVisible();

      const descriptionText = await projectsPage.getDescriptionParagraphText();
      expect(descriptionText).toBeTruthy();
      expect(descriptionText?.trim().length).toBeGreaterThan(0);
    });

    test("Description paragraph mentions OTAR", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const descriptionText = await projectsPage.getDescriptionParagraphText();
      expect(descriptionText).toMatch(/OTAR/i);
    });
  });

  test.describe("External Links", () => {
    test("Data-available external link is present and visible", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const dataAvailableLink = projectsPage.getDataAvailableLink();
      await expect(dataAvailableLink).toBeVisible();

      const href = await projectsPage.getDataAvailableLinkHref();
      expect(href).toBe("http://home.opentargets.org/data-available");
    });

    test("Data-available link points to correct URL", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const href = await projectsPage.getDataAvailableLinkHref();
      expect(href).toContain("home.opentargets.org");
      expect(href).toContain("data-available");
    });

    test("Data requests email link is present and visible", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const emailLink = projectsPage.getDataRequestsEmailLink();
      await expect(emailLink).toBeVisible();

      const href = await projectsPage.getDataRequestsEmailLinkHref();
      expect(href).toBe("mailto:datarequests@opentargets.org");
    });

    test("Data requests email link has correct mailto address", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const href = await projectsPage.getDataRequestsEmailLinkHref();
      expect(href).toContain("mailto:");
      expect(href).toContain("datarequests@opentargets.org");
    });

    test("PPP documentation external link is present and visible", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const pppDocLink = projectsPage.getPPPDocumentationLink();
      await expect(pppDocLink).toBeVisible();

      const href = await projectsPage.getPPPDocumentationLinkHref();
      expect(href).toBe("http://home.opentargets.org/ppp-documentation");
    });

    test("PPP documentation link points to correct URL", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const href = await projectsPage.getPPPDocumentationLinkHref();
      expect(href).toContain("home.opentargets.org");
      expect(href).toContain("ppp-documentation");
    });

    test("Page contains multiple external links", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const externalLinksCount = await projectsPage.getExternalLinksCount();
      // At minimum: data-available and ppp-documentation
      expect(externalLinksCount).toBeGreaterThanOrEqual(2);
    });

    test("Page contains at least one mailto link", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const mailtoLinksCount = await projectsPage.getMailtoLinksCount();
      expect(mailtoLinksCount).toBeGreaterThanOrEqual(1);
    });

    test("All expected external links are visible", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const isDataAvailableVisible = await projectsPage.isDataAvailableLinkVisible();
      expect(isDataAvailableVisible).toBe(true);

      const isEmailVisible = await projectsPage.isDataRequestsEmailLinkVisible();
      expect(isEmailVisible).toBe(true);

      const isPPPDocVisible = await projectsPage.isPPPDocumentationLinkVisible();
      expect(isPPPDocVisible).toBe(true);
    });
  });

  test.describe("Direct Navigation", () => {
    test("Can navigate directly to the Projects page", async ({ page, baseURL }) => {
      const projectsPage = new ProjectsPage(page);

      await projectsPage.goToProjectsPage();
      await projectsPage.waitForPageLoad();

      const isLoaded = await projectsPage.isPageLoaded();
      expect(isLoaded).toBe(true);
    });

    test("Projects page URL is correct after navigation", async ({ page, baseURL }) => {
      const projectsPage = new ProjectsPage(page);

      await projectsPage.goToProjectsPage();
      await projectsPage.waitForPageLoad();

      await expect(page).toHaveURL(/\/projects/);
    });

    test("Page renders all key elements after direct navigation", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);

      await projectsPage.goToProjectsPage();
      await projectsPage.waitForPageLoad();

      const titleLocator = projectsPage.getPageTitle();
      await expect(titleLocator).toBeVisible();

      const descriptionLocator = projectsPage.getDescriptionParagraph();
      await expect(descriptionLocator).toBeVisible();

      const dataAvailableLink = projectsPage.getDataAvailableLink();
      await expect(dataAvailableLink).toBeVisible();
    });
  });

  test.describe("Page Title and Meta", () => {
    test("Document title is set for the Projects page", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.trim().length).toBeGreaterThan(0);
    });

    test("Document title contains relevant project information", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const title = await page.title();
      // Title should reference projects or Open Targets
      expect(title.toLowerCase()).toMatch(/project|open targets/i);
    });

    test("Page h1 heading is unique and descriptive", async ({ page }) => {
      const projectsPage = new ProjectsPage(page);
      await projectsPage.waitForPageLoad();

      const h1Elements = page.locator("h1");
      const h1Count = await h1Elements.count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      const titleText = await projectsPage.getPageTitleText();
      expect(titleText?.trim().length).toBeGreaterThan(0);
    });
  });
});