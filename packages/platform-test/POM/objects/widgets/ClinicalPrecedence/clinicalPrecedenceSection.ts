/**
 * TECH-STACK ANALYSIS:
 * [Step 1 - IDENTIFY] Key imports:
 *   - "ui" → OtTable, SectionItem, Link, Tooltip, DirectionOfEffectIcon, ClinicalRecordDrawer (DOM-based components)
 *   - "@mui/material" → Box, Typography (DOM-based MUI components)
 *   - "@apollo/client" → useQuery (data fetching, no DOM impact)
 *   - "@fortawesome/react-fontawesome" → FontAwesomeIcon (SVG icons rendered in DOM)
 *
 * [Step 2 - DEDUCE] DOM structure: DOM-based because OtTable renders a standard HTML <table>,
 *   MUI components render standard HTML elements, and all interactions are DOM-queryable.
 *   No canvas or WebGL rendering involved.
 *
 * [Step 3 - STRATEGIZE] Selector approach:
 *   - No data-testid attributes exist in source code
 *   - Use section ID "clinicalprecedence" to scope locators via heading/text
 *   - Use element roles and types: table, input[type='text'], button
 *   - Use text content for column headers and specific UI elements
 *   - Use getByRole for buttons (download, sort, drawer trigger)
 *   - Scope all locators within the section container identified by section heading
 */

import type { Locator, Page } from "@playwright/test";

/**
 * Interactor for the Clinical Precedence evidence section.
 *
 * Displays clinical candidates and approved drugs pharmacologically targeting
 * a gene/protein and indicated for a disease. Includes a sortable table with
 * columns for Report (with drawer), Disease/phenotype, Targets, Drug,
 * Direction of Effect, Stage, and Start Date. Supports global search/filter
 * and data download.
 *
 * @example
 *