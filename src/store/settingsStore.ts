import { create } from 'zustand';
import { setApiKey, getApiKey, deleteApiKey, ApiKeyService } from '../lib/keychain';

interface SettingsStore {
  hasOpenAIKey: boolean;
  hasAnthropicKey: boolean;
  hasGoogleKey: boolean;
  isLoading: boolean;
  checkApiKeys: () => Promise<void>;
  saveApiKey: (service: ApiKeyService, key: string) => Promise<void>;
  removeApiKey: (service: ApiKeyService) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  hasOpenAIKey: false,
  hasAnthropicKey: false,
  hasGoogleKey: false,
  isLoading: false,

  checkApiKeys: async () => {
    set({ isLoading: true });
    try {
      const [openai, anthropic, google] = await Promise.all([
        getApiKey('openai'),
        getApiKey('anthropic'),
        getApiKey('google'),
      ]);

      set({
        hasOpenAIKey: !!openai,
        hasAnthropicKey: !!anthropic,
        hasGoogleKey: !!google,
      });
    } catch (error) {
      console.error('Failed to check API keys:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveApiKey: async (service: ApiKeyService, key: string) => {
    set({ isLoading: true });
    try {
      await setApiKey(service, key);
      
      if (service === 'openai') set({ hasOpenAIKey: true });
      if (service === 'anthropic') set({ hasAnthropicKey: true });
      if (service === 'google') set({ hasGoogleKey: true });
    } catch (error) {
      console.error(`Failed to save ${service} API key:`, error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeApiKey: async (service: ApiKeyService) => {
    set({ isLoading: true });
    try {
      await deleteApiKey(service);
      
      if (service === 'openai') set({ hasOpenAIKey: false });
      if (service === 'anthropic') set({ hasAnthropicKey: false });
      if (service === 'google') set({ hasGoogleKey: false });
    } catch (error) {
      console.error(`Failed to remove ${service} API key:`, error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
