import React, { useState } from 'react';
import {
  Bell,
  Database,
  Download,
  Moon,
  Palette,
  Settings,
  Sun,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  createFileName,
  downloadFile,
  parseImportPayload,
} from '../../utils/appData';

const SettingsView = () => {
  const {
    theme,
    setTheme,
    notes,
    flashcards,
    folders,
    studySessions,
    preferences,
    updatePreferences,
    importData,
    clearAllData,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'general' | 'appearance' | 'data' | 'notifications'
  >('general');
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Export', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  const storageSizeKb = Math.round(
    JSON.stringify({
      notes,
      flashcards,
      folders,
      studySessions,
      preferences,
      theme,
    }).length / 1024,
  );

  const exportData = () => {
    downloadFile(
      JSON.stringify(
        {
          notes,
          flashcards,
          folders,
          studySessions,
          preferences,
          theme,
          exportDate: new Date().toISOString(),
          version: '2.0.0',
        },
        null,
        2,
      ),
      'application/json',
      createFileName(`neuronotes-backup-${new Date().toISOString().slice(0, 10)}`, 'json'),
    );
    setImportMessage('Backup exported successfully.');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const rawValue = await file.text();
      const parsed = parseImportPayload(rawValue);
      importData(parsed);
      setImportMessage('Backup imported successfully.');
    } catch (error: unknown) {
      setImportMessage(
        error instanceof Error ? error.message : 'Failed to import this backup file.',
      );
    } finally {
      event.target.value = '';
    }
  };

  const handleClearAllData = () => {
    const shouldClear = window.confirm(
      'Clear all notes, flashcards, sessions, and settings stored in this browser?',
    );

    if (shouldClear) {
      clearAllData();
    }
  };

  const renderToggle = (
    title: string,
    description: string,
    preferenceKey: keyof typeof preferences,
  ) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(preferences[preferenceKey])}
          onChange={(event) =>
            updatePreferences({ [preferenceKey]: event.target.checked } as Partial<
              typeof preferences
            >)
          }
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
      </label>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Profile
              </h3>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Local workspace</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Everything is stored in this browser unless you export a backup.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Study Preferences
              </h3>
              <div className="space-y-4">
                {renderToggle(
                  'Auto-save notes',
                  'Save changes while you type in the editor.',
                  'autoSaveNotes',
                )}
                {renderToggle(
                  'Smart flashcard generation',
                  'Keep AI generation tools enabled throughout the app.',
                  'smartFlashcardGeneration',
                )}
                {renderToggle(
                  'Study reminders',
                  'Show reminder options for regular review sessions.',
                  'studyReminders',
                )}
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Light Mode</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Clean and bright interface
                  </p>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Moon className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Easier contrast for long sessions
                  </p>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Font Size
              </h3>
              <div className="space-y-3">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <label
                    key={size}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="fontSize"
                      checked={preferences.fontSize === size}
                      onChange={() => updatePreferences({ fontSize: size })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="capitalize text-gray-900 dark:text-white">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Editor Font
              </h3>
              <select
                value={preferences.editorFont}
                onChange={(event) =>
                  updatePreferences({
                    editorFont: event.target.value as typeof preferences.editorFont,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="system">System</option>
                <option value="mono">Monospace</option>
                <option value="serif">Serif</option>
              </select>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Storage Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">{notes.length}</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Notes</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">
                    {flashcards.length}
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Flashcards</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    {studySessions.length}
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">Sessions</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                  <h4 className="font-medium text-orange-900 dark:text-orange-100">
                    {storageSizeKb} KB
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Stored locally</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Export & Backup
              </h3>
              <div className="space-y-4">
                <button
                  onClick={exportData}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export All Data</span>
                </button>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Import Data</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Restore notes, flashcards, sessions, and preferences from a backup file.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {importMessage && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{importMessage}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                Danger Zone
              </h3>
              <div className="p-4 border border-red-200 dark:border-red-800 rounded-2xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h4 className="font-medium text-red-900 dark:text-red-100">Clear All Data</h4>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  This removes everything stored in this browser, including settings and history.
                </p>
                <button
                  onClick={handleClearAllData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Reminder Controls
              </h3>
              <div className="space-y-4">
                {renderToggle(
                  'Daily study reminder',
                  'Show a daily reminder in your preferred time slot.',
                  'studyReminders',
                )}
                {renderToggle(
                  'Flashcard review alerts',
                  'Surface when flashcards are due for review.',
                  'flashcardReviewAlerts',
                )}
                {renderToggle(
                  'Achievement notifications',
                  'Celebrate streaks and milestones inside the app.',
                  'achievementNotifications',
                )}
                {renderToggle(
                  'Anonymous analytics',
                  'Opt in to usage analytics if you want to help improve the app.',
                  'analyticsOptIn',
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Reminder Time
              </h3>
              <input
                type="time"
                value={preferences.reminderTime}
                onChange={(event) => updatePreferences({ reminderTime: event.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-3xl">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
