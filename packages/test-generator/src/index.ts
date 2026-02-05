/**
 * Test Generator Package
 *
 * Automated test generation for Open Targets Platform widgets using LLM + AST.
 */

// Types
export type {
  WidgetInfo,
  WidgetAnalysis,
  TestGeneratorConfig,
  GenerationResult,
  DataTestIdSuggestion,
  ASTProcessingResult,
  ASTFileResult,
  ASTProcessingOptions,
} from './types';

export { DEFAULT_CONFIG } from './types';

// Widget detection
export { detectNewWidgets, readWidgetSources, getNewFiles, detect } from './detector';

// AST utilities
export { parseCode, addDataTestIdsToComponent, processWidgetForTestIds } from './ast-utils';

// Generation
export {
  analyzeWidget,
  generateInteractor,
  generateTest,
  generateTestsForWidget,
  loadExamples,
  writeGeneratedFiles,
  applyDataTestIds,
} from './generator';
