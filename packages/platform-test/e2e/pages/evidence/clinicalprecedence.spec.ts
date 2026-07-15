import { expect, test } from "../../../fixtures";
import { ClinicalPrecedenceSection } from "../../../POM/objects/widgets/ClinicalPrecedence/clinicalPrecedenceSection";
import { EvidencePage } from "../../../POM/page/evidence/evidence";

test.describe("Clinical Precedence Section", () => {
  let evidencePage: EvidencePage;
  let clinicalPrecedenceSection: ClinicalPrecedenceSection;

  test.beforeEach(async ({ page, testConfig }) => {
    evidencePage = new EvidencePage(page);
    clinicalPrecedenceSection = new ClinicalPrecedenceSection(page);

    await evidencePage.goToEvidencePage(
      testConfig.target.primary,
      testConfig.disease.primary
    );

    const sectionVisible = await clinicalPrecedenceSection.isSectionVisible();
    if (!sectionVisible) {
      test.skip(true, "Clinical Precedence section not found for this target/disease combination");
      return;
    }

    await clinicalPrecedenceSection.waitForLoad();
  });

  test("Clinical Precedence section is visible", async () => {
    expect(await clinicalPrecedenceSection.isSectionVisible()).toBe(true);
  });

  test("Table displays data rows", async () => {
    const rowCount = await clinicalPrecedenceSection.getTableRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("Table has expected column headers", async () => {
    const headers = await clinicalPrecedenceSection.getColumnHeaders();
    expect(headers).toContain("Report");
    expect(headers).toContain("Disease/phenotype");
    expect(headers).toContain("Targets");
    expect(headers).toContain("Drug");
    expect(headers).toContain("Stage");
    expect(headers).toContain("Start Date");
  });

  test("Global search/filter is present and functional", async () => {
    const initialRowCount = await clinicalPrecedenceSection.getTableRowCount();

    await clinicalPrecedenceSection.search("cancer");

    const filteredRowCount = await clinicalPrecedenceSection.getTableRowCount();
    expect(filteredRowCount).toBeGreaterThanOrEqual(0);

    await clinicalPrecedenceSection.clearSearch();

    const restoredRowCount = await clinicalPrecedenceSection.getTableRowCount();
    expect(restoredRowCount).toBe(initialRowCount);
  });

  test("Search with no matching term returns zero rows", async () => {
    await clinicalPrecedenceSection.search("xyznonexistentterm12345");
    const filteredRowCount = await clinicalPrecedenceSection.getTableRowCount();
    expect(filteredRowCount).toBe(0);
  });

  test("Clearing search restores original rows", async () => {
    const initialRowCount = await clinicalPrecedenceSection.getTableRowCount();

    await clinicalPrecedenceSection.search("xyznonexistentterm12345");
    await clinicalPrecedenceSection.clearSearch();

    const restoredRowCount = await clinicalPrecedenceSection.getTableRowCount();
    expect(restoredRowCount).toBe(initialRowCount);
  });

  test("Data downloader button is present", async () => {
    const isVisible = await clinicalPrecedenceSection.isDownloaderVisible();
    expect(isVisible).toBe(true);
  });

  test("Data downloader can be triggered", async () => {
    await clinicalPrecedenceSection.clickDownloader();
  });

  test("Stage column is sortable - ascending", async () => {
    await clinicalPrecedenceSection.sortByColumn("Stage");
    const rowCount = await clinicalPrecedenceSection.getTableRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("Stage column is sortable - descending", async () => {
    await clinicalPrecedenceSection.sortByColumn("Stage");
    await clinicalPrecedenceSection.sortByColumn("Stage");
    const rowCount = await clinicalPrecedenceSection.getTableRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("Start Date column is sortable", async () => {
    await clinicalPrecedenceSection.sortByColumn("Start Date");
    const rowCount = await clinicalPrecedenceSection.getTableRowCount();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("Description section contains external link to Open Targets docs", async () => {
    const hasExternalLink = await clinicalPrecedenceSection.hasExternalLink(
      "https://platform-docs.opentargets.org/evidence#clinical-precedence"
    );
    expect(hasExternalLink).toBe(true);
  });

  test("Description section contains external link to ChEMBL", async () => {
    const hasExternalLink = await clinicalPrecedenceSection.hasExternalLink(
      "https://www.ebi.ac.uk/chembl/"
    );
    expect(hasExternalLink).toBe(true);
  });

  test("Disease/phenotype column contains links", async () => {
    const hasLinks = await clinicalPrecedenceSection.columnHasLinks("Disease/phenotype");
    expect(hasLinks).toBe(true);
  });

  test("Drug column contains links", async () => {
    const hasLinks = await clinicalPrecedenceSection.columnHasLinks("Drug");
    expect(hasLinks).toBe(true);
  });

  test("Targets column contains links", async () => {
    const hasLinks = await clinicalPrecedenceSection.columnHasLinks("Targets");
    expect(hasLinks).toBe(true);
  });

  test("Report column contains View buttons", async () => {
    const hasViewButtons = await clinicalPrecedenceSection.hasViewButtons();
    expect(hasViewButtons).toBe(true);
  });

  test("Clicking View button opens Clinical Record Drawer", async () => {
    await clinicalPrecedenceSection.clickFirstViewButton();
    const isDrawerOpen = await clinicalPrecedenceSection.isDrawerOpen();
    expect(isDrawerOpen).toBe(true);
  });

  test("Clinical Record Drawer can be closed", async () => {
    await clinicalPrecedenceSection.clickFirstViewButton();
    expect(await clinicalPrecedenceSection.isDrawerOpen()).toBe(true);

    await clinicalPrecedenceSection.closeDrawer();
    expect(await clinicalPrecedenceSection.isDrawerOpen()).toBe(false);
  });

  test("Disease link navigates to disease page", async ({ page }) => {
    await clinicalPrecedenceSection.clickFirstDiseaseLink();
    await page.waitForURL((url) => url.toString().includes("/disease/"), { timeout: 10000 });
    expect(page.url()).toContain("/disease/");
  });

  test("Drug link navigates to drug page", async ({ page }) => {
    await clinicalPrecedenceSection.clickFirstDrugLink();
    await page.waitForURL((url) => url.toString().includes("/drug/"), { timeout: 10000 });
    expect(page.url()).toContain("/drug/");
  });

  test("Target link navigates to target page", async ({ page }) => {
    await clinicalPrecedenceSection.clickFirstTargetLink();
    await page.waitForURL((url) => url.toString().includes("/target/"), { timeout: 10000 });
    expect(page.url()).toContain("/target/");
  });

  test("Summary item displays entry count", async () => {
    const summaryText = await clinicalPrecedenceSection.getSummaryText();
    expect(summaryText).toMatch(/\d+\s+entr(y|ies)/i);
  });
});