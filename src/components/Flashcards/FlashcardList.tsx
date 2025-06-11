import React, { useState } from 'react';
import { RotateCcw, Clock, Star, BookOpen, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Flashcard } from '../../types';
import { format, isAfter } from 'date-fns';

interface FlashcardListProps {
  flashcards: Flashcard[];
}

const FlashcardList = ({ flashcards }: FlashcardListProps) => {
  const { notes, deleteFlashcard } = useStore();
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardId)) {
      newFlipped.delete(cardId);
    } else {
      newFlipped.add(cardId);
    }
    setFlippedCards(newFlipped);
  };

  const getNoteName = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    return note?.title || 'Unknown Note';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No flashcards yet</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
          Create your first flashcards to start studying more effectively. You can generate them from your notes or create them manually.
        </p>
        <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          <BookOpen className="w-5 h-5" />
          <span>Create Flashcards</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcards.map((card) => {
          const isFlipped = flippedCards.has(card.id);
          const isDue = isAfter(new Date(), new Date(card.nextReview));

          return (
            <div
              key={card.id}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all duration-300 cursor-pointer group ${
                isDue 
                  ? 'border-orange-300 dark:border-orange-600 shadow-orange-100 dark:shadow-orange-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
              }`}
              onClick={() => toggleCard(card.id)}
            >
              {/* Due indicator */}
              {isDue && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(card.difficulty)}`}>
                      {card.difficulty}
                    </span>
                    {isDue && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 text-xs font-medium rounded-full">
                        Due
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    <div className="p-1">
                      {isFlipped ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="min-h-[120px] flex items-center justify-center mb-4">
                  <div className={`transform transition-all duration-500 w-full ${isFlipped ? 'rotateY-180' : ''}`}>
                    {!isFlipped ? (
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Question</h3>
                        <p className="text-gray-700 dark:text-gray-300">{card.question}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">Answer</h3>
                        <p className="text-gray-700 dark:text-gray-300">{card.answer}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <RotateCcw className="w-3 h-3" />
                        <span>{card.reviewCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>{card.correctCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(card.nextReview), 'MMM d')}</span>
                    </div>
                  </div>
                  
                  {card.noteId && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400">
                      <BookOpen className="w-3 h-3" />
                      <span>From: {getNoteName(card.noteId)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlashcardList;