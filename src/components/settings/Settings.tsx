import { useState, useEffect } from 'react';
import { Key, Check, X } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { Button } from '../ui/Button';

export function Settings() {
  const { hasOpenAIKey, hasAnthropicKey, hasGoogleKey, isLoading, checkApiKeys, saveApiKey, removeApiKey } = useSettingsStore();
  
  const [openaiInput, setOpenaiInput] = useState('');
  const [anthropicInput, setAnthropicInput] = useState('');
  const [googleInput, setGoogleInput] = useState('');
  
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);

  useEffect(() => {
    checkApiKeys();
  }, []);

  const handleSave = async (service: 'openai' | 'anthropic' | 'google', key: string) => {
    if (!key.trim()) return;
    
    try {
      console.log(`[SETTINGS] Attempting to save ${service} API key...`);
      await saveApiKey(service, key);
      console.log(`[SETTINGS] Save completed for ${service}`);
      
      // Immediately verify by checking again
      await checkApiKeys();
      console.log(`[SETTINGS] Verification completed for ${service}`);
      
      if (service === 'openai') setOpenaiInput('');
      if (service === 'anthropic') setAnthropicInput('');
      if (service === 'google') setGoogleInput('');
      
      alert(`${service} API key kaydedildi! Kontrol ediliyor...`);
    } catch (error) {
      console.error('[SETTINGS ERROR] Failed to save API key:', error);
      alert(`Hata: ${error instanceof Error ? error.message : 'API key kaydedilemedi'}`);
    }
  };

  const handleRemove = async (service: 'openai' | 'anthropic' | 'google') => {
    try {
      await removeApiKey(service);
    } catch (error) {
      console.error('Failed to remove API key:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-text-muted" />
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            API Keys
          </div>
        </div>
        <div className="text-xs text-text-muted mt-1">
          Keys are stored securely in your OS keychain
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-text-primary font-medium">OpenAI API Key</label>
            {hasOpenAIKey && (
              <div className="flex items-center gap-1 text-xs text-green-500">
                <Check className="w-3 h-3" />
                Configured
              </div>
            )}
          </div>
          
          {!hasOpenAIKey || showOpenAI ? (
            <div className="space-y-2">
              <input
                type="password"
                value={openaiInput}
                onChange={(e) => setOpenaiInput(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 text-sm bg-background text-text-primary border border-border focus:outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave('openai', openaiInput)}
                  disabled={!openaiInput.trim() || isLoading}
                  className="text-xs"
                >
                  Save
                </Button>
                {hasOpenAIKey && (
                  <Button
                    onClick={() => setShowOpenAI(false)}
                    variant="ghost"
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setShowOpenAI(true)} variant="ghost" className="text-xs">
                Update Key
              </Button>
              <Button
                onClick={() => handleRemove('openai')}
                variant="ghost"
                className="text-xs text-red-500 hover:text-red-600"
              >
                <X className="w-3 h-3 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-text-primary font-medium">Anthropic API Key</label>
            {hasAnthropicKey && (
              <div className="flex items-center gap-1 text-xs text-green-500">
                <Check className="w-3 h-3" />
                Configured
              </div>
            )}
          </div>
          
          {!hasAnthropicKey || showAnthropic ? (
            <div className="space-y-2">
              <input
                type="password"
                value={anthropicInput}
                onChange={(e) => setAnthropicInput(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 text-sm bg-background text-text-primary border border-border focus:outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave('anthropic', anthropicInput)}
                  disabled={!anthropicInput.trim() || isLoading}
                  className="text-xs"
                >
                  Save
                </Button>
                {hasAnthropicKey && (
                  <Button
                    onClick={() => setShowAnthropic(false)}
                    variant="ghost"
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setShowAnthropic(true)} variant="ghost" className="text-xs">
                Update Key
              </Button>
              <Button
                onClick={() => handleRemove('anthropic')}
                variant="ghost"
                className="text-xs text-red-500 hover:text-red-600"
              >
                <X className="w-3 h-3 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-text-primary font-medium">Google API Key</label>
            {hasGoogleKey && (
              <div className="flex items-center gap-1 text-xs text-green-500">
                <Check className="w-3 h-3" />
                Configured
              </div>
            )}
          </div>
          
          {!hasGoogleKey || showGoogle ? (
            <div className="space-y-2">
              <input
                type="password"
                value={googleInput}
                onChange={(e) => setGoogleInput(e.target.value)}
                placeholder="AIza..."
                className="w-full px-3 py-2 text-sm bg-background text-text-primary border border-border focus:outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave('google', googleInput)}
                  disabled={!googleInput.trim() || isLoading}
                  className="text-xs"
                >
                  Save
                </Button>
                {hasGoogleKey && (
                  <Button
                    onClick={() => setShowGoogle(false)}
                    variant="ghost"
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setShowGoogle(true)} variant="ghost" className="text-xs">
                Update Key
              </Button>
              <Button
                onClick={() => handleRemove('google')}
                variant="ghost"
                className="text-xs text-red-500 hover:text-red-600"
              >
                <X className="w-3 h-3 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
