import React, { Suspense, lazy, useState } from 'react';
import { Filter, Grid, List, Plus, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';
import NotesList from './NotesList';

const NoteEditor = lazy(() => import('./NoteEditor'));

const NotesView = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'words'>('updated');
  const {
    notes,
    folders,
    searchQuery,
    setSearchQuery,
    selectedFolder,
    selectedTags,
    currentNote,
    addNote,
    setCurrentNote,
    resetFilters,
  } = useStore();

  const selectedFolderName = folders.find((folder) => folder.id === selectedFolder)?.name;

  const handleNewNote = () => {
    const newNote = addNote({
      title: 'Untitled Note',
      content: '',
      tags: [],
      folderId: selectedFolder || undefined,
    });

    setCurrentNote(newNote);
  };

  const filteredNotes = notes.filter((note) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch === '' ||
      note.title.toLowerCase().includes(normalizedSearch) ||
      note.content.toLowerCase().includes(normalizedSearch) ||
      note.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

    const matchesFolder = selectedFolder === null || note.folderId === selectedFolder;
    const matchesTags =
      selectedTags.length === 0 || selectedTags.every((tag) => note.tags.includes(tag));

    return matchesSearch && matchesFolder && matchesTags;
  });

  const sortedNotes = [...filteredNotes].sort((left, right) => {
    switch (sortBy) {
      case 'created':
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      case 'title':
        return left.title.localeCompare(right.title);
      case 'words':
        return right.wordCount - left.wordCount;
      case 'updated':
      default:
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    }
  });

  if (currentNote) {
    return (
      <Suspense
        fallback={
          <div className="p-6 animate-pulse">
            <div className="h-full rounded-3xl bg-white dark:bg-gray-800 shadow-sm" />
          </div>
        }
      >
        <NoteEditor />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {sortedNotes.length} {sortedNotes.length === 1 ? 'note' : 'notes'}
              {selectedFolderName ? ` in ${selectedFolderName}` : ' across your workspace'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated">Recently updated</option>
              <option value="created">Recently created</option>
              <option value="title">Title</option>
              <option value="words">Word count</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              {viewMode === 'list' ? (
                <Grid className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <List className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            <button
              onClick={() => setShowFilters((current) => !current)}
              className={`p-2.5 rounded-xl transition-colors ${
                showFilters || selectedTags.length > 0 || selectedFolder
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            <button
              onClick={handleNewNote}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        <div className="mt-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search titles, tags, or note content..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {(showFilters || selectedTags.length > 0 || selectedFolder) && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active filters
              </span>

              {selectedFolderName && (
                <span className="px-3 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm rounded-full">
                  Folder: {selectedFolderName}
                </span>
              )}

              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}

              {!selectedFolderName && selectedTags.length === 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">No extra filters</span>
              )}

              <button
                onClick={resetFilters}
                className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Reset filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <NotesList notes={sortedNotes} viewMode={viewMode} onCreateNote={handleNewNote} />
      </div>
    </div>
  );
};

export default NotesView;
