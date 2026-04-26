import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppImportData,
  AppState,
  Flashcard,
  Folder,
  Note,
  StudySession,
} from '../types';
import {
  calculateWordCount,
  DEFAULT_FOLDER_COLORS,
  DEFAULT_FOLDERS,
  DEFAULT_PREFERENCES,
  normalizeFolders,
  sanitizeTags,
} from '../utils/appData';

const createId = () => globalThis.crypto?.randomUUID?.() ?? Date.now().toString();

const cloneDefaultFolders = () => DEFAULT_FOLDERS.map((folder) => ({ ...folder }));

const createBaseState = () => ({
  notes: [] as Note[],
  folders: cloneDefaultFolders(),
  currentNote: null as Note | null,
  searchQuery: '',
  selectedFolder: null as string | null,
  selectedTags: [] as string[],
  flashcards: [] as Flashcard[],
  studySessions: [] as StudySession[],
  sidebarOpen: true,
  currentView: 'dashboard' as AppState['currentView'],
  theme: 'light' as AppState['theme'],
  preferences: { ...DEFAULT_PREFERENCES },
  isLoading: false,
});

const hydrateNote = (note: Note): Note => ({
  ...note,
  title: note.title || 'Untitled Note',
  tags: sanitizeTags(note.tags || []),
  wordCount:
    typeof note.wordCount === 'number' ? note.wordCount : calculateWordCount(note.content || ''),
});

const hydrateFlashcard = (flashcard: Flashcard): Flashcard => ({
  ...flashcard,
  difficulty: flashcard.difficulty || 'medium',
  reviewCount: flashcard.reviewCount ?? 0,
  correctCount: flashcard.correctCount ?? 0,
  nextReview: flashcard.nextReview || new Date(),
  createdAt: flashcard.createdAt || new Date(),
});

const hydrateStudySession = (session: StudySession): StudySession => ({
  ...session,
  mode: session.mode || 'study',
  correctAnswers:
    typeof session.correctAnswers === 'number'
      ? session.correctAnswers
      : Math.round(((session.score || 0) / 100) * session.flashcards.length),
});

const buildImportedNotes = (notes?: Note[]) =>
  Array.isArray(notes) ? notes.map(hydrateNote) : [];

const buildImportedFolders = (folders: Folder[] | undefined, notes: Note[]) =>
  normalizeFolders(
    Array.isArray(folders) && folders.length > 0 ? folders : cloneDefaultFolders(),
    notes,
  );

const buildImportedFlashcards = (flashcards?: Flashcard[]) =>
  Array.isArray(flashcards) ? flashcards.map(hydrateFlashcard) : [];

