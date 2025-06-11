import React, { useState } from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Plus, 
  Download, 
  Sparkles,
  Bell 
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { aiService } from '../../services/aiService';
import ApiKeyModal from '../AI/ApiKeyModal';
import SummaryModal from '../AI/SummaryModal';
import { SummaryResult } from '../../services/aiService';

const Header = () => {
  const { 
    toggleSidebar, 
    theme, 
    toggleTheme, 
    currentView,
    setCurrentView,
    addNote,
    selectedFolder,
    currentNote
  } = useStore();

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const handleNewNote = () => {
    const newNote = {
      title: 'Untitled Note',
      content: '',
      tags: [],
      folderId: selectedFolder || undefined,
    };
    addNote(newNote);
    setCurrentView('notes');
  };

  const handleAISummarize = async () => {
    // Check if we have an API key
    if (!aiService.getApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    // Check if we have a current note with content
    if (!currentNote || !currentNote.content.trim()) {
      alert('Please open a note with content to summarize.');
      return;
    }

    setIsLoadingSummary(true);
    setShowSummaryModal(true);
    setSummaryResult(null);

    try {
      const result = await aiService.summarizeNote(currentNote.title, currentNote.content);
      setSummaryResult(result);
    } catch (error: any) {
      console.error('Error summarizing note:', error);
      alert(error.message || 'Failed to summarize note. Please try again.');
      setShowSummaryModal(false);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'notes': return 'Notes';
      case 'flashcards': return 'Flashcards';
      case 'quiz': return 'Quiz Mode';
      case 'settings': return 'Settings';
      default: return 'NeuroNotes';
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getViewTitle()}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enhance your learning with AI-powered tools
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* AI Summarize Button */}
            <button 
              onClick={handleAISummarize}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI Summarize</span>
            </button>

            {/* New Note Button */}
            <button
              onClick={handleNewNote}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">New Note</span>
            </button>

            {/* Export Button */}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSuccess={() => {
          setShowApiKeyModal(false);
          // Retry the summarize action
          handleAISummarize();
        }}
      />

      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        summary={summaryResult}
        isLoading={isLoadingSummary}
        noteTitle={currentNote?.title || ''}
      />
    </>
  );
};

export default Header;