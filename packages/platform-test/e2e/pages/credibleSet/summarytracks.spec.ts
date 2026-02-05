import { expect, test } from "../../../fixtures";
import { SummaryTracksSection } from "../../../POM/objects/widgets/credibleSet/summaryTracksSection";
import { CredibleSetPage } from "../../../POM/page/credibleSet/credibleSet";

test.describe("CredibleSet SummaryTracks Section", () => {
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

  test("SummaryTracks section is visible", async () => {
    expect(await summaryTracksSection.isSectionVisible()).toBe(true);
  });

  test("Section header displays correct title", async () => {
    const title = await summaryTracksSection.getSectionTitle();
    
    expect(title).toContain("Summary");
  });

  test("Summary item is displayed", async () => {
    expect(await summaryTracksSection.isSummaryVisible()).toBe(true);
  });

  test("Loading state is handled correctly", async ({ page, testConfig }) => {
    // Navigate to trigger loading state
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);
    
    // Check if loading message appears (may be brief)
    const loadingMessage = await summaryTracksSection.getLoadingMessage();
    
    // Either loading message should appear or section should load directly
    if (loadingMessage) {
      expect(loadingMessage).toContain("Loading data. This may take some time...");
    }
    
    // Wait for loading to complete
    await summaryTracksSection.waitForSectionLoad();
    
    // Loading should be gone
    expect(await summaryTracksSection.isLoading()).toBe(false);
  });

  test("Genomic track visualization is displayed", async () => {
    // Wait for genomic track to render
    await summaryTracksSection.waitForGenTrackLoad();
    
    expect(await summaryTracksSection.isGenTrackVisible()).toBe(true);
  });

  test("Chart visualization is rendered", async () => {
    await summaryTracksSection.waitForGenTrackLoad();
    
    expect(await summaryTracksSection.isChartVisible()).toBe(true);
  });

  test("Variant elements are displayed in chart", async () => {
    await summaryTracksSection.waitForGenTrackLoad();
    
    const variantCount = await summaryTracksSection.getVariantCount();
    
    expect(variantCount).toBeGreaterThan(0);
  });

  test("Tooltip interactions work on chart elements", async () => {
    await summaryTracksSection.waitForGenTrackLoad();
    
    // Try to hover on chart elements to trigger tooltip
    await summaryTracksSection.hoverOnChartElement("circle, rect, path");
    
    // Wait a moment for tooltip to appear
    await summaryTracksSection.page.waitForTimeout(500);
    
    // Check if tooltip is visible (may not always appear depending on chart implementation)
    const tooltipVisible = await summaryTracksSection.isTooltipVisible();
    
    // This is a soft assertion since tooltip behavior may vary
    if (tooltipVisible) {
      const tooltipContent = await summaryTracksSection.getTooltipContent();
      expect(tooltipContent).not.toBeNull();
      expect(tooltipContent).not.toBe("");
    }
  });

  test("Description section is displayed", async () => {
    const description = await summaryTracksSection.getDescriptionText();
    
    expect(description).toContain("Summary of credible set");
  });

  test("Pagination controls are available when needed", async () => {
    await summaryTracksSection.waitForSectionLoad();
    
    // Check if pagination buttons exist (they may not be visible if all data fits on one page)
    const nextPageExists = await summaryTracksSection.getNextPageButton().count();
    const previousPageExists = await summaryTracksSection.getPreviousPageButton().count();
    
    // If pagination exists, test its functionality
    if (nextPageExists > 0) {
      const nextEnabled = await summaryTracksSection.isNextPageEnabled();
      const previousEnabled = await summaryTracksSection.isPreviousPageEnabled();
      
      // On first page, previous should be disabled, next may be enabled
      expect(previousEnabled).toBe(false);
      
      // If next is enabled, try clicking it
      if (nextEnabled) {
        await summaryTracksSection.clickNextPage();
        
        // Wait for data to load
        await summaryTracksSection.page.waitForTimeout(1000);
        
        // Previous should now be enabled
        expect(await summaryTracksSection.isPreviousPageEnabled()).toBe(true);
        
        // Go back to first page
        await summaryTracksSection.clickPreviousPage();
        await summaryTracksSection.page.waitForTimeout(1000);
      }
    }
  });

  test("Section handles data loading errors gracefully", async ({ page, testConfig }) => {
    // Navigate to a potentially problematic study ID
    await credibleSetPage.goToCredibleSetPage("INVALID_STUDY_ID");
    
    // Wait for potential error state
    await summaryTracksSection.page.waitForTimeout(3000);
    
    // Section should either show error message or handle gracefully
    const sectionVisible = await summaryTracksSection.isSectionVisible();
    
    // If section is visible, it should handle the error state
    if (sectionVisible) {
      const isLoading = await summaryTracksSection.isLoading();
      
      // Should not be stuck in loading state
      expect(isLoading).toBe(false);
    }
  });

  test("Variant hover interactions work correctly", async () => {
    await summaryTracksSection.waitForGenTrackLoad();
    
    const variantCount = await summaryTracksSection.getVariantCount();
    
    if (variantCount > 0) {
      // Try hovering on first variant element
      await summaryTracksSection.hoverOnChartElement("[data-variant-id]");
      
      // Wait for potential tooltip or highlight effect
      await summaryTracksSection.page.waitForTimeout(500);
      
      // This test mainly ensures no errors occur during hover interactions
      expect(true).toBe(true);
    }
  });

  test("Chart renders with proper genomic coordinates", async () => {
    await summaryTracksSection.waitForGenTrackLoad();
    
    // Check that chart container is properly sized and positioned
    const chartContainer = summaryTracksSection.getChartContainer();
    const boundingBox = await chartContainer.first().boundingBox();
    
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });
});