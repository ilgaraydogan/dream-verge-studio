export function Inspector() {
  return (
    <div className="flex flex-col h-full border-t border-border">
      <div className="px-4 py-3 border-b border-border">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          Inspector
        </div>
      </div>
      
      <div className="flex items-center justify-center flex-1 text-text-muted">
        <p className="text-sm">File metadata will appear here</p>
      </div>
    </div>
  );
}
