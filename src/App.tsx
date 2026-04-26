import React, { Suspense, lazy, useEffect } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { useStore } from './store/useStore';

const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const NotesView = lazy(() => import('./components/Notes/NotesView'));
const FlashcardsView = lazy(() => import('./components/Flashcards/FlashcardsView'));
const QuizView = lazy(() => import('./components/Quiz/QuizView'));
const SettingsView = lazy(() => import('./components/Settings/SettingsView'));

function App() {
  const { currentView, theme } = useStore();

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'notes':
        return <NotesView />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'quiz':
        return <QuizView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <Suspense
            fallback={
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-12 w-56 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className="h-32 rounded-2xl bg-white dark:bg-gray-800 shadow-sm"
                      />
                    ))}
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="h-72 rounded-2xl bg-white dark:bg-gray-800 shadow-sm" />
                    <div className="h-72 rounded-2xl bg-white dark:bg-gray-800 shadow-sm" />
                  </div>
                </div>
              </div>
            }
          >
            {renderCurrentView()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default App;
