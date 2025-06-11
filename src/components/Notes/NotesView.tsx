import React, { useState } from 'react';
import { Search, Plus, Filter, Grid, List } from 'lucide-react';
import { useStore } from '../../store/useStore';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';

const NotesView = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const { 
    notes, 
    searchQuery, 
    setSearchQuery, 
    selectedFolder, 
    selectedTags,
    currentNote,
    addNote,
    setCurrentView
  } = useStore();

  const handleNewNote = () => {
    const newNote = {
      title: 'Untitled Note',
      content: '',
      tags: [],
      folderId: selectedFolder || undefined,
    };
    addNote(newNote);
  };

  // Filter notes based on search, folder, and tags
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFolder = selectedFolder === null || note.folderId === selectedFolder;
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => note.tags.includes(tag));
    
    return matchesSearch && matchesFolder && matchesTags;
  });

  if (currentNote) {
    return <NoteEditor />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              {selectedFolder && ' in selected folder'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {viewMode === 'list' ? (
                <Grid className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <List className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleNewNote}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes, tags, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
              {selectedTags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                  {tag}
                </span>
              ))}
              {selectedTags.length === 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">No active filters</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-auto">
        <NotesList notes={filteredNotes} viewMode={viewMode} />
      </div>
    </div>
  );
};

export default NotesView;