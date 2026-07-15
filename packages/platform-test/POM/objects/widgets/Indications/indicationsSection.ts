/**
 * TECH-STACK ANALYSIS:
 * [Step 1 - IDENTIFY] Key imports:
 *   - "@apollo/client" → GraphQL data fetching
 *   - "@mui/material" (Box, Typography) → DOM-based MUI components
 *   - "ui" (SectionItem, OtTable, Link, ClinicalReportsMasterDetailFrame, RecordsCards) → DOM-based custom components
 *   - "@fortawesome/react-fontawesome" → SVG icon rendering inside DOM
 *   - "react" → Standard React rendering
 *
 * [Step 2 - DEDUCE] DOM structure: DOM-based because MUI and OtTable render standard HTML elements
 *   (divs, tables, inputs, buttons). No canvas or pure SVG charting libraries present.
 *   The layout is a master-detail frame: left panel = IndicationsTable (OtTable with card rows),
 *   right panel = RecordsCards (shown on row selection).
 *
 * [Step 3 - STRATEGIZE] Selector approach:
 *   - Use the single confirmed data-testid: "Indications-table-container" (on each card row Box)
 *   - Use role/text selectors for search input, pagination buttons, download button
 *   - Use CSS/element selectors for table structure (OtTable renders a <table>)
 *   - Use getByText for disease name links
 *   - Section container via section ID heading text or role
 */

import type { Locator, Page } from "@playwright/test";

/**
 * Interactor for the Indications section on drug pages.
 *
 * Displays investigational and approved disease indications for a drug,
 * sourced from clinical trial records and ChEMBL. Renders a master-detail
 * layout: the master panel is a searchable, downloadable table of indication
 * cards; selecting a row loads clinical report cards in the detail panel.
 *
 * @example
 *