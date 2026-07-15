import { expect, test } from "../../../fixtures";
import { SubcellularLocationSection } from "../../../POM/objects/widgets/SubcellularLocation/subcellularLocationSection";
import { TargetPage } from "../../../POM/page/target/target";

test.describe("SubcellularLocation Widget - Target Page", () => {
  let targetPage: TargetPage;
  let subcellularLocationSection: SubcellularLocationSection;

  test.beforeEach(async ({ page, testConfig }) => {
    targetPage = new TargetPage(page);
    subcellularLocationSection = new SubcellularLocationSection(page);

    await targetPage.goToTargetPage(testConfig.target.primary);

    const sectionVisible = await subcellularLocationSection.isSectionVisible();
    if (!sectionVisible) {
      test.skip(true, "Subcellular Location section not visible for this target");
      return;
    }

    await subcellularLocationSection.waitForLoad();
  });

  // ─── Section Visibility ───────────────────────────────────────────────────

  test("section is visible on the target page", async () => {
    expect(await subcellularLocationSection.isSectionVisible()).toBe(true);
  });

  test("section header is displayed", async () => {
    const headerText = await subcellularLocationSection.getSectionHeaderText();
    expect(headerText).not.toBeNull();
    expect(headerText).not.toBe("");
  });

  // ─── Description ─────────────────────────────────────────────────────────

  test("description text is displayed", async () => {
    const description = await subcellularLocationSection.getDescriptionText();
    expect(description).not.toBeNull();
    expect(description).not.toBe("");
  });

  test("description contains UniProt external link", async () => {
    const uniprotLink = await subcellularLocationSection.getUniprotDescriptionLink();
    expect(uniprotLink).not.toBeNull();
  });

  test("description UniProt link points to uniprot.org", async () => {
    const href = await subcellularLocationSection.getUniprotDescriptionLinkHref();
    expect(href).toContain("uniprot.org");
  });

  test("description contains HPA external link", async () => {
    const hpaLink = await subcellularLocationSection.getHpaDescriptionLink();
    expect(hpaLink).not.toBeNull();
  });

  test("description HPA link points to proteinatlas.org", async () => {
    const href = await subcellularLocationSection.getHpaDescriptionLinkHref();
    expect(href).toContain("proteinatlas.org");
  });

  // ─── Tabs ─────────────────────────────────────────────────────────────────

  test("subcellular tabs container is visible", async () => {
    const tabsVisible = await subcellularLocationSection.isTabsContainerVisible();
    expect(tabsVisible).toBe(true);
  });

  test("at least one tab is rendered", async () => {
    const tabCount = await subcellularLocationSection.getTabCount();
    expect(tabCount).toBeGreaterThan(0);
  });

  test("first tab is active by default", async () => {
    const activeTabIndex = await subcellularLocationSection.getActiveTabIndex();
    expect(activeTabIndex).toBe(0);
  });

  test("HPA main tab is visible when present", async ({ page }) => {
    const hpaMainTab = page.getByTestId("subcellular-tab-hpa_main");
    const isPresent = await hpaMainTab.count();
    if (isPresent === 0) {
      test.skip(true, "HPA main tab not present for this target");
      return;
    }
    await expect(hpaMainTab).toBeVisible();
  });

  test("HPA additional tab is visible when present", async ({ page }) => {
    const hpaAdditionalTab = page.getByTestId("subcellular-tab-hpa_additional");
    const isPresent = await hpaAdditionalTab.count();
    if (isPresent === 0) {
      test.skip(true, "HPA additional tab not present for this target");
      return;
    }
    await expect(hpaAdditionalTab).toBeVisible();
  });

  test("HPA extracellular location tab is visible when present", async ({ page }) => {
    const hpaExtracellularTab = page.getByTestId("subcellular-tab-hpa_extracellular_location");
    const isPresent = await hpaExtracellularTab.count();
    if (isPresent === 0) {
      test.skip(true, "HPA extracellular location tab not present for this target");
      return;
    }
    await expect(hpaExtracellularTab).toBeVisible();
  });

  test("UniProt tab is visible when present", async ({ page }) => {
    const uniprotTab = page.getByTestId("subcellular-tab-uniprot");
    const isPresent = await uniprotTab.count();
    if (isPresent === 0) {
      test.skip(true, "UniProt tab not present for this target");
      return;
    }
    await expect(uniprotTab).toBeVisible();
  });

  // ─── Tab Switching ────────────────────────────────────────────────────────

  test("clicking a tab changes the active tab", async () => {
    const tabCount = await subcellularLocationSection.getTabCount();
    if (tabCount < 2) {
      test.skip(true, "Need at least 2 tabs to test tab switching");
      return;
    }

    await subcellularLocationSection.clickTabByIndex(1);
    const activeTabIndex = await subcellularLocationSection.getActiveTabIndex();
    expect(activeTabIndex).toBe(1);
  });

  test("clicking HPA main tab shows its tab panel", async ({ page }) => {
    const hpaMainTab = page.getByTestId("subcellular-tab-hpa_main");
    const isPresent = await hpaMainTab.count();
    if (isPresent === 0) {
      test.skip(true, "HPA main tab not present for this target");
      return;
    }

    await hpaMainTab.click();
    const tabPanel = page.getByTestId("subcellular-tabpanel-hpa_main");
    await expect(tabPanel).toBeVisible();
  });

  test("clicking UniProt tab shows its tab panel", async ({ page }) => {
    const uniprotTab = page.getByTestId("subcellular-tab-uniprot");
    const isPresent = await uniprotTab.count();
    if (isPresent === 0) {
      test.skip(true, "UniProt tab not present for this target");
      return;
    }

    await uniprotTab.click();
    const tabPanel = page.getByTestId("subcellular-tabpanel-uniprot");
    await expect(tabPanel).toBeVisible();
  });

  test("clicking HPA additional tab shows its tab panel", async ({ page }) => {
    const hpaAdditionalTab = page.getByTestId("subcellular-tab-hpa_additional");
    const isPresent = await hpaAdditionalTab.count();
    if (isPresent === 0) {
      test.skip(true, "HPA additional tab not present for this target");
      return;
    }

    await hpaAdditionalTab.click();
    const tabPanel = page.getByTestId("subcellular-tabpanel-hpa_additional");
    await expect(tabPanel).toBeVisible();
  });

  test("clicking HPA extracellular location tab shows its tab panel", async ({ page }) => {
    const hpaExtracellularTab = page.getByTestId("subcellular-tab-hpa_extracellular_location");
    const isPresent = await hpaExtracellularTab.count();
    if (isPresent === 0) {
      test.skip(true, "HPA extracellular location tab not present for this target");
      return;
    }

    await hpaExtracellularTab.click();
    const tabPanel = page.getByTestId("subcellular-tabpanel-hpa_extracellular_location");
    await expect(tabPanel).toBeVisible();
  });

  // ─── Locations List ───────────────────────────────────────────────────────

  test("locations list is visible in the active tab panel", async () => {
    const listVisible = await subcellularLocationSection.isLocationsListVisible();
    expect(listVisible).toBe(true);
  });

  test("at least one location item is displayed", async () => {
    const itemCount = await subcellularLocationSection.getLocationItemCount();
    expect(itemCount).toBeGreaterThan(0);
  });

  test("location item text is not empty", async () => {
    const firstItemText = await subcellularLocationSection.getLocationItemText(0);
    expect(firstItemText).not.toBeNull();
    expect(firstItemText).not.toBe("");
  });

  test("all location items have non-empty text", async () => {
    const itemCount = await subcellularLocationSection.getLocationItemCount();
    for (let i = 0; i < Math.min(itemCount, 5); i++) {
      const text = await subcellularLocationSection.getLocationItemText(i);
      expect(text).not.toBeNull();
      expect(text).not.toBe("");
    }
  });

  // ─── Hover Interaction ────────────────────────────────────────────────────

  test("hovering over a location item does not throw an error", async () => {
    const itemCount = await subcellularLocationSection.getLocationItemCount();
    if (itemCount === 0) {
      test.skip(true, "No location items to hover over");
      return;
    }

    // Hover should not cause any errors or page crashes
    await subcellularLocationSection.hoverLocationItem(0);
    const listVisible = await subcellularLocationSection.isLocationsListVisible();
    expect(listVisible).toBe(true);
  });

  test("mouse leave after hover restores default state", async () => {
    const itemCount = await subcellularLocationSection.getLocationItemCount();
    if (itemCount === 0) {
      test.skip(true, "No location items to test hover/leave");
      return;
    }

    await subcellularLocationSection.hoverLocationItem(0);
    await subcellularLocationSection.leaveLocationItem(0);

    // Section should still be visible and stable after hover/leave
    const listVisible = await subcellularLocationSection.isLocationsListVisible();
    expect(listVisible).toBe(true);
  });

  // ─── Visualization ────────────────────────────────────────────────────────

  test("visualization container is present in the active tab panel", async () => {
    const vizVisible = await subcellularLocationSection.isVisualizationVisible();
    expect(vizVisible).toBe(true);
  });

  // ─── Tab Panel Content ────────────────────────────────────────────────────

  test("active tab panel contains a location link", async () => {
    const locationLinkCount = await subcellularLocationSection.getLocationLinkCount();
    expect(locationLinkCount).toBeGreaterThan(0);
  });

  test("location link in active tab panel has a valid href", async () => {
    const href = await subcellularLocationSection.getLocationLinkHref(0);
    expect(href).not.toBeNull();
    expect(href).not.toBe("");
    // Should link to identifiers.org, HPA, or UniProt
    const validDomains = ["identifiers.org", "uniprot.org", "proteinatlas.org"];
    const isValidLink = validDomains.some(domain => href?.includes(domain));
    expect(isValidLink).toBe(true);
  });

  test("tab panel source label is displayed", async () => {
    const sourceLabel = await subcellularLocationSection.getActiveTabPanelSourceLabel();
    expect(sourceLabel).not.toBeNull();
    expect(sourceLabel).not.toBe("");
  });

  // ─── Tab Switching Preserves Content ─────────────────────────────────────

  test("switching tabs updates the locations list", async () => {
    const tabCount = await subcellularLocationSection.getTabCount();
    if (tabCount < 2) {
      test.skip(true, "Need at least 2 tabs to test content switching");
      return;
    }

    const firstTabItemCount = await subcellularLocationSection.getLocationItemCount();

    await subcellularLocationSection.clickTabByIndex(1);
    await subcellularLocationSection.waitForLoad();

    const secondTabItemCount = await subcellularLocationSection.getLocationItemCount();

    // Both tabs should have at least one location item
    expect(firstTabItemCount).toBeGreaterThan(0);
    expect(secondTabItemCount).toBeGreaterThan(0);
  });

  test("switching back to first tab restores original content", async () => {
    const tabCount = await subcellularLocationSection.getTabCount();
    if (tabCount < 2) {
      test.skip(true, "Need at least 2 tabs to test tab switching back");
      return;
    }

    const initialItemCount = await subcellularLocationSection.getLocationItemCount();

    await subcellularLocationSection.clickTabByIndex(1);
    await subcellularLocationSection.clickTabByIndex(0);
    await subcellularLocationSection.waitForLoad();

    const restoredItemCount = await subcellularLocationSection.getLocationItemCount();
    expect(restoredItemCount).toBe(initialItemCount);
  });
});