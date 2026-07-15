/**
 * TECH-STACK ANALYSIS:
 * [Step 1 - IDENTIFY] Key imports:
 *   - "@mui/material" → Tabs, Tab, Alert, Collapse, Typography (DOM elements)
 *   - "@fortawesome/react-fontawesome" → FontAwesomeIcon (DOM SVG icon)
 *   - "ui" → SectionItem, Link (DOM elements)
 *   - "react" → Fragment, useState, useEffect (React runtime)
 *
 * [Step 2 - DEDUCE] DOM structure: DOM-based because MUI components render
 *   standard HTML elements (divs, buttons, anchors). Tabs render as role="tab"
 *   elements, Alert renders as a div with role="alert", Links render as <a> tags.
 *
 * [Step 3 - STRATEGIZE] Selector approach:
 *   - Use data-testid selectors for tabs and tab content panels (all 4 exist in source)
 *   - Use page.getByRole('tab') or getByText() for tab interaction fallbacks
 *   - Use page.getByRole('link') with name matching for external links in Description
 *   - Use page.getByRole('alert') for the dismissible Alert component
 */

import type { Locator, Page } from "@playwright/test";

/**
 * Interactor for the Baseline Expression section.
 *
 * Displays RNA and protein baseline expression data for a target gene,
 * with two tabs: "Summary" and "Variation (GTEx)". Includes an
 * informational alert and external links to data sources.
 *
 * @example
 *