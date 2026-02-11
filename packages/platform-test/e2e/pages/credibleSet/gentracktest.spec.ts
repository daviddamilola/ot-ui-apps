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

  test("Track visualization is rendered", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    expect(await genTrackTestSection.isTrackVisualizationVisible()).toBe(true);
  });

  test("SVG track elements are present", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    expect(await genTrackTestSection.isTrackSvgVisible()).toBe(true);
  });

  test("Long rectangles are rendered", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    const longRectsCount = await genTrackTestSection.getLongRectsCount();
    
    // Based on the fake data, there should be 4 long rectangles
    expect(longRectsCount).toBeGreaterThan(0);
  });

  test("Short rectangles are rendered", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    const shortRectsCount = await genTrackTestSection.getShortRectsCount();
    
    // Based on the fake data, there should be 5000 short rectangles
    expect(shortRectsCount).toBeGreaterThan(0);
  });

  test("Bars are rendered", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    const barsCount = await genTrackTestSection.getBarsCount();
    
    // Based on the fake data, there should be 50 bars
    expect(barsCount).toBeGreaterThan(0);
  });

  test("Tooltip appears on hover", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    // Hover on a track element
    await genTrackTestSection.hoverOnTrackElement(0);
    
    // Check if tooltip becomes visible
    expect(await genTrackTestSection.isTooltipVisible()).toBe(true);
  });

  test("Tooltip displays content on hover", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    // Hover on a track element
    await genTrackTestSection.hoverOnTrackElement(0);
    
    // Wait for tooltip to appear
    await genTrackTestSection.getTooltip().waitFor({ state: "visible" });
    
    const tooltipContent = await genTrackTestSection.getTooltipContent();
    
    expect(tooltipContent).not.toBeNull();
    expect(tooltipContent).not.toBe("");
  });

  test("Track interaction area is present", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    const interactionArea = genTrackTestSection.getTrackInteractionArea();
    
    expect(await interactionArea.isVisible()).toBe(true);
  });

  test("Can interact with track visualization", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    // Click on track area
    await genTrackTestSection.clickOnTrack(300, 50);
    
    // Interaction should not cause errors
    expect(await genTrackTestSection.isSectionVisible()).toBe(true);
  });

  test("Loading state is handled properly", async ({ page, testConfig }) => {
    // Navigate to a new page to test loading state
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);
    
    // Check if loading indicator appears initially
    const isInitiallyLoading = await genTrackTestSection.isLoading();
    
    // Wait for section to fully load
    await genTrackTestSection.waitForSectionLoad();
    
    // Loading should be complete
    expect(await genTrackTestSection.isLoading()).toBe(false);
  });

  test("Track data renders with expected structure", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    // Verify that the track has the expected data structure
    const svg = genTrackTestSection.getTrackSvg();
    
    expect(await svg.isVisible()).toBe(true);
    
    // Check that SVG has child elements (the rendered track data)
    const svgChildren = svg.locator("> *");
    const childCount = await svgChildren.count();
    
    expect(childCount).toBeGreaterThan(0);
  });

  test("Multiple hover interactions work correctly", async () => {
    await genTrackTestSection.waitForTrackVisualization();
    
    // Test multiple hover interactions
    await genTrackTestSection.hoverOnTrackElement(0);
    expect(await genTrackTestSection.isTooltipVisible()).toBe(true);
    
    // Hover on different element
    await genTrackTestSection.hoverOnTrackElement(1);
    expect(await genTrackTestSection.isTooltipVisible()).toBe(true);
    
    // Move away from elements
    await genTrackTestSection.getSection().hover();
    
    // Tooltip should eventually disappear
    await expect(genTrackTestSection.getTooltip()).not.toBeVisible();
  });
});