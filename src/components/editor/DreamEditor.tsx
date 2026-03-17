import { useEditorStore } from '../../store/editorStore';
import { useProjectStore } from '../../store/projectStore';
import { useState, useEffect } from 'react';
import { Flag } from '../../lib/flags/types';
import { detectFlags } from '../../lib/flags/engine';
import { parseConfig, DEFAULT_CONFIG } from '../../lib/project/config';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { HighlightedTextarea } from './HighlightedTextarea';

export function DreamEditor() {
  const { currentDream, updateFrontmatter, updateBody } = useEditorStore();
  const { projectPath } = useProjectStore();
  const [flags, setFlags] = useState<Flag[]>([]);

  useEffect(() => {
    async function analyzeContent() {
      if (!currentDream || !projectPath) {
        setFlags([]);
        return;
      }

      try {
        let config = DEFAULT_CONFIG;
        try {
          const configPath = `${projectPath}/.dreamconfig`;
          const configContent = await readTextFile(configPath);
          config = parseConfig(configContent);
        } catch {
          // Use default config
        }

        const detectedFlags = detectFlags(currentDream, config);
        setFlags(detectedFlags);
      } catch (error) {
        console.warn('[DREAM EDITOR] Failed to detect flags:', error);
        setFlags([]);
      }
    }

    analyzeContent();
  }, [currentDream?.content, projectPath]);

  if (!currentDream) return null;

  const { frontmatter, content } = currentDream;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-surface">
        <div className="grid grid-cols-2 gap-4 p-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">Date</label>
            <input
              type="date"
              value={frontmatter.date.split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value).toISOString();
                updateFrontmatter({ date: newDate });
              }}
              className="w-full px-2 py-1 text-sm bg-background text-text-primary border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">Session</label>
            <input
              type="number"
              value={frontmatter.session}
              onChange={(e) => updateFrontmatter({ session: parseInt(e.target.value) || 1 })}
              className="w-full px-2 py-1 text-sm bg-background text-text-primary border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-text-muted mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={frontmatter.tags.join(', ')}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map(t => t.trim())
                  .filter(t => t.length > 0);
                updateFrontmatter({ tags });
              }}
              placeholder="e.g. anxiety, recurring, nightmare"
              className="w-full px-2 py-1 text-sm bg-background text-text-primary border border-border focus:outline-none focus:border-accent"
            />
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={frontmatter.flagged}
                onChange={(e) => updateFrontmatter({ flagged: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm text-text-primary">Flagged for review</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b border-border">
          <div className="text-xs text-text-muted uppercase tracking-wide">Dream Content</div>
        </div>
        <HighlightedTextarea
          value={content}
          onChange={(value) => updateBody(value)}
          flags={flags}
          placeholder="Write the dream content here..."
          className="flex-1 w-full p-4 bg-background text-text-primary font-mono text-sm resize-none focus:outline-none"
        />
      </div>
    </div>
  );
}
