import { DreamFile } from '../project/dreamFile';
import { DreamConfig } from '../project/config';
import { getApiKey } from '../keychain';
import { readTextFile, readDir } from '@tauri-apps/plugin-fs';
import OpenAI from 'openai';

export interface SoulUpdateProposal {
  changesSummary: string;
  proposedContent: string;
}

const SOUL_UPDATE_PROMPT = `You are assisting a clinician in maintaining a patient's psychological profile (soul.md).

Based on the recent dream sessions below, propose updates to the existing soul profile.

CURRENT SOUL PROFILE:
{current_soul}

RECENT DREAM SESSIONS (with their analyses):
{recent_dreams}

---

Your task:
1. Identify new themes, symbols, or patterns that have emerged and are not yet in the profile.
2. Identify anything in the current profile that the recent sessions contradict or nuance.
3. Propose a revised version of the soul profile in full markdown.

Format your response as:

CHANGES SUMMARY:
- (brief list of what changed and why)

PROPOSED SOUL.MD:
(full revised markdown)

---

Respond in {language}.
The clinician will review this proposal before it is accepted. Be conservative — only propose changes that are clearly supported by the session data.`;

export async function generateSoulUpdateProposal(
  projectPath: string,
  config: DreamConfig
): Promise<SoulUpdateProposal | null> {
  try {
    const soulPath = `${projectPath}/soul.md`;
    const currentSoul = await readTextFile(soulPath);

    const recentDreams = await getRecentDreams(projectPath, 5);
    
    if (recentDreams.length === 0) {
      return null;
    }

    const apiKey = await getApiKey('openai');
    if (!apiKey) {
      console.error('No OpenAI API key found for soul update');
      return null;
    }

    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const recentDreamsText = recentDreams.map((dream, idx) => {
      return `SESSION ${idx + 1} (${dream.frontmatter.date}):
ID: ${dream.frontmatter.id}
Session: ${dream.frontmatter.session}
Tags: ${dream.frontmatter.tags?.join(', ') || 'none'}

DREAM CONTENT:
${dream.content}

---`;
    }).join('\n\n');

    const prompt = SOUL_UPDATE_PROMPT
      .replace('{current_soul}', currentSoul)
      .replace('{recent_dreams}', recentDreamsText)
      .replace('{language}', config.language);

    console.log('[SOUL UPDATER] Requesting soul update proposal from OpenAI...');

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const fullResponse = response.choices[0]?.message?.content || '';

    const summaryMatch = fullResponse.match(/CHANGES SUMMARY:([\s\S]*?)PROPOSED SOUL\.MD:/);
    const proposedMatch = fullResponse.match(/PROPOSED SOUL\.MD:([\s\S]*)/);

    if (!summaryMatch || !proposedMatch) {
      console.error('Failed to parse soul update response');
      return null;
    }

    return {
      changesSummary: summaryMatch[1].trim(),
      proposedContent: proposedMatch[1].trim(),
    };

  } catch (error) {
    console.error('Failed to generate soul update proposal:', error);
    return null;
  }
}

async function getRecentDreams(projectPath: string, count: number): Promise<DreamFile[]> {
  try {
    const entries = await readDir(projectPath);
    const dreamFiles: Array<{ dream: DreamFile, date: Date }> = [];

    for (const entry of entries) {
      if (entry.name.endsWith('.dream')) {
        try {
          const content = await readTextFile(`${projectPath}/${entry.name}`);
          const { parseDreamFile } = await import('../project/dreamFile');
          const dreamFile = parseDreamFile(content);
          dreamFiles.push({
            dream: dreamFile,
            date: new Date(dreamFile.frontmatter.date),
          });
        } catch (error) {
          console.warn(`Failed to read dream file ${entry.name}:`, error);
        }
      }
    }

    dreamFiles.sort((a, b) => b.date.getTime() - a.date.getTime());

    return dreamFiles.slice(0, count).map(df => df.dream);
  } catch (error) {
    console.error('Failed to get recent dreams:', error);
    return [];
  }
}

export function shouldTriggerSoulUpdate(sessionCount: number, config: DreamConfig): boolean {
  if (!config.soul.autoUpdate) {
    return false;
  }

  return sessionCount > 0 && sessionCount % config.soul.updateAfterSessions === 0;
}
