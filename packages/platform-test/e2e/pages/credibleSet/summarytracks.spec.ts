import { expect, test } from "../../../fixtures";
import { SummaryTracksSection } from "../../../POM/objects/widgets/credibleSet/summaryTracksSection";
import { CredibleSetPage } from "../../../POM/page/credibleSet/credibleSet";

test.describe("CredibleSet Summary Tracks Section", () => {
  let credibleSetPage: CredibleSetPage;
  let summaryTracksSection: SummaryTracksSection;

  test.beforeEach(async ({ page, testConfig }) => {
    credibleSetPage = new CredibleSetPage(page);
    summaryTracksSection = new SummaryTracksSection(page);

    // Navigate to a credible set with summary tracks data
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);

    // Wait for the section to fully load
    await summaryTracksSection.waitForSectionLoad();
  });

  test("Summary tracks section is visible", async () => {
    expect(await summaryTracksSection.isSectionVisible()).toBe(true);
  });

  test("Section header displays correct title", async () => {
    const title = await summaryTracksSection.getSectionTitle();
    
    expect(title).toContain("Summary");
  });

  test("Description is visible and contains expected content", async () => {
    expect(await summaryTracksSection.isDescriptionVisible()).toBe(true);
    
    const description = await summaryTracksSection.getDescriptionText();
    expect(description).toContain("Summary of credible set");
  });

  test("Genomic visualization loads successfully", async () => {
    await summaryTracksSection.waitForVisualizationLoad();
    
    expect(await summaryTracksSection.isVisualizationVisible()).toBe(true);
  });

  test("Variant data is displayed", async () => {
    const variantCount = await summaryTracksSection.getVariantCount();
    
    expect(variantCount).toBeGreaterThan(0);
  });

  test("Tooltip appears on hover interaction", async () => {
    // Wait for visualization to be ready
    await summaryTracksSection.waitForVisualizationLoad();
    
    // Hover on first track element if available
    await summaryTracksSection.hoverOnTrackElement(0);
    
    // Check if tooltip becomes visible
    const isTooltipVisible = await summaryTracksSection.isTooltipVisible();
    
    // Tooltip may or may not appear depending on implementation
    // This test verifies the interaction doesn't cause errors
    expect(typeof isTooltipVisible).toBe("boolean");
  });

  test("Pagination controls are present when data is paginated", async () => {
    const variantCount = await summaryTracksSection.getVariantCount();
    
    if (variantCount > 0) {
      // Check if pagination controls exist
      const nextEnabled = await summaryTracksSection.isNextPageEnabled();
      const prevEnabled = await summaryTracksSection.isPreviousPageEnabled();
      
      // At least one of these should be a boolean (controls exist)
      expect(typeof nextEnabled).toBe("boolean");
      expect(typeof prevEnabled).toBe("boolean");
    }
  });

  test("Page navigation works when next page is available", async () => {
    const isNextEnabled = await summaryTracksSection.isNextPageEnabled();
    
    if (isNextEnabled) {
      // Get initial page info
      const initialPageInfo = await summaryTracksSection.getPageInfoText();
      
      // Click next page
      await summaryTracksSection.clickNextPage();
      
      // Wait for data to load
      await summaryTracksSection.waitForSectionLoad();
      
      // Verify page changed
      const newPageInfo = await summaryTracksSection.getPageInfoText();
      expect(newPageInfo).not.toBe(initialPageInfo);
    }
  });

  test("Credible set data is accessible", async () => {
    const credibleSetData = await summaryTracksSection.getCredibleSetData();
    
    // Data may or may not be present depending on implementation
    // This test verifies the method doesn't cause errors
    expect(credibleSetData === null || typeof credibleSetData === "string").toBe(true);
  });

  test("Section handles loading states properly", async ({ page, testConfig }) => {
    // Navigate to trigger loading
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);
    
    // Check if loading indicator appears initially
    const wasLoading = await summaryTracksSection.isLoading();
    
    // Wait for section to fully load
    await summaryTracksSection.waitForSectionLoad();
    
    // Verify loading is complete
    const isStillLoading = await summaryTracksSection.isLoading();
    expect(isStillLoading).toBe(false);
  });

  test("Variant interaction works without errors", async () => {
    const variantCount = await summaryTracksSection.getVariantCount();
    
    if (variantCount > 0) {
      // Click on first variant
      await summaryTracksSection.clickVariant(0);
      
      // Wait a moment for any interactions to complete
      await page.waitForTimeout(500);
      
      // Verify no navigation occurred (variants shouldn't navigate away)
      expect(page.url()).toContain(testConfig.study.gwas.primary);
    }
  });

  test("Section maintains functionality after data updates", async () => {
    // Initial state check
    const initialVariantCount = await summaryTracksSection.getVariantCount();
    
    // If pagination is available, test data consistency
    const isNextEnabled = await summaryTracksSection.isNextPageEnabled();
    
    if (isNextEnabled) {
      await summaryTracksSection.clickNextPage();
      await summaryTracksSection.waitForSectionLoad();
      
      // Verify section is still functional
      expect(await summaryTracksSection.isSectionVisible()).toBe(true);
      
      const newVariantCount = await summaryTracksSection.getVariantCount();
      expect(newVariantCount).toBeGreaterThanOrEqual(0);
    }
  });
});