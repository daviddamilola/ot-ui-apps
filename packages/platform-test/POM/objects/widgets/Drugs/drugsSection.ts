/**
 * TECH-STACK ANALYSIS:
 * [Step 1 - IDENTIFY] Key imports:
 *   - "@apollo/client" → GraphQL data fetching
 *   - "@mui/material" (Box, Typography) → DOM-based MUI components
 *   - "ui" (SectionItem, OtTable, Link, RecordsCards, ClinicalReportsMasterDetailFrame) → DOM-based UI components
 *   - "@fortawesome/react-fontawesome" → SVG icon rendering inside DOM
 *   - "@fortawesome/free-solid-svg-icons" (faArrowRight, faArrowDown) → directional icons
 *
 * [Step 2 - DEDUCE] DOM structure: DOM-based because MUI and OtTable render standard HTML
 *   elements (div, table, input, button). OtTable renders a <table> with thead/tbody,
 *   global filter <input>, pagination controls, and a download button. The master-detail
 *   layout uses MUI Box containers. Drug cards are rendered as styled Box elements inside
 *   table cells (thead is hidden via CSS). RecordsCards renders in the detail panel.
 *
 * [Step 3 - STRATEGIZE] Selector approach:
 *   - Use the single confirmed data-testid: "drugs-table-container" (on each drug card Box)
 *   - Use role-based selectors for search input, pagination buttons, download button
 *   - Use CSS/element selectors for table rows and external links
 *   - Section container via data-testid="section-drugs" (standard OT platform pattern)
 */

import type { Locator, Page } from "@playwright/test";

/**
 * Interactor for the Drugs and Clinical Candidates section (target entity).
 *
 * Displays a master-detail layout: a DrugsTable (OtTable) on the left showing
 * drug cards with name, max clinical stage, and report count; and a RecordsCards
 * detail panel on the right that updates when a drug card is selected.
 *
 * Supports global search/filter, pagination, data download, and row selection.
 *
 * @example
 *