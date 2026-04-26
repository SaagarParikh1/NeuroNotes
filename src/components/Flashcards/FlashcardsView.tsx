import React, { Suspense, lazy, useState } from 'react';
import { Brain, Plus, Search, Target } from 'lucide-react';
import { useStore } from '../../store/useStore';
import FlashcardList from './FlashcardList';
import { getDueFlashcards } from '../../utils/appData';

const FlashcardCreator = lazy(() => import('./FlashcardCreator'));
const StudySession = lazy(() => import('./StudySession'));

const FlashcardsView = () => {
  const [currentMode, setCurrentMode] = useState<'list' | 'create' | 'study'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'mastered'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>(
    'all',
  );
  const { flashcards } = useStore();

  const dueForReview = getDueFlashcards(flashcards);
  const masteredCount = flashcards.filter((card) => card.correctCount >= 3).length;

  const filteredFlashcards = flashcards.filter((card) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch === '' ||
      card.question.toLowerCase().includes(normalizedSearch) ||
      card.answer.toLowerCase().includes(normalizedSearch);

    const isDue = new Date(card.nextReview).getTime() <= Date.now();
    const isMastered = card.correctCount >= 3;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'due' && isDue) ||
      (statusFilter === 'mastered' && isMastered);

    const matchesDifficulty =
      difficultyFilter === 'all' || card.difficulty === difficultyFilter;

    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  if (currentMode === 'create') {
    return (
      <Suspense fallback={<div className="p-6">Loading flashcard creator...</div>}>
        <FlashcardCreator onClose={() => setCurrentMode('list')} />
      </Suspense>
    );
  }

  if (currentMode === 'study') {
    return (
      <Suspense fallback={<div className="p-6">Loading study session...</div>}>
        <StudySession onClose={() => setCurrentMode('list')} />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Brain className="w-7 h-7 mr-3 text-purple-600" />
              Flashcards
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {flashcards.length} total cards • {dueForReview.length} due for review
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentMode('study')}
              disabled={flashcards.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl transition-colors"
            >
              <Target className="w-4 h-4" />
              <span>{dueForReview.length > 0 ? `Study Due (${dueForReview.length})` : 'Study Deck'}</span>
            </button>

            <button
              onClick={() => setCurrentMode('create')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Cards</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl">
            <p className="text-blue-100 text-sm">Total Cards</p>
            <p className="text-2xl font-bold mt-1">{flashcards.length}</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-2xl">
            <p className="text-orange-100 text-sm">Due Today</p>
            <p className="text-2xl font-bold mt-1">{dueForReview.length}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-2xl">
            <p className="text-purple-100 text-sm">Mastered</p>
            <p className="text-2xl font-bold mt-1">{masteredCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions or answers..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All cards</option>
              <option value="due">Due now</option>
              <option value="mastered">Mastered</option>
            </select>

            <select
              value={difficultyFilter}
              onChange={(event) =>
                setDifficultyFilter(event.target.value as typeof difficultyFilter)
              }
              className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <FlashcardList
          flashcards={filteredFlashcards}
          onCreateFlashcards={() => setCurrentMode('create')}
        />
      </div>
    </div>
  );
};

export default FlashcardsView;
