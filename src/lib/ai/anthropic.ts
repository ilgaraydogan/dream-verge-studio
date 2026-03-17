import Anthropic from '@anthropic-ai/sdk';
import { ModelAdapter, AnalysisResult, buildPrompt } from './types';
import { DreamFile } from '../project/dreamFile';
import { DreamConfig } from '../project/config';
import { getApiKey } from '../keychain';

export class AnthropicAdapter implements ModelAdapter {
  id = 'claude-3-5-sonnet';
  name = 'Claude 3.5 Sonnet (Anthropic)';

  async analyze(
    dream: DreamFile,
    soulContext: string,
    config: DreamConfig,
    onChunk?: (chunk: string) => void
  ): Promise<AnalysisResult> {
    const apiKey = await getApiKey('anthropic');
    if (!apiKey) {
      throw new Error('Anthropic API key not found');
    }

    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const prompt = buildPrompt(
      dream.content,
      soulContext,
      config.language,
      config.flagging.sensitivityLevel
    );

    try {
      const stream = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });

      let fullContent = '';

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const content = event.delta.text;
          fullContent += content;
          onChunk?.(content);
        }
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
