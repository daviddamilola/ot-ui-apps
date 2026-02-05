/**
 * Widget analysis using LLM
 */

import { WidgetInfo, WidgetAnalysis, TestGeneratorConfig } from '../types';
import { callClaude, extractJson } from './llm-client';
import { formatWidgetSourcesForPrompt, formatWidgetInfo } from './prompt-formatter';

const ANALYSIS_SYSTEM_PROMPT = `You are an expert code analyst specializing in React components and UI testing.
Your task is to carefully analyze React component code and identify exactly what UI elements are present.
Be precise and thorough. Do NOT assume elements exist if they are not explicitly in the code.
IMPORTANT: Analyze ALL provided source files including imported local components.`;

/**
 * Create fallback analysis based on keyword matching
 */
function createFallbackAnalysis(widget: WidgetInfo): WidgetAnalysis {
  const allSourcesText = Object.values(widget.sources || {}).join('\n');
  
  return {
    uiComponents: [],
    hasTable: allSourcesText.includes('OtTable') || allSourcesText.includes('<Table'),
    hasChart: allSourcesText.includes('Chart') || allSourcesText.includes('Plot'),
    hasSearch: allSourcesText.includes('showGlobalFilter') || allSourcesText.includes('Search'),
    hasPagination: allSourcesText.includes('pagination'),
    hasExternalLinks: allSourcesText.includes('Link external'),
    hasDownloader: allSourcesText.includes('dataDownloader'),
    customInteractions: [],
    existingTestIds: [],
    suggestedTestIds: [],
    reasoning: 'Fallback analysis based on keyword matching',
  };
}

/**
 * Analyze widget code to understand its structure
 */
export async function analyzeWidget(
  widget: WidgetInfo,
  config: TestGeneratorConfig
): Promise<WidgetAnalysis> {
  const allSources = formatWidgetSourcesForPrompt(widget);

  const userPrompt = `## Task
Carefully analyze the following React widget/section code and ALL its imported local components.

${formatWidgetInfo(widget)}

## Widget Source Code
${allSources}

## Instructions
Analyze ALL provided source files and output JSON:

\`\`\`json
{
  "uiComponents": ["list", "of", "all", "components", "found"],
  "hasTable": true/false,
  "hasChart": true/false,
  "hasSearch": true/false,
  "hasPagination": true/false,
  "hasExternalLinks": true/false,
  "hasDownloader": true/false,
  "customInteractions": ["list", "of", "interactions"],
  "existingTestIds": ["list", "of", "existing", "testids"],
  "suggestedTestIds": [
    {"element": "element description", "testId": "suggested-test-id", "file": "which file", "reason": "why"}
  ],
  "reasoning": "Brief explanation of your analysis"
}
\`\`\``;

  const response = await callClaude(
    config.anthropicApiKey!,
    ANALYSIS_SYSTEM_PROMPT,
    userPrompt,
    config.model,
    2048
  );

  const parsed = extractJson<WidgetAnalysis>(response);
  return parsed || createFallbackAnalysis(widget);
}
