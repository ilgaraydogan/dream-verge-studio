import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelAdapter, AnalysisResult, buildPrompt } from './types';
import { DreamFile } from '../project/dreamFile';
import { DreamConfig } from '../project/config';
import { getApiKey } from '../keychain';

export class GeminiAdapter implements ModelAdapter {
  id = 'gemini-2.0-flash-exp';
  name = 'Gemini 2.0 Flash (Google)';

  async analyze(
    dream: DreamFile,
    soulContext: string,
    config: DreamConfig,
    onChunk?: (chunk: string) => void
  ): Promise<AnalysisResult> {
    const apiKey = await getApiKey('google');
    if (!apiKey) {
      throw new Error('Google API key not found');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = buildPrompt(
      dream.content,
      soulContext,
      config.language,
      config.flagging.sensitivityLevel
    );

    try {
      const result = await model.generateContentStream(prompt);
      let fullContent = '';

      for await (const chunk of result.stream) {
        const content = chunk.text();
        fullContent += content;
        onChunk?.(content);
      }

      return {
        modelId: this.id,
        modelName: this.name,
        content: fullContent,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        modelId: this.id,
        modelName: this.name,
        content: '',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
