import { DreamFile, parseDreamFile } from '../project/dreamFile';
import { PatternResult } from './types';
import { readTextFile, readDir } from '@tauri-apps/plugin-fs';
import { DreamConfig } from '../project/config';
import { detectFlags } from './engine';

export async function detectCrossSessionPatterns(
  projectPath: string,
  currentDreamId: string,
  config: DreamConfig
): Promise<PatternResult[]> {
  const patterns: PatternResult[] = [];

  try {
    const dreamFiles = await loadAllDreamFiles(projectPath);
    
    if (dreamFiles.length === 0) {
      return patterns;
    }

    patterns.push(...detectTagRecurrence(dreamFiles, currentDreamId));
    patterns.push(...detectUrgentKeywordRecurrence(dreamFiles, currentDreamId, config));
    
    const escalation = detectEscalation(dreamFiles, currentDreamId, config);
    if (escalation) {
      patterns.push(escalation);
    }

  } catch (error) {
    console.warn('[PATTERNS] Failed to detect cross-session patterns:', error);
  }

  return patterns;
}

async function loadAllDreamFiles(projectPath: string): Promise<DreamFile[]> {
  const dreamFiles: DreamFile[] = [];

  try {
    const entries = await readDir(projectPath);

    for (const entry of entries) {
      if (entry.name.endsWith('.dream')) {
        try {
          const content = await readTextFile(`${projectPath}/${entry.name}`);
          const dreamFile = parseDreamFile(content);
          dreamFiles.push(dreamFile);
        } catch (error) {
          continue;
        }
      }
    }
  } catch (error) {
    console.warn('[PATTERNS] Failed to read directory:', error);
  }

  return dreamFiles.sort((a, b) => 
    new Date(a.frontmatter.date).getTime() - new Date(b.frontmatter.date).getTime()
  );
}

function detectTagRecurrence(dreamFiles: DreamFile[], currentDreamId: string): PatternResult[] {
  const patterns: PatternResult[] = [];
  const tagOccurrences: Map<string, Set<string>> = new Map();

  for (const dream of dreamFiles) {
    for (const tag of dream.frontmatter.tags || []) {
      const tagLower = tag.toLowerCase();
      if (!tagOccurrences.has(tagLower)) {
        tagOccurrences.set(tagLower, new Set());
      }
      tagOccurrences.get(tagLower)!.add(dream.frontmatter.id);
    }
  }

  for (const [tag, sessionIds] of tagOccurrences.entries()) {
    if (sessionIds.has(currentDreamId) && sessionIds.size >= 3) {
      patterns.push({
        type: 'tag_recurrence',
        severity: 'WATCH',
        description: `Recurring theme: ${tag} (${sessionIds.size} sessions)`,
        occurrences: Array.from(sessionIds).map(id => {
          const dream = dreamFiles.find(d => d.frontmatter.id === id);
          return dream ? `Session ${dream.frontmatter.session}` : id;
        }),
        sessionIds: Array.from(sessionIds),
      });
    }
  }

  return patterns;
}

function detectUrgentKeywordRecurrence(
  dreamFiles: DreamFile[], 
  currentDreamId: string,
  config: DreamConfig
): PatternResult[] {
  const patterns: PatternResult[] = [];
  const urgentKeywordSessions: Map<string, Set<string>> = new Map();

  for (const dream of dreamFiles) {
    const flags = detectFlags(dream, config);
    const urgentFlags = flags.filter(f => f.severity === 'URGENT');

    for (const flag of urgentFlags) {
      const match = flag.reason.match(/Keyword "([^"]+)"/);
      if (match) {
        const keyword = match[1].toLowerCase();
        if (!urgentKeywordSessions.has(keyword)) {
          urgentKeywordSessions.set(keyword, new Set());
        }
        urgentKeywordSessions.get(keyword)!.add(dream.frontmatter.id);
      }
    }
  }

  for (const [keyword, sessionIds] of urgentKeywordSessions.entries()) {
    if (sessionIds.has(currentDreamId) && sessionIds.size >= 2) {
      patterns.push({
        type: 'keyword_recurrence',
        severity: 'URGENT',
        description: `⚠️ URGENT keyword "${keyword}" recurring (${sessionIds.size} sessions)`,
        occurrences: Array.from(sessionIds).map(id => {
          const dream = dreamFiles.find(d => d.frontmatter.id === id);
          return dream ? `Session ${dream.frontmatter.session}` : id;
        }),
        sessionIds: Array.from(sessionIds),
      });
    }
  }

  return patterns;
}

function detectEscalation(
  dreamFiles: DreamFile[],
  currentDreamId: string,
  config: DreamConfig
): PatternResult | null {
  const currentIndex = dreamFiles.findIndex(d => d.frontmatter.id === currentDreamId);
  
  if (currentIndex < 2) {
    return null;
  }

  const last3Sessions = dreamFiles.slice(Math.max(0, currentIndex - 2), currentIndex + 1);
  const urgentCounts: number[] = [];

  for (const dream of last3Sessions) {
    const flags = detectFlags(dream, config);
    const urgentCount = flags.filter(f => f.severity === 'URGENT').length;
    urgentCounts.push(urgentCount);
  }

  const isEscalating = urgentCounts.length === 3 && 
                       urgentCounts[0] < urgentCounts[1] && 
                       urgentCounts[1] < urgentCounts[2];

  if (isEscalating) {
    return {
      type: 'escalation',
      severity: 'URGENT',
      description: `🚨 Escalating pattern detected: URGENT flags increasing (${urgentCounts.join(' → ')})`,
      occurrences: last3Sessions.map(d => `Session ${d.frontmatter.session}: ${urgentCounts[last3Sessions.indexOf(d)]} URGENT flags`),
      sessionIds: last3Sessions.map(d => d.frontmatter.id),
    };
  }

  return null;
}
