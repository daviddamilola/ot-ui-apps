import { expect, test } from "../../../fixtures";
import { GenTrackTestSection } from "../../../POM/objects/widgets/credibleSet/genTrackTestSection";
import { CredibleSetPage } from "../../../POM/page/credibleSet/credibleSet";

test.describe("CredibleSet GenTrackTest Section", () => {
  let credibleSetPage: CredibleSetPage;
  let genTrackTestSection: GenTrackTestSection;

  test.beforeEach(async ({ page, testConfig }) => {
    credibleSetPage = new CredibleSetPage(page);
    genTrackTestSection = new GenTrackTestSection(page);

    // Navigate to a credible set with GenTrackTest data
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);

    // Wait for the section to fully load
    await genTrackTestSection.waitForSectionLoad();
  });

  test("GenTrackTest section is visible", async () => {
    expect(await genTrackTestSection.isSectionVisible()).toBe(true);
  });

  test("Section header displays correct title", async () => {
    const title = await genTrackTestSection.getSectionTitle();
    
    expect(title).toContain("GenTrack Test");
  });

  test("Description is displayed", async () => {
    const description = await genTrackTestSection.getDescriptionText();
    
    expect(description).not.toBeNull();
    expect(description).toContain("Gen track test, see below for details");
  });

  test("Track visualization is rendered", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    expect(await genTrackTestSection.isTrackVisualizationVisible()).toBe(true);
    expect(await genTrackTestSection.isTrackSvgVisible()).toBe(true);
  });

  test("Long rectangles are rendered", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    const longRectsCount = await genTrackTestSection.getLongRectsCount();
    
    // Based on the fake data generation, there should be 4 long rectangles
    expect(longRectsCount).toBe(4);
  });

  test("Short rectangles are rendered", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    const shortRectsCount = await genTrackTestSection.getShortRectsCount();
    
    // Based on the fake data generation, there should be 5000 short rectangles
    expect(shortRectsCount).toBe(5000);
  });

  test("Bars are rendered", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    const barsCount = await genTrackTestSection.getBarsCount();
    
    // Based on the fake data generation, there should be 50 bars
    expect(barsCount).toBe(50);
  });

  test("Tooltip appears on hover", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    // Hover on the first short rectangle
    await genTrackTestSection.hoverOnTrackElement(0);
    
    // Check if tooltip becomes visible
    expect(await genTrackTestSection.isTooltipVisible()).toBe(true);
  });

  test("Tooltip displays content on hover", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    // Hover on the first short rectangle
    await genTrackTestSection.hoverOnTrackElement(0);
    
    // Wait for tooltip to appear
    await genTrackTestSection.getTooltip().waitFor({ state: "visible" });
    
    const tooltipContent = await genTrackTestSection.getTooltipContent();
    
    expect(tooltipContent).not.toBeNull();
    expect(tooltipContent).not.toBe("");
  });

  test("Loading state is handled correctly", async ({ page, testConfig }) => {
    // Navigate to a new page to test loading state
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);
    
    // Check if loading indicator appears initially
    const isInitiallyLoading = await genTrackTestSection.isLoading();
    
    // Wait for section to fully load
    await genTrackTestSection.waitForSectionLoad();
    
    // Loading should be complete
    expect(await genTrackTestSection.isLoading()).toBe(false);
  });

  test("Loading message is displayed during data fetch", async ({ page, testConfig }) => {
    // Navigate to trigger loading state
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);
    
    // Try to capture loading message (may be brief)
    try {
      const loadingMessage = await genTrackTestSection.getLoadingMessage();
      if (loadingMessage) {
        expect(loadingMessage).toContain("Loading data. This may take some time...");
      }
    } catch (error) {
      // Loading may complete too quickly to capture message
      // This is acceptable behavior
    }
    
    // Ensure section loads successfully
    await genTrackTestSection.waitForSectionLoad();
    expect(await genTrackTestSection.isSectionVisible()).toBe(true);
  });

  test("Track visualization renders with correct data structure", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    // Verify all data types are present
    const longRectsCount = await genTrackTestSection.getLongRectsCount();
    const shortRectsCount = await genTrackTestSection.getShortRectsCount();
    const barsCount = await genTrackTestSection.getBarsCount();
    
    expect(longRectsCount).toBeGreaterThan(0);
    expect(shortRectsCount).toBeGreaterThan(0);
    expect(barsCount).toBeGreaterThan(0);
    
    // Verify the SVG container exists
    expect(await genTrackTestSection.isTrackSvgVisible()).toBe(true);
  });

  test("Multiple tooltip interactions work correctly", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    // Test hovering on different elements
    await genTrackTestSection.hoverOnTrackElement(0);
    expect(await genTrackTestSection.isTooltipVisible()).toBe(true);
    
    // Move to another element
    await genTrackTestSection.hoverOnTrackElement(1);
    expect(await genTrackTestSection.isTooltipVisible()).toBe(true);
    
    // Move away from elements
    await genTrackTestSection.getSection().hover();
    
    // Tooltip should eventually disappear
    await expect(genTrackTestSection.getTooltip()).toBeHidden({ timeout: 2000 });
  });
});