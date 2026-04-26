import React, { Suspense, lazy, useState } from 'react';
import { Brain, Clock, Play, Settings, Target, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../../store/useStore';
import { getAverageScore, getDueFlashcards } from '../../utils/appData';

const QuizSession = lazy(() => import('./QuizSession'));

const QuizView = () => {
  const [showQuizSetup, setShowQuizSetup] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    questionCount: 10,
    difficulty: 'mixed' as 'easy' | 'medium' | 'hard' | 'mixed',
    timeLimit: 300,
    showHints: true,
  });

  const { flashcards, studySessions } = useStore();

  const quizSessions = [...studySessions]
    .filter((session) => (session.mode || 'study') === 'quiz')
    .sort(
      (left, right) =>
        new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime(),
    );
  const recentScores = quizSessions.slice(0, 5);
  const averageScore = getAverageScore(studySessions, 'quiz');
  const dueFlashcards = getDueFlashcards(flashcards);

  const startQuiz = () => {
    if (flashcards.length === 0) {
      alert('Create some flashcards first so the quiz has questions to use.');
      return;
    }

    setIsQuizActive(true);
  };

  if (isQuizActive) {
    return (
      <Suspense fallback={<div className="p-6">Loading quiz...</div>}>
        <QuizSession
          settings={quizSettings}
          onComplete={() => setIsQuizActive(false)}
          onClose={() => setIsQuizActive(false)}
        />
      </Suspense>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-3xl p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Target className="w-8 h-8 mr-3" />
              Quiz Mode
            </h1>
            <p className="text-green-100 text-lg max-w-2xl">
              Run timed question sets from your flashcard deck and compare the results with your
              study sessions.
            </p>
          </div>

          <button
            onClick={startQuiz}
            disabled={flashcards.length === 0}
            className="px-5 py-3 bg-white text-green-700 rounded-2xl font-medium hover:bg-green-50 disabled:bg-white/40 disabled:text-white/80 transition-colors"
          >
            Start quick quiz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Available Questions
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {flashcards.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quiz Sessions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {quizSessions.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {averageScore}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-green-500">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Cards</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {dueFlashcards.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Play className="w-5 h-5 mr-2 text-green-600" />
            Start a Quiz
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Quick quiz</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                10 random questions, 5 minutes, mixed difficulty.
              </p>
              <button
                onClick={startQuiz}
                disabled={flashcards.length === 0}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl transition-colors"
              >
                Start quick quiz
              </button>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Custom quiz</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Choose your question count, difficulty, time limit, and hints.
              </p>
              <button
                onClick={() => setShowQuizSetup(true)}
                disabled={flashcards.length === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition-colors"
              >
                Customize quiz
              </button>
            </div>

            {flashcards.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Generate a few flashcards first to unlock quiz mode.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Recent Performance
          </h3>

          {recentScores.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average score</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {averageScore}%
                </span>
              </div>

              <div className="space-y-3">
                {recentScores.map((session) => (
                  <div key={session.id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.correctAnswers} correct out of {session.flashcards.length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(session.completedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            session.score >= 80
                              ? 'bg-green-500'
                              : session.score >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${session.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-10 text-right">
                        {session.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No quiz history yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Take your first quiz to start measuring progress.
              </p>
            </div>
          )}
        </div>
      </div>

      {showQuizSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Quiz Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Questions
                </label>
                <select
                  value={quizSettings.questionCount}
                  onChange={(event) =>
                    setQuizSettings({
                      ...quizSettings,
                      questionCount: parseInt(event.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={quizSettings.difficulty}
                  onChange={(event) =>
                    setQuizSettings({
                      ...quizSettings,
                      difficulty: event.target.value as typeof quizSettings.difficulty,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mixed">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Limit
                </label>
                <select
                  value={quizSettings.timeLimit}
                  onChange={(event) =>
                    setQuizSettings({
                      ...quizSettings,
                      timeLimit: parseInt(event.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={180}>3 Minutes</option>
                  <option value={300}>5 Minutes</option>
                  <option value={600}>10 Minutes</option>
                  <option value={900}>15 Minutes</option>
                </select>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={quizSettings.showHints}
                  onChange={(event) =>
                    setQuizSettings({
                      ...quizSettings,
                      showHints: event.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show hints for difficult questions
                </span>
              </label>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowQuizSetup(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowQuizSetup(false);
                  startQuiz();
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                Start quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
