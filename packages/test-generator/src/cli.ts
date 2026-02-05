#!/usr/bin/env node
/**
 * CLI for the test generator package
 */

import * as fs from 'fs';
import * as path from 'path';
import { detect } from './detector';
import { generateTestsForWidget } from './generator';
import { TestGeneratorConfig, DEFAULT_CONFIG, GenerationResult, WidgetInfo } from './types';

function printUsage(): void {
  console.log(`
Test Generator CLI

Usage:
  test-generator detect [options]    Detect new widgets in PR
  test-generator generate [options]  Generate tests for detected widgets
  test-generator --help              Show this help message

Options:
  --base-branch <branch>    Base branch to compare against (default: main)
  --pr-number <number>      Pull request number
  --dry-run                 Don't write any files
  --verbose                 Show detailed output
  --skip-data-testids       Skip adding data-testid attributes
  --output-file <path>      Write detected widgets to JSON file
  --widgets-file <path>     Read widgets from JSON file (for generate command)

Environment Variables:
  ANTHROPIC_API_KEY         API key for Claude (required for generate)
  GITHUB_TOKEN              GitHub token for PR access
  
Examples:
  # Detect new widgets in a PR
  test-generator detect --base-branch main --output-file widgets.json
  
  # Generate tests for detected widgets
  test-generator generate --widgets-file widgets.json
  
  # Detect and generate in one step
  test-generator detect --output-file widgets.json && test-generator generate --widgets-file widgets.json
`);
}

function parseArgs(args: string[]): {
  command: string;
  options: {
    baseBranch: string;
    prNumber?: string;
    dryRun: boolean;
    verbose: boolean;
    skipDataTestIds: boolean;
    outputFile?: string;
    widgetsFile?: string;
    help: boolean;
  };
} {
  const command = args[0] || 'help';
  const options = {
    baseBranch: 'main',
    prNumber: undefined as string | undefined,
    dryRun: false,
    verbose: false,
    skipDataTestIds: false,
    outputFile: undefined as string | undefined,
    widgetsFile: undefined as string | undefined,
    help: false,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--base-branch':
        options.baseBranch = args[++i];
        break;
      case '--pr-number':
        options.prNumber = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--skip-data-testids':
        options.skipDataTestIds = true;
        break;
      case '--output-file':
        options.outputFile = args[++i];
        break;
      case '--widgets-file':
        options.widgetsFile = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return { command, options };
}

async function runDetect(options: ReturnType<typeof parseArgs>['options']): Promise<void> {
  console.log('🔍 Detecting new widgets...\n');

  const result = detect(options.baseBranch);
  const widgets = result.widgets;

  if (widgets.length === 0) {
    console.log('✅ No new widgets detected.');
    return;
  }

  console.log(`Found ${widgets.length} new widget(s):\n`);

  for (const widget of widgets) {
    console.log(`  📦 ${widget.name} (${widget.entity})`);
    if (options.verbose) {
      console.log(`     Path: ${widget.path}`);
      console.log(`     Files: ${Object.keys(widget.sources || {}).join(', ')}`);
    }
  }

  if (options.outputFile) {
    const outputPath = path.resolve(options.outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(widgets, null, 2));
    console.log(`\n📝 Saved widget info to ${outputPath}`);
  }
}

async function runGenerate(options: ReturnType<typeof parseArgs>['options']): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }

  let widgets: WidgetInfo[];
  if (options.widgetsFile) {
    const widgetsPath = path.resolve(options.widgetsFile);
    if (!fs.existsSync(widgetsPath)) {
      console.error(`❌ Error: Widgets file not found: ${widgetsPath}`);
      process.exit(1);
    }
    widgets = JSON.parse(fs.readFileSync(widgetsPath, 'utf-8'));
  } else {
    console.log('🔍 Detecting widgets...\n');
    const result = detect(options.baseBranch);
    widgets = result.widgets;
  }

  if (widgets.length === 0) {
    console.log('✅ No widgets to process.');
    return;
  }

  const config: TestGeneratorConfig = {
    ...DEFAULT_CONFIG,
    anthropicApiKey: apiKey,
    dryRun: options.dryRun,
    verbose: options.verbose,
    skipDataTestIds: options.skipDataTestIds,
  };

  console.log(`🚀 Generating tests for ${widgets.length} widget(s)...\n`);

  const results: GenerationResult[] = [];

  for (const widget of widgets) {
    console.log(`\n📦 Processing ${widget.name}...`);

    const result = await generateTestsForWidget(widget, config);
    results.push(result);

    if (result.success) {
      console.log(`  ✅ Success`);
      if (result.interactorPath) {
        console.log(`     Interactor: ${result.interactorPath}`);
      }
      if (result.testPath) {
        console.log(`     Test: ${result.testPath}`);
      }
      if (result.dataTestIds && result.dataTestIds.applied > 0) {
        console.log(`     Data-testids added: ${result.dataTestIds.applied}`);
      }
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
    }
  }

  // Summary
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log('\n📊 Summary:');
  console.log(`   Total: ${results.length}`);
  console.log(`   Successful: ${successful}`);
  console.log(`   Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { command, options } = parseArgs(args);

  if (options.help || command === 'help' || command === '--help') {
    printUsage();
    return;
  }

  try {
    switch (command) {
      case 'detect':
        await runDetect(options);
        break;
      case 'generate':
        await runGenerate(options);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    if (options.verbose && error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
