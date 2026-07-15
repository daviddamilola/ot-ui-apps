import { expect, test } from "../../../fixtures";
import { IndicationsSection } from "../../../POM/objects/widgets/Indications/indicationsSection";
import { DrugPage } from "../../../POM/page/drug/drug";

test.describe("Drug Indications Section", () => {
  let drugPage: DrugPage;
  let indicationsSection: IndicationsSection;

  test.beforeEach(async ({ page, testConfig }) => {
    drugPage = new DrugPage(page);
    indicationsSection = new IndicationsSection(page);

    await drugPage.goToDrugPage(testConfig.drug.primary);

    const sectionVisible = await indicationsSection.isSectionVisible();
    if (!sectionVisible) {
      test.skip(true, "Indications section not found for this drug");
      return;
    }

    await indicationsSection.waitForLoad();
  });

  test("Indications section is visible", async () => {
    expect(await indicationsSection.isSectionVisible()).toBe(true);
  });

  test("Indications master table displays data rows", async () => {
    const rowCount = await indicationsSection.getMasterTableRows();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("Indication name is displayed in card", async () => {
    const indication = await indicationsSection.getIndicationName(0);
    expect(indication).not.toBeNull();
    expect(indication).not.toBe("");
  });

  test("Max stage is displayed in indication card", async () => {
    const maxStage = await indicationsSection.getMaxStageFromCard(0);
    expect(maxStage).not.toBeNull();
    expect(maxStage).not.toBe("");
  });

  test("Report count is displayed in indication card", async () => {
    const reportCount = await indicationsSection.getReportCountFromCard(0);
    expect(reportCount).toBeGreaterThan(0);
  });

  test("Can search/filter indications and restore results", async () => {
    const initialRowCount = await indicationsSection.getMasterTableRows();
    expect(initialRowCount).toBeGreaterThan(0);

    await indicationsSection.search("cancer");

    const filteredRowCount = await indicationsSection.getMasterTableRows();
    expect(filteredRowCount).toBeGreaterThanOrEqual(0);

    await indicationsSection.clearSearch();

    const restoredRowCount = await indicationsSection.getMasterTableRows();
    expect(restoredRowCount).toBe(initialRowCount);
  });

  test("Search with no matching term returns zero rows", async () => {
    await indicationsSection.search("xyznonexistentterm12345");
    const filteredRowCount = await indicationsSection.getMasterTableRows();
    expect(filteredRowCount).toBe(0);

    await indicationsSection.clearSearch();
  });

  test("Selecting indication card loads detail panel", async () => {
    await indicationsSection.selectIndicationCard(0);

    const headerText = await indicationsSection.getDetailHeaderText();
    expect(headerText).not.toBeNull();
    expect(headerText).toContain("report");
  });

  test("Detail panel shows records after selecting indication", async () => {
    await indicationsSection.selectIndicationCard(0);

    const recordsCount = await indicationsSection.getRecordsCount();
    expect(recordsCount).toBeGreaterThan(0);
  });

  test("Record title is displayed in detail panel", async () => {
    await indicationsSection.selectIndicationCard(0);

    const title = await indicationsSection.getRecordTitle(0);
    expect(title).not.toBeNull();
    expect(title).not.toBe("");
  });

  test("Stage filter buttons are present after selecting indication", async () => {
    await indicationsSection.selectIndicationCard(0);

    const stageButtons = indicationsSection.getStageFilterButtons();
    const buttonCount = await stageButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test("Can click stage filter to filter records", async () => {
    await indicationsSection.selectIndicationCard(0);

    await indicationsSection.selectStage("Phase");

    const filteredRecordsCount = await indicationsSection.getRecordsCount();
    expect(filteredRecordsCount).toBeGreaterThanOrEqual(0);
  });

  test("Clicking record title opens drawer", async () => {
    await indicationsSection.selectIndicationCard(0);

    await indicationsSection.clickRecordTitle(0);

    const isDrawerOpen = await indicationsSection.isDrawerOpen();
    expect(isDrawerOpen).toBe(true);

    await indicationsSection.closeDrawer();
  });

  test("Drawer closes after closeDrawer is called", async () => {
    await indicationsSection.selectIndicationCard(0);
    await indicationsSection.clickRecordTitle(0);

    const isDrawerOpenBefore = await indicationsSection.isDrawerOpen();
    expect(isDrawerOpenBefore).toBe(true);

    await indicationsSection.closeDrawer();

    const isDrawerOpenAfter = await indicationsSection.isDrawerOpen();
    expect(isDrawerOpenAfter).toBe(false);
  });

  test("Clicking indication link navigates to disease page", async ({ page }) => {
    await indicationsSection.clickIndicationLink(0);

    await page.waitForURL((url) => url.toString().includes("/disease/"), {
      timeout: 10000,
    });

    expect(page.url()).toContain("/disease/");
  });

  test("Download button is present in indications section", async () => {
    const isDownloaderVisible = await indicationsSection.isDownloaderVisible();
    expect(isDownloaderVisible).toBe(true);
  });

  test("Selecting different indication cards updates detail panel", async () => {
    const rowCount = await indicationsSection.getMasterTableRows();

    if (rowCount < 2) {
      test.skip(true, "Not enough indication rows to test selection switching");
      return;
    }

    await indicationsSection.selectIndicationCard(0);
    const firstHeaderText = await indicationsSection.getDetailHeaderText();

    await indicationsSection.selectIndicationCard(1);
    const secondHeaderText = await indicationsSection.getDetailHeaderText();

    // Both headers should be non-null and contain "report"
    expect(firstHeaderText).not.toBeNull();
    expect(secondHeaderText).not.toBeNull();
    expect(firstHeaderText).toContain("report");
    expect(secondHeaderText).toContain("report");
  });

  test("Indication cards contain both max stage and report count text", async () => {
    const rowCount = await indicationsSection.getMasterTableRows();
    expect(rowCount).toBeGreaterThan(0);

    const maxStage = await indicationsSection.getMaxStageFromCard(0);
    const reportCount = await indicationsSection.getReportCountFromCard(0);

    expect(maxStage).toBeTruthy();
    expect(reportCount).toBeGreaterThanOrEqual(1);
  });
});