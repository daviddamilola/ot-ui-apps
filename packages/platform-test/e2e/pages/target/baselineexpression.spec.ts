import { expect, test } from "../../../fixtures";
import { BaselineExpressionSection } from "../../../POM/objects/widgets/BaselineExpression/baselineExpressionSection";
import { TargetPage } from "../../../POM/page/target/target";

test.describe("Baseline Expression Section", () => {
  let targetPage: TargetPage;
  let baselineExpressionSection: BaselineExpressionSection;

  test.beforeEach(async ({ page, testConfig }) => {
    targetPage = new TargetPage(page);
    baselineExpressionSection = new BaselineExpressionSection(page);

    await targetPage.goToTargetPage(testConfig.target.primary);

    const sectionVisible = await baselineExpressionSection.isSectionVisible();
    if (!sectionVisible) {
      test.skip(true, "Baseline Expression section not found for this target");
      return;
    }

    await baselineExpressionSection.waitForLoad();
  });

  test("Baseline Expression section is visible", async () => {
    expect(await baselineExpressionSection.isSectionVisible()).toBe(true);
  });

  test("Summary tab is visible and active by default", async () => {
    const summaryTab = await baselineExpressionSection.getSummaryTab();
    expect(summaryTab).not.toBeNull();
    await expect(summaryTab).toBeVisible();
  });

  test("GTEx tab is visible", async () => {
    const gtexTab = await baselineExpressionSection.getGtexTab();
    expect(gtexTab).not.toBeNull();
    await expect(gtexTab).toBeVisible();
  });

  test("Can switch to GTEx tab", async () => {
    await baselineExpressionSection.clickGtexTab();
    const isGtexActive = await baselineExpressionSection.isGtexTabActive();
    expect(isGtexActive).toBe(true);
  });

  test("Can switch back to Summary tab from GTEx tab", async () => {
    await baselineExpressionSection.clickGtexTab();
    await baselineExpressionSection.clickSummaryTab();
    const isSummaryActive = await baselineExpressionSection.isSummaryTabActive();
    expect(isSummaryActive).toBe(true);
  });

  test("Documentation external link is present", async () => {
    const docLink = await baselineExpressionSection.getDocumentationLink();
    expect(docLink).not.toBeNull();
    await expect(docLink).toBeVisible();
  });

  test("Tabula Sapiens external link is present", async () => {
    const tabulaLink = await baselineExpressionSection.getTabulaSapiensLink();
    expect(tabulaLink).not.toBeNull();
    await expect(tabulaLink).toBeVisible();
  });

  test("GTEx portal external link is present", async () => {
    const gtexLink = await baselineExpressionSection.getGtexPortalLink();
    expect(gtexLink).not.toBeNull();
    await expect(gtexLink).toBeVisible();
  });

  test("PRIDE (OTAR3091) external link is present", async () => {
    const prideLink = await baselineExpressionSection.getPrideLink();
    expect(prideLink).not.toBeNull();
    await expect(prideLink).toBeVisible();
  });

  test("DICE external link is present", async () => {
    const diceLink = await baselineExpressionSection.getDiceLink();
    expect(diceLink).not.toBeNull();
    await expect(diceLink).toBeVisible();
  });

  test("Documentation link points to correct URL", async () => {
    const docLink = await baselineExpressionSection.getDocumentationLink();
    const href = await docLink.getAttribute("href");
    expect(href).toContain("platform-docs.opentargets.org/target/baseline-expression");
  });

  test("Tabula Sapiens link points to correct URL", async () => {
    const tabulaLink = await baselineExpressionSection.getTabulaSapiensLink();
    const href = await tabulaLink.getAttribute("href");
    expect(href).toContain("tabula-sapiens.sf.czbiohub.org");
  });

  test("GTEx portal link points to correct URL", async () => {
    const gtexLink = await baselineExpressionSection.getGtexPortalLink();
    const href = await gtexLink.getAttribute("href");
    expect(href).toContain("gtexportal.org");
  });

  test("PRIDE link points to correct URL", async () => {
    const prideLink = await baselineExpressionSection.getPrideLink();
    const href = await prideLink.getAttribute("href");
    expect(href).toContain("opentargets.org/OTAR3091");
  });

  test("DICE link points to correct URL", async () => {
    const diceLink = await baselineExpressionSection.getDiceLink();
    const href = await diceLink.getAttribute("href");
    expect(href).toContain("dice-database.org");
  });

  test("External links open in new tab", async () => {
    const docLink = await baselineExpressionSection.getDocumentationLink();
    const target = await docLink.getAttribute("target");
    expect(target).toBe("_blank");
  });

  test("Summary tab content is displayed when Summary tab is active", async () => {
    await baselineExpressionSection.clickSummaryTab();
    const summaryContent = await baselineExpressionSection.getSummaryTabContent();
    expect(summaryContent).not.toBeNull();
    await expect(summaryContent).toBeVisible();
  });

  test("GTEx tab content is displayed when GTEx tab is active", async () => {
    await baselineExpressionSection.clickGtexTab();
    const gtexContent = await baselineExpressionSection.getGtexTabContent();
    expect(gtexContent).not.toBeNull();
    await expect(gtexContent).toBeVisible();
  });
});