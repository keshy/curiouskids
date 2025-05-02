import { useState } from "react";
import { Settings } from "./AskMeBuddy";

interface ParentSettingsModalProps {
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

export default function ParentSettingsModal({ settings, onClose, onSave }: ParentSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<Settings>({ ...settings });

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close modal only if the backdrop itself is clicked
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Parental Controls</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Audio Settings</h3>
            <div className="flex items-center justify-between">
              <span className="text-lg">Text-to-Speech</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localSettings.textToSpeech} 
                  onChange={() => setLocalSettings({
                    ...localSettings,
                    textToSpeech: !localSettings.textToSpeech
                  })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Content Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg">Show Images</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localSettings.showImages} 
                    onChange={() => setLocalSettings({
                      ...localSettings,
                      showImages: !localSettings.showImages
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg">Content Filter</span>
                <select 
                  className="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={localSettings.contentFilter}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    contentFilter: e.target.value as Settings["contentFilter"]
                  })}
                >
                  <option value="strict">Strict (5yo appropriate)</option>
                  <option value="moderate">Moderate</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">Display Settings</h3>
            <div className="flex items-center justify-between">
              <span className="text-lg">High Contrast Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localSettings.highContrastMode} 
                  onChange={() => setLocalSettings({
                    ...localSettings,
                    highContrastMode: !localSettings.highContrastMode
                  })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full bg-primary hover:bg-blue-600 text-white text-xl font-bold py-3 px-6 rounded-xl shadow-md transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}