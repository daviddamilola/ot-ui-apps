import { expect, test } from "../../../fixtures";
import { DrugPage } from "../../../POM/page/drug/drugpage";

test.describe("Drug Page - Header and Navigation", () => {
  test.beforeEach(async ({ page, baseURL, testConfig }) => {
    const chemblId = testConfig.drug?.primary || "CHEMBL25";
    await page.goto(`${baseURL}/drug/${chemblId}`);
  });

  test.describe("Page Header", () => {
    test("Drug page loads successfully with correct title and name", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const isLoaded = await drugPage.isPageLoaded();
      expect(isLoaded).toBe(true);

      const nameText = await drugPage.getDrugNameText();
      expect(nameText).toBeTruthy();
      expect(nameText?.trim().length).toBeGreaterThan(0);
    });

    test("Drug page displays ChEMBL ID in subtitle", async ({ page, testConfig }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const subtitleText = await drugPage.getChemblIdSubtitleText();
      expect(subtitleText).toBeTruthy();

      const chemblId = testConfig.drug?.primary || "CHEMBL25";
      expect(subtitleText).toContain(chemblId);
    });

    test("Drug name element is visible in header", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const drugName = drugPage.getDrugName();
      await expect(drugName).toBeVisible();
    });

    test("ChEMBL ID subtitle element is visible in header", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const subtitle = drugPage.getChemblIdSubtitle();
      await expect(subtitle).toBeVisible();
    });
  });

  test.describe("External Links", () => {
    test("ChEMBL link is present and correct", async ({ page, testConfig }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const chemblLink = drugPage.getChemblLink();
      await expect(chemblLink).toBeVisible();

      const href = await drugPage.getChemblLinkHref();
      expect(href).toContain("ebi.ac.uk/chembl/compound_report_card");

      const chemblId = testConfig.drug?.primary || "CHEMBL25";
      expect(href).toContain(chemblId);
    });

    test("DrugBank link is present when available", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const isVisible = await drugPage.isDrugBankLinkVisible();
      if (isVisible) {
        const href = await drugPage.getDrugBankLinkHref();
        expect(href).toContain("drugbank.ca");
      }
    });

    test("ChEBI link is present when available", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const isVisible = await drugPage.isChEBILinkVisible();
      if (isVisible) {
        const href = await drugPage.getChEBILinkHref();
        expect(href).toContain("ebi.ac.uk/chebi");
      }
    });

    test("DailyMed link is present when available", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const isVisible = await drugPage.isDailyMedLinkVisible();
      if (isVisible) {
        const href = await drugPage.getDailyMedLinkHref();
        expect(href).toContain("dailymed.nlm.nih.gov");
      }
    });

    test("DrugCentral link is present when available", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const isVisible = await drugPage.isDrugCentralLinkVisible();
      if (isVisible) {
        const href = await drugPage.getDrugCentralLinkHref();
        expect(href).toContain("drugcentral.org");
      }
    });

    test("Wikipedia link is present when available", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const isVisible = await drugPage.isWikipediaLinkVisible();
      if (isVisible) {
        const href = await drugPage.getWikipediaLinkHref();
        expect(href).toContain("wikipedia.org");
      }
    });

    test("Probes & Drugs link is present when available", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const isVisible = await drugPage.isProbesAndDrugsLinkVisible();
      if (isVisible) {
        const href = await drugPage.getProbesAndDrugsLinkHref();
        expect(href).toContain("probes-drugs.org");
      }
    });

    test("External links section has at least one link (ChEMBL)", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const linksCount = await drugPage.getExternalLinksCount();
      expect(linksCount).toBeGreaterThanOrEqual(1);
    });

    test("All external link hrefs are valid URLs", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const hrefs = await drugPage.getAllExternalLinkHrefs();
      expect(hrefs.length).toBeGreaterThan(0);

      for (const href of hrefs) {
        expect(href).toBeTruthy();
        expect(href).toMatch(/^https?:\/\//);
      }
    });

    test("ChEMBL link is always visible as a required external link", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const isVisible = await drugPage.isChemblLinkVisible();
      expect(isVisible).toBe(true);
    });
  });

  test.describe("Tab Navigation", () => {
    test("Profile tab is visible", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const profileTab = drugPage.getProfileTab();
      await expect(profileTab).toBeVisible();
    });

    test("Profile tab is active by default", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const isActive = await drugPage.isProfileTabActive();
      expect(isActive).toBe(true);
    });

    test("Clicking Profile tab keeps user on profile page", async ({ page, testConfig }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      await drugPage.clickProfileTab();

      const chemblId = testConfig.drug?.primary || "CHEMBL25";
      await expect(page).toHaveURL(new RegExp(`/drug/${chemblId}$`));

      const isActive = await drugPage.isProfileTabActive();
      expect(isActive).toBe(true);
    });

    test("Profile tab remains active after clicking", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      await drugPage.clickProfileTab();

      const isActive = await drugPage.isProfileTabActive();
      expect(isActive).toBe(true);
    });
  });

  test.describe("Direct Navigation", () => {
    test("Can navigate directly to drug profile page", async ({ page, baseURL, testConfig }) => {
      const chemblId = testConfig.drug?.primary || "CHEMBL25";
      const drugPage = new DrugPage(page);

      await drugPage.goToDrugPage(chemblId);
      await drugPage.waitForPageLoad();

      const isLoaded = await drugPage.isPageLoaded();
      expect(isLoaded).toBe(true);
    });

    test("Profile tab is active on direct navigation to drug page", async ({
      page,
      baseURL,
      testConfig,
    }) => {
      const chemblId = testConfig.drug?.primary || "CHEMBL25";
      const drugPage = new DrugPage(page);

      await drugPage.goToDrugPage(chemblId);
      await drugPage.waitForPageLoad();

      const isActive = await drugPage.isProfileTabActive();
      expect(isActive).toBe(true);
    });

    test("Drug page URL contains the correct ChEMBL ID", async ({ page, testConfig }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const chemblId = testConfig.drug?.primary || "CHEMBL25";
      await expect(page).toHaveURL(new RegExp(`/drug/${chemblId}`));
    });

    test("Navigating to a different drug loads the correct drug", async ({
      page,
      baseURL,
      testConfig,
    }) => {
      const chemblId = testConfig.drug?.secondary || "CHEMBL192";
      const drugPage = new DrugPage(page);

      await drugPage.goToDrugPage(chemblId);
      await drugPage.waitForPageLoad();

      const isLoaded = await drugPage.isPageLoaded();
      expect(isLoaded).toBe(true);

      await expect(page).toHaveURL(new RegExp(`/drug/${chemblId}`));
    });
  });

  test.describe("Page Title and Meta", () => {
    test("Drug profile page has a non-empty document title", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.trim().length).toBeGreaterThan(0);
    });

    test("Drug profile page title contains relevant drug information", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      const title = await page.title();
      const nameText = await drugPage.getDrugNameText();

      // Title should contain either the drug name or ChEMBL ID
      const subtitleText = await drugPage.getChemblIdSubtitleText();
      const hasRelevantContent =
        (nameText && title.includes(nameText.trim())) ||
        (subtitleText && title.includes(subtitleText.trim())) ||
        title.toLowerCase().includes("drug") ||
        title.toLowerCase().includes("chembl");

      expect(hasRelevantContent).toBe(true);
    });

    test("Page has correct meta structure after load", async ({ page }) => {
      const drugPage = new DrugPage(page);
      await drugPage.waitForPageLoad();

      // Verify the page has loaded with proper content
      const isLoaded = await drugPage.isPageLoaded();
      expect(isLoaded).toBe(true);

      // Verify the URL is correct
      await expect(page).toHaveURL(/\/drug\/CHEMBL/i);
    });
  });
});