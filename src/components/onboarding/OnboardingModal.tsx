import { useState, useEffect } from 'react';
import { FolderOpen, Key, FileText, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

const ONBOARDING_KEY = 'dreamverge_onboarded';

interface OnboardingModalProps {
  onClose: () => void;
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-surface border border-border w-full max-w-lg">
        <div className="p-8">
          {step === 1 && (
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-accent mx-auto mb-4">
                <span className="text-2xl font-bold text-white">DV</span>
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Welcome to Dream Verge Studio
              </h2>
              <p className="text-sm text-text-muted">
                Professional AI-powered dream analysis for psychologists and therapists
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 text-accent" />
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Open or Create a Project
              </h2>
              <p className="text-sm text-text-muted">
                Each patient gets their own project folder containing dream sessions, 
                psychological profile (soul.md), and analysis history.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <Key className="w-16 h-16 mx-auto mb-4 text-accent" />
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Add Your AI API Keys
              </h2>
              <p className="text-sm text-text-muted">
                Go to Settings (⚙️) and add your OpenAI, Anthropic, or Google API keys. 
                Your keys are stored securely in the OS keychain.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-accent" />
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Create and Analyze Dreams
              </h2>
              <p className="text-sm text-text-muted mb-4">
                Click "New Dream" to create a session, enter the dream content, 
                then click "Analyze" to get AI-powered insights.
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted bg-background border border-border p-3">
                <FileText className="w-4 h-4" />
                <span>Flagging, cross-session patterns, and soul profile updates happen automatically.</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 transition-colors ${
                    s === step ? 'bg-accent' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Skip
              </button>
              <Button
                onClick={handleNext}
                className="px-6 py-2 bg-accent hover:bg-accent/90 text-white text-sm transition-colors"
              >
                {step === 4 ? 'Get Started' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem(ONBOARDING_KEY);
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  return {
    showOnboarding,
    closeOnboarding: () => setShowOnboarding(false),
  };
}
