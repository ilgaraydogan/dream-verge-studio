import { useEditorStore } from '../../store/editorStore';

export function SoulEditor() {
  const { currentContent, setCurrentContent } = useEditorStore();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-border">
        <div className="text-xs text-text-muted uppercase tracking-wide">Soul.md</div>
        <div className="text-xs text-text-muted mt-1">
          Patient's psychological profile and recurring patterns
        </div>
      </div>
      
      <textarea
        value={currentContent}
        onChange={(e) => setCurrentContent(e.target.value)}
        className="flex-1 w-full p-4 bg-background text-text-primary font-mono text-sm resize-none focus:outline-none"
        placeholder="# Core Themes..."
      />
    </div>
  );
}
