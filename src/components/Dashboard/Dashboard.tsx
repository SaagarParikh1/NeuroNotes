import React from 'react';
import { 
  BookOpen, 
  Brain, 
  Target, 
  TrendingUp,
  Clock,
  Award,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { format, subDays, isAfter } from 'date-fns';

const Dashboard = () => {
  const { notes, flashcards, studySessions } = useStore();

  // Calculate statistics
  const totalNotes = notes.length;
  const totalFlashcards = flashcards.length;
  const totalSessions = studySessions.length;
  const totalWordCount = notes.reduce((sum, note) => sum + note.wordCount, 0);
  
  // Recent activity
  const recentNotes = notes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  const recentSessions = studySessions
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 3);

  // Due flashcards
  const dueFlashcards = flashcards.filter(card => 
    isAfter(new Date(), new Date(card.nextReview))
  );

  const stats = [
    {
      label: 'Total Notes',
      value: totalNotes,
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      label: 'Flashcards',
      value: totalFlashcards,
      icon: Brain,
      color: 'bg-purple-500',
      change: '+8%',
    },
    {
      label: 'Study Sessions',
      value: totalSessions,
      icon: Target,
      color: 'bg-green-500',
      change: '+23%',
    },
    {
      label: 'Words Written',
      value: totalWordCount.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+15%',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back to NeuroNotes!</h1>
            <p className="text-blue-100 text-lg">
              Ready to enhance your learning journey? You have {dueFlashcards.length} flashcards due for review.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Brain className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Notes</h3>
              <BookOpen className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {recentNotes.length > 0 ? (
              <div className="space-y-4">
                {recentNotes.map((note) => (
                  <div key={note.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {note.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(note.updatedAt), 'MMM d, HH:mm')} • {note.wordCount} words
                      </p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No notes yet. Create your first note!</p>
              </div>
            )}
          </div>
        </div>

        {/* Study Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Study Progress</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {/* Due Flashcards */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Due for Review</span>
                <span className="text-sm font-bold text-orange-600">{dueFlashcards.length}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((dueFlashcards.length / Math.max(totalFlashcards, 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Sessions</h4>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {session.flashcards.length} cards
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(session.completedAt), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{session.score}%</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{Math.round(session.duration / 60)}m</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No study sessions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Create Note</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start writing</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Study Cards</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Review flashcards</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Take Quiz</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Test knowledge</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;