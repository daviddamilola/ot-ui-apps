/**
 * Generator module - LLM-based code generation for tests and interactors
 * 
 * Re-exports from generator/ submodules for backwards compatibility.
 */

export {
  // LLM client
  callClaude,
  extractCodeBlock,
  extractJson,
  
  // Prompt utilities
  formatWidgetSourcesForPrompt,
  formatWidgetInfo,
  formatAnalysisForPrompt,
  
  // Widget analysis
  analyzeWidget,
  
  // Code generators
  generateInteractor,
  generateTest,
  type InteractorExamples,
  type TestExamples,
  
  // File I/O
  loadExamples,
  writeGeneratedFiles,
  type Examples,
  
  // Data-testid application
  applyDataTestIds,
  type DataTestIdResult,
  
  // Main orchestrator
  generateTestsForWidget,
} from './generator/index';
