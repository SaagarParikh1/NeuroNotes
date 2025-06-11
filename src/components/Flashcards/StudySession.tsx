import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Check, X, Eye, EyeOff, Trophy, Target } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { addDays } from 'date-fns';

interface StudySessionProps {
  onClose: () => void;
}

const StudySession = ({ onClose }: StudySessionProps) => {
  const { flashcards, updateFlashcard, addStudySession } = useStore();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [sessionStartTime] = useState(Date.now());
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Get cards due for review
  const dueCards = flashcards.filter(card => new Date(card.nextReview) <= new Date());
  const studyCards = dueCards.length > 0 ? dueCards : flashcards.slice(0, 10);

  useEffect(() => {
    if (studyCards.length === 0) {
      setIsSessionComplete(true);
    }
  }, [studyCards.length]);

  const currentCard = studyCards[currentCardIndex];

  const handleAnswer = (correct: boolean) => {
    if (!currentCard) return;

    const newStats = {
      ...sessionStats,
      total: sessionStats.total + 1,
      correct: sessionStats.correct + (correct ? 1 : 0),
      incorrect: sessionStats.incorrect + (correct ? 0 : 1),
    };
    setSessionStats(newStats);

    // Update flashcard based on spaced repetition
    const newReviewCount = currentCard.reviewCount + 1;
    const newCorrectCount = currentCard.correctCount + (correct ? 1 : 0);
    
    // Simple spaced repetition algorithm
    let daysToAdd = 1;
    if (correct) {
      switch (currentCard.difficulty) {
        case 'easy':
          daysToAdd = Math.max(1, newCorrectCount * 2);
          break;
        case 'medium':
          daysToAdd = Math.max(1, newCorrectCount * 1.5);
          break;
        case 'hard':
          daysToAdd = Math.max(1, newCorrectCount);
          break;
      }
    }

    updateFlashcard(currentCard.id, {
      reviewCount: newReviewCount,
      correctCount: newCorrectCount,
      nextReview: addDays(new Date(), daysToAdd),
    });

    // Move to next card or complete session
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      completeSession(newStats);
    }
  };

  const completeSession = (finalStats: typeof sessionStats) => {
    const sessionDuration = Date.now() - sessionStartTime;
    const score = finalStats.total > 0 ? Math.round((finalStats.correct / finalStats.total) * 100) : 0;

    addStudySession({
      flashcards: studyCards.map(card => card.id),
      score,
      duration: sessionDuration,
    });

    setIsSessionComplete(true);
  };

  const resetSession = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionStats({ correct: 0, incorrect: 0, total: 0 });
    setIsSessionComplete(false);
  };

  if (studyCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center">
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            All caught up!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You have no flashcards due for review right now. Great job staying on top of your studies!
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Flashcards
          </button>
        </div>
      </div>
    );
  }

  if (isSessionComplete) {
    const score = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000 / 60);

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Session Complete!
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{sessionStats.correct}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Incorrect</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{score}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Session duration: {sessionDuration} minute{sessionDuration !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={resetSession}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Study Again</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Session</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Card {currentCardIndex + 1} of {studyCards.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {sessionStats.correct}/{sessionStats.total}
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / studyCards.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                  currentCard.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                }`}>
                  {currentCard.difficulty}
                </span>
              </div>
              
              <div className="min-h-[200px] flex items-center justify-center">
                {!showAnswer ? (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Question</h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentCard.question}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">Answer</h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentCard.answer}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span>Show Answer</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleAnswer(false)}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                    <span>Incorrect</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    <span>Correct</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySession;