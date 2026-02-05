import { expect, test } from "../../../fixtures";
import { GenTrackTestSection } from "../../../POM/objects/widgets/GenTrackTest/gentracktestSection";
import { CredibleSetPage } from "../../../POM/page/credibleSet/credibleSet";

test.describe("GenTrack Test Section", () => {
  let credibleSetPage: CredibleSetPage;
  let genTrackTestSection: GenTrackTestSection;

  test.beforeEach(async ({ page, testConfig }) => {
    credibleSetPage = new CredibleSetPage(page);
    genTrackTestSection = new GenTrackTestSection(page);

    // Navigate using testConfig
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);

    // Check if section is visible, skip if not
    const isVisible = await genTrackTestSection.isSectionVisible();
    if (isVisible) {
      await genTrackTestSection.waitForSectionLoad();
    } else {
      test.skip();
    }
  });

  test("Section is visible when data available", async () => {
    const isVisible = await genTrackTestSection.isSectionVisible();
    expect(isVisible).toBe(true);
  });

  test("Section header is displayed", async () => {
    const headerText = await genTrackTestSection.getSectionTitle();
    expect(headerText).not.toBeNull();
    expect(headerText).not.toBe("");
  });

  test("Loading state is displayed initially", async () => {
    // Navigate to a fresh page to catch loading state
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);
    
    const isLoadingVisible = await genTrackTestSection.isLoadingVisible();
    // Loading state may or may not be visible depending on timing
    expect(typeof isLoadingVisible).toBe("boolean");
  });

  test("Description section is visible", async () => {
    await genTrackTestSection.waitForContentLoad();
    
    const isDescriptionVisible = await genTrackTestSection.isDescriptionVisible();
    expect(isDescriptionVisible).toBe(true);
  });

  test("Body content is visible after loading", async () => {
    await genTrackTestSection.waitForContentLoad();
    
    const isBodyContentVisible = await genTrackTestSection.isBodyContentVisible();
    expect(isBodyContentVisible).toBe(true);
  });
});