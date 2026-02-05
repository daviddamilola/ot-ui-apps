/**
 * Page detection from git changes
 */

import * as fs from 'fs';

/**
 * Page information
 */
export interface PageInfo {
  type: 'page';
  name: string;
  path: string;
}

/**
 * Detect new pages from added files
 */
export function detectNewPages(
  addedFiles: string[],
  pagesPath = 'apps/platform/src/pages'
): PageInfo[] {
  const newPages: PageInfo[] = [];
  const detectedPagePaths = new Set<string>();

  for (const file of addedFiles) {
    if (!file.startsWith(pagesPath)) {
      continue;
    }

    const relativePath = file.replace(`${pagesPath}/`, '');
    const parts = relativePath.split('/');

    if (parts.length < 2) {
      continue;
    }

    const pageName = parts[0];
    const pagePath = `${pagesPath}/${pageName}`;

    if (detectedPagePaths.has(pagePath)) {
      continue;
    }

    if (fs.existsSync(pagePath)) {
      detectedPagePaths.add(pagePath);
      newPages.push({
        type: 'page',
        name: pageName,
        path: pagePath,
      });
    }
  }

  return newPages;
}
