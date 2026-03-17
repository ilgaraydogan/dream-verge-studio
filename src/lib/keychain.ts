import { invoke } from '@tauri-apps/api/core';

export type ApiKeyService = 'openai' | 'anthropic' | 'google';

export async function setApiKey(service: ApiKeyService, key: string): Promise<void> {
  await invoke('set_api_key', { service, key });
}

export async function getApiKey(service: ApiKeyService): Promise<string | null> {
  try {
    return await invoke('get_api_key', { service });
  } catch {
    return null;
  }
}

export async function deleteApiKey(service: ApiKeyService): Promise<void> {
  await invoke('delete_api_key', { service });
}
