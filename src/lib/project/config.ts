export interface DreamConfig {
  models: string[];
  parallelAnalysis: boolean;
  language: 'tr' | 'en';
  flagging: {
    enabled: boolean;
    sensitivityLevel: 'low' | 'clinical' | 'high';
    keywords: string[];
  };
  soul: {
    autoUpdate: boolean;
    updateAfterSessions: number;
  };
}

export const DEFAULT_CONFIG: DreamConfig = {
  models: ['gpt-4o'],
  parallelAnalysis: true,
  language: 'tr',
  flagging: {
    enabled: true,
    sensitivityLevel: 'clinical',
    keywords: [
      'death', 'suicide', 'kill', 'violence',
      'ölüm', 'intihar', 'öldür', 'şiddet',
      'isolation', 'trapped', 'helpless', 'darkness',
      'yalnız', 'hapsolmak', 'çaresiz', 'karanlık'
    ],
  },
  soul: {
    autoUpdate: true,
    updateAfterSessions: 2,
  },
};

export function parseConfig(content: string): DreamConfig {
  try {
    const parsed = JSON.parse(content);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function serializeConfig(config: DreamConfig): string {
  return JSON.stringify(config, null, 2);
}
