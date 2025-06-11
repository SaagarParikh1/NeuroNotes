export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  noteCount: number;
  createdAt: Date;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  noteId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: Date;
  reviewCount: number;
  correctCount: number;
  createdAt: Date;
}

export interface StudySession {
  id: string;
  flashcards: string[];
  score: number;
  duration: number;
  completedAt: Date;
}

export interface AppState {
  // Notes
  notes: Note[];
  folders: Folder[];
  currentNote: Note | null;
  searchQuery: string;
  selectedFolder: string | null;
  selectedTags: string[];
  
  // Flashcards
  flashcards: Flashcard[];
  studySessions: StudySession[];
  
  // UI State
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'notes' | 'flashcards' | 'quiz' | 'settings';
  theme: 'light' | 'dark';
  isLoading: boolean;
  
  // Actions
  setCurrentView: (view: AppState['currentView']) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedFolder: (folderId: string | null) => void;
  setSelectedTags: (tags: string[]) => void;
  
  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;
  
  // Folder actions
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'noteCount'>) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  
  // Flashcard actions
  addFlashcard: (flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'nextReview' | 'reviewCount' | 'correctCount'>) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  
  // Study session actions
  addStudySession: (session: Omit<StudySession, 'id' | 'completedAt'>) => void;
}