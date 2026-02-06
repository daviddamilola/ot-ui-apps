# Test Generation Template

You are generating Playwright end-to-end tests for the Open Targets Platform.

## CRITICAL: Chain-of-Thought Analysis Required

Before generating ANY tests, you MUST:
1. Read the provided widget analysis JSON carefully
2. Review the interactor code to see what methods are available
3. Only write tests for features that ACTUALLY EXIST
4. Do NOT copy tests from examples if the widget doesn't have those features

**DO NOT:**
- Write table tests if the widget has no table (`hasTable: false`)
- Write search tests if there's no search (`hasSearch: false`)
- Write pagination tests if there's no pagination (`hasPagination: false`)
- Write chart tests if there's no chart (`hasChart: false`)
- Copy test patterns from examples that don't match this widget's features

## Context

The Open Targets Platform displays scientific data about:
- **Targets**: Genes/proteins (IDs like `ENSG00000158578`)
- **Diseases**: Medical conditions (IDs like `EFO_0000612`)
- **Drugs**: Pharmaceuticals (IDs like `CHEMBL25`)
- **Evidence**: Links between targets and diseases
- **Variants**: Genetic variants
- **Studies**: GWAS studies

Each entity page has a profile view with multiple sections/widgets.

## CRITICAL: Using Fixtures

Tests MUST use the custom fixtures system, NOT direct Playwright imports:

```typescript
// ✅ CORRECT - Import from fixtures
import { expect, test } from "../../../fixtures";

// ❌ WRONG - Do not import from @playwright/test
import { test } from "@playwright/test";
```

The fixtures provide a `testConfig` object with test data:

```typescript
test.beforeEach(async ({ page, testConfig }) => {
  // Use testConfig to get entity IDs
  await drugPage.goToDrugPage(testConfig.drug.primary);
  await variantPage.goToVariantPage(testConfig.variant.withEVA);
  await diseasePage.goToDiseasePage(testConfig.disease.primary);
});
```

## Test File Structure

```typescript
import { expect, test } from "../../../fixtures";
import { [WidgetName]Section } from "../../../POM/objects/widgets/[location]/[widgetName]Section";
import { [Entity]Page } from "../../../POM/page/[entity]/[entity]";

test.describe("[Widget Display Name] Section", () => {
  let [entity]Page: [Entity]Page;
  let [widget]Section: [WidgetName]Section;

  test.beforeEach(async ({ page, testConfig }) => {
    [entity]Page = new [Entity]Page(page);
    [widget]Section = new [WidgetName]Section(page);

    // Navigate using testConfig - use specific config if available
    await [entity]Page.goTo[Entity]Page(testConfig.[entity].with[WidgetName] ?? testConfig.[entity].primary);

    // Check if section is visible, skip if not
    const isVisible = await [widget]Section.isSectionVisible();
    if (isVisible) {
      await [widget]Section.waitForSectionLoad();
    } else {
      test.skip();
    }
  });

  // ALWAYS include this test
  test("Section is visible when data available", async () => {
    const isVisible = await [widget]Section.isSectionVisible();
    expect(isVisible).toBe(true);
  });

  // ONLY add tests below if the feature exists based on analysis
});
```

## Conditional Tests (ONLY include if feature exists)

### If hasTable is true:
```typescript
test("Table is visible with data", async () => {
  const rows = await [widget]Section.getTableRows();
  expect(rows.length).toBeGreaterThan(0);
});
```

### If hasChart is true:
```typescript
test("Chart/visualization is visible", async () => {
  const isChartVisible = await [widget]Section.isChartVisible();
  expect(isChartVisible).toBe(true);
});
```

### If hasSearch is true:
```typescript
test("Search filters results", async () => {
  await [widget]Section.search("test term");
  // Verify filtered results
});
```

### If hasExternalLinks is true:
```typescript
test("External links are present", async () => {
  const links = await [widget]Section.getExternalLinks();
  expect(links.length).toBeGreaterThan(0);
});
```

## TestConfig Structure

The `testConfig` fixture provides entity IDs for testing:

```typescript
interface TestConfig {
  drug: {
    primary: string;
    alternatives?: { ... };
  };
  variant: {
    primary: string;
    withMolecularStructure?: string;
    withPharmacogenomics?: string;
    // widget-specific IDs
  };
  target?: {
    primary?: string;
  };
  disease: {
    primary: string;
  };
  study: {
    gwas: { primary: string; };
  };
}
```

When a widget needs specific data, use the pattern:
- `testConfig.[entity].with[WidgetName]` for widget-specific IDs
- `testConfig.[entity].primary` as fallback

## Best Practices

1. **Always Use Fixtures**: Import from `"../../../fixtures"` not `"@playwright/test"`
2. **Use testConfig**: Get entity IDs from testConfig, never hardcode
3. **Skip Gracefully**: If section isn't visible, skip the test
4. **Test Independence**: Each test should be able to run independently
5. **Descriptive Names**: Test names should describe what is being tested
6. **Proper Waits**: Use `waitForSectionLoad()` before assertions
7. **Match Features to Tests**: Only test what actually exists in the widget

## Important Notes

1. Always import test/expect from "../../../fixtures"
2. Use testConfig fixture for all entity IDs
3. Skip tests gracefully when section has no data
4. Avoid hardcoded timeouts; use proper waits instead
5. Tests should pass on the staging environment
6. **ONLY write tests for features that exist in the widget based on the analysis**
