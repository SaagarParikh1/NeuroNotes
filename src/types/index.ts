export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';
export type AppView = 'dashboard' | 'notes' | 'flashcards' | 'quiz' | 'settings';
export type ThemeMode = 'light' | 'dark';
export type StudySessionMode = 'study' | 'quiz';
export type FontSize = 'small' | 'medium' | 'large';
export type EditorFont = 'system' | 'mono' | 'serif';

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
  noteId?: string;
  difficulty: FlashcardDifficulty;
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
  correctAnswers: number;
  mode: StudySessionMode;
}

export interface AppPreferences {
  autoSaveNotes: boolean;
  smartFlashcardGeneration: boolean;
  studyReminders: boolean;
  flashcardReviewAlerts: boolean;
  achievementNotifications: boolean;
  analyticsOptIn: boolean;
  reminderTime: string;
  fontSize: FontSize;
  editorFont: EditorFont;
}

export interface AppImportData {
  notes?: Note[];
  folders?: Folder[];
  flashcards?: Flashcard[];
  studySessions?: StudySession[];
  preferences?: Partial<AppPreferences>;
  theme?: ThemeMode;
  exportDate?: string;
  version?: string;
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
  currentView: AppView;
  theme: ThemeMode;
  preferences: AppPreferences;
  isLoading: boolean;
  
  // Actions
  setCurrentView: (view: AppView) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  updatePreferences: (updates: Partial<AppPreferences>) => void;
  setSearchQuery: (query: string) => void;
  setSelectedFolder: (folderId: string | null) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTagFilter: (tag: string) => void;
  resetFilters: () => void;
  
  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;
  
  // Folder actions
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'noteCount'>) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  
  // Flashcard actions
  addFlashcard: (flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'nextReview' | 'reviewCount' | 'correctCount'>) => Flashcard;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  
  // Study session actions
  addStudySession: (session: Omit<StudySession, 'id' | 'completedAt'>) => StudySession;

  // Data actions
  importData: (data: AppImportData) => void;
  clearAllData: () => void;
}
