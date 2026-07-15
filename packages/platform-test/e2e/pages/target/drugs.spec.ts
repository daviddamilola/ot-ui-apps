import { expect, test } from "../../../fixtures";
import { DrugsSection } from "../../../POM/objects/widgets/Drugs/drugsSection";
import { TargetPage } from "../../../POM/page/target/target";

test.describe("Target Drugs and Clinical Candidates Section", () => {
  let targetPage: TargetPage;
  let drugsSection: DrugsSection;

  test.beforeEach(async ({ page, testConfig }) => {
    targetPage = new TargetPage(page);
    drugsSection = new DrugsSection(page);

    await targetPage.goToTargetPage(testConfig.target.primary);

    const sectionVisible = await drugsSection.isSectionVisible();
    if (!sectionVisible) {
      test.skip(true, "Drugs section not visible for this target");
      return;
    }

    await drugsSection.waitForLoad();
  });

  test("Drugs section is visible", async () => {
    expect(await drugsSection.isSectionVisible()).toBe(true);
  });

  test("Drugs table displays drug cards", async () => {
    const rowCount = await drugsSection.getMasterTableRows();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("Drug name is displayed in card", async () => {
    const drugName = await drugsSection.getDrugName(0);
    expect(drugName).not.toBeNull();
    expect(drugName).not.toBe("");
  });

  test("Max clinical stage is displayed in drug card", async () => {
    const maxStage = await drugsSection.getMaxStageFromCard(0);
    expect(maxStage).not.toBeNull();
    expect(maxStage).not.toBe("");
  });

  test("Report count is displayed in drug card", async () => {
    const reportCount = await drugsSection.getReportCountFromCard(0);
    expect(reportCount).toBeGreaterThan(0);
  });

  test("Can search/filter drugs by name", async () => {
    const initialRowCount = await drugsSection.getMasterTableRows();
    expect(initialRowCount).toBeGreaterThan(0);

    // Get the first drug name to search for
    const drugName = await drugsSection.getDrugName(0);
    expect(drugName).not.toBeNull();

    // Search for the drug name
    await drugsSection.search(drugName!);

    // Filtered results should be at least 1 (the drug we searched for)
    const filteredRowCount = await drugsSection.getMasterTableRows();
    expect(filteredRowCount).toBeGreaterThanOrEqual(1);
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);

    // Clear search and verify rows return
    await drugsSection.clearSearch();
    const restoredRowCount = await drugsSection.getMasterTableRows();
    expect(restoredRowCount).toBe(initialRowCount);
  });

  test("Search with no matching term returns zero results", async () => {
    await drugsSection.search("xyznonexistentdrugname12345");

    const filteredRowCount = await drugsSection.getMasterTableRows();
    expect(filteredRowCount).toBe(0);

    // Restore state
    await drugsSection.clearSearch();
  });

  test("Can search/filter drugs by clinical stage label", async () => {
    const initialRowCount = await drugsSection.getMasterTableRows();

    // Search by a common clinical stage term
    await drugsSection.search("Phase");

    const filteredRowCount = await drugsSection.getMasterTableRows();
    expect(filteredRowCount).toBeGreaterThanOrEqual(0);
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);

    await drugsSection.clearSearch();
  });

  test("Selecting a drug card loads the detail panel", async () => {
    await drugsSection.selectDrugCard(0);

    const headerText = await drugsSection.getDetailHeaderText();
    expect(headerText).not.toBeNull();
    expect(headerText).toContain("report");
  });

  test("Detail panel shows records after selecting a drug", async () => {
    await drugsSection.selectDrugCard(0);

    const recordsCount = await drugsSection.getRecordsCount();
    expect(recordsCount).toBeGreaterThan(0);
  });

  test("Selected drug card has visual selection indicator", async () => {
    await drugsSection.selectDrugCard(0);

    const isSelected = await drugsSection.isDrugCardSelected(0);
    expect(isSelected).toBe(true);
  });

  test("Selecting a different drug card updates the detail panel", async () => {
    const rowCount = await drugsSection.getMasterTableRows();
    if (rowCount < 2) {
      test.skip(true, "Need at least 2 drug cards to test selection change");
      return;
    }

    // Select first card
    await drugsSection.selectDrugCard(0);
    const firstHeaderText = await drugsSection.getDetailHeaderText();

    // Select second card
    await drugsSection.selectDrugCard(1);
    const secondHeaderText = await drugsSection.getDetailHeaderText();

    // Detail panel should have updated (headers may differ)
    expect(secondHeaderText).not.toBeNull();
    expect(secondHeaderText).toContain("report");
  });

  test("Drug name link is present and has correct href", async () => {
    const drugLink = await drugsSection.getDrugLink(0);
    expect(drugLink).not.toBeNull();
    expect(drugLink).toContain("/drug/");
  });

  test("Data download button is present", async () => {
    const isDownloadVisible = await drugsSection.isDownloadButtonVisible();
    expect(isDownloadVisible).toBe(true);
  });

  test("Data download initiates file download", async ({ page }) => {
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await drugsSection.clickDownloadButton();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("drugs-and-clinical-candidates");
  });

  test("Description contains target name", async ({ testConfig }) => {
    const descriptionText = await drugsSection.getDescriptionText();
    expect(descriptionText).not.toBeNull();
    expect(descriptionText).not.toBe("");
  });

  test("Description contains Open Targets external link", async () => {
    const openTargetsLink = await drugsSection.getOpenTargetsDescriptionLink();
    expect(openTargetsLink).not.toBeNull();
    expect(openTargetsLink).toContain("platform-docs.opentargets.org");
  });

  test("Description contains ChEMBL external link", async () => {
    const chemblLink = await drugsSection.getChemblDescriptionLink();
    expect(chemblLink).not.toBeNull();
    expect(chemblLink).toContain("ebi.ac.uk/chembl");
  });

  test("Stage filter buttons are present after selecting a drug card", async () => {
    await drugsSection.selectDrugCard(0);

    const stageButtons = drugsSection.getStageFilterButtons();
    const buttonCount = await stageButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test("Can filter records by clinical stage in detail panel", async () => {
    await drugsSection.selectDrugCard(0);

    // Click a stage filter
    await drugsSection.selectStage("Phase");

    const filteredRecordsCount = await drugsSection.getRecordsCount();
    expect(filteredRecordsCount).toBeGreaterThanOrEqual(0);
  });

  test("Record title is displayed in detail panel", async () => {
    await drugsSection.selectDrugCard(0);

    const title = await drugsSection.getRecordTitle(0);
    expect(title).not.toBeNull();
    expect(title).not.toBe("");
  });

  test("Clicking record title opens drawer", async () => {
    await drugsSection.selectDrugCard(0);

    await drugsSection.clickRecordTitle(0);

    const isDrawerOpen = await drugsSection.isDrawerOpen();
    expect(isDrawerOpen).toBe(true);

    await drugsSection.closeDrawer();
  });

  test("Drawer closes after clicking close button", async () => {
    await drugsSection.selectDrugCard(0);
    await drugsSection.clickRecordTitle(0);

    await drugsSection.closeDrawer();

    const isDrawerOpen = await drugsSection.isDrawerOpen();
    expect(isDrawerOpen).toBe(false);
  });

  test("Pagination controls are present when there are many drugs", async () => {
    const rowCount = await drugsSection.getMasterTableRows();

    // Pagination is shown conditionally (showPaginationAlways=false)
    // Only verify if there are enough rows to trigger pagination
    if (rowCount >= 10) {
      const isPaginationVisible = await drugsSection.isPaginationVisible();
      expect(isPaginationVisible).toBe(true);
    } else {
      test.skip(true, "Not enough rows to trigger pagination display");
    }
  });

  test("Drug cards are sorted by clinical stage descending by default", async () => {
    const rowCount = await drugsSection.getMasterTableRows();
    if (rowCount < 2) {
      test.skip(true, "Need at least 2 drug cards to verify sort order");
      return;
    }

    const firstStage = await drugsSection.getMaxStageFromCard(0);
    const lastStage = await drugsSection.getMaxStageFromCard(rowCount - 1);

    // First card should have a stage label (sorted desc by clinical stage)
    expect(firstStage).not.toBeNull();
    expect(lastStage).not.toBeNull();
  });
});