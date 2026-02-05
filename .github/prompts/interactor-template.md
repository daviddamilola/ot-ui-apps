# Interactor Generation Template

You are generating a Page Object Model (POM) interactor class for the Open Targets Platform.

## CRITICAL: Chain-of-Thought Analysis Required

Before generating ANY code, you MUST:
1. Carefully read the widget's Body component code
2. Identify ONLY the UI components that are actually present
3. List exactly what elements exist (tables, charts, forms, links, buttons)
4. Generate methods ONLY for elements that exist

**DO NOT:**
- Copy methods from examples if the widget doesn't have those elements
- Add table methods if there's no table component (OtTable, Table, etc.)
- Add search methods if there's no search functionality
- Add pagination methods if there's no pagination
- Assume any functionality that isn't explicitly in the code

## Context

The Open Targets Platform is a drug discovery tool that displays scientific data about targets, diseases, drugs, and evidence. Each entity page has multiple "sections" or "widgets" that display specific types of data.

## Interactor Structure

Each interactor class should follow this structure:

```typescript
import type { Locator, Page } from "@playwright/test";

export class [WidgetName]Section {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ALWAYS INCLUDE: Section container - uses data-testid
  getSection(): Locator {
    return this.page.locator("[data-testid='section-[sectionId]']");
  }

  async isSectionVisible(): Promise<boolean> {
    return await this.getSection().isVisible();
  }

  // ALWAYS INCLUDE: Section header
  getSectionHeader(): Locator {
    return this.page.locator("[data-testid='section-[sectionId]-header']");
  }

  async getSectionTitle(): Promise<string | null> {
    return await this.getSectionHeader().textContent();
  }

  // ALWAYS INCLUDE: Wait for section to load
  async waitForSectionLoad(): Promise<void> {
    await this.getSection().waitFor({ state: "visible" });
  }

  // ONLY add methods below if the corresponding UI element EXISTS in the widget
}
```

## Conditional Patterns (ONLY include if element exists)

### For sections with OtTable (check for `<OtTable` or `OtTable` import):
- `getTable()` - returns table locator
- `getTableRows()` - returns all table body rows  
- `getRowCount()` - returns number of rows
- `getCell(rowIndex, columnIndex)` - returns specific cell

### For sections with search/filter (check for `showGlobalFilter` or search input):
- `getSearchInput()` - returns search input locator
- `search(term)` - performs search action
- `clearSearch()` - clears search

### For sections with pagination (check for pagination component):
- `getNextPageButton()` - returns next page button
- `getPreviousPageButton()` - returns previous page button
- `clickNextPage()` - clicks next page
- `clickPreviousPage()` - clicks previous page

### For sections with charts/visualizations (check for Chart/Plot components):
- `getChart()` - returns chart container
- `isChartVisible()` - checks chart visibility

### For sections with external links (check for `<Link external`):
- `getExternalLinks()` - returns all external link locators

### For sections with download button (check for `dataDownloader`):
- `getDownloadButton()` - returns download button locator

## Naming Conventions

- Class name: PascalCase with "Section" suffix (e.g., `KnownDrugsSection`)
- Methods: camelCase, starting with verb (get, is, has, click, wait, etc.)
- Locator methods: prefix with "get" (e.g., `getTable()`)
- Boolean methods: prefix with "is" or "has" (e.g., `isVisible()`)
- Action methods: use verb (e.g., `clickNextPage()`, `search()`)

## Data Test IDs

Use these patterns for data-testid selectors:
- Section container: `section-[sectionId]`
- Section header: `section-[sectionId]-header`
- Section description: `section-description`
- Tables: standard HTML table selectors within section
- Buttons: descriptive names like `next-page-button`, `export-button`

## Important Notes

1. Always use async/await for Playwright operations
2. Return Locators for element getters (allows chaining and assertions)
3. Return Promises for action methods
4. Include error handling with `.catch()` for optional elements
5. Add appropriate timeouts for dynamic content
6. Make sure any imports are valid imports
7. When using a data-testid, make sure they are added to the component being used and that they will eventually be rendered in the dom.
