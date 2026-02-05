/**
 * Configuration and types for the test generator
 */

export interface WidgetInfo {
  type: 'widget' | 'page';
  name: string;
  entity: string;
  path: string;
  id?: string | null;
  displayName?: string | null;
  sources?: Record<string, string>;
  sourcePaths?: Record<string, string>;
  suggestedTestIdChanges?: TestIdChanges;
}

export interface TestIdChanges {
  changes: TestIdChange[];
}

export interface TestIdChange {
  file: string;
  description: string;
  originalCode: string;
  newCode: string;
}

export interface WidgetAnalysis {
  uiComponents: string[];
  hasTable: boolean;
  hasChart: boolean;
  hasSearch: boolean;
  hasPagination: boolean;
  hasExternalLinks: boolean;
  hasDownloader: boolean;
  customInteractions: string[];
  existingTestIds: string[];
  suggestedTestIds: SuggestedTestId[];
  reasoning: string;
}

export interface SuggestedTestId {
  element: string;
  testId: string;
  file?: string;
  reason: string;
}

export interface GenerationResult {
  widget: string;
  entity: string;
  success: boolean;
  error?: string;
  analysis?: Partial<WidgetAnalysis>;
  dataTestIds?: {
    applied: number;
    failed: number;
    modifiedFiles: string[];
    method: 'ast' | 'llm' | 'none';
  };
  interactorPath?: string;
  testPath?: string;
}

export interface TestGeneratorConfig {
  /** Anthropic API key for LLM-based generation */
  anthropicApiKey?: string;
  /** Model to use for generation */
  model?: string;
  /** Maximum tokens for LLM responses */
  maxTokens?: number;
  /** Path to sections source code */
  sectionsPath?: string;
  /** Path to output interactors */
  interactorOutputPath?: string;
  /** Path to output test files */
  testOutputPath?: string;
  /** Path to fixtures file */
  fixturesPath?: string;
  /** Skip data-testid additions */
  skipDataTestIds?: boolean;
  /** Dry run mode - don't write files */
  dryRun?: boolean;
  /** Verbose output */
  verbose?: boolean;
}

export const DEFAULT_CONFIG: Required<TestGeneratorConfig> = {
  anthropicApiKey: '',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  sectionsPath: 'packages/sections/src',
  interactorOutputPath: 'packages/platform-test/POM/objects/widgets',
  testOutputPath: 'packages/platform-test/e2e/pages',
  fixturesPath: 'packages/platform-test/fixtures/testConfig.ts',
  skipDataTestIds: false,
  dryRun: false,
  verbose: false,
};

export const ENTITY_TYPES = [
  'target',
  'disease', 
  'drug',
  'evidence',
  'variant',
  'study',
  'credibleSet',
] as const;

export type EntityType = typeof ENTITY_TYPES[number];

/**
 * AST Processing Types
 */
export interface DataTestIdSuggestion {
  element: string;
  testId: string;
  file?: string;
  reason?: string;
}

export interface ASTFileResult {
  name: string;
  path: string;
  modified: boolean;
  testIdsAdded: number;
  error?: string;
  newCode?: string;
}

export interface ASTProcessingResult {
  totalApplied: number;
  files: ASTFileResult[];
}

export interface ASTProcessingOptions {
  dryRun?: boolean;
  verbose?: boolean;
}
