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

  test("Section description is displayed", async () => {
    const description = await summaryTracksSection.getDescriptionText();
    
    expect(description).toContain("Summary of credible set");
  });

  test("Summary item is visible", async () => {
    expect(await summaryTracksSection.isSummaryVisible()).toBe(true);
  });

  test("Genomic track visualization is displayed", async () => {
    expect(await summaryTracksSection.isGenTrackVisible()).toBe(true);
  });

  test("Chart visualization is rendered", async () => {
    expect(await summaryTracksSection.isChartVisible()).toBe(true);
  });

  test("Track contains variant data", async () => {
    const variantCount = await summaryTracksSection.getTrackVariantCount();
    
    expect(variantCount).toBeGreaterThan(0);
  });

  test("Can interact with track variants", async () => {
    const variantCount = await summaryTracksSection.getTrackVariantCount();
    
    if (variantCount > 0) {
      // Click on first variant
      await summaryTracksSection.clickVariant(0);
      
      // Should not cause any errors
      expect(await summaryTracksSection.hasError()).toBe(false);
    }
  });

  test("Tooltip interactions work on track elements", async () => {
    const variantCount = await summaryTracksSection.getTrackVariantCount();
    
    if (variantCount > 0) {
      // Hover on first track element
      await summaryTracksSection.hoverOnTrackElement(0);
      
      // Wait a moment for tooltip to appear
      await summaryTracksSection.page.waitForTimeout(500);
      
      // Check if tooltip is visible (may not always be present)
      const tooltipVisible = await summaryTracksSection.isTooltipVisible();
      
      // If tooltip is visible, it should have content
      if (tooltipVisible) {
        const tooltipContent = await summaryTracksSection.getTooltipContent();
        expect(tooltipContent).not.toBeNull();
        expect(tooltipContent).not.toBe("");
      }
    }
  });

  test("Pagination controls are functional", async () => {
    const hasPagination = await summaryTracksSection.isPaginationVisible();
    
    if (hasPagination) {
      // Try clicking next page if available
      const nextButton = summaryTracksSection.getNextPageButton();
      const isNextEnabled = await nextButton.isEnabled().catch(() => false);
      
      if (isNextEnabled) {
        await summaryTracksSection.clickNextPage();
        
        // Wait for data to load
        await summaryTracksSection.waitForDataLoad();
        
        // Should still have track data
        expect(await summaryTracksSection.isGenTrackVisible()).toBe(true);
      }
    }
  });

  test("Section loads without errors", async () => {
    // Check that no error messages are displayed
    expect(await summaryTracksSection.hasError()).toBe(false);
  });

  test("Loading state is handled properly", async ({ page, testConfig }) => {
    // Navigate to a new page to test loading state
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);
    
    // Check if loading state appears briefly
    const wasLoading = await summaryTracksSection.isLoading();
    
    // Wait for section to fully load
    await summaryTracksSection.waitForSectionLoad();
    
    // Loading should be gone and content should be visible
    expect(await summaryTracksSection.isLoading()).toBe(false);
    expect(await summaryTracksSection.isSectionVisible()).toBe(true);
  });

  test("Data loads correctly after navigation", async () => {
    // Wait for data to be fully loaded
    await summaryTracksSection.waitForDataLoad();
    
    // Verify genomic track is visible
    expect(await summaryTracksSection.isGenTrackVisible()).toBe(true);
    
    // Verify chart is rendered
    expect(await summaryTracksSection.isChartVisible()).toBe(true);
    
    // Verify no errors occurred
    expect(await summaryTracksSection.hasError()).toBe(false);
  });

  test("Section maintains state during interactions", async () => {
    const initialVariantCount = await summaryTracksSection.getTrackVariantCount();
    
    if (initialVariantCount > 0) {
      // Interact with a variant
      await summaryTracksSection.clickVariant(0);
      
      // Wait for any potential state changes
      await summaryTracksSection.page.waitForTimeout(500);
      
      // Variant count should remain the same
      const afterInteractionCount = await summaryTracksSection.getTrackVariantCount();
      expect(afterInteractionCount).toBe(initialVariantCount);
      
      // Section should still be visible
      expect(await summaryTracksSection.isSectionVisible()).toBe(true);
    }
  });
});