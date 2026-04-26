import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Brain,
  Check,
  CreditCard,
  FolderOpen,
  Hash,
  Plus,
  Search,
  Settings,
  X,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { DEFAULT_FOLDER_COLORS } from '../../utils/appData';

const Sidebar = () => {
  const {
    currentView,
    setCurrentView,
    sidebarOpen,
    folders,
    selectedFolder,
    setSelectedFolder,
    searchQuery,
    setSearchQuery,
    notes,
    selectedTags,
    toggleTagFilter,
    resetFilters,
    addFolder,
  } = useStore();

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState(DEFAULT_FOLDER_COLORS[0]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: CreditCard },
    { id: 'quiz', label: 'Quiz Mode', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const allTags = Array.from(
    notes.reduce((tagCounts, note) => {
      note.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
      return tagCounts;
    }, new Map<string, number>()),
  )
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([tag]) => tag);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || selectedFolder !== null || selectedTags.length > 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setCurrentView('notes');
    }
  };

  const handleCreateFolder = () => {
    if (!folderName.trim()) {
      return;
    }

    addFolder({
      name: folderName.trim(),
      color: folderColor,
    });

    setFolderName('');
    setFolderColor(DEFAULT_FOLDER_COLORS[0]);
    setIsCreatingFolder(false);
  };

  if (!sidebarOpen) {
    return null;
  }

  return (
    <aside className="w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">NeuroNotes</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Study workspace</p>
          </div>
        </div>

        <div className="mt-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes and tags..."
            value={searchQuery}
            onChange={(event) => handleSearch(event.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Clear note filters
          </button>
        )}
      </div>

      <nav className="px-4 py-5 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
            Folders
          </h3>
          <button
            onClick={() => setIsCreatingFolder((current) => !current)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {isCreatingFolder && (
          <div className="mb-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex flex-wrap gap-2 mt-3">
              {DEFAULT_FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setFolderColor(color)}
                  className={`w-6 h-6 rounded-full ${color} ring-offset-2 transition-all ${
                    folderColor === color ? 'ring-2 ring-gray-900 dark:ring-white' : ''
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2 mt-3">
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setFolderName('');
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={handleCreateFolder}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={() => {
              setSelectedFolder(null);
              setCurrentView('notes');
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left transition-colors ${
              selectedFolder === null
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm">All Notes</span>
            <span className="ml-auto text-xs text-gray-400">{notes.length}</span>
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => {
                setSelectedFolder(folder.id);
                setCurrentView('notes');
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`w-4 h-4 rounded ${folder.color}`} />
              <span className="text-sm truncate">{folder.name}</span>
              <span className="ml-auto text-xs text-gray-400">{folder.noteCount}</span>
            </button>
          ))}
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
            Tags
          </h3>

          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 16).map((tag) => {
              const isSelected = selectedTags.includes(tag);

              return (
                <button
                  key={tag}
                  onClick={() => {
                    toggleTagFilter(tag);
                    setCurrentView('notes');
                  }}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Hash className="w-3 h-3" />
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
