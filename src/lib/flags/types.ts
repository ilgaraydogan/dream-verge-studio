export type FlagSeverity = 'NOTE' | 'WATCH' | 'URGENT';

export type FlagType = 'keyword' | 'semantic' | 'pattern';

export interface Flag {
  id: string;
  type: FlagType;
  severity: FlagSeverity;
  excerpt: string;
  reason: string;
  sessionId: string;
  position?: number;
}

export interface PatternResult {
  type: 'tag_recurrence' | 'keyword_recurrence' | 'escalation';
  severity: FlagSeverity;
  description: string;
  occurrences: string[];
  sessionIds: string[];
}

export interface FlagResult {
  dreamId: string;
  flags: Flag[];
  patterns: PatternResult[];
}
