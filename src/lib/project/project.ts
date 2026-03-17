import { writeTextFile, exists } from '@tauri-apps/plugin-fs';
import { createDefaultSoulFile } from './soulFile';
import { DEFAULT_CONFIG, serializeConfig } from './config';

export async function initializeProject(projectPath: string): Promise<void> {
  const soulPath = `${projectPath}/soul.md`;
  const configPath = `${projectPath}/.dreamconfig`;

  const soulExists = await exists(soulPath);
  if (!soulExists) {
    await writeTextFile(soulPath, createDefaultSoulFile());
  }

  const configExists = await exists(configPath);
  if (!configExists) {
    await writeTextFile(configPath, serializeConfig(DEFAULT_CONFIG));
  }
}
