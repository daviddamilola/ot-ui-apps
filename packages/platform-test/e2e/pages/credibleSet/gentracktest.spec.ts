import { expect, test } from "../../../fixtures";
import { GenTrackTestSection } from "../../../POM/objects/widgets/credibleSet/genTrackTestSection";
import { CredibleSetPage } from "../../../POM/page/credibleSet/credibleSet";

test.describe("CredibleSet GenTrack Test Section", () => {
  let credibleSetPage: CredibleSetPage;
  let genTrackTestSection: GenTrackTestSection;

  test.beforeEach(async ({ page, testConfig }) => {
    credibleSetPage = new CredibleSetPage(page);
    genTrackTestSection = new GenTrackTestSection(page);

    // Navigate to a credible set with GenTrack test data
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);

    // Wait for the section to fully load
    await genTrackTestSection.waitForSectionLoad();
  });

  test("GenTrack test section is visible", async () => {
    expect(await genTrackTestSection.isSectionVisible()).toBe(true);
  });

  test("Section header displays correct title", async () => {
    const title = await genTrackTestSection.getSectionTitle();
    
    expect(title).toContain("GenTrack Test");
  });

  test("Description is displayed", async () => {
    const description = await genTrackTestSection.getDescriptionText();
    
    expect(description).toContain("Gen track test, see below for details");
  });

  test("Visualization container is present", async () => {
    expect(await genTrackTestSection.isVisualizationVisible()).toBe(true);
  });

  test("Track SVG is rendered", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    expect(await genTrackTestSection.isTrackSvgVisible()).toBe(true);
  });

  test("Long rectangles are rendered", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    const longRectCount = await genTrackTestSection.getLongRectangleCount();
    
    // Based on fake data, should have 4 long rectangles
    expect(longRectCount).toBe(4);
  });

  test("Short rectangles are rendered", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    const shortRectCount = await genTrackTestSection.getShortRectangleCount();
    
    // Based on fake data, should have 5000 short rectangles
    expect(shortRectCount).toBe(5000);
  });

  test("Bar chart elements are rendered", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    const barCount = await genTrackTestSection.getBarCount();
    
    // Based on fake data, should have 50 bars
    expect(barCount).toBe(50);
  });

  test("Tooltip appears on hover", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    // Hover on first short rectangle
    await genTrackTestSection.hoverOnVisualizationElement(0);
    
    // Check if tooltip becomes visible
    expect(await genTrackTestSection.isTooltipVisible()).toBe(true);
  });

  test("Tooltip content is displayed", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    // Hover on first short rectangle
    await genTrackTestSection.hoverOnVisualizationElement(0);
    
    // Wait for tooltip to appear
    await genTrackTestSection.getTooltip().waitFor({ state: "visible" });
    
    const tooltipContent = await genTrackTestSection.getTooltipContent();
    
    expect(tooltipContent).not.toBeNull();
    expect(tooltipContent).not.toBe("");
  });

  test("Can interact with track elements", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    // Click on first track element
    await genTrackTestSection.clickOnTrackElement(0);
    
    // Should not throw error and element should remain visible
    expect(await genTrackTestSection.isVisualizationVisible()).toBe(true);
  });

  test("Can interact with bar chart elements", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    // Click on first bar
    await genTrackTestSection.clickOnBar(0);
    
    // Should not throw error and visualization should remain visible
    expect(await genTrackTestSection.isVisualizationVisible()).toBe(true);
  });

  test("Keyboard navigation works", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    // Test zoom in
    await genTrackTestSection.zoomIn();
    
    // Test zoom out
    await genTrackTestSection.zoomOut();
    
    // Test pan left
    await genTrackTestSection.panLeft();
    
    // Test pan right
    await genTrackTestSection.panRight();
    
    // Visualization should still be visible after interactions
    expect(await genTrackTestSection.isVisualizationVisible()).toBe(true);
  });

  test("Multiple tooltip interactions work correctly", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    // Hover on first element
    await genTrackTestSection.hoverOnVisualizationElement(0);
    expect(await genTrackTestSection.isTooltipVisible()).toBe(true);
    
    // Hover on different element
    await genTrackTestSection.hoverOnVisualizationElement(10);
    expect(await genTrackTestSection.isTooltipVisible()).toBe(true);
    
    // Move away from elements
    await genTrackTestSection.getSection().hover();
    
    // Tooltip should disappear
    await expect(genTrackTestSection.getTooltip()).not.toBeVisible();
  });

  test("Visualization renders with correct data structure", async () => {
    await genTrackTestSection.waitForVisualizationLoad();
    
    // Verify all expected visualization elements are present
    expect(await genTrackTestSection.getLongRectangleCount()).toBeGreaterThan(0);
    expect(await genTrackTestSection.getShortRectangleCount()).toBeGreaterThan(0);
    expect(await genTrackTestSection.getBarCount()).toBeGreaterThan(0);
    
    // Verify SVG is properly rendered
    expect(await genTrackTestSection.isTrackSvgVisible()).toBe(true);
  });
});