import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clock3,
  Layers3,
  Target,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../../store/useStore';
import {
  getAccuracy,
  getAverageScore,
  getDueFlashcards,
  getStudyStreak,
} from '../../utils/appData';

const Dashboard = () => {
  const {
    notes,
    flashcards,
    studySessions,
    addNote,
    setCurrentNote,
    setCurrentView,
  } = useStore();

  const dueFlashcards = getDueFlashcards(flashcards);
  const recentNotes = [...notes]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4);
  const recentSessions = [...studySessions]
    .sort(
      (left, right) =>
        new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime(),
    )
    .slice(0, 4);

  const totalCorrectAnswers = studySessions.reduce(
    (total, session) => total + (session.correctAnswers || 0),
    0,
  );
  const totalAnswers = studySessions.reduce(
    (total, session) => total + session.flashcards.length,
    0,
  );
  const studyAccuracy = getAccuracy(totalCorrectAnswers, totalAnswers);
  const quizAverage = getAverageScore(studySessions, 'quiz');
  const studyStreak = getStudyStreak(studySessions);
  const linkedNotes = new Set(
    flashcards.map((flashcard) => flashcard.noteId).filter(Boolean),
  ).size;
  const noteCoverage = notes.length ? Math.round((linkedNotes / notes.length) * 100) : 0;

  const handleCreateNote = () => {
    const newNote = addNote({
      title: 'Untitled Note',
      content: '',
      tags: [],
    });

    setCurrentNote(newNote);
    setCurrentView('notes');
  };

  const stats = [
    {
      label: 'Notes',
      value: notes.length,
      detail: `${linkedNotes} linked to flashcards`,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Due Review',
      value: dueFlashcards.length,
      detail: dueFlashcards.length === 0 ? 'You are caught up' : 'Ready to study now',
      icon: Brain,
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Study Accuracy',
      value: `${studyAccuracy}%`,
      detail: `${studyStreak} day study streak`,
      icon: Target,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Quiz Average',
      value: `${quizAverage}%`,
      detail: `${noteCoverage}% note coverage`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 p-8 text-white shadow-xl shadow-blue-500/15">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-blue-100 text-sm uppercase tracking-[0.2em]">Study cockpit</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-3">
              Keep notes, cards, and review sessions moving together.
            </h1>
            <p className="text-blue-100 text-lg mt-3 max-w-xl">
              {dueFlashcards.length > 0
                ? `You have ${dueFlashcards.length} flashcard${dueFlashcards.length === 1 ? '' : 's'} ready for review, plus ${recentNotes.length} recently touched note${recentNotes.length === 1 ? '' : 's'}.`
                : 'Your review queue is clear, so this is a good time to capture a new note or run a quiz.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentView(dueFlashcards.length > 0 ? 'flashcards' : 'quiz')}
              className="px-5 py-3 bg-white text-blue-700 rounded-2xl font-medium hover:bg-blue-50 transition-colors"
            >
              {dueFlashcards.length > 0 ? 'Review due cards' : 'Start a quiz'}
            </button>
            <button
              onClick={handleCreateNote}
              className="px-5 py-3 bg-white/15 hover:bg-white/20 rounded-2xl font-medium transition-colors border border-white/20"
            >
              Capture a note
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color} text-white shadow-lg`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Notes</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Jump back into the notes you touched most recently.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('notes')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Open notes
            </button>
          </div>

          <div className="p-6">
            {recentNotes.length > 0 ? (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setCurrentNote(note);
                      setCurrentView('notes');
                    }}
                    className="w-full flex items-start justify-between gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {note.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {note.content || 'Empty note ready for your next study session.'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{note.wordCount} words</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No notes yet. Start with your first capture.
                </p>
                <button
                  onClick={handleCreateNote}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  Create note
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Queue</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The next cards that need attention.
              </p>
            </div>

            <div className="p-6">
              {dueFlashcards.length > 0 ? (
                <div className="space-y-3">
                  {dueFlashcards.slice(0, 4).map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setCurrentView('flashcards')}
                      className="w-full p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-left hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {card.question}
                          </p>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
                            Due now • {card.difficulty}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-orange-500 shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-700/60 p-5">
                  <p className="font-medium text-gray-900 dark:text-white">Nothing overdue</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your study queue is clear right now.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Session Activity
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recent study and quiz sessions.
              </p>
            </div>

            <div className="p-6">
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/60"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                          {session.mode === 'quiz' ? (
                            <Target className="w-5 h-5" />
                          ) : (
                            <Layers3 className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {session.mode === 'quiz' ? 'Quiz session' : 'Study session'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {session.correctAnswers} correct out of {session.flashcards.length}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {session.score}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center space-x-1">
                          <Clock3 className="w-3 h-3" />
                          <span>
                            {Math.max(1, Math.round(session.duration / 1000 / 60))} min
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-700/60 p-5">
                  <p className="font-medium text-gray-900 dark:text-white">No sessions yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Once you study or take a quiz, progress will show up here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
