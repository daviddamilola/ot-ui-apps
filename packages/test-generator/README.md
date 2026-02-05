# Test Generator

Automated test generation for Open Targets Platform widgets using LLM (Claude) + AST analysis.

## Features

- 🔍 **Widget Detection**: Automatically detects new widgets added in PRs
- 🤖 **LLM Analysis**: Uses Claude to analyze widget structure and generate appropriate tests
- 🌳 **AST-based Data-testid Injection**: Reliably adds data-testid attributes using Babel/recast
- 📝 **Interactor Generation**: Creates Playwright Page Object Model interactors
- 🧪 **Test Generation**: Creates comprehensive Playwright test suites
- 🔄 **GitHub Action**: Deployable as a reusable GitHub Action

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

Add to your workflow:

```yaml
name: Generate Tests

on:
  pull_request:
    paths:
      - 'packages/sections/src/**'

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
          commit-changes: 'true'
```

### Action Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `anthropic-api-key` | Anthropic API key for Claude | Yes | - |
| `github-token` | GitHub token for PR access | No | `${{ github.token }}` |
| `base-branch` | Base branch to compare against | No | `main` |
| `skip-data-testids` | Skip adding data-testid attributes | No | `false` |
| `dry-run` | Run without writing files | No | `false` |
| `commit-changes` | Commit changes back to PR branch | No | `true` |
| `commit-message` | Commit message for generated files | No | `chore: auto-generate tests...` |

### Action Outputs

| Output | Description |
|--------|-------------|
| `widgets-detected` | Number of new widgets detected |
| `tests-generated` | Number of tests successfully generated |
| `tests-failed` | Number of tests that failed to generate |
| `modified-files` | JSON array of modified source files |

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

### 1. Widget Detection

The detector analyzes git diff between the PR branch and base branch to find new widget directories in `packages/sections/src/*/`.

### 2. Source Collection

For each widget, it reads:
- `index.tsx` - Widget entry point
- `Body.tsx` - Main component
- `Summary.tsx` - Summary component (if exists)
- `Description.tsx` - Description component (if exists)
- All imported local components
- GraphQL query files

### 3. LLM Analysis

Claude analyzes the widget code to understand:
- What UI components are present (tables, charts, etc.)
- What interactions are available
- What existing data-testid attributes exist
- What test scenarios make sense

### 4. AST-based Data-testid Injection

Using Babel and recast, the tool:
- Parses TypeScript/JSX source files
- Identifies components that need data-testid (OtTable, SectionItem, Link, etc.)
- Adds appropriate data-testid attributes
- Preserves original formatting

### 5. Code Generation

Based on the analysis:
- Generates Playwright interactor classes following POM pattern
- Generates comprehensive test suites
- Only includes methods/tests for features that actually exist

## Configuration

Default configuration:

```typescript
const DEFAULT_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  widgetBasePath: 'packages/sections/src',
  interactorOutputPath: 'packages/platform-test/POM/objects',
  testOutputPath: 'packages/platform-test/e2e/pages',
  fixturesPath: 'packages/platform-test/fixtures/testConfig.ts',
};
```

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

## Architecture

```
packages/test-generator/
├── src/
│   ├── index.ts      # Package exports
│   ├── types.ts      # TypeScript types
│   ├── detector.ts   # Widget detection logic
│   ├── ast-utils.ts  # AST manipulation with Babel/recast
│   ├── generator.ts  # LLM-based code generation
│   └── cli.ts        # Command-line interface
├── action.yml        # GitHub Action definition
├── package.json
├── tsconfig.json
└── README.md
```

## License

Apache 2.0
