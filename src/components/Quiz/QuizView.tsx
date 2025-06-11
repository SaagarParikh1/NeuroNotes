import React, { useState } from 'react';
import { Target, Play, Settings, Trophy, Clock, Brain } from 'lucide-react';
import { useStore } from '../../store/useStore';
import QuizSession from './QuizSession';

const QuizView = () => {
  const [showQuizSetup, setShowQuizSetup] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    questionCount: 10,
    difficulty: 'mixed' as 'easy' | 'medium' | 'hard' | 'mixed',
    timeLimit: 300, // 5 minutes
    showHints: true,
  });

  const { flashcards, notes, studySessions } = useStore();

  const recentScores = studySessions
    .slice(-5)
    .map(session => session.score)
    .reverse();

  const averageScore = recentScores.length > 0 
    ? Math.round(recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length)
    : 0;

  const startQuiz = () => {
    if (flashcards.length === 0) {
      alert('You need to create some flashcards first!');
      return;
    }
    setIsQuizActive(true);
  };

  if (isQuizActive) {
    return (
      <QuizSession
        settings={quizSettings}
        onComplete={() => setIsQuizActive(false)}
        onClose={() => setIsQuizActive(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Target className="w-8 h-8 mr-3" />
              Quiz Mode
            </h1>
            <p className="text-green-100 text-lg">
              Test your knowledge and track your progress
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Brain className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Questions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{flashcards.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quiz Sessions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{studySessions.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500">
              <Play className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{averageScore}%</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Notes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{notes.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-500">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Start */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Play className="w-5 h-5 mr-2 text-green-600" />
            Quick Start
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Quick Quiz</h4>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                10 random questions, 5 minutes, mixed difficulty
              </p>
              <button
                onClick={startQuiz}
                disabled={flashcards.length === 0}
                className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                Start Quick Quiz
              </button>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Custom Quiz</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Customize question count, difficulty, and time limit
              </p>
              <button
                onClick={() => setShowQuizSetup(true)}
                disabled={flashcards.length === 0}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                Customize Quiz
              </button>
            </div>
            
            {flashcards.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Create some flashcards first to start quizzing yourself!
              </p>
            )}
          </div>
        </div>

        {/* Recent Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Recent Performance
          </h3>
          
          {recentScores.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Score</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{averageScore}%</span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Last 5 Quiz Scores
                </h4>
                <div className="space-y-2">
                  {recentScores.map((score, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Quiz #{recentScores.length - index}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              score >= 80 ? 'bg-green-500' : 
                              score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                          {score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No quiz history yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Take your first quiz to see your performance!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Setup Modal */}
      {showQuizSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
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
                  onChange={(e) => setQuizSettings({...quizSettings, questionCount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setQuizSettings({...quizSettings, difficulty: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setQuizSettings({...quizSettings, timeLimit: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={180}>3 Minutes</option>
                  <option value={300}>5 Minutes</option>
                  <option value={600}>10 Minutes</option>
                  <option value={900}>15 Minutes</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showHints"
                  checked={quizSettings.showHints}
                  onChange={(e) => setQuizSettings({...quizSettings, showHints: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showHints" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show hints for difficult questions
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowQuizSetup(false)}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowQuizSetup(false);
                  startQuiz();
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;