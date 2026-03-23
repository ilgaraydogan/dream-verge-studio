import { useState, useEffect } from 'react';
import { Navigator } from '../components/navigator/Navigator';
import { Editor } from '../components/editor/Editor';
import { Analysis } from '../components/analysis/Analysis';
import { Inspector } from '../components/inspector/Inspector';
import { Settings } from '../components/settings/Settings';
import { SoulUpdateModal } from '../components/soul/SoulUpdateModal';
import { OnboardingModal, useOnboarding } from '../components/onboarding/OnboardingModal';
import { Toolbar } from '../components/app/Toolbar';
import { useSettingsStore } from '../store/settingsStore';
import { useSoulStore } from '../store/soulStore';
import { useProjectStore } from '../store/projectStore';
import { generateSoulUpdateProposal, shouldTriggerSoulUpdate } from '../lib/soul/soulUpdater';
import { parseConfig, DEFAULT_CONFIG } from '../lib/project/config';
import { writeTextFile, readTextFile, readDir } from '@tauri-apps/plugin-fs';

export function ProjectMode() {
  const [showSettings, setShowSettings] = useState(false);
  const [triggerAnalysis, setTriggerAnalysis] = useState(0);
  const { checkApiKeys } = useSettingsStore();
  const { projectPath } = useProjectStore();
  const { updateProposal, showUpdateModal, setUpdateProposal, setShowUpdateModal, clearProposal } = useSoulStore();
  const { showOnboarding, closeOnboarding } = useOnboarding();

  const handleAnalyze = () => {
    setShowSettings(false);
    setTriggerAnalysis(prev => prev + 1);
  };

  useEffect(() => {
    if (showSettings) {
      checkApiKeys();
    }
  }, [showSettings, checkApiKeys]);

  useEffect(() => {
    async function checkForSoulUpdate() {
      if (!projectPath) return;

      try {
        let config = DEFAULT_CONFIG;
        try {
          const configPath = `${projectPath}/.dreamconfig`;
          const configContent = await readTextFile(configPath);
          config = parseConfig(configContent);
        } catch (error) {
          console.warn('Using default config for soul update check');
        }

        const entries = await readDir(projectPath);
        const dreamCount = entries.filter(e => e.name.endsWith('.dream')).length;

        if (shouldTriggerSoulUpdate(dreamCount, config)) {
          const proposal = await generateSoulUpdateProposal(projectPath, config);
          if (proposal) {
            setUpdateProposal(proposal);
            setShowUpdateModal(true);
          }
        }
      } catch (error) {
        console.error('Failed to check for soul update:', error);
      }
    }

    checkForSoulUpdate();
  }, [projectPath, setUpdateProposal, setShowUpdateModal]);

  const handleAcceptSoulUpdate = async (content: string) => {
    if (!projectPath) return;

    try {
      const soulPath = `${projectPath}/soul.md`;
      await writeTextFile(soulPath, content);
      console.log('Soul profile updated successfully');
      clearProposal();
    } catch (error) {
      console.error('Failed to save soul update:', error);
      alert('Failed to save soul.md update');
    }
  };

  const handleRejectSoulUpdate = () => {
    console.log('Soul update proposal rejected');
    clearProposal();
  };

  return (
    <>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <Toolbar 
          onSettingsClick={() => setShowSettings(!showSettings)}
          onAnalyzeClick={handleAnalyze}
        />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-border bg-surface overflow-y-auto">
          <Navigator />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 border-r border-border overflow-y-auto">
              <Editor />
            </div>

            <div className="w-80 bg-surface overflow-y-auto">
              {showSettings ? <Settings /> : <Analysis triggerAnalysis={triggerAnalysis} />}
            </div>
          </div>

          <div className="h-48 border-t border-border bg-surface overflow-y-auto">
            <Inspector />
          </div>
        </div>
      </div>
      </div>

      {showUpdateModal && updateProposal && (
        <SoulUpdateModal
          proposal={updateProposal}
          onAccept={handleAcceptSoulUpdate}
          onReject={handleRejectSoulUpdate}
          onClose={clearProposal}
        />
      )}

      {showOnboarding && (
        <OnboardingModal onClose={closeOnboarding} />
      )}
    </>
  );
}
