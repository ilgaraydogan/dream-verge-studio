import { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useProjectStore } from '../../store/projectStore';
import { Button } from '../ui/Button';
import { analyzeWithAllModels } from '../../lib/ai/analyzer';
import { AnalysisResult } from '../../lib/ai/types';
import { readTextFile, exists } from '@tauri-apps/plugin-fs';
import { parseConfig } from '../../lib/project/config';

export function Analysis() {
  const { currentDream, fileType } = useEditorStore();
  const { projectPath } = useProjectStore();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Record<string, AnalysisResult>>({});
  const [streamingContent, setStreamingContent] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = fileType === 'dream' && currentDream && projectPath;

  const handleAnalyze = async () => {
    if (!canAnalyze || !currentDream || !projectPath) return;

    console.log('=== ANALYSIS STARTED ===');
    console.log('Dream ID:', currentDream.frontmatter.id);
    console.log('Project Path:', projectPath);

    setIsAnalyzing(true);
    setResults({});
    setStreamingContent({});
    setError(null);

    try {
      console.log('Step 1: Reading soul.md...');
      const soulPath = `${projectPath}/soul.md`;
      const soulExists = await exists(soulPath);
      const soulContext = soulExists ? await readTextFile(soulPath) : '';
      console.log('Soul context loaded:', soulContext.length, 'chars');

      console.log('Step 2: Reading .dreamconfig...');
      const configPath = `${projectPath}/.dreamconfig`;
      const configContent = await readTextFile(configPath);
      const config = parseConfig(configContent);
      console.log('Config loaded, models:', config.models);

      console.log('Step 3: Starting analysis with models...');
      const analysisResults = await analyzeWithAllModels(
        currentDream,
        soulContext,
        config,
        projectPath,
        (modelId, chunk) => {
          setStreamingContent(prev => ({
            ...prev,
            [modelId]: (prev[modelId] || '') + chunk,
          }));
        }
      );

      console.log('Step 4: Analysis complete, results:', analysisResults.length);
      
      const resultMap: Record<string, AnalysisResult> = {};
      for (const result of analysisResults) {
        console.log('Result for', result.modelId, '- error?', result.error);
        resultMap[result.modelId] = result;
      }
      setResults(resultMap);
      setStreamingContent({});
      
      if (analysisResults.length === 0) {
        const msg = 'Analiz başarısız oldu. Lütfen API anahtarlarınızı kontrol edin.';
        console.error(msg);
        setError(msg);
      } else {
        console.log('=== ANALYSIS SUCCESS ===');
      }
    } catch (error) {
      console.error('=== ANALYSIS ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error object:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'no stack');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const fullError = `Analiz hatası: ${errorMessage}`;
      
      console.error('Setting error message:', fullError);
      setError(fullError);
      
      // Also alert so it's visible
      alert(`HATA: ${fullError}\n\nDetay: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setIsAnalyzing(false);
      console.log('=== ANALYSIS FINISHED ===');
    }
  };

  const displayResults = Object.keys(results).length > 0 ? results : streamingContent;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            Analysis
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className="flex items-center gap-2 text-xs"
          >
            <Sparkles className="w-4 h-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-4 border border-red-500 bg-red-500/10 text-red-500 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {!canAnalyze ? (
          <div className="flex items-center justify-center h-full text-text-muted">
            <p className="text-sm">.dream dosyası açın</p>
          </div>
        ) : Object.keys(displayResults).length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted">
            <p className="text-sm">Analiz başlatmak için "Analyze" butonuna tıklayın</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(displayResults).map(([modelId, result]) => {
              const content = typeof result === 'string' ? result : result.content;
              const modelName = typeof result === 'string' ? modelId : result.modelName;
              const error = typeof result === 'string' ? undefined : result.error;

              return (
                <div
                  key={modelId}
                  className="border border-border bg-surface p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="font-medium text-sm text-text-primary">
                      {modelName}
                    </div>
                    {isAnalyzing && streamingContent[modelId] && (
                      <div className="text-xs text-accent animate-pulse">●</div>
                    )}
                  </div>

                  {error ? (
                    <div className="flex items-start gap-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-text-primary whitespace-pre-wrap font-mono leading-relaxed">
                      {content || <span className="text-text-muted italic">Bekleniyor...</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
