import React, { useState } from 'react';
import { Brain, Plus, Search, Filter, RotateCcw, Target } from 'lucide-react';
import { useStore } from '../../store/useStore';
import FlashcardList from './FlashcardList';
import FlashcardCreator from './FlashcardCreator';
import StudySession from './StudySession';

const FlashcardsView = () => {
  const [currentMode, setCurrentMode] = useState<'list' | 'create' | 'study'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const { flashcards, notes } = useStore();

  const filteredFlashcards = flashcards.filter(card =>
    card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dueForReview = flashcards.filter(card => 
    new Date(card.nextReview) <= new Date()
  );

  if (currentMode === 'create') {
    return <FlashcardCreator onClose={() => setCurrentMode('list')} />;
  }

  if (currentMode === 'study') {
    return <StudySession onClose={() => setCurrentMode('list')} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Brain className="w-7 h-7 mr-3 text-purple-600" />
              Flashcards
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {flashcards.length} total cards • {dueForReview.length} due for review
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentMode('study')}
              disabled={dueForReview.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <Target className="w-4 h-4" />
              <span>Study Now ({dueForReview.length})</span>
            </button>
            <button
              onClick={() => setCurrentMode('create')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Cards</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Cards</p>
                <p className="text-2xl font-bold">{flashcards.length}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Due Today</p>
                <p className="text-2xl font-bold">{dueForReview.length}</p>
              </div>
              <RotateCcw className="w-8 h-8 text-orange-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Mastered</p>
                <p className="text-2xl font-bold">
                  {flashcards.filter(card => card.correctCount >= 3).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">From Notes</p>
                <p className="text-2xl font-bold">
                  {flashcards.filter(card => card.noteId).length}
                </p>
              </div>
              <Plus className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search flashcards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <FlashcardList flashcards={filteredFlashcards} />
      </div>
    </div>
  );
};

export default FlashcardsView;