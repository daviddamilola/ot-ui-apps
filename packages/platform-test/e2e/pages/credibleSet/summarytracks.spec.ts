import { expect, test } from "../../../fixtures";
import { SummaryTracksSection } from "../../../POM/objects/widgets/SummaryTracks/summaryTracksSection";
import { CredibleSetPage } from "../../../POM/page/credibleSet/credibleSet";

test.describe("Summary Section", () => {
  let credibleSetPage: CredibleSetPage;
  let summaryTracksSection: SummaryTracksSection;

  test.beforeEach(async ({ page, testConfig }) => {
    credibleSetPage = new CredibleSetPage(page);
    summaryTracksSection = new SummaryTracksSection(page);

    // Navigate using testConfig - use specific config if available
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);

    // Check if section is visible, skip if not
    const isVisible = await summaryTracksSection.isSectionVisible();
    if (isVisible) {
      await summaryTracksSection.waitForSectionLoad();
    } else {
      test.skip();
    }
  });

  test("Section is visible when data available", async () => {
    const isVisible = await summaryTracksSection.isSectionVisible();
    expect(isVisible).toBe(true);
  });

  test("Section header displays correctly", async () => {
    const sectionHeader = summaryTracksSection.getSectionHeader();
    await expect(sectionHeader).toBeVisible();

    const title = await summaryTracksSection.getSectionTitle();
    expect(title).toContain("Summary");
  });

  test("Description is visible", async () => {
    const description = summaryTracksSection.getDescription();
    await expect(description).toBeVisible();

    const descriptionText = await summaryTracksSection.getDescriptionText();
    expect(descriptionText).not.toBeNull();
    expect(descriptionText).not.toBe("");
  });

  test("Body content is visible", async () => {
    const isBodyVisible = await summaryTracksSection.isBodyContentVisible();
    expect(isBodyVisible).toBe(true);
  });

  test("Table displays data when available", async () => {
    const isTableVisible = await summaryTracksSection.isTableVisible();
    
    if (isTableVisible) {
      const rowCount = await summaryTracksSection.getRowCount();
      expect(rowCount).toBeGreaterThan(0);

      // Check that cells contain data
      const firstCell = summaryTracksSection.getCell(0, 0);
      await expect(firstCell).toBeVisible();
      
      const cellText = await firstCell.textContent();
      expect(cellText).not.toBeNull();
      expect(cellText?.trim()).not.toBe("");
    }
  });

  test("Loading message displays correctly during data fetch", async ({ page, testConfig }) => {
    // Navigate to a fresh page to see loading state
    const newPage = await page.context().newPage();
    const newCredibleSetPage = new CredibleSetPage(newPage);
    const newSummaryTracksSection = new SummaryTracksSection(newPage);

    await newCredibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);

    // Check if loading message appears initially
    const isLoadingVisible = await newSummaryTracksSection.isLoadingMessageVisible();
    if (isLoadingVisible) {
      const loadingText = await newSummaryTracksSection.getLoadingMessageText();
      expect(loadingText).toContain("Loading data. This may take some time...");
    }

    await newPage.close();
  });

  test("Section loads without errors", async () => {
    // Verify section is fully loaded
    const isVisible = await summaryTracksSection.isSectionVisible();
    expect(isVisible).toBe(true);

    // Verify no loading indicators remain
    const isLoadingVisible = await summaryTracksSection.isLoadingMessageVisible();
    expect(isLoadingVisible).toBe(false);
  });
});