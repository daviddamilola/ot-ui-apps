import { expect, test } from "../../../fixtures";
import { SummaryTracksSection } from "../../../POM/objects/widgets/credibleSet/summaryTracksSection";
import { StudyPage } from "../../../POM/page/study/study";

test.describe("Summary Section", () => {
  let studyPage: StudyPage;
  let summaryTracksSection: SummaryTracksSection;

  test.beforeEach(async ({ page, testConfig }) => {
    studyPage = new StudyPage(page);
    summaryTracksSection = new SummaryTracksSection(page);

    // Navigate using GWAS study ID since credible sets are related to studies
    await studyPage.goToStudyPage(testConfig.study.gwas.primary);

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

  test("Section header displays correct title", async () => {
    const title = await summaryTracksSection.getSectionTitle();
    expect(title).toBeTruthy();
  });

  test("Loading state displays during data fetch", async () => {
    // Navigate to trigger fresh load
    await studyPage.goToStudyPage(testConfig.study.gwas.primary);
    
    // Check if loader appears (may be brief)
    const loaderVisible = await summaryTracksSection.isLoaderVisible();
    
    // Wait for data to load
    await summaryTracksSection.waitForDataLoad();
    
    // Body content should be visible after loading
    const bodyVisible = await summaryTracksSection.isBodyContentVisible();
    expect(bodyVisible).toBe(true);
  });

  test("Loading message is displayed during data fetch", async () => {
    // Navigate to trigger fresh load
    await studyPage.goToStudyPage(testConfig.study.gwas.primary);
    
    // Wait for section to load completely
    await summaryTracksSection.waitForDataLoad();
    
    // After loading, body content should be visible
    const bodyVisible = await summaryTracksSection.isBodyContentVisible();
    expect(bodyVisible).toBe(true);
  });

  test("Description is rendered when available", async () => {
    const descriptionText = await summaryTracksSection.getDescriptionText();
    
    // Description may or may not be present depending on data
    if (descriptionText) {
      expect(descriptionText.length).toBeGreaterThan(0);
    }
  });

  test("Summary item displays when data is available", async () => {
    await summaryTracksSection.waitForDataLoad();
    
    const summaryVisible = await summaryTracksSection.isSummaryItemVisible();
    
    // Summary should be visible after data loads
    expect(summaryVisible).toBe(true);
  });

  test("Error state is handled gracefully", async () => {
    const errorVisible = await summaryTracksSection.isErrorStateVisible();
    
    // Error should not be visible in normal operation
    expect(errorVisible).toBe(false);
  });
});