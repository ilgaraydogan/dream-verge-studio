import { DreamFile } from '../project/dreamFile';
import { DreamConfig } from '../project/config';
import { Flag, FlagSeverity, FlagResult } from './types';
import { nanoid } from 'nanoid';

const URGENT_KEYWORDS = [
  'death', 'suicide', 'kill', 'violence',
  'ölüm', 'intihar', 'öldür', 'şiddet'
];

const WATCH_KEYWORDS = [
  'isolation', 'trapped', 'helpless', 'darkness',
  'yalnız', 'hapsolmak', 'çaresiz', 'karanlık'
];

export function detectFlags(dream: DreamFile, config: DreamConfig): Flag[] {
  if (!config.flagging.enabled) {
    return [];
  }

  const flags: Flag[] = [];
  const keywords = config.flagging.keywords;

  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi');
    let match;

    while ((match = regex.exec(dream.content)) !== null) {
      const position = match.index;
      
      const excerptStart = Math.max(0, position - 30);
      const excerptEnd = Math.min(dream.content.length, position + match[0].length + 30);
      const excerpt = dream.content.substring(excerptStart, excerptEnd).trim();

      const severity = getSeverityForKeyword(keyword.toLowerCase());

      flags.push({
        id: nanoid(8),
        type: 'keyword',
        severity,
        excerpt: `...${excerpt}...`,
        reason: `Keyword "${keyword}" detected (${severity} level)`,
        sessionId: dream.frontmatter.id,
        position,
      });
    }
  }

  return flags;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSeverityForKeyword(keyword: string): FlagSeverity {
  const keywordLower = keyword.toLowerCase();

  if (URGENT_KEYWORDS.some(k => keywordLower.includes(k))) {
    return 'URGENT';
  }

  if (WATCH_KEYWORDS.some(k => keywordLower.includes(k))) {
    return 'WATCH';
  }

  return 'NOTE';
}

export function analyzeDream(dream: DreamFile, config: DreamConfig): FlagResult {
  const flags = detectFlags(dream, config);

  return {
    dreamId: dream.frontmatter.id,
    flags,
    patterns: [],
  };
}
