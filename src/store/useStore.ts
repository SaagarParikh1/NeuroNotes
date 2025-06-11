import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Note, Folder, Flashcard, StudySession } from '../types';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      notes: [],
      folders: [
        {
          id: '1',
          name: 'Personal',
          color: 'bg-blue-500',
          noteCount: 0,
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'Work',
          color: 'bg-purple-500',
          noteCount: 0,
          createdAt: new Date(),
        },
        {
          id: '3',
          name: 'Study',
          color: 'bg-green-500',
          noteCount: 0,
          createdAt: new Date(),
        },
      ],
      currentNote: null,
      searchQuery: '',
      selectedFolder: null,
      selectedTags: [],
      flashcards: [],
      studySessions: [],
      sidebarOpen: true,
      currentView: 'dashboard',
      theme: 'light',
      isLoading: false,

      // UI Actions
      setCurrentView: (view) => set({ currentView: view }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFolder: (folderId) => set({ selectedFolder: folderId }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),

      // Note Actions
      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          wordCount: noteData.content.split(/\s+/).length,
        };
        
        set((state) => ({
          notes: [...state.notes, newNote],
          folders: state.folders.map(folder => 
            folder.id === noteData.folderId 
              ? { ...folder, noteCount: folder.noteCount + 1 }
              : folder
          )
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map(note => 
            note.id === id 
              ? { 
                  ...note, 
                  ...updates, 
                  updatedAt: new Date(),
                  wordCount: updates.content ? updates.content.split(/\s+/).length : note.wordCount
                }
              : note
          )
        }));
      },

      deleteNote: (id) => {
        const note = get().notes.find(n => n.id === id);
        set((state) => ({
          notes: state.notes.filter(n => n.id !== id),
          flashcards: state.flashcards.filter(f => f.noteId !== id),
          folders: note?.folderId ? state.folders.map(folder => 
            folder.id === note.folderId 
              ? { ...folder, noteCount: Math.max(0, folder.noteCount - 1) }
              : folder
          ) : state.folders,
          currentNote: state.currentNote?.id === id ? null : state.currentNote
        }));
      },

      setCurrentNote: (note) => set({ currentNote: note }),

      // Folder Actions
      addFolder: (folderData) => {
        const newFolder: Folder = {
          ...folderData,
          id: Date.now().toString(),
          createdAt: new Date(),
          noteCount: 0,
        };
        set((state) => ({ folders: [...state.folders, newFolder] }));
      },

      updateFolder: (id, updates) => {
        set((state) => ({
          folders: state.folders.map(folder => 
            folder.id === id ? { ...folder, ...updates } : folder
          )
        }));
      },

      deleteFolder: (id) => {
        set((state) => ({
          folders: state.folders.filter(f => f.id !== id),
          notes: state.notes.map(note => 
            note.folderId === id ? { ...note, folderId: undefined } : note
          ),
          selectedFolder: state.selectedFolder === id ? null : state.selectedFolder
        }));
      },

      // Flashcard Actions
      addFlashcard: (flashcardData) => {
        const newFlashcard: Flashcard = {
          ...flashcardData,
          id: Date.now().toString(),
          createdAt: new Date(),
          nextReview: new Date(),
          reviewCount: 0,
          correctCount: 0,
        };
        set((state) => ({ flashcards: [...state.flashcards, newFlashcard] }));
      },

      updateFlashcard: (id, updates) => {
        set((state) => ({
          flashcards: state.flashcards.map(card => 
            card.id === id ? { ...card, ...updates } : card
          )
        }));
      },

      deleteFlashcard: (id) => {
        set((state) => ({
          flashcards: state.flashcards.filter(f => f.id !== id)
        }));
      },

      // Study Session Actions
      addStudySession: (sessionData) => {
        const newSession: StudySession = {
          ...sessionData,
          id: Date.now().toString(),
          completedAt: new Date(),
        };
        set((state) => ({ studySessions: [...state.studySessions, newSession] }));
      },
    }),
    {
      name: 'neuronotes-storage',
    }
  )
);