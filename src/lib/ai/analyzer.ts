import { DreamFile } from '../project/dreamFile';
import { DreamConfig } from '../project/config';
import { ModelAdapter, AnalysisResult } from './types';
import { OpenAIAdapter } from './openai';
import { AnthropicAdapter } from './anthropic';
import { GeminiAdapter } from './gemini';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { getApiKey } from '../keychain';

const ADAPTERS: Record<string, ModelAdapter> = {
  'gpt-4o': new OpenAIAdapter(),
  'claude-3-5-sonnet': new AnthropicAdapter(),
  'gemini-2.0-flash-exp': new GeminiAdapter(),
};

const MODEL_TO_SERVICE: Record<string, string> = {
  'gpt-4o': 'openai',
  'claude-3-5-sonnet': 'anthropic',
  'gemini-2.0-flash-exp': 'google',
};

export async function analyzeWithAllModels(
  dream: DreamFile,
  soulContext: string,
  config: DreamConfig,
  projectPath: string,
  onUpdate: (modelId: string, chunk: string) => void
): Promise<AnalysisResult[]> {
  console.log('[ANALYZER] Starting analysis with models:', config.models);
  
  // Filter models to only those with API keys
  const availableAdapters: ModelAdapter[] = [];
  for (const modelId of config.models) {
    const adapter = ADAPTERS[modelId];
    if (!adapter) {
      console.warn(`[ANALYZER] Unknown model: ${modelId}`);
      continue;
    }
    
    const service = MODEL_TO_SERVICE[modelId];
    if (!service) {
      console.warn(`[ANALYZER] No service mapping for model: ${modelId}`);
      continue;
    }
    
    try {
      const apiKey = await getApiKey(service as any);
      if (apiKey) {
        console.log(`[ANALYZER] ✓ API key found for ${modelId} (${service})`);
        availableAdapters.push(adapter);
      } else {
        console.warn(`[ANALYZER] ✗ No API key for ${modelId} (${service}) - skipping`);
      }
    } catch (error) {
      console.warn(`[ANALYZER] ✗ Failed to check API key for ${modelId}:`, error);
    }
  }

  if (availableAdapters.length === 0) {
    throw new Error('No models with valid API keys configured');
  }
  
  console.log(`[ANALYZER] Running analysis with ${availableAdapters.length} model(s)`);


  const results = await Promise.allSettled(
    availableAdapters.map(adapter =>
      adapter.analyze(dream, soulContext, config, (chunk) => {
        onUpdate(adapter.id, chunk);
      })
    )
  );

  const analysisResults: AnalysisResult[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const analysisResult = result.value;
      analysisResults.push(analysisResult);

      if (!analysisResult.error) {
        await saveAnalysisResult(projectPath, dream.frontmatter.id, analysisResult);
      }
    } else {
      console.error('Analysis failed:', result.reason);
    }
  }

  return analysisResults;
}

async function saveAnalysisResult(
  projectPath: string,
  dreamId: string,
  result: AnalysisResult
): Promise<void> {
  const fileName = `${dreamId}.${result.modelId}.json`;
  const filePath = `${projectPath}/${fileName}`;

  const data = {
    dreamId,
    modelId: result.modelId,
    modelName: result.modelName,
    content: result.content,
    timestamp: result.timestamp,
  };

  await writeTextFile(filePath, JSON.stringify(data, null, 2));
}
