import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, Flag, Lightbulb, Trophy, XCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Flashcard } from '../../types';

interface QuizSettings {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  timeLimit: number;
  showHints: boolean;
}

interface QuizSessionProps {
  settings: QuizSettings;
  onComplete: () => void;
  onClose: () => void;
}

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const buildHint = (question: Flashcard, noteTitle?: string) => {
  if (noteTitle) {
    return `Linked note: ${noteTitle}`;
  }

  const trimmedAnswer = question.answer.trim();
  if (!trimmedAnswer) {
    return undefined;
  }

  return trimmedAnswer.length <= 24
    ? `Answer length: ${trimmedAnswer.length} characters`
    : `Answer starts with "${trimmedAnswer.charAt(0).toUpperCase()}".`;
};

const buildQuizQuestions = (
  flashcards: Flashcard[],
  notes: Array<{ id: string; title: string }>,
  settings: QuizSettings,
) => {
  let availableCards = [...flashcards];

  if (settings.difficulty !== 'mixed') {
    availableCards = availableCards.filter((card) => card.difficulty === settings.difficulty);
  }

  const selectedCards = shuffle(availableCards).slice(
    0,
    Math.min(settings.questionCount, availableCards.length),
  );

  return selectedCards.map((card) => {
    const otherAnswers = Array.from(
      new Set(
        flashcards
          .filter((candidate) => candidate.id !== card.id)
          .map((candidate) => candidate.answer)
          .filter(Boolean),
      ),
    ).slice(0, 3);

    const options = shuffle(Array.from(new Set([card.answer, ...otherAnswers])));
    const linkedNote = notes.find((note) => note.id === card.noteId);

    return {
      ...card,
      options,
      hint: settings.showHints ? buildHint(card, linkedNote?.title) : undefined,
    };
  });
};

const QuizSession = ({ settings, onComplete, onClose }: QuizSessionProps) => {
  const { flashcards, notes, addStudySession } = useStore();
  const [quizQuestions] = useState(() => buildQuizQuestions(flashcards, notes, settings));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(settings.timeLimit);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [completedDuration, setCompletedDuration] = useState(0);

  const handleQuizComplete = () => {
    if (quizComplete || quizQuestions.length === 0) {
      return;
    }

    const correctAnswers = quizQuestions.filter(
      (question, index) => selectedAnswers[index] === question.answer,
    ).length;
    const score = Math.round((correctAnswers / quizQuestions.length) * 100);
    const duration = Date.now() - quizStartTime;

    addStudySession({
      flashcards: quizQuestions.map((question) => question.id),
      score,
      duration,
      correctAnswers,
      mode: 'quiz',
    });

    setCompletedDuration(duration);
    setQuizComplete(true);
  };

  useEffect(() => {
    if (quizComplete) {
      return;
    }

    if (timeRemaining === 0) {
      const correctAnswers = quizQuestions.filter(
        (question, index) => selectedAnswers[index] === question.answer,
      ).length;
      const score = Math.round((correctAnswers / quizQuestions.length) * 100);
      const duration = Date.now() - quizStartTime;

      addStudySession({
        flashcards: quizQuestions.map((question) => question.id),
        score,
        duration,
        correctAnswers,
        mode: 'quiz',
      });

      setCompletedDuration(duration);
      setQuizComplete(true);
      return;
    }

    const timer = window.setTimeout(() => setTimeRemaining((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [addStudySession, quizComplete, quizQuestions, quizStartTime, selectedAnswers, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers((current) => ({
      ...current,
      [currentQuestionIndex]: answer,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return;
    }

    handleQuizComplete();
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];

  if (quizQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Questions Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            There are no flashcards matching your selected difficulty level.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Back to quiz setup
          </button>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const correctAnswers = quizQuestions.filter(
      (question, index) => selectedAnswers[index] === question.answer,
    ).length;
    const score = Math.round((correctAnswers / quizQuestions.length) * 100);
    const durationInMinutes = Math.max(1, Math.round(completedDuration / 1000 / 60));

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center max-w-2xl">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          >
            <Trophy className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Quiz Complete
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{score}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">
                  {quizQuestions.length - correctAnswers}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Incorrect</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">{durationInMinutes}m</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 max-h-72 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review</h3>
            <div className="space-y-3 text-left">
              {quizQuestions.map((question, index) => {
                const isCorrect = selectedAnswers[index] === question.answer;

                return (
                  <div
                    key={question.id}
                    className={`p-3 rounded-xl ${
                      isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          Q{index + 1}: {question.question}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Your answer: {selectedAnswers[index] || 'No answer'}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            Correct: {question.answer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onComplete}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz in Progress</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-red-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
            <button
              onClick={handleQuizComplete}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
            >
              <Flag className="w-4 h-4" />
              <span>Finish</span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    currentQuestion.difficulty === 'easy'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                      : currentQuestion.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Object.keys(selectedAnswers).length} answered
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {currentQuestion.question}
              </h3>

              {currentQuestion.hint && currentQuestion.difficulty !== 'easy' && (
                <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 mb-6">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm">{currentQuestion.hint}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${
                    selectedAnswers[currentQuestionIndex] === option
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuestionIndex] === option
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selectedAnswers[currentQuestionIndex] === option && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-900 dark:text-white">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={nextQuestion}
                disabled={!selectedAnswers[currentQuestionIndex]}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl disabled:cursor-not-allowed transition-colors"
              >
                {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSession;
