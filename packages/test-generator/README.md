# Test Generator

Automated test generation for Open Targets Platform **widgets** and **pages** using LLM (Claude) with structured reasoning protocols.

## Key Features

- 🔍 **Widget & Page Detection**: Automatically detects new widgets and pages added in PRs
- 🤖 **LLM Analysis with Structured Reasoning**: Uses Claude with "Thought-Action-Observation" protocols
- 🎯 **Intelligent Rendering Technology Detection**: Distinguishes Canvas/WebGL, SVG, and DOM components
- 🧠 **Smart data-testid Injection**: LLM verifies prop spreading before suggesting test IDs
- 🔗 **Prop Drilling Support**: Adds `testId` props to components that don't spread props
- 📝 **POM Interactor Generation**: Creates Playwright Page Object Model interactors
- 🧪 **Test Suite Generation**: Creates comprehensive Playwright test suites
- 🔄 **GitHub Action Integration**: Creates separate PR with generated tests

## LLM Reasoning Protocol

The test generator uses structured "Thought-Action-Observation" prompts to ensure reliable code generation:

### Tech-Stack Analysis (Required Before Code Generation)

```
Step 1: IDENTIFY - Extract key UI imports from source
Step 2: DEDUCE - Determine DOM structure (Canvas/SVG/DOM)
Step 3: STRATEGIZE - Choose appropriate selector approach
```

### Rendering Technology Classification

| Import Pattern | Technology | DOM Queryable? |
|----------------|------------|----------------|
| `@pixi/react`, Stage, Container, Sprite | Canvas | No (only `<canvas>` element) |
| `three`, WebGLRenderer | WebGL | No (only `<canvas>` element) |
| `<svg>`, `<path>`, `<rect>` in JSX | SVG | Yes |
| `d3-selection`, `d3-axis` (DOM bindings) | SVG | Yes |
| `d3-array`, `d3-scale`, `d3-format` | Math only | N/A (no rendering) |
| `recharts`, `visx`, `nivo` | SVG | Yes |
| MUI components, HTML elements | DOM | Yes |

### Failure Mode Guards

| Failure Mode | Mitigation |
|--------------|------------|
| **Prompt Drift** | Concise numbered steps + decision matrices |
| **Over-Inference** | Explicit warnings (e.g., "d3-scale is math, NOT SVG") |
| **Non-Determinism** | Required output format with reasoning blocks |

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           TEST GENERATOR PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   GitHub Action  │
                              │   / CLI Trigger  │
                              └────────┬─────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: DETECTION                                                              │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │   ┌─────────────┐      ┌─────────────────┐      ┌────────────────────┐    │  │
│  │   │  Git Diff   │─────▶│ Widget/Page     │─────▶│ Detected Items     │    │  │
│  │   │ (vs base)   │      │ Detector        │      │ • Widgets          │    │  │
│  │   └─────────────┘      └─────────────────┘      │ • Pages            │    │  │
│  │                                                 └────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: SOURCE COLLECTION                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │   ┌─────────────┐      ┌─────────────────┐      ┌────────────────────┐    │  │
│  │   │Widget/Page  │─────▶│ Source Reader   │─────▶│ Collected Sources  │    │  │
│  │   │ Path        │      │ • Reads files   │      │ • Body.tsx         │    │  │
│  │   └─────────────┘      │ • Follows imports│     │ • Local components │    │  │
│  │   ┌─────────────┐      │ • Finds UI deps │      │ • GraphQL queries  │    │  │
│  │   │ UI Package  │─────▶│                 │─────▶│ • UI package source│    │  │
│  │   │ (components)│      └─────────────────┘      └────────────────────┘    │  │
│  │   └─────────────┘                                                          │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: LLM ANALYSIS (Structured Reasoning Protocol)                           │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │   ┌─────────────────┐      ┌─────────────────────────────────────────┐    │  │
│  │   │ Widget Sources  │─────▶│   Claude LLM with Reasoning Protocol   │    │  │
│  │   │ + UI Sources    │      │                                         │    │  │
│  │   └─────────────────┘      │  Step 1: IDENTIFY - Extract imports     │    │  │
│  │                            │  Step 2: DEDUCE - Determine DOM type    │    │  │
│  │   ┌─────────────────┐      │  Step 3: STRATEGIZE - Choose approach   │    │  │
│  │   │ Widget Analysis │◀─────│                                         │    │  │
│  │   │ • hasTable      │      │  Classification applied before code gen │    │  │
│  │   │ • hasChart      │      └─────────────────────────────────────────┘    │  │
│  │   │ • renderingType │                                                      │  │
│  │   │ • interactions  │                                                      │  │
│  │   └─────────────────┘                                                      │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
                                       │
                          ┌────────────┴────────────┐
                          ▼                         ▼
