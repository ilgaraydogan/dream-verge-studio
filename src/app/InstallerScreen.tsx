import { useState } from 'react';
import { Sparkles, FolderOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Store } from '@tauri-apps/plugin-store';
import { Button } from '../components/ui/Button';

type Step = 0 | 1 | 2;

const STEPS = {
  WELCOME: 0 as Step,
  MODES: 1 as Step,
  READY: 2 as Step,
} as const;

export function InstallerScreen() {
  const [currentStep, setCurrentStep] = useState<Step>(STEPS.WELCOME);
  const { setMode } = useAppStore();

  const handleNext = () => {
    if (currentStep < STEPS.READY) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleComplete = async () => {
    try {
      const store = await Store.load('settings.json');
      await store.set('onboarded', true);
      await store.save();
      setMode('welcome');
    } catch (error) {
      console.error('[INSTALLER] Failed to save onboarded flag:', error);
      setMode('welcome');
    }
  };

  const handleSkip = async () => {
    try {
      const store = await Store.load('settings.json');
      await store.set('onboarded', true);
      await store.save();
    } catch (error) {
      console.error('[INSTALLER] Failed to save onboarded flag:', error);
    }
    setMode('welcome');
  };

  return (
    <div className="relative flex items-center justify-center h-screen w-screen bg-[#0d0d0d] overflow-hidden">
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        Skip
      </button>

      {/* Content */}
      <div className="w-full max-w-4xl px-8">
        {/* Step 1: Welcome */}
        {currentStep === STEPS.WELCOME && (
          <div
            className="flex flex-col items-center text-center space-y-8 animate-fadeIn"
            key="welcome"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-accent blur-3xl opacity-30 animate-pulse" />
              <div className="relative flex items-center justify-center w-32 h-32 bg-accent text-white text-5xl font-bold animate-scaleIn">
                DV
              </div>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold text-text-primary animate-fadeInUp">
                Dream Verge Studio'ya Hoş Geldiniz
              </h1>
              <p className="text-lg text-text-muted animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                Psikologlar için AI destekli rüya analiz IDE'si
              </p>
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3 mt-8 animate-fadeInUp"
              style={{ animationDelay: '0.2s' }}
            >
              Devam Et
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Modes */}
        {currentStep === STEPS.MODES && (
          <div
            className="flex flex-col items-center space-y-12 animate-fadeIn"
            key="modes"
          >
            <h2 className="text-3xl font-semibold text-text-primary text-center">
              İki Kullanım Modu
            </h2>

            <div className="flex gap-8 w-full max-w-3xl">
              {/* Project Mode Card */}
              <div className="group flex-1 p-8 bg-surface border border-border hover:border-accent transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                <div className="flex flex-col items-center text-center space-y-4">
                  <FolderOpen className="w-12 h-12 text-accent group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-text-primary">Project Mode</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Klinik kullanım için tam özellikli IDE. Hasta klasörleri, çoklu AI modelleri, flagging sistemi ve cross-session analiz.
                  </p>
                  <span className="text-xs px-3 py-1 bg-accent/20 text-accent border border-accent/30">
                    Beta
                  </span>
                </div>
              </div>

              {/* Playground Card */}
              <div className="group flex-1 p-8 bg-surface border border-border hover:border-accent transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Sparkles className="w-12 h-12 text-accent group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-text-primary">Playground</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Hızlı analiz için basit arayüz. Rüyanızı yazın, anında AI yorumu alın. Kurulum gerektirmez.
                  </p>
                  <span className="text-xs px-3 py-1 bg-green-500/20 text-green-500 border border-green-500/30">
                    Sınırsız
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3"
            >
              Devam Et
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 3: Ready */}
        {currentStep === STEPS.READY && (
          <div
            className="flex flex-col items-center text-center space-y-8 animate-fadeIn"
            key="ready"
          >
            <div className="relative">
              <CheckCircle2 className="w-32 h-32 text-accent animate-drawCheck" strokeWidth={1.5} />
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-semibold text-text-primary">
                Her Şey Hazır!
              </h1>
              <p className="text-lg text-text-muted">
                API anahtarlarınızı Settings'ten ekleyebilirsiniz
              </p>
            </div>

            <Button
              onClick={handleComplete}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3 mt-8"
            >
              Başla
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
