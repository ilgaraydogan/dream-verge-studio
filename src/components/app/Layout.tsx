import { useState, useEffect } from 'react';
import { Navigator } from '../navigator/Navigator';
import { Editor } from '../editor/Editor';
import { Analysis } from '../analysis/Analysis';
import { Inspector } from '../inspector/Inspector';
import { Settings } from '../settings/Settings';
import { Toolbar } from './Toolbar';
import { useSettingsStore } from '../../store/settingsStore';

export function Layout() {
  const [showSettings, setShowSettings] = useState(false);
  const { checkApiKeys } = useSettingsStore();

  useEffect(() => {
    if (showSettings) {
      checkApiKeys();
    }
  }, [showSettings, checkApiKeys]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Toolbar onSettingsClick={() => setShowSettings(!showSettings)} />
      
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
              {showSettings ? <Settings /> : <Analysis />}
            </div>
          </div>

          <div className="h-48 border-t border-border bg-surface overflow-y-auto">
            <Inspector />
          </div>
        </div>
      </div>
    </div>
  );
}
