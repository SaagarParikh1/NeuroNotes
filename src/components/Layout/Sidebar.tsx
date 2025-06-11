import React from 'react';
import { 
  Brain, 
  BookOpen, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Plus,
  FolderOpen,
  Hash,
  Search
} from 'lucide-react';
import { useStore } from '../../store/useStore';

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
    notes
  } = useStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: CreditCard },
    { id: 'quiz', label: 'Quiz Mode', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  if (!sidebarOpen) return null;

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">NeuroNotes</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI Study Assistant</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Folders */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
            Folders
          </h3>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
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
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`w-4 h-4 rounded ${folder.color}`} />
              <span className="text-sm">{folder.name}</span>
              <span className="ml-auto text-xs text-gray-400">{folder.noteCount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
            Tags
          </h3>
          <div className="space-y-1">
            {allTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                className="w-full flex items-center space-x-2 px-3 py-1 rounded-lg text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Hash className="w-3 h-3" />
                <span className="text-sm">{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;