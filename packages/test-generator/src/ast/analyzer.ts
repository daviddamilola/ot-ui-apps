/**
 * Component analyzer for identifying elements that need data-testids
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as recast from 'recast';
import { parseCode } from './parser';
import { hasDataTestId, getJSXElementName, hasAttribute } from './jsx-utils';
import { analyzeImports, CategorizedImports } from './import-extractor';

/**
 * Target component configuration
 */
export interface TargetComponent {
  /** Component name to match */
  name: string;
  /** Pattern for generating test ID (null means skip unless special) */
  testIdPattern: string | null;
  /** Only add testid if element has 'external' prop */
  onlyExternal?: boolean;
  /** Skip unless element has className or role */
  skipUnlessSpecial?: boolean;
  /** Source package (for reference) */
  source?: string;
}

/**
 * Known interactive components and their test ID patterns
 * These provide custom patterns/rules for specific components.
 * Components NOT in this list will get a default pattern based on their name.
 */
export const COMPONENT_PATTERNS: Record<string, Partial<TargetComponent>> = {
  // Components with custom patterns
  SectionItem: { testIdPattern: 'section-{id}' },
  
  // Components with special rules
  Link: { testIdPattern: '{id}-link', onlyExternal: true },
  
  // Container components - skip unless they have meaningful attributes
  Box: { testIdPattern: null, skipUnlessSpecial: true },
  Paper: { testIdPattern: null, skipUnlessSpecial: true },
  Container: { testIdPattern: null, skipUnlessSpecial: true },
  Grid: { testIdPattern: null, skipUnlessSpecial: true },
  Stack: { testIdPattern: null, skipUnlessSpecial: true },
  div: { testIdPattern: null, skipUnlessSpecial: true },
  span: { testIdPattern: null, skipUnlessSpecial: true },
  
  // Typography - usually not interactive, skip
  Typography: { testIdPattern: null, skipUnlessSpecial: true },
};

/**
 * Convert component name to kebab-case for test ID
 */
function toKebabCase(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Generate default test ID pattern for a component
 */
function getDefaultPattern(componentName: string): string {
  const kebabName = toKebabCase(componentName);
  return `{id}-${kebabName}`;
}

/**
 * Build target components list from imports
 * 
 * Every imported UI/MUI component becomes a target.
 * Components in COMPONENT_PATTERNS get custom rules, others get default patterns.
 */
export function buildTargetComponentsFromImports(
  imports: CategorizedImports
): TargetComponent[] {
  const targets: TargetComponent[] = [];
  const seen = new Set<string>();

  const processImport = (imp: { name: string; source: string }) => {
    if (seen.has(imp.name)) return;
    seen.add(imp.name);

    const customPattern = COMPONENT_PATTERNS[imp.name];
    
    // Use custom pattern if exists, otherwise generate default
    const testIdPattern = customPattern?.testIdPattern !== undefined
      ? customPattern.testIdPattern
      : getDefaultPattern(imp.name);

    targets.push({
      name: imp.name,
      testIdPattern,
      onlyExternal: customPattern?.onlyExternal,
      skipUnlessSpecial: customPattern?.skipUnlessSpecial,
      source: imp.source,
    });
  };

  // Process all UI and MUI components
  imports.uiComponents.forEach(processImport);
  imports.muiComponents.forEach(processImport);

  return targets;
}

/**
 * Build target components from source code
 */
export function buildTargetComponentsFromCode(code: string): TargetComponent[] {
  const imports = analyzeImports(code);
  return buildTargetComponentsFromImports(imports);
}

/**
 * Suggestion for adding a data-testid
 */
export interface TestIdSuggestion {
  elementName: string;
  testId: string;
  line: number | undefined;
  column: number | undefined;
  node: t.JSXElement;
}

/**
 * Result of analyzing a component for test IDs
 */
export interface AnalysisResult {
  ast: recast.types.ASTNode;
  suggestions: TestIdSuggestion[];
}

/**
 * Generate a test ID from a pattern
 */
function generateTestId(pattern: string, sectionId: string, count: number): string {
  let testId = pattern.replace('{id}', sectionId);
  if (count > 1) {
    testId = `${testId}-${count}`;
  }
  return testId;
}

/**
 * Check if an element should be processed based on target config
 */
function shouldProcessElement(
  node: t.JSXElement,
  elementName: string,
  target: TargetComponent
): boolean {
  // Skip elements that already have data-testid
  if (hasDataTestId(node)) {
    return false;
  }

  // Skip generic elements unless they have special attributes
  if (target.skipUnlessSpecial) {
    const hasClassName = hasAttribute(node, 'className');
    const hasRole = hasAttribute(node, 'role');
    if (!hasClassName && !hasRole) {
      return false;
    }
  }

  // For Link, only process external links
  if (target.onlyExternal && elementName === 'Link') {
    if (!hasAttribute(node, 'external')) {
      return false;
    }
  }

  return true;
}

/**
 * Analyze a React component file and suggest data-testid additions
 * 
 * If no targetComponents are provided, they will be automatically
 * extracted from the file's imports.
 */
export function analyzeComponentForTestIds(
  code: string,
  sectionId: string,
  targetComponents?: TargetComponent[]
): AnalysisResult {
  const ast = parseCode(code);
  const suggestions: TestIdSuggestion[] = [];
  const counters: Record<string, number> = {};

  // Build target components from imports if not provided
  const targets = targetComponents ?? buildTargetComponentsFromCode(code);

  traverse(ast as t.Node, {
    JSXElement(path) {
      const node = path.node as t.JSXElement;
      const elementName = getJSXElementName(node);
      if (!elementName) return;

      const target = targets.find((tc) => tc.name === elementName);
      if (!target || !target.testIdPattern) return;

      if (!shouldProcessElement(node, elementName, target)) return;

      // Track count for unique IDs
      counters[elementName] = (counters[elementName] || 0) + 1;
      const count = counters[elementName];

      const testId = generateTestId(target.testIdPattern, sectionId, count);

      suggestions.push({
        elementName,
        testId,
        line: node.loc?.start.line,
        column: node.loc?.start.column,
        node,
      });
    },
  });

  return { ast, suggestions };
}
