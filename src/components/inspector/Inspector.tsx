import { useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useProjectStore } from '../../store/projectStore';
import { Flag, PatternResult } from '../../lib/flags/types';
import { analyzeDream } from '../../lib/flags/engine';
import { detectCrossSessionPatterns } from '../../lib/flags/patterns';
import { parseConfig, DEFAULT_CONFIG } from '../../lib/project/config';
import { readTextFile, readDir, writeTextFile } from '@tauri-apps/plugin-fs';
import { parseDreamFile } from '../../lib/project/dreamFile';
import { save } from '@tauri-apps/plugin-dialog';
import { FileDown } from 'lucide-react';
import { Button } from '../ui/Button';

interface SessionSummary {
  totalSessions: number;
  flagCounts: { URGENT: number; WATCH: number; NOTE: number };
  topTags: Array<{ tag: string; count: number }>;
}

export function Inspector() {
  const { currentDream, fileType } = useEditorStore();
  const { projectPath } = useProjectStore();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [patterns, setPatterns] = useState<PatternResult[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function analyzeFlags() {
      if (!currentDream || fileType !== 'dream' || !projectPath) {
        setFlags([]);
        setPatterns([]);
        setSummary(null);
        return;
      }

      setLoading(true);
      try {
        let config = DEFAULT_CONFIG;
        try {
          const configPath = `${projectPath}/.dreamconfig`;
          const configContent = await readTextFile(configPath);
          config = parseConfig(configContent);
        } catch {
          console.warn('[INSPECTOR] Using default config');
        }

        const result = analyzeDream(currentDream, config);
        setFlags(result.flags);

        const crossPatterns = await detectCrossSessionPatterns(projectPath, currentDream.frontmatter.id, config);
        setPatterns(crossPatterns);

        const sessionSummary = await generateSessionSummary(projectPath, config);
        setSummary(sessionSummary);
      } catch (error) {
        console.error('[INSPECTOR] Failed to analyze:', error);
      } finally {
        setLoading(false);
      }
    }

    analyzeFlags();
  }, [currentDream, fileType, projectPath]);

  const handleExportReport = async () => {
    if (!projectPath) return;

    try {
      const savePath = await save({
        defaultPath: 'patient-report.md',
        filters: [{ name: 'Markdown', extensions: ['md'] }],
      });

      if (!savePath) return;

      const report = await generateReport(projectPath);
      await writeTextFile(savePath, report);
      
      console.log('[INSPECTOR] Report exported to:', savePath);
    } catch (error) {
      console.error('[INSPECTOR] Failed to export report:', error);
      alert('Failed to export report: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (!currentDream || fileType !== 'dream') {
    return (
      <div className="flex flex-col h-full border-t border-border">
        <div className="px-4 py-3 border-b border-border">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Inspector
          </div>
        </div>
        
        <div className="flex items-center justify-center flex-1 text-text-muted">
          <p className="text-sm">Open a .dream file to see analysis</p>
        </div>
      </div>
    );
  }

  const escalationPattern = patterns.find(p => p.type === 'escalation');

  return (
    <div className="flex flex-col h-full border-t border-border">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Inspector
        </div>
        <Button
          onClick={handleExportReport}
          variant="ghost"
          className="flex items-center gap-1 px-2 py-1 text-xs"
        >
          <FileDown className="w-3 h-3" />
          Export
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-4 text-text-muted">
            <p className="text-sm">Analyzing...</p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {/* SECTION 1: Current Session Flags */}
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Current Session Flags
              </h3>
              {flags.length > 0 ? (
                <div className="space-y-2">
                  {flags.map((flag) => (
                    <div key={flag.id} className="border border-border p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 border ${getSeverityColor(flag.severity)}`}>
                          {flag.severity}
                        </span>
                      </div>
                      <p className="text-xs text-text-primary mb-1">{flag.excerpt}</p>
                      <p className="text-xs text-text-muted">→ {flag.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">No flags detected</p>
              )}
            </div>

            {/* SECTION 2: Cross-Session Patterns */}
            <div>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Cross-Session Patterns
              </h3>
              
              {escalationPattern && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 mb-2">
                  <p className="text-xs font-semibold text-red-500 mb-1">
                    {escalationPattern.description}
                  </p>
                  <p className="text-xs text-text-muted">
                    {escalationPattern.occurrences.join(' • ')}
                  </p>
                </div>
              )}

              {patterns.filter(p => p.type !== 'escalation').length > 0 ? (
                <div className="space-y-2">
                  {patterns.filter(p => p.type !== 'escalation').map((pattern, idx) => (
                    <div key={idx} className="text-xs text-text-primary">
                      <p className="mb-1">{pattern.description}</p>
                      <p className="text-text-muted">
                        Sessions: {pattern.occurrences.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : escalationPattern ? null : (
                <p className="text-xs text-text-muted">No cross-session patterns detected</p>
              )}
            </div>

            {/* SECTION 3: Session Summary */}
            {summary && (
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                  Session Summary
                </h3>
                <div className="text-xs space-y-1">
                  <div className="text-text-primary">
                    Total Sessions: <span className="text-accent">{summary.totalSessions}</span>
                  </div>
                  <div className="text-text-primary">
                    Total Flags:{' '}
                    <span className="text-red-500">{summary.flagCounts.URGENT} URGENT</span> /{' '}
                    <span className="text-yellow-500">{summary.flagCounts.WATCH} WATCH</span> /{' '}
                    <span className="text-blue-500">{summary.flagCounts.NOTE} NOTE</span>
                  </div>
                  {summary.topTags.length > 0 && (
                    <div className="text-text-primary mt-2">
                      <div className="text-text-muted mb-1">Top 3 recurring tags:</div>
                      {summary.topTags.map((item, idx) => (
                        <div key={idx} className="ml-2">
                          • {item.tag} ({item.count} sessions)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'URGENT': return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'WATCH': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'NOTE': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    default: return 'text-text-muted bg-surface border-border';
  }
}

async function generateSessionSummary(projectPath: string, config: typeof DEFAULT_CONFIG): Promise<SessionSummary> {
  const summary: SessionSummary = {
    totalSessions: 0,
    flagCounts: { URGENT: 0, WATCH: 0, NOTE: 0 },
    topTags: [],
  };

  try {
    const entries = await readDir(projectPath);
    const tagCounts: Map<string, number> = new Map();

    for (const entry of entries) {
      if (entry.name.endsWith('.dream')) {
        summary.totalSessions++;

        try {
          const content = await readTextFile(`${projectPath}/${entry.name}`);
          const dream = parseDreamFile(content);
          
          const result = analyzeDream(dream, config);
          for (const flag of result.flags) {
            summary.flagCounts[flag.severity]++;
          }

          for (const tag of dream.frontmatter.tags || []) {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          }
        } catch {
          continue;
        }
      }
    }

    summary.topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

  } catch (error) {
    console.warn('[INSPECTOR] Failed to generate summary:', error);
  }

  return summary;
}

async function generateReport(projectPath: string): Promise<string> {
  const lines: string[] = [];
  
  lines.push('# Patient Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString('tr-TR')}`);
  lines.push('');
  
  try {
    const soulContent = await readTextFile(`${projectPath}/soul.md`);
    lines.push('## Soul Profile');
    lines.push('');
    lines.push(soulContent);
    lines.push('');
  } catch {
    lines.push('## Soul Profile');
    lines.push('');
    lines.push('_No soul profile available_');
    lines.push('');
  }

  lines.push('## Sessions');
  lines.push('');

  let config = DEFAULT_CONFIG;
  try {
    const configContent = await readTextFile(`${projectPath}/.dreamconfig`);
    config = parseConfig(configContent);
  } catch {
    // Use default
  }

  try {
    const entries = await readDir(projectPath);
    const dreamFiles = entries.filter(e => e.name.endsWith('.dream'));

    const sessions: Array<{ name: string; dream: any; date: Date; session: number }> = [];
    for (const entry of dreamFiles) {
      try {
        const content = await readTextFile(`${projectPath}/${entry.name}`);
        const dream = parseDreamFile(content);
        sessions.push({
          name: entry.name,
          dream,
          date: new Date(dream.frontmatter.date),
          session: dream.frontmatter.session,
        });
      } catch {
        continue;
      }
    }

    sessions.sort((a, b) => a.date.getTime() - b.date.getTime());

    for (const { dream } of sessions) {
      const flags = analyzeDream(dream, config).flags;
      
      lines.push(`### Session ${dream.frontmatter.session} - ${new Date(dream.frontmatter.date).toLocaleDateString('tr-TR')}`);
      lines.push('');
      
      if (dream.frontmatter.tags && dream.frontmatter.tags.length > 0) {
        lines.push(`**Tags:** ${dream.frontmatter.tags.join(', ')}`);
        lines.push('');
      }

      lines.push('**Dream Content:**');
      lines.push('');
      lines.push(dream.content);
      lines.push('');

      if (flags.length > 0) {
        lines.push('**Flags:**');
        lines.push('');
        for (const flag of flags) {
          lines.push(`- **[${flag.severity}]** ${flag.excerpt}`);
          lines.push(`  - ${flag.reason}`);
        }
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }
  } catch (error) {
    console.error('[REPORT] Failed to generate sessions:', error);
  }

  return lines.join('\n');
}
