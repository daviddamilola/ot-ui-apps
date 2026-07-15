/**
 * TECH-STACK ANALYSIS:
 * [Step 1 - IDENTIFY] Key imports:
 *   - "@mui/material" (Typography, List, ListItem, Box, Tabs, Tab) → DOM elements
 *   - "@fortawesome/react-fontawesome" → SVG icons rendered in DOM
 *   - "SwissBioVis" (SwissbioViz) → External web component (canvas/SVG cell diagram)
 *   - "ui" (SectionItem, Link) → DOM elements
 *
 * [Step 2 - DEDUCE] DOM structure: Mixed DOM + embedded visualization
 *   - MUI Tabs/Tab → Standard queryable DOM elements (role="tab", role="tablist")
 *   - MUI List/ListItem → Standard queryable DOM elements
 *   - SwissBioVis → External web component rendering a cell diagram (canvas or SVG internally,
 *     not directly queryable by test IDs but container is accessible)
 *   - All tab panels, location lists, and location items have data-testid attributes
 *
 * [Step 3 - STRATEGIZE] Selector approach:
 *   - Use ONLY the 3 confirmed data-testid values: "subcellular-tabs", "subcellular-locations-list",
 *     "subcellular-location-item"
 *   - For tabs, use role="tab" with name matching since individual tab test IDs are NOT in the
 *     confirmed list
 *   - For tab panels, use role="tabpanel" since tabpanel test IDs are NOT in the confirmed list
 *   - For the SwissBioVis visualization, locate by the web component tag or canvas element
 *   - For external links, use role="link" or anchor elements
 */

import type { Locator, Page } from "@playwright/test";

/**
 * Interactor for the Subcellular Location section on target pages.
 *
 * Displays subcellular location data from HPA and UniProt sources in a tabbed
 * interface. Each tab contains a SwissBioVis cell diagram visualization and a
 * text list of subcellular locations. Location list items support hover
 * interactions that highlight the corresponding cell part in the visualization.
 *
 * @example
 *