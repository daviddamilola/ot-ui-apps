#!/usr/bin/env node

/**
 * Generate Tests Script
 * 
 * This script uses Anthropic's Claude API to generate interactors and test files
 * for newly detected widgets/sections.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

const INTERACTOR_OUTPUT_PATH = 'packages/platform-test/POM/objects/widgets';
const TEST_OUTPUT_PATH = 'packages/platform-test/e2e/pages';
const FIXTURES_PATH = 'packages/platform-test/fixtures/testConfig.ts';

/**
 * Call Anthropic Claude API with optional extended thinking
 */
async function callClaude(systemPrompt, userPrompt, maxTokens = MAX_TOKENS, useExtendedThinking = false) {
  const requestBody = {
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  };

  // Add temperature for more deterministic outputs in code generation
  if (!useExtendedThinking) {
    requestBody.temperature = 0.2;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Load prompt templates
 */
function loadPromptTemplate(templateName) {
  const templatePath = path.join('.github/prompts', `${templateName}.md`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }
  return null;
}

/**
 * Load example files for few-shot learning
 */
function loadExamples() {
  const examples = {
    interactor: '',
    test: '',
    fixtures: ''
  };

  // Load example interactor
  const exampleInteractorPath = 'packages/platform-test/POM/objects/widgets/KnownDrugs/knownDrugsSection.ts';
  if (fs.existsSync(exampleInteractorPath)) {
    examples.interactor = fs.readFileSync(exampleInteractorPath, 'utf-8');
  }

  // Load example test that uses fixtures
  const exampleTestPath = 'packages/platform-test/e2e/pages/drug/drugIndications.spec.ts';
  if (fs.existsSync(exampleTestPath)) {
    examples.test = fs.readFileSync(exampleTestPath, 'utf-8');
  }

  // Load another widget interactor example
  const ontologyInteractorPath = 'packages/platform-test/POM/objects/widgets/Ontology/ontologySection.ts';
  if (fs.existsSync(ontologyInteractorPath)) {
    examples.interactorOntology = fs.readFileSync(ontologyInteractorPath, 'utf-8');
  }

  // Load shared interactor example (EVA)
  const sharedInteractorPath = 'packages/platform-test/POM/objects/widgets/shared/evaSection.ts';
  if (fs.existsSync(sharedInteractorPath)) {
    examples.interactorShared = fs.readFileSync(sharedInteractorPath, 'utf-8');
  }

  // Load current fixtures/testConfig.ts
  if (fs.existsSync(FIXTURES_PATH)) {
    examples.fixtures = fs.readFileSync(FIXTURES_PATH, 'utf-8');
  }

  return examples;
}

/**
 * Analyze widget code to understand its structure
 */
async function analyzeWidget(widget) {
  const systemPrompt = `You are an expert code analyst specializing in React components and UI testing.
Your task is to carefully analyze React component code and identify exactly what UI elements are present.
Be precise and thorough. Do NOT assume elements exist if they are not explicitly in the code.`;

  const userPrompt = `## Task
Carefully analyze the following React widget/section code and identify:
1. What UI components are actually rendered (tables, charts, forms, links, buttons, etc.)
2. What interactions are possible (clicking, filtering, searching, pagination, etc.)
3. What data-testid attributes already exist in the code
4. What data-testid attributes should be added for testing

## Widget Information
- **Name**: ${widget.name}
- **Entity**: ${widget.entity}
- **Section ID**: ${widget.id || widget.name.toLowerCase()}

## Widget Source Code

### index.ts
\`\`\`typescript
${widget.sources?.index || 'Not available'}
\`\`\`

### Body.tsx (or Body.jsx)
\`\`\`typescript
${widget.sources?.Body || 'Not available'}
\`\`\`

### Summary.tsx (or Summary.jsx)
\`\`\`typescript
${widget.sources?.Summary || 'Not available'}
\`\`\`

## Instructions
Think step by step:

1. **Identify UI Components**: List each UI component used (e.g., OtTable, Link, Tooltip, Chart, etc.)
2. **Has Table?**: Does this widget use OtTable, Table, or any table component? (true/false)
3. **Has Chart?**: Does this widget render a chart or visualization? (true/false)
4. **Has Search/Filter?**: Does this widget have search or filter functionality? (true/false)
5. **Has Pagination?**: Does this widget have pagination controls? (true/false)
6. **Has External Links?**: Does this widget render external links? (true/false)
7. **Custom Interactions**: List any widget-specific interactions (e.g., 3D viewer, expandable sections, etc.)
8. **Existing data-testid**: List any data-testid attributes already in the code
9. **Missing data-testid**: List data-testid attributes that should be added for better testability

Output your analysis as JSON in this exact format:
\`\`\`json
{
  "uiComponents": ["list", "of", "components"],
  "hasTable": true/false,
  "hasChart": true/false,
  "hasSearch": true/false,
  "hasPagination": true/false,
  "hasExternalLinks": true/false,
  "hasDownloader": true/false,
  "customInteractions": ["list", "of", "interactions"],
  "existingTestIds": ["list", "of", "existing", "testids"],
  "suggestedTestIds": [
    {"element": "element description", "testId": "suggested-test-id", "reason": "why it's needed"}
  ],
  "reasoning": "Brief explanation of your analysis"
}
\`\`\``;

  const response = await callClaude(systemPrompt, userPrompt, 2048);
  
  // Extract JSON from response
  let analysis = {};
  const jsonMatch = response.match(/```json\n([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      analysis = JSON.parse(jsonMatch[1].trim());
    } catch (e) {
      console.warn('  ⚠️ Could not parse widget analysis:', e.message);
      // Default analysis if parsing fails
      analysis = {
        hasTable: widget.sources?.Body?.includes('OtTable') || widget.sources?.Body?.includes('Table'),
        hasChart: widget.sources?.Body?.includes('Chart') || widget.sources?.Body?.includes('Plot'),
        hasSearch: widget.sources?.Body?.includes('showGlobalFilter') || widget.sources?.Body?.includes('Search'),
        hasPagination: widget.sources?.Body?.includes('pagination') || widget.sources?.Body?.includes('Pagination'),
        hasExternalLinks: widget.sources?.Body?.includes('Link external'),
        hasDownloader: widget.sources?.Body?.includes('dataDownloader'),
        customInteractions: [],
        existingTestIds: [],
        suggestedTestIds: [],
        reasoning: 'Fallback analysis based on keyword matching'
      };
    }
  }
  
  return analysis;
}

/**
 * Generate data-testid suggestions for the widget source code
 */
async function generateDataTestIdSuggestions(widget, analysis) {
  if (!analysis.suggestedTestIds || analysis.suggestedTestIds.length === 0) {
    return null;
  }

  const systemPrompt = `You are an expert React developer who adds data-testid attributes for testing.
You output precise code changes that add data-testid attributes to existing React components.`;

  const userPrompt = `## Task
Generate code changes to add the following data-testid attributes to the widget's Body component.

## Widget: ${widget.name}
## Section ID: ${widget.id || widget.name.toLowerCase()}

## Suggested data-testid additions:
${JSON.stringify(analysis.suggestedTestIds, null, 2)}

## Current Body.tsx code:
\`\`\`typescript
${widget.sources?.Body || 'Not available'}
\`\`\`

## Instructions
For each suggested data-testid, provide the exact code change needed.
Output a JSON array of changes in this format:

\`\`\`json
{
  "changes": [
    {
      "description": "What this change does",
      "originalCode": "The exact original code snippet to find",
      "newCode": "The new code with data-testid added"
    }
  ]
}
\`\`\`

If a data-testid cannot be reasonably added (e.g., the element doesn't exist), skip it.
Only output the JSON, no explanations.`;

  const response = await callClaude(systemPrompt, userPrompt, 2048);
  
  const jsonMatch = response.match(/```json\n([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch (e) {
      console.warn('  ⚠️ Could not parse data-testid suggestions:', e.message);
      return null;
    }
  }
  return null;
}

/**
 * Generate interactor for a widget using chain-of-thought analysis
 */
async function generateInteractor(widget, examples, analysis) {
  const interactorTemplate = loadPromptTemplate('interactor-template');
  
  const systemPrompt = `You are an expert TypeScript developer specializing in Playwright Page Object Model (POM) patterns. 
You generate clean, well-documented interactor classes for UI testing.

CRITICAL RULES:
- ONLY generate methods for UI elements that ACTUALLY EXIST in the widget
- If there is NO table in the widget, do NOT generate table methods
- If there is NO search functionality, do NOT generate search methods
- If there is NO pagination, do NOT generate pagination methods
- Base your interactor ONLY on the provided analysis and source code
- Do NOT copy methods from examples that don't apply to this widget`;

  const userPrompt = `${interactorTemplate || ''}

## Task
Generate a Playwright interactor class for the following widget/section.
IMPORTANT: Only include methods for UI elements that actually exist in this widget.

## Widget Information
- **Name**: ${widget.name}
- **Entity**: ${widget.entity}
- **Section ID**: ${widget.id || widget.name.toLowerCase()}
- **Display Name**: ${widget.displayName || widget.name}

## Widget Analysis (from code inspection)
\`\`\`json
${JSON.stringify(analysis, null, 2)}
\`\`\`

## Widget Source Code

### Body.tsx
\`\`\`typescript
${widget.sources?.Body || 'Not available'}
\`\`\`

## Example Interactor for reference (DO NOT copy methods that don't apply):

### Example with Table (OtTable):
\`\`\`typescript
${examples.interactor}
\`\`\`

### Example without Table (if applicable):
\`\`\`typescript
${examples.interactorOntology || ''}
\`\`\`

## Step-by-Step Generation Process

Think through this carefully:

1. **Section container**: Always include getSection() and isSectionVisible()
2. **Section header**: Always include getSectionHeader() and getSectionTitle()
3. **Wait for load**: Always include waitForSectionLoad()

Now, based on the analysis:

4. **Table methods**: ${analysis.hasTable ? 'YES - Include table methods (getTable, getTableRows, getRowCount, etc.)' : 'NO - Do NOT include any table methods'}
5. **Search methods**: ${analysis.hasSearch ? 'YES - Include search methods' : 'NO - Do NOT include search methods'}
6. **Pagination methods**: ${analysis.hasPagination ? 'YES - Include pagination methods' : 'NO - Do NOT include pagination methods'}
7. **Chart methods**: ${analysis.hasChart ? 'YES - Include chart methods (getChart, isChartVisible, etc.)' : 'NO - Do NOT include chart methods'}
8. **External link methods**: ${analysis.hasExternalLinks ? 'YES - Include external link methods' : 'NO - Do NOT include external link methods'}
9. **Download methods**: ${analysis.hasDownloader ? 'YES - Include download button method' : 'NO - Do NOT include download methods'}
10. **Custom interactions**: ${analysis.customInteractions?.length > 0 ? `Include methods for: ${analysis.customInteractions.join(', ')}` : 'No custom interactions needed'}

## Requirements
1. Create a class named \`${widget.name}Section\`
2. Use data-testid selectors based on the section id: \`section-${widget.id || widget.name.toLowerCase()}\`
3. ONLY include methods that correspond to actual UI elements in the widget
4. Follow TypeScript best practices with proper types
5. Only output the TypeScript code, no explanations

Generate the complete interactor class:`;

  const response = await callClaude(systemPrompt, userPrompt);
  
  // Extract code from response (remove markdown code blocks if present)
  let code = response;
  const codeMatch = response.match(/```typescript\n([\s\S]*?)```/);
  if (codeMatch) {
    code = codeMatch[1];
  }
  
  return code.trim();
}

/**
 * Generate test file for a widget using chain-of-thought analysis
 */
async function generateTest(widget, examples, interactorCode, analysis) {
  const testTemplate = loadPromptTemplate('test-template');
  
  const systemPrompt = `You are an expert QA engineer specializing in Playwright end-to-end testing.
You write comprehensive, maintainable test suites that follow best practices.

CRITICAL RULES:
- ONLY write tests for UI elements that ACTUALLY EXIST in the widget
- If there is NO table, do NOT write table tests
- If there is NO search, do NOT write search tests
- If there is NO pagination, do NOT write pagination tests
- Base your tests ONLY on the provided analysis and interactor code
- Do NOT copy test patterns from examples that don't apply`;

  const userPrompt = `${testTemplate || ''}

## Task
Generate a Playwright test file for the following widget/section.
IMPORTANT: Only write tests for features that actually exist in this widget.

## Widget Information
- **Name**: ${widget.name}
- **Entity**: ${widget.entity}
- **Section ID**: ${widget.id || widget.name.toLowerCase()}
- **Display Name**: ${widget.displayName || widget.name}

## Widget Analysis (from code inspection)
\`\`\`json
${JSON.stringify(analysis, null, 2)}
\`\`\`

## Widget Source Code

### Body.tsx
\`\`\`typescript
${widget.sources?.Body || 'Not available'}
\`\`\`

## Generated Interactor (use only methods defined here)
\`\`\`typescript
${interactorCode}
\`\`\`

## Example Test File (for reference only - DO NOT copy tests that don't apply)
\`\`\`typescript
${examples.test}
\`\`\`

## Current Test Config Fixtures
\`\`\`typescript
${examples.fixtures}
\`\`\`

## Step-by-Step Test Generation

Think through which tests to include based on the analysis:

1. **Basic visibility test**: Always include - tests that section is visible
2. **Section header test**: Always include - tests that header exists

Now, based on the analysis:

3. **Table tests**: ${analysis.hasTable ? 'YES - Test that table is visible and has rows' : 'NO - Skip table tests'}
4. **Chart tests**: ${analysis.hasChart ? 'YES - Test that chart/visualization is visible' : 'NO - Skip chart tests'}
5. **Search tests**: ${analysis.hasSearch ? 'YES - Test search functionality' : 'NO - Skip search tests'}
6. **Pagination tests**: ${analysis.hasPagination ? 'YES - Test pagination' : 'NO - Skip pagination tests'}
7. **External link tests**: ${analysis.hasExternalLinks ? 'YES - Test external links' : 'NO - Skip link tests'}
8. **Download tests**: ${analysis.hasDownloader ? 'YES - Test download button' : 'NO - Skip download tests'}
9. **Custom interaction tests**: ${analysis.customInteractions?.length > 0 ? `Test: ${analysis.customInteractions.join(', ')}` : 'No custom interaction tests'}

## Requirements
1. Import test and expect from "../../../fixtures" (NOT from @playwright/test)
2. Import the generated interactor class
3. Import the appropriate page class (e.g., DrugPage, VariantPage, DiseasePage, TargetPage)
4. Create a test.describe block for "${widget.displayName || widget.name} Section"
5. In beforeEach:
   - Create page and section instances
   - Use testConfig fixture to get entity IDs (e.g., testConfig.${widget.entity}.primary or testConfig.${widget.entity}.with${widget.name})
   - Navigate to the entity page
   - Wait for section to load, skip if section not visible
6. ONLY include tests for features that exist based on the analysis
7. For the interactor import path:
   - If it's a shared widget (used by multiple entities), use: "../../../POM/objects/widgets/shared/${widget.name.toLowerCase()}Section"
   - Otherwise use: "../../../POM/objects/widgets/${widget.name}/${widget.name.toLowerCase()}Section"
8. Only output the TypeScript code, no explanations

Generate the complete test file:`;

  const response = await callClaude(systemPrompt, userPrompt);
  
  // Extract code from response
  let code = response;
  const codeMatch = response.match(/```typescript\n([\s\S]*?)```/);
  if (codeMatch) {
    code = codeMatch[1];
  }
  
  return code.trim();
}

/**
 * Generate fixture updates for new widgets
 */
async function generateFixtureUpdates(widgets, examples) {
  const systemPrompt = `You are an expert TypeScript developer who understands Playwright test fixtures.
You analyze widget requirements and suggest appropriate test data configurations.
You output valid TypeScript code that follows existing patterns.`;

  const widgetSummaries = widgets.map(w => ({
    name: w.name,
    entity: w.entity,
    id: w.id,
    displayName: w.displayName,
    hasTable: w.sources?.Body?.includes('Table') || w.sources?.Body?.includes('table'),
    hasSearch: w.sources?.Body?.includes('search') || w.sources?.Body?.includes('Search'),
  }));

  const userPrompt = `## Task
Analyze the following new widgets and suggest updates to the TestConfig interface and mock data.

## New Widgets
${JSON.stringify(widgetSummaries, null, 2)}

## Current TestConfig File
\`\`\`typescript
${examples.fixtures}
\`\`\`

## Requirements
1. For each new widget, determine if it needs a specific test data entry in TestConfig
2. Widgets often need a specific entity ID that has data for that widget (e.g., "withPharmacogenomics", "withEVA")
3. Add new optional properties to the appropriate entity in TestConfig interface
4. Add corresponding mock values in fetchTestConfig()
5. Use realistic Open Targets Platform IDs:
   - Targets: ENSG IDs (e.g., "ENSG00000157764" for BRAF)
   - Diseases: EFO IDs (e.g., "EFO_0000612" for myocardial infarction)
   - Drugs: CHEMBL IDs (e.g., "CHEMBL1201585" for trastuzumab)
   - Variants: chr_pos_ref_alt format (e.g., "1_154453788_C_T")
   - Studies: GCST IDs for GWAS, descriptive IDs for QTL

## Output Format
Return a JSON object with two fields:
1. "interfaceAdditions": An object mapping entity names to new interface properties (TypeScript type definitions)
2. "mockDataAdditions": An object mapping entity names to new mock data values

Example output:
\`\`\`json
{
  "interfaceAdditions": {
    "variant": {
      "withNewWidget": "string"
    }
  },
  "mockDataAdditions": {
    "variant": {
      "withNewWidget": "19_44908822_C_T"
    }
  },
  "reasoning": "The NewWidget section displays variant data, so we need a variant ID that has this data available."
}
\`\`\`

Only output the JSON, no additional explanation.`;

  const response = await callClaude(systemPrompt, userPrompt);
  
  // Extract JSON from response
  let json = response;
  const jsonMatch = response.match(/```json\n([\s\S]*?)```/);
  if (jsonMatch) {
    json = jsonMatch[1];
  }
  
  try {
    return JSON.parse(json.trim());
  } catch (e) {
    console.warn('  ⚠️ Could not parse fixture suggestions:', e.message);
    return null;
  }
}

/**
 * Apply fixture updates to testConfig.ts
 */
function applyFixtureUpdates(fixtureUpdates) {
  if (!fixtureUpdates || !fs.existsSync(FIXTURES_PATH)) {
    return null;
  }

  let content = fs.readFileSync(FIXTURES_PATH, 'utf-8');
  const originalContent = content;
  
  // Apply interface additions
  if (fixtureUpdates.interfaceAdditions) {
    for (const [entity, additions] of Object.entries(fixtureUpdates.interfaceAdditions)) {
      for (const [propName, propType] of Object.entries(additions)) {
        // Find the entity interface block and add the new property
        const entityPattern = new RegExp(`(${entity}:\\s*\\{[^}]*)(\\})`, 's');
        const match = content.match(entityPattern);
        
        if (match) {
          // Check if property already exists
          if (!content.includes(`${propName}:`)) {
            const newProp = `\n    /** ${propName} - auto-generated */\n    ${propName}?: ${propType};`;
            content = content.replace(entityPattern, `$1${newProp}\n  $2`);
          }
        }
      }
    }
  }

  // Apply mock data additions
  if (fixtureUpdates.mockDataAdditions) {
    for (const [entity, additions] of Object.entries(fixtureUpdates.mockDataAdditions)) {
      for (const [propName, propValue] of Object.entries(additions)) {
        // Find the entity in the mock data return block
        const mockPattern = new RegExp(`(${entity}:\\s*\\{[^}]*)(\\},?)`, 's');
        const match = content.match(mockPattern);
        
        if (match) {
          // Check if property already exists in mock data
          if (!match[1].includes(`${propName}:`)) {
            const newMockProp = `\n      ${propName}: "${propValue}",`;
            content = content.replace(mockPattern, `$1${newMockProp}\n    $2`);
          }
        }
      }
    }
  }

  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(FIXTURES_PATH, content);
    return FIXTURES_PATH;
  }
  
  return null;
}



/**
 * Apply data-testid changes to widget source files
 */
function applyDataTestIdChanges(widget, testIdChanges) {
  if (!testIdChanges?.changes || testIdChanges.changes.length === 0) {
    return { applied: 0, failed: 0 };
  }

  let applied = 0;
  let failed = 0;

  // Determine the Body file path
  const bodyPath = widget.sourcePaths?.Body;
  if (!bodyPath || !fs.existsSync(bodyPath)) {
    console.warn(`    ⚠️ Could not find Body file to apply data-testid changes`);
    return { applied: 0, failed: testIdChanges.changes.length };
  }

  let content = fs.readFileSync(bodyPath, 'utf-8');

  for (const change of testIdChanges.changes) {
    if (content.includes(change.originalCode)) {
      content = content.replace(change.originalCode, change.newCode);
      console.log(`    ✓ Applied: ${change.description}`);
      applied++;
    } else {
      console.warn(`    ✗ Could not apply: ${change.description}`);
      failed++;
    }
  }

  if (applied > 0) {
    fs.writeFileSync(bodyPath, content);
  }

  return { applied, failed };
}

/**
 * Write generated files to disk
 */
function writeGeneratedFiles(widget, interactorCode, testCode) {
  // Create interactor directory and file
  const interactorDir = path.join(INTERACTOR_OUTPUT_PATH, widget.name);
  if (!fs.existsSync(interactorDir)) {
    fs.mkdirSync(interactorDir, { recursive: true });
  }
  
  const interactorFileName = `${widget.name.charAt(0).toLowerCase() + widget.name.slice(1)}Section.ts`;
  const interactorPath = path.join(interactorDir, interactorFileName);
  fs.writeFileSync(interactorPath, interactorCode);
  console.log(`  ✅ Created interactor: ${interactorPath}`);

  // Create test directory and file
  const testDir = path.join(TEST_OUTPUT_PATH, widget.entity);
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const testFileName = `${widget.name.toLowerCase()}.spec.ts`;
  const testPath = path.join(testDir, testFileName);
  fs.writeFileSync(testPath, testCode);
  console.log(`  ✅ Created test: ${testPath}`);

  return { interactorPath, testPath };
}

/**
 * Main execution
 */
async function main() {
  console.log('🤖 Starting test generation...\n');

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is not set');
    process.exit(1);
  }

  // Load detected widgets
  let widgets;
  
  if (process.env.NEW_WIDGETS_JSON) {
    widgets = JSON.parse(process.env.NEW_WIDGETS_JSON);
  } else if (fs.existsSync('.github/scripts/.detected-widgets.json')) {
    widgets = JSON.parse(fs.readFileSync('.github/scripts/.detected-widgets.json', 'utf-8'));
  } else {
    console.error('❌ No widgets data found. Run detect-new-widgets.js first.');
    process.exit(1);
  }

  if (!widgets || widgets.length === 0) {
    console.log('No widgets to process.');
    return;
  }

  // Filter to only widget types
  const widgetsToProcess = widgets.filter(w => w.type === 'widget');
  
  if (widgetsToProcess.length === 0) {
    console.log('No widget-type items to process.');
    return;
  }

  // Load examples for few-shot learning
  const examples = loadExamples();
  
  console.log(`📦 Processing ${widgetsToProcess.length} widget(s)...\n`);

  // First, generate fixture updates for all widgets
  console.log('📋 Analyzing fixture requirements...');
  const fixtureUpdates = await generateFixtureUpdates(widgetsToProcess, examples);
  
  if (fixtureUpdates) {
    console.log('  📝 Suggested fixture updates:');
    if (fixtureUpdates.interfaceAdditions) {
      console.log('    Interface additions:', JSON.stringify(fixtureUpdates.interfaceAdditions));
    }
    if (fixtureUpdates.mockDataAdditions) {
      console.log('    Mock data additions:', JSON.stringify(fixtureUpdates.mockDataAdditions));
    }
    if (fixtureUpdates.reasoning) {
      console.log('    Reasoning:', fixtureUpdates.reasoning);
    }
    
    // Apply fixture updates
    console.log('  💾 Applying fixture updates...');
    const fixturesPath = applyFixtureUpdates(fixtureUpdates);
    if (fixturesPath) {
      console.log(`  ✅ Updated fixtures: ${fixturesPath}`);
    } else {
      console.log('  ℹ️  No fixture changes needed or could not apply updates');
    }
  }

  const results = [];

  for (const widget of widgetsToProcess) {
    console.log(`\n🔧 Processing: ${widget.name} (${widget.entity})`);

    try {
      // Step 1: Analyze widget code
      console.log('  🔍 Analyzing widget code...');
      const analysis = await analyzeWidget(widget);
      console.log(`    - Has table: ${analysis.hasTable}`);
      console.log(`    - Has chart: ${analysis.hasChart}`);
      console.log(`    - Has search: ${analysis.hasSearch}`);
      console.log(`    - Has pagination: ${analysis.hasPagination}`);
      console.log(`    - Has external links: ${analysis.hasExternalLinks}`);
      console.log(`    - Has downloader: ${analysis.hasDownloader}`);
      if (analysis.customInteractions?.length > 0) {
        console.log(`    - Custom interactions: ${analysis.customInteractions.join(', ')}`);
      }
      if (analysis.reasoning) {
        console.log(`    - Analysis: ${analysis.reasoning}`);
      }

      // Step 2: Generate data-testid suggestions and optionally apply them
      if (analysis.suggestedTestIds?.length > 0) {
        console.log(`  📋 Suggested data-testid additions: ${analysis.suggestedTestIds.length}`);
        const testIdChanges = await generateDataTestIdSuggestions(widget, analysis);
        if (testIdChanges?.changes?.length > 0) {
          // Apply data-testid changes if APPLY_DATA_TESTIDS env var is set
          if (process.env.APPLY_DATA_TESTIDS === 'true') {
            console.log(`  🔧 Applying data-testid changes...`);
            const { applied, failed } = applyDataTestIdChanges(widget, testIdChanges);
            console.log(`    Applied: ${applied}, Failed: ${failed}`);
          } else {
            console.log(`    ⚠️ Widget may need data-testid additions for better testability`);
            console.log(`    Set APPLY_DATA_TESTIDS=true to auto-apply suggested changes`);
          }
          // Store for potential future use
          widget.suggestedTestIdChanges = testIdChanges;
        }
      }

      // Step 3: Generate interactor based on analysis
      console.log('  📝 Generating interactor...');
      const interactorCode = await generateInteractor(widget, examples, analysis);

      // Step 4: Generate test based on analysis
      console.log('  📝 Generating test file...');
      const testCode = await generateTest(widget, examples, interactorCode, analysis);

      // Step 5: Write files
      console.log('  💾 Writing files...');
      const paths = writeGeneratedFiles(widget, interactorCode, testCode);
      
      results.push({
        widget: widget.name,
        entity: widget.entity,
        success: true,
        analysis: {
          hasTable: analysis.hasTable,
          hasChart: analysis.hasChart,
          hasSearch: analysis.hasSearch,
          hasPagination: analysis.hasPagination,
          customInteractions: analysis.customInteractions
        },
        ...paths
      });

    } catch (error) {
      console.error(`  ❌ Error generating tests for ${widget.name}:`, error.message);
      results.push({
        widget: widget.name,
        entity: widget.entity,
        success: false,
        error: error.message
      });
    }
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 Generation Summary');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\nGenerated files:');
    successful.forEach(r => {
      console.log(`  - ${r.widget}: ${r.interactorPath}, ${r.testPath}`);
    });
  }

  if (failed.length > 0) {
    console.log('\nFailed widgets:');
    failed.forEach(r => {
      console.log(`  - ${r.widget}: ${r.error}`);
    });
  }

  // Clean up temp file
  if (fs.existsSync('.github/scripts/.detected-widgets.json')) {
    fs.unlinkSync('.github/scripts/.detected-widgets.json');
  }

  console.log('\n✅ Generation complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
