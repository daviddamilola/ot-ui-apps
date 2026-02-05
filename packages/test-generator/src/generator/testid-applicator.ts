/**
 * Data-testid application to widget source files
 */

import * as fs from 'fs';
import { WidgetInfo, TestGeneratorConfig } from '../types';
import { processWidgetForTestIds } from '../ast-utils';

export interface DataTestIdResult {
  applied: number;
  failed: number;
  files: string[];
  method: 'ast' | 'none';
}

/**
 * Apply data-testids to widget source files using AST transformation
 */
export function applyDataTestIds(
  widget: WidgetInfo,
  config: TestGeneratorConfig
): DataTestIdResult {
  if (config.skipDataTestIds) {
    return { applied: 0, failed: 0, files: [], method: 'none' };
  }

  try {
    const results = processWidgetForTestIds(widget, {
      dryRun: config.dryRun,
      verbose: config.verbose,
    });

    const modifiedFiles: string[] = [];

    if (!config.dryRun) {
      for (const file of results.files) {
        if (file.modified && file.newCode && file.path) {
          fs.writeFileSync(file.path, file.newCode);
          modifiedFiles.push(file.path);

          // Update widget sources with new code
          if (widget.sources) {
            widget.sources[file.name] = file.newCode;
          }
        }
      }
    }

    return {
      applied: results.totalApplied,
      failed: 0,
      files: modifiedFiles,
      method: 'ast',
    };
  } catch {
    return { applied: 0, failed: 0, files: [], method: 'none' };
  }
}
