import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Eye,
  EyeOff,
  RotateCcw,
  Star,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../../store/useStore';
import { Flashcard } from '../../types';

interface FlashcardListProps {
  flashcards: Flashcard[];
  onCreateFlashcards: () => void;
}

const FlashcardList = ({ flashcards, onCreateFlashcards }: FlashcardListProps) => {
  const { notes, deleteFlashcard } = useStore();
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    const nextFlippedCards = new Set(flippedCards);

    if (nextFlippedCards.has(cardId)) {
      nextFlippedCards.delete(cardId);
    } else {
      nextFlippedCards.add(cardId);
    }

    setFlippedCards(nextFlippedCards);
  };

  const getNoteName = (noteId?: string) => {
    if (!noteId) {
      return null;
    }

    const note = notes.find((item) => item.id === noteId);
    return note?.title || 'Unknown note';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-6">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No flashcards yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
          Create your first cards manually or generate them from a note to build a study deck.
        </p>
        <button
          onClick={onCreateFlashcards}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          <span>Create flashcards</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcards.map((card) => {
          const isFlipped = flippedCards.has(card.id);
          const isDue = new Date(card.nextReview).getTime() <= Date.now();
          const noteName = getNoteName(card.noteId);
          const accuracy =
            card.reviewCount > 0 ? Math.round((card.correctCount / card.reviewCount) * 100) : 0;

          return (
            <div
              key={card.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border transition-all duration-300 ${
                isDue
                  ? 'border-orange-300 dark:border-orange-600 shadow-orange-100 dark:shadow-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
              }`}
            >
              {isDue && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
              )}

              <button
                onClick={() => toggleCard(card.id)}
                className="w-full p-6 text-left"
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(card.difficulty)}`}
                    >
                      {card.difficulty}
                    </span>
                    {isDue && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 text-xs font-medium rounded-full">
                        Due now
                      </span>
                    )}
                  </div>

                  <div className="p-1 text-gray-400">
                    {isFlipped ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </div>
                </div>

                <div className="min-h-[140px] flex items-center justify-center mb-4">
                  {!isFlipped ? (
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Question
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">{card.question}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                        Answer
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">{card.answer}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center space-x-1">
                        <RotateCcw className="w-3 h-3" />
                        <span>{card.reviewCount}</span>
                      </span>
                      <span className="inline-flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>{accuracy}%</span>
                      </span>
                    </div>
                    <span className="inline-flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(card.nextReview), { addSuffix: true })}
                      </span>
                    </span>
                  </div>

                  {noteName && (
                    <div className="mt-3 text-xs text-purple-600 dark:text-purple-400">
                      From: {noteName}
                    </div>
                  )}
                </div>
              </button>

              <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {isFlipped ? 'Tap card to see question' : 'Tap card to reveal answer'}
                </span>
                <button
                  onClick={() => deleteFlashcard(card.id)}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlashcardList;
