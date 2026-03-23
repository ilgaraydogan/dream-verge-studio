import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { InstallerScreen } from './app/InstallerScreen';
import { WelcomeScreen } from './app/WelcomeScreen';
import { ProjectMode } from './app/ProjectMode';
import { PlaygroundMode } from './app/PlaygroundMode';
import { Store } from '@tauri-apps/plugin-store';

function App() {
  const { mode, setMode } = useAppStore();

  useEffect(() => {
    async function checkOnboarded() {
      try {
        const store = await Store.load('settings.json');
        const onboarded = await store.get<boolean>('onboarded');
        
        if (onboarded) {
          setMode('welcome');
        } else {
          setMode('installer');
        }
      } catch (error) {
        console.error('[APP] Failed to check onboarded status:', error);
        setMode('installer');
      }
    }

    checkOnboarded();
  }, [setMode]);

  switch (mode) {
    case 'installer':
      return <InstallerScreen />;
    case 'welcome':
      return <WelcomeScreen />;
    case 'project':
      return <ProjectMode />;
    case 'playground':
      return <PlaygroundMode />;
    default:
      return <InstallerScreen />;
  }
}

export default App;