┌─────────────────────────────────────┐  ┌─────────────────────────────────────────┐
│  PHASE 4A: DATA-TESTID INJECTION    │  │  PHASE 4B: TEST GENERATION              │
│  ┌───────────────────────────────┐  │  │  ┌─────────────────────────────────────┐│
│  │  Component Analysis Checklist │  │  │  │  Code Generation with Analysis      ││
│  │  ┌───────────┐ ┌───────────┐  │  │  │  │  ┌───────────┐    ┌─────────────┐  ││
│  │  │ Checklist │ │ Applicator│  │  │  │  │  │  Claude   │───▶│ Interactor  │  ││
│  │  │           │─▶│           │  │  │  │  │  │   LLM     │    │   (.ts)     │  ││
│  │  │ • DOM? Y/N│ │ • testids │  │  │  │  │  │           │    └─────────────┘  ││
│  │  │ • Props?  │ │ • testId  │  │  │  │  │  │ Tech-Stack│                     ││
│  │  │ • Canvas? │ │   props   │  │  │  │  │  │ Analysis  │    ┌─────────────┐  ││
│  │  │ • Context?│ │ • prop    │  │  │  │  │  │ Required  │───▶│ Test Suite  │  ││
│  │  └───────────┘ │   drilling│  │  │  │  │  │ First     │    │  (.spec.ts) │  ││
│  │                └───────────┘  │  │  │  │  └───────────┘    └─────────────┘  ││
│  └───────────────────────────────┘  │  │  └─────────────────────────────────────┘│
└─────────────────────────────────────┘  └─────────────────────────────────────────┘
                          │                         │
                          └────────────┬────────────┘
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 5: OUTPUT                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │   Modified Source Files           Generated Test Files                     │  │
│  │   ┌─────────────────────┐       ┌─────────────────────────────────────┐   │  │
│  │   │ packages/sections/  │       │ packages/platform-test/             │   │  │
│  │   │   src/{entity}/     │       │   POM/objects/widgets/{Widget}/     │   │  │
│  │   │     {Widget}/       │       │     {widget}Section.ts              │   │  │
│  │   │       Body.tsx ✏️   │       │   POM/page/{entity}/                │   │  │
│  │   │       (testId prop) │       │     {entity}.ts                     │   │  │
│  │   └─────────────────────┘       │   e2e/pages/{entity}/               │   │  │
│  │                                 │     {widgetname}.spec.ts            │   │  │
│  │                                 └─────────────────────────────────────┘   │  │
│  │                                                                            │  │
│  │                    ┌─────────────────────────────────────────┐             │  │
│  │                    │  Create PR with generated tests         │             │  │
│  │                    │  (branch: auto-tests/*)                 │             │  │
│  │                    └─────────────────────────────────────────┘             │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### data-testid Decision Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         LLM-BASED DATA-TESTID ANALYSIS                          │
└─────────────────────────────────────────────────────────────────────────────────┘

   Component Analysis Checklist (LLM completes for each component):

   ┌────────────────────────────────────────────────────────────────────────────┐
   │  1. [ ] Does it render a DOM element? (Check JSX return)                   │
   │  2. [ ] Does it spread props? (Look for {...props} or {...rest})           │
   │  3. [ ] Is it a canvas/WebGL component? (Check imports)                    │
   │  4. [ ] Is it a provider/context wrapper? (Returns only children?)         │
   └────────────────────────────────────────────────────────────────────────────┘

   Decision Matrix:

   ┌──────────────┬────────────────┬─────────┬──────────────────────────────────┐
   │ Renders DOM? │ Spreads Props? │ Canvas? │ Action                           │
   ├──────────────┼────────────────┼─────────┼──────────────────────────────────┤
   │ Yes          │ Yes            │ No      │ ✓ Can add data-testid directly   │
   │ Yes          │ No             │ No      │ ✓ Needs testId prop added        │
   │ Yes          │ -              │ Yes     │ ✗ Add to DOM wrapper, not canvas │
   │ No           │ -              │ -       │ ✗ Skip (no DOM output)           │
   └──────────────┴────────────────┴─────────┴──────────────────────────────────┘

   Example Flow:

   ┌──────────────────┐     ┌────────────────────┐
   │ <OtTable         │────▶│ Spreads props to   │────▶ ✅ ADD data-testid
   │   columns=...    │     │ root MUI Table     │
   └──────────────────┘     └────────────────────┘

   ┌──────────────────┐     ┌────────────────────┐
   │ <GenTrackProvider│────▶│ Context Provider   │────▶ ❌ SKIP (no DOM)
   │   initialState=  │     │ Returns children   │
   └──────────────────┘     └────────────────────┘

   ┌──────────────────┐     ┌────────────────────┐
   │ <Stage>          │────▶│ @pixi/react import │────▶ ❌ SKIP (Canvas)
   │   <Container>    │     │ Renders to canvas  │      Add to wrapper instead
   └──────────────────┘     └────────────────────┘
```

## Installation

```bash
npm install @open-targets/test-generator
```

Or add to your project:

```bash
yarn add @open-targets/test-generator
```

## CLI Usage

### Detect New Widgets

```bash
# Detect widgets changed vs main branch
npx test-generator detect --base-branch main --output-file widgets.json

# With verbose output
npx test-generator detect --verbose
```

### Generate Tests

```bash
# Set API key
export ANTHROPIC_API_KEY=your-api-key

# Generate tests from detected widgets
npx test-generator generate --widgets-file widgets.json

# Dry run (no files written)
npx test-generator generate --widgets-file widgets.json --dry-run

# Skip data-testid injection
npx test-generator generate --widgets-file widgets.json --skip-data-testids
```

## GitHub Action Usage

The action detects new widgets in a PR and creates a **separate PR** with generated tests.

### Basic Usage

```yaml
name: Generate Tests

on:
  pull_request:
    types: [opened]
    paths:
      - 'packages/sections/src/**'

permissions:
  contents: write
  pull-requests: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: ${{ github.head_ref }}
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Generate Tests
        uses: ./packages/test-generator
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          base-branch: main
          source-branch: ${{ github.head_ref }}
          original-pr-number: ${{ github.event.pull_request.number }}
```

### Action Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `anthropic-api-key` | Anthropic API key for Claude | Yes | - |
| `github-token` | GitHub token for PR access | No | `${{ github.token }}` |
| `base-branch` | Base branch to compare against | No | `main` |
| `source-branch` | Source branch where widgets were added | No | `${{ github.head_ref }}` |
| `skip-data-testids` | Skip adding data-testid attributes | No | `false` |
| `dry-run` | Run without writing files | No | `false` |
| `create-pr` | Create a separate PR for generated tests | No | `true` |
| `original-pr-number` | Original PR number (for linking in comments) | No | - |

### Action Outputs

| Output | Description |
|--------|-------------|
| `widgets-detected` | Number of new widgets detected |
| `widgets-json` | JSON array of detected widgets |
| `tests-generated` | Number of tests successfully generated |
| `tests-failed` | Number of tests that failed to generate |
| `has-changes` | Whether any files were generated |
| `generated-branch` | Name of the branch with generated tests |
| `pr-number` | PR number for generated tests |
| `pr-url` | PR URL for generated tests |

## Programmatic API

```typescript
import {
  detectNewWidgets,
  readWidgetSources,
  analyzeWidget,
  generateTestsForWidget,
  processWidgetForTestIds,
} from '@open-targets/test-generator';

// Detect new widgets
const widgets = detectNewWidgets('main');

// Read widget source files
for (const widget of widgets) {
  widget.sources = readWidgetSources(widget.path);
}

// Generate tests
const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  dryRun: false,
  verbose: true,
};

for (const widget of widgets) {
  const result = await generateTestsForWidget(widget, config);
  console.log(`Generated tests for ${widget.name}:`, result);
}
```

## How It Works

### 1. Widget & Page Detection

The detector analyzes git diff between the PR branch and base branch to find new:
- **Widgets** in `packages/sections/src/*/`
- **Pages** in `apps/platform/src/pages/`

### 2. Source Collection

For each widget/page, it reads:
- `index.tsx` - Entry point
- `Body.tsx` - Main component
- `Summary.tsx` - Summary component (if exists)
- All imported local components
- GraphQL query files
- **UI component source files** (from `packages/ui/src/`) for prop spreading analysis

### 3. LLM Analysis with Structured Reasoning

Claude analyzes the code using a required protocol:

1. **IDENTIFY**: Extract actual imports from source code
2. **DEDUCE**: Determine DOM structure based on imports (Canvas/SVG/DOM)
3. **STRATEGIZE**: Choose appropriate testing approach

This structured approach prevents common LLM errors like assuming SVG for canvas-based components.

### 4. data-testid Analysis & Application

The LLM receives both widget sources AND UI component sources to:
- **Check prop spreading** - Can the component accept data-testid?
- **Identify providers** - Skip context-only components
- **Handle canvas components** - Add testid to wrapper, not canvas internals
- **Support prop drilling** - Add testId prop where props aren't spread

### 5. Code Generation

Based on the analysis:
- Generates Playwright interactor classes following POM pattern
- Generates comprehensive test suites
- Only includes methods/tests for features that actually exist
- Uses exact import paths and class names (no guessing)

## Configuration

Default configuration:

```typescript
const DEFAULT_CONFIG = {
  model: 'claude-sonnet-4-6',
  maxTokens: 4096,
  sectionsPath: 'packages/sections/src',
  interactorOutputPath: 'packages/platform-test/POM/objects/widgets',
  testOutputPath: 'packages/platform-test/e2e/pages',
  fixturesPath: 'packages/platform-test/fixtures/testConfig.ts',
};

const PAGE_CONFIG = {
  pagesPath: 'apps/platform/src/pages',
  pageInteractorOutputPath: 'packages/platform-test/POM/page',
  pageTestOutputPath: 'packages/platform-test/e2e/pages',
};
```

## Architecture

```
packages/test-generator/
├── src/
│   ├── index.ts              # Package exports
│   ├── types.ts              # TypeScript types
│   ├── cli.ts                # Command-line interface
│   │
│   ├── detector/             # Widget/Page detection module
│   │   ├── index.ts          # Module exports
│   │   ├── git-utils.ts      # Git diff operations
│   │   ├── widget-detector.ts # Detects new widgets in PRs
│   │   ├── page-detector.ts  # Detects page components
│   │   └── source-reader.ts  # Reads widget & UI sources
│   │
│   ├── generator/            # Code generation module
│   │   ├── index.ts          # Module exports
│   │   ├── orchestrator.ts   # Widget generation pipeline
│   │   ├── page-orchestrator.ts # Page generation pipeline
│   │   ├── analyzer.ts       # LLM widget analysis (with reasoning protocol)
│   │   ├── page-analyzer.ts  # LLM page analysis
│   │   ├── llm-client.ts     # Claude API client
│   │   ├── prompt-formatter.ts # Formats LLM prompts
│   │   ├── testid-applicator.ts # Applies data-testid + prop drilling
│   │   ├── interactor-generator.ts # Widget POM interactors
│   │   ├── page-interactor-generator.ts # Page POM interactors
│   │   ├── test-generator.ts # Widget Playwright tests
│   │   ├── page-test-generator.ts # Page Playwright tests
│   │   └── file-io.ts        # File write operations
│   │
│   └── ast/                  # AST utilities module
│       ├── index.ts          # Module exports
│       ├── analyzer.ts       # Component analysis
│       ├── parser.ts         # Babel parsing
│       ├── transformer.ts    # Code transforms
│       ├── import-extractor.ts # Import analysis
│       ├── jsx-utils.ts      # JSX manipulation
│       └── widget-processor.ts # Widget-specific processing
│
├── action.yml                # GitHub Action definition
├── package.json
├── tsconfig.json
└── README.md
```

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| **detector/** | Finds new widgets/pages via git diff, reads source files, extracts UI component dependencies |
| **generator/** | LLM-powered analysis with structured reasoning, generates interactors & tests, applies data-testid changes |
| **ast/** | Babel/recast utilities for code transformation (format-preserving) |

## Entity Types Supported

- `target`
- `disease`
- `drug`
- `evidence`
- `variant`
- `study`
- `credibleSet`

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## License

Apache 2.0
