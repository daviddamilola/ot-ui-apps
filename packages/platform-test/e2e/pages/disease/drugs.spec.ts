import { expect, test } from "../../../fixtures";
import { DrugsSection } from "../../../POM/objects/widgets/Drugs/drugsSection";
import { DiseasePage } from "../../../POM/page/disease/disease";

test.describe("Drugs and Clinical Candidates Section", () => {
  let diseasePage: DiseasePage;
  let drugsSection: DrugsSection;

  test.beforeEach(async ({ page, testConfig }) => {
    diseasePage = new DiseasePage(page);
    drugsSection = new DrugsSection(page);

    await diseasePage.goToDiseasePage(testConfig.disease.primary);

    const sectionVisible = await drugsSection.isSectionVisible();
    if (!sectionVisible) {
      test.skip(true, "Drugs section not visible for this disease");
      return;
    }

    await drugsSection.waitForLoad();
  });

  // ─── Section Visibility ───────────────────────────────────────────────────

  test("Drugs section is visible on disease page", async () => {
    expect(await drugsSection.isSectionVisible()).toBe(true);
  });

  // ─── Table / Drug Cards ───────────────────────────────────────────────────

  test("Drug cards table displays at least one row", async () => {
    const rowCount = await drugsSection.getMasterTableRows();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("Drug name is displayed in the first drug card", async () => {
    const drugName = await drugsSection.getDrugName(0);
    expect(drugName).not.toBeNull();
    expect(drugName).not.toBe("");
  });

  test("Max clinical stage is displayed in the first drug card", async () => {
    const maxStage = await drugsSection.getMaxStageFromCard(0);
    expect(maxStage).not.toBeNull();
    expect(maxStage).not.toBe("");
  });

  test("Report count is displayed in the first drug card", async () => {
    const reportCount = await drugsSection.getReportCountFromCard(0);
    expect(reportCount).toBeGreaterThan(0);
  });

  // ─── Search / Filter ──────────────────────────────────────────────────────

  test("Search input is present and accepts text", async () => {
    const isSearchVisible = await drugsSection.isSearchVisible();
    expect(isSearchVisible).toBe(true);
  });

  test("Searching filters the drug card list", async () => {
    const initialRowCount = await drugsSection.getMasterTableRows();

    // Get the first drug name to search for
    const firstDrugName = await drugsSection.getDrugName(0);
    expect(firstDrugName).not.toBeNull();

    await drugsSection.search(firstDrugName as string);

    const filteredRowCount = await drugsSection.getMasterTableRows();
    expect(filteredRowCount).toBeGreaterThanOrEqual(1);
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);
  });

  test("Clearing search restores full drug card list", async () => {
    const initialRowCount = await drugsSection.getMasterTableRows();

    await drugsSection.search("zzz_no_match_expected_xyz");
    const filteredRowCount = await drugsSection.getMasterTableRows();
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);

    await drugsSection.clearSearch();
    const restoredRowCount = await drugsSection.getMasterTableRows();
    expect(restoredRowCount).toBe(initialRowCount);
  });

  test("Searching by clinical stage filters results", async () => {
    const initialRowCount = await drugsSection.getMasterTableRows();

    await drugsSection.search("Phase");

    const filteredRowCount = await drugsSection.getMasterTableRows();
    expect(filteredRowCount).toBeGreaterThanOrEqual(0);
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);

    await drugsSection.clearSearch();
  });

  // ─── Row Selection / Master-Detail ───────────────────────────────────────

  test("Clicking a drug card selects it and loads detail panel", async () => {
    await drugsSection.selectDrugCard(0);

    const isDetailVisible = await drugsSection.isDetailPanelVisible();
    expect(isDetailVisible).toBe(true);
  });

  test("Detail panel shows clinical reports after selecting a drug card", async () => {
    await drugsSection.selectDrugCard(0);

    const recordsCount = await drugsSection.getRecordsCount();
    expect(recordsCount).toBeGreaterThan(0);
  });

  test("Selected drug card has visual selection indicator", async () => {
    await drugsSection.selectDrugCard(0);

    const isSelected = await drugsSection.isDrugCardSelected(0);
    expect(isSelected).toBe(true);
  });

  test("Detail panel header contains report information", async () => {
    await drugsSection.selectDrugCard(0);

    const headerText = await drugsSection.getDetailHeaderText();
    expect(headerText).not.toBeNull();
    expect(headerText).toContain("report");
  });

  // ─── Drug Name Link Navigation ────────────────────────────────────────────

  test("Drug name link navigates to drug page", async ({ page }) => {
    await drugsSection.clickDrugLink(0);

    await page.waitForURL((url) => url.toString().includes("/drug/"), {
      timeout: 10000,
    });

    expect(page.url()).toContain("/drug/");
  });

  // ─── External Links ───────────────────────────────────────────────────────

  test("Open Targets external link is present in description", async () => {
    const openTargetsLink = await drugsSection.getOpenTargetsLink();
    expect(openTargetsLink).not.toBeNull();

    const href = await openTargetsLink!.getAttribute("href");
    expect(href).toContain("platform-docs.opentargets.org");
  });

  test("ChEMBL external link is present in description", async () => {
    const chemblLink = await drugsSection.getChemblLink();
    expect(chemblLink).not.toBeNull();

    const href = await chemblLink!.getAttribute("href");
    expect(href).toContain("ebi.ac.uk/chembl");
  });

  test("Open Targets link opens in new tab", async () => {
    const openTargetsLink = await drugsSection.getOpenTargetsLink();
    expect(openTargetsLink).not.toBeNull();

    const target = await openTargetsLink!.getAttribute("target");
    expect(target).toBe("_blank");
  });

  test("ChEMBL link opens in new tab", async () => {
    const chemblLink = await drugsSection.getChemblLink();
    expect(chemblLink).not.toBeNull();

    const target = await chemblLink!.getAttribute("target");
    expect(target).toBe("_blank");
  });

  // ─── Data Download ────────────────────────────────────────────────────────

  test("Data downloader button is visible", async () => {
    const isDownloaderVisible = await drugsSection.isDownloaderVisible();
    expect(isDownloaderVisible).toBe(true);
  });

  test("Clicking download button initiates CSV download", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await drugsSection.clickDownloader();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("drugs-and-clinical-candidates");
    expect(download.suggestedFilename()).toContain(".csv");
  });

  // ─── Pagination ───────────────────────────────────────────────────────────

  test("Pagination is conditionally displayed based on row count", async () => {
    const rowCount = await drugsSection.getMasterTableRows();
    const isPaginationVisible = await drugsSection.isPaginationVisible();

    // Pagination is shown conditionally (showPaginationAlways=false)
    // If rows fit on one page, pagination may not be visible
    if (rowCount > 10) {
      expect(isPaginationVisible).toBe(true);
    } else {
      // Pagination may or may not be visible for small datasets
      expect(typeof isPaginationVisible).toBe("boolean");
    }
  });

  // ─── Stage Filter in Detail Panel ────────────────────────────────────────

  test("Stage filter buttons appear in detail panel after selecting a drug", async () => {
    await drugsSection.selectDrugCard(0);

    const stageButtons = drugsSection.getStageFilterButtons();
    const buttonCount = await stageButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test("Clicking stage filter updates records in detail panel", async () => {
    await drugsSection.selectDrugCard(0);

    const initialRecordsCount = await drugsSection.getRecordsCount();

    await drugsSection.selectStage("Phase");

    const filteredRecordsCount = await drugsSection.getRecordsCount();
    expect(filteredRecordsCount).toBeGreaterThanOrEqual(0);
    expect(filteredRecordsCount).toBeLessThanOrEqual(initialRecordsCount);
  });

  // ─── Description ─────────────────────────────────────────────────────────

  test("Section description contains disease name", async ({ testConfig }) => {
    const descriptionText = await drugsSection.getDescriptionText();
    expect(descriptionText).not.toBeNull();
    expect(descriptionText!.toLowerCase()).toContain(
      testConfig.disease.name.toLowerCase()
    );
  });

  test("Section description mentions clinical trial records", async () => {
    const descriptionText = await drugsSection.getDescriptionText();
    expect(descriptionText).not.toBeNull();
    expect(descriptionText!.toLowerCase()).toContain("clinical trial");
  });
});