const buildImportedSessions = (studySessions?: StudySession[]) =>
  Array.isArray(studySessions) ? studySessions.map(hydrateStudySession) : [];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createBaseState(),

      // UI actions
      setCurrentView: (view) => set({ currentView: view }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...updates,
          },
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFolder: (folderId) => set({ selectedFolder: folderId }),
      setSelectedTags: (tags) => set({ selectedTags: sanitizeTags(tags) }),
      toggleTagFilter: (tag) =>
        set((state) => ({
          selectedTags: state.selectedTags.includes(tag)
            ? state.selectedTags.filter((selectedTag) => selectedTag !== tag)
            : [...state.selectedTags, tag],
        })),
      resetFilters: () =>
        set({
          searchQuery: '',
          selectedFolder: null,
          selectedTags: [],
        }),

      // Note actions
      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: createId(),
          title: noteData.title?.trim() || 'Untitled Note',
          tags: sanitizeTags(noteData.tags || []),
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: calculateWordCount(noteData.content || ''),
        };

        set((state) => {
          const notes = [...state.notes, newNote];
          return {
            notes,
            folders: normalizeFolders(state.folders, notes),
          };
        });

        return newNote;
      },

      updateNote: (id, updates) => {
        set((state) => {
          let updatedCurrentNote = state.currentNote;

          const notes = state.notes.map((note) => {
            if (note.id !== id) {
              return note;
            }

            const updatedNote: Note = {
              ...note,
              ...updates,
              title:
                updates.title !== undefined
                  ? updates.title.trim() || 'Untitled Note'
                  : note.title,
              tags: updates.tags ? sanitizeTags(updates.tags) : note.tags,
              updatedAt: new Date(),
              wordCount:
                updates.content !== undefined
                  ? calculateWordCount(updates.content)
                  : note.wordCount,
            };

            if (updatedCurrentNote?.id === id) {
              updatedCurrentNote = updatedNote;
            }

            return updatedNote;
          });

          return {
            notes,
            currentNote: updatedCurrentNote,
            folders: normalizeFolders(state.folders, notes),
          };
        });
      },

      deleteNote: (id) => {
        set((state) => {
          const notes = state.notes.filter((note) => note.id !== id);

          return {
            notes,
            flashcards: state.flashcards.filter((card) => card.noteId !== id),
            folders: normalizeFolders(state.folders, notes),
            currentNote: state.currentNote?.id === id ? null : state.currentNote,
          };
        });
      },

      setCurrentNote: (note) => set({ currentNote: note }),

      // Folder actions
      addFolder: (folderData) => {
        const newFolder: Folder = {
          ...folderData,
          id: createId(),
          color:
            folderData.color ||
            DEFAULT_FOLDER_COLORS[get().folders.length % DEFAULT_FOLDER_COLORS.length],
          createdAt: new Date(),
          noteCount: 0,
        };

        set((state) => ({
          folders: [...state.folders, newFolder],
        }));
      },

      updateFolder: (id, updates) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, ...updates } : folder,
          ),
        }));
      },

      deleteFolder: (id) => {
        set((state) => {
          const notes = state.notes.map((note) =>
            note.folderId === id ? { ...note, folderId: undefined } : note,
          );

          return {
            folders: state.folders.filter((folder) => folder.id !== id),
            notes,
            currentNote:
              state.currentNote?.folderId === id
                ? { ...state.currentNote, folderId: undefined }
                : state.currentNote,
            selectedFolder: state.selectedFolder === id ? null : state.selectedFolder,
          };
        });
      },

      // Flashcard actions
      addFlashcard: (flashcardData) => {
        const newFlashcard: Flashcard = {
          ...flashcardData,
          id: createId(),
          createdAt: new Date(),
          nextReview: new Date(),
          reviewCount: 0,
          correctCount: 0,
        };

        set((state) => ({
          flashcards: [...state.flashcards, newFlashcard],
        }));

        return newFlashcard;
      },

      updateFlashcard: (id, updates) => {
        set((state) => ({
          flashcards: state.flashcards.map((card) =>
            card.id === id ? { ...card, ...updates } : card,
          ),
        }));
      },

      deleteFlashcard: (id) => {
        set((state) => ({
          flashcards: state.flashcards.filter((card) => card.id !== id),
        }));
      },

      // Study session actions
      addStudySession: (sessionData) => {
        const newSession: StudySession = {
          ...sessionData,
          id: createId(),
          completedAt: new Date(),
          mode: sessionData.mode || 'study',
        };

        set((state) => ({
          studySessions: [...state.studySessions, newSession],
        }));

        return newSession;
      },

      // Data actions
      importData: (data: AppImportData) => {
        const notes = buildImportedNotes(data.notes);
        const folders = buildImportedFolders(data.folders, notes);
        const flashcards = buildImportedFlashcards(data.flashcards);
        const studySessions = buildImportedSessions(data.studySessions);

        set((state) => ({
          notes,
          folders,
          flashcards,
          studySessions,
          currentNote: null,
          searchQuery: '',
          selectedFolder: null,
          selectedTags: [],
          currentView: 'dashboard',
          theme: data.theme || state.theme,
          preferences: {
            ...state.preferences,
            ...(data.preferences || {}),
          },
        }));
      },

      clearAllData: () => {
        localStorage.removeItem('neuronotes-storage');
        set(createBaseState());
      },
    }),
    {
      name: 'neuronotes-storage',
      version: 2,
      merge: (persistedState, currentState) => {
        const state = (persistedState as Partial<AppState>) || {};
        const notes = buildImportedNotes(state.notes);
        const folders = buildImportedFolders(state.folders, notes);
        const flashcards = buildImportedFlashcards(state.flashcards);
        const studySessions = buildImportedSessions(state.studySessions);

        return {
          ...currentState,
          ...state,
          notes,
          folders,
          flashcards,
          studySessions,
          currentNote: null,
          preferences: {
            ...DEFAULT_PREFERENCES,
            ...(state.preferences || {}),
          },
          selectedTags: Array.isArray(state.selectedTags) ? state.selectedTags : [],
          selectedFolder: state.selectedFolder || null,
          searchQuery: state.searchQuery || '',
          currentView: state.currentView || 'dashboard',
          theme: state.theme || 'light',
        };
      },
    },
  ),
);
