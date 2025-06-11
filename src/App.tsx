import React, { useEffect } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import NotesView from './components/Notes/NotesView';
import FlashcardsView from './components/Flashcards/FlashcardsView';
import QuizView from './components/Quiz/QuizView';
import SettingsView from './components/Settings/SettingsView';
import { useStore } from './store/useStore';

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
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;