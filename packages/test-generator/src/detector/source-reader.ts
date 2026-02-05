/**
 * Source file reading utilities
 */

import * as fs from 'fs';
import * as path from 'path';

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const MAIN_FILES = ['index', 'Body', 'Summary', 'Description'];

/**
 * Extract local imports from a source file
 */
export function extractLocalImports(sourceCode: string): string[] {
  if (!sourceCode) return [];

  const imports: string[] = [];
  const importRegex =
    /import\s+(?:(?:\{[^}]*\})|(?:[^{}\s]+))\s+from\s+['"](\.[^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(sourceCode)) !== null) {
    const importPath = match[1];
    // Skip GraphQL imports and utility imports
    if (
      !importPath.endsWith('.gql') &&
      !importPath.includes('context') &&
      !importPath.includes('utils')
    ) {
      imports.push(importPath);
    }
  }

  return imports;
}

/**
 * Resolve import path to actual file path
 */
export function resolveImportPath(basePath: string, importPath: string): string | null {
  const cleanPath = importPath.replace(/^\.\//, '');

  for (const ext of EXTENSIONS) {
    // Try direct file
    const fullPath = path.join(basePath, `${cleanPath}${ext}`);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
    // Try index file in directory
    const indexPath = path.join(basePath, cleanPath, `index${ext}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }

  return null;
}

/**
 * Read a file if it exists with any of the standard extensions
 */
export function readFileWithExtension(
  basePath: string,
  fileName: string
): { content: string; path: string } | null {
  for (const ext of EXTENSIONS) {
    const filePath = path.join(basePath, `${fileName}${ext}`);
    if (fs.existsSync(filePath)) {
      return {
        content: fs.readFileSync(filePath, 'utf-8'),
        path: filePath,
      };
    }
  }
  return null;
}

/**
 * Read widget source files for LLM context
 */
export function readWidgetSources(widgetPath: string): {
  sources: Record<string, string>;
  sourcePaths: Record<string, string>;
} {
  const sources: Record<string, string> = {};
  const sourcePaths: Record<string, string> = {};

  // First pass: read main files
  for (const file of MAIN_FILES) {
    const result = readFileWithExtension(widgetPath, file);
    if (result) {
      sources[file] = result.content;
      sourcePaths[file] = result.path;
    }
  }

  // Second pass: resolve and read imported local components from Body
  const bodySource = sources['Body'];
  if (bodySource) {
    const localImports = extractLocalImports(bodySource);

    for (const importPath of localImports) {
      const resolvedPath = resolveImportPath(widgetPath, importPath);
      if (resolvedPath) {
        const componentName = importPath.replace(/^\.\//, '').split('/').pop()!;
        if (!sources[componentName]) {
          try {
            sources[componentName] = fs.readFileSync(resolvedPath, 'utf-8');
            sourcePaths[componentName] = resolvedPath;
          } catch {
            // Ignore read errors
          }
        }
      }
    }
  }

  // Read GraphQL files
  if (fs.existsSync(widgetPath)) {
    const gqlFiles = fs.readdirSync(widgetPath).filter((f) => f.endsWith('.gql'));
    for (const gqlFile of gqlFiles) {
      const gqlPath = path.join(widgetPath, gqlFile);
      sources[gqlFile] = fs.readFileSync(gqlPath, 'utf-8');
      sourcePaths[gqlFile] = gqlPath;
    }
  }

  return { sources, sourcePaths };
}
