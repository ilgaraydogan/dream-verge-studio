import OpenAI from 'openai';
import { ModelAdapter, AnalysisResult, buildPrompt } from './types';
import { DreamFile } from '../project/dreamFile';
import { DreamConfig } from '../project/config';
import { getApiKey } from '../keychain';

export class OpenAIAdapter implements ModelAdapter {
  id = 'gpt-4o';
  name = 'GPT-4o (OpenAI)';

  async analyze(
    dream: DreamFile,
    soulContext: string,
    config: DreamConfig,
    onChunk?: (chunk: string) => void
  ): Promise<AnalysisResult> {
    console.log('[OPENAI] Starting analysis...');
    
    const apiKey = await getApiKey('openai');
    if (!apiKey) {
      console.error('[OPENAI] API key not found');
      throw new Error('OpenAI API key not found');
    }
    console.log('[OPENAI] API key found (length:', apiKey.length, ')');

    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const prompt = buildPrompt(
      dream.content,
      soulContext,
      config.language,
      config.flagging.sensitivityLevel
    );
    console.log('[OPENAI] Prompt length:', prompt.length, 'chars');

    try {
      console.log('[OPENAI] Making API request to OpenAI...');
      console.log('[OPENAI] URL: https://api.openai.com/v1/chat/completions');
      console.log('[OPENAI] Model: gpt-4o');
      console.log('[OPENAI] Stream: true');
      console.log('[OPENAI] API Key prefix:', apiKey.substring(0, 7) + '...');
      
      let stream;
      try {
        stream = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          temperature: 0.7,
        });
      } catch (createError) {
        console.error('[OPENAI] Failed to create stream');
        console.error('[OPENAI] Create error type:', createError?.constructor?.name);
        console.error('[OPENAI] Create error:', createError);
        throw createError;
      }
      
      console.log('[OPENAI] Stream started successfully');

      let fullContent = '';
      let chunkCount = 0;

      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            chunkCount++;
            onChunk?.(content);
          }
        }
      } catch (streamError) {
        console.error('[OPENAI] Error during streaming');
        console.error('[OPENAI] Stream error:', streamError);
        throw streamError;
      }

      console.log('[OPENAI] ✓ Analysis complete');
      console.log('[OPENAI] Received', chunkCount, 'chunks, total length:', fullContent.length, 'chars');

      return {
        modelId: this.id,
        modelName: this.name,
        content: fullContent,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[OPENAI] ✗ Analysis failed');
      console.error('[OPENAI] Error type:', error?.constructor?.name);
      console.error('[OPENAI] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[OPENAI] Error name:', (error as any)?.name);
      console.error('[OPENAI] Error code:', (error as any)?.code);
      console.error('[OPENAI] Error status:', (error as any)?.status);
      console.error('[OPENAI] Full error object:', JSON.stringify(error, null, 2));
      console.error('[OPENAI] Full error (raw):', error);
      
      // Check for specific error types
      if ((error as any)?.code === 'ENOTFOUND') {
        console.error('[OPENAI] Network error - DNS resolution failed');
      } else if ((error as any)?.code === 'ETIMEDOUT') {
        console.error('[OPENAI] Network error - Connection timeout');
      } else if ((error as any)?.status === 401) {
        console.error('[OPENAI] Authentication error - Invalid API key');
      } else if ((error as any)?.status === 429) {
        console.error('[OPENAI] Rate limit exceeded');
      }
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      return {
        modelId: this.id,
        modelName: this.name,
        content: '',
        timestamp: new Date().toISOString(),
        error: `OpenAI hatası: ${errorMsg}`,
      };
    }
  }
}
