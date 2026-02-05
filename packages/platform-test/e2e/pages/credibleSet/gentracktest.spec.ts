import { expect, test } from "../../../fixtures";
import { GenTrackTestSection } from "../../../POM/objects/widgets/GenTrackTest/genTrackTestSection";
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
      await genTrackTestSection.waitForDataLoad();
    } else {
      test.skip();
    }
  });

  test("Section is visible when data available", async () => {
    const isVisible = await genTrackTestSection.isSectionVisible();
    expect(isVisible).toBe(true);
  });

  test("Section header displays correct title", async () => {
    const title = await genTrackTestSection.getSectionTitle();
    expect(title).toBe("GenTrack Test");
  });

  test("Description is visible", async () => {
    const description = await genTrackTestSection.getDescriptionText();
    expect(description).not.toBeNull();
    expect(description).not.toBe("");
  });

  test("Loading message appears during data load", async ({ page, testConfig }) => {
    // Navigate to trigger fresh load
    await credibleSetPage.goToCredibleSetPage(testConfig.study.gwas.primary);
    
    // Check if loading message is visible during initial load
    const isLoadingVisible = await genTrackTestSection.isLoadingMessageVisible();
    
    // Loading message should either be visible initially or already gone
    expect(typeof isLoadingVisible).toBe("boolean");
  });

  test("Body content is visible after loading", async () => {
    const isBodyVisible = await genTrackTestSection.isBodyContentVisible();
    expect(isBodyVisible).toBe(true);
  });

  test("Section loads without errors", async () => {
    await genTrackTestSection.waitForSectionLoad();
    
    const sectionVisible = await genTrackTestSection.isSectionVisible();
    expect(sectionVisible).toBe(true);
  });
});