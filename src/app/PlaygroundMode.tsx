import { useState } from 'react';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../store/appStore';
import { interpretDreamWithOpenRouter } from '../lib/ai/openrouter';
import { Button } from '../components/ui/Button';

export function PlaygroundMode() {
  const { setMode } = useAppStore();
  const [dreamText, setDreamText] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!dreamText.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setInterpretation('');

    try {
      const result = await interpretDreamWithOpenRouter(dreamText);
      setInterpretation(result);
    } catch (err) {
      console.error('[PLAYGROUND] Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackToWelcome = () => {
    setMode('welcome');
  };

  const canAnalyze = dreamText.trim().length > 0;

  return (
    <div className="flex flex-col h-screen w-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 bg-accent text-white text-xs font-bold">
            DV
          </div>
          <span className="text-sm font-semibold text-text-primary">Dream Verge Studio</span>
        </div>
        <Button
          onClick={handleBackToWelcome}
          variant="ghost"
          className="text-sm"
        >
          Open Project Mode
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-3xl space-y-6">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-semibold text-text-primary">Dream Playground</h1>
            </div>
            <p className="text-sm text-text-muted">Rüyanı yaz, AI yorumlasın • Sınırsız analiz</p>
          </div>

          {/* Dream Input */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Your Dream
            </label>
            <textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder="Rüyanı buraya yaz..."
              className="w-full h-48 p-4 bg-surface text-text-primary border border-border focus:outline-none focus:border-accent resize-none font-mono text-sm"
              disabled={isAnalyzing}
            />
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={!canAnalyze || isAnalyzing}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : (
                <>
                  Yorumla
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Error</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Interpretation Result */}
          {interpretation && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                AI Interpretation
              </label>
              <div className="p-6 bg-surface border border-border">
                <div className="prose prose-invert prose-sm max-w-none text-text-primary leading-relaxed">
                  <ReactMarkdown>
                    {interpretation}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
