import React, { useState } from 'react';
import {
  Bell,
  Download,
  Menu,
  Moon,
  Plus,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { aiService, SummaryResult } from '../../services/aiService';
import ApiKeyModal from '../AI/ApiKeyModal';
import SummaryModal from '../AI/SummaryModal';
import {
  createFileName,
  downloadFile,
  exportNoteMarkdown,
  getDueFlashcards,
} from '../../utils/appData';

const Header = () => {
  const {
    toggleSidebar,
    theme,
    toggleTheme,
    currentView,
    setCurrentView,
    addNote,
    setCurrentNote,
    selectedFolder,
    currentNote,
    notes,
    flashcards,
    folders,
    studySessions,
    preferences,
  } = useStore();

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const dueFlashcards = getDueFlashcards(flashcards);
  const quizSessions = studySessions.filter((session) => (session.mode || 'study') === 'quiz');

  const handleNewNote = () => {
    const newNote = addNote({
      title: 'Untitled Note',
      content: '',
      tags: [],
      folderId: selectedFolder || undefined,
    });

    setCurrentNote(newNote);
    setCurrentView('notes');
  };

  const handleExport = () => {
    if (currentNote) {
      downloadFile(
        exportNoteMarkdown(currentNote),
        'text/markdown',
        createFileName(currentNote.title, 'md'),
      );
      return;
    }

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
  };

  const handleAISummarize = async () => {
    if (!aiService.getApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    if (!currentNote || !currentNote.content.trim()) {
      alert('Open a note with some content before running an AI summary.');
      return;
    }

    setIsLoadingSummary(true);
    setShowSummaryModal(true);
    setSummaryResult(null);

    try {
      const result = await aiService.summarizeNote(currentNote.title, currentNote.content);
      setSummaryResult(result);
    } catch (error: unknown) {
      console.error('Error summarizing note:', error);
      alert(error instanceof Error ? error.message : 'Failed to summarize note. Please try again.');
      setShowSummaryModal(false);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard';
      case 'notes':
        return currentNote ? currentNote.title || 'Untitled Note' : 'Notes';
      case 'flashcards':
        return 'Flashcards';
      case 'quiz':
        return 'Quiz Mode';
      case 'settings':
        return 'Settings';
      default:
        return 'NeuroNotes';
    }
  };

  const getViewSubtitle = () => {
    switch (currentView) {
      case 'dashboard':
        return `${notes.length} notes, ${flashcards.length} cards, ${dueFlashcards.length} due today`;
      case 'notes':
        return currentNote
          ? `${currentNote.wordCount} words • ${currentNote.tags.length} tags`
          : `${notes.length} notes in your workspace`;
      case 'flashcards':
        return `${dueFlashcards.length} due for review • ${flashcards.length} total cards`;
      case 'quiz':
        return `${quizSessions.length} quiz session${quizSessions.length === 1 ? '' : 's'} logged`;
      case 'settings':
        return 'Control your workspace, backups, and study preferences';
      default:
        return 'AI-powered study tools';
    }
  };

  return (
    <>
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4 min-w-0">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {getViewTitle()}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {getViewSubtitle()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAISummarize}
              disabled={!currentNote || !currentNote.content.trim()}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-700 text-white rounded-xl transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">AI Summary</span>
            </button>

            <button
              onClick={handleNewNote}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">New Note</span>
            </button>

            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={currentNote ? 'Export note' : 'Export workspace backup'}
            >
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <button
              onClick={() => setCurrentView('flashcards')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
              title="Open due flashcards"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {dueFlashcards.length > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 bg-orange-500 rounded-full text-[10px] font-semibold text-white flex items-center justify-center">
                  {dueFlashcards.length > 9 ? '9+' : dueFlashcards.length}
                </div>
              )}
            </button>

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

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSuccess={() => {
          setShowApiKeyModal(false);
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
