import React from 'react';
import { Clock, FileText, Folder, Plus, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../../store/useStore';
import { Note } from '../../types';

interface NotesListProps {
  notes: Note[];
  viewMode: 'list' | 'grid';
  onCreateNote: () => void;
}

const NotesList = ({ notes, viewMode, onCreateNote }: NotesListProps) => {
  const { setCurrentNote, folders } = useStore();

  const getFolderName = (folderId?: string) => {
    if (!folderId) {
      return null;
    }

    const folder = folders.find((item) => item.id === folderId);
    return folder?.name || null;
  };

  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) {
      return content;
    }

    return `${content.slice(0, maxLength)}...`;
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-6">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No notes found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
          Start a fresh note or clear your filters to bring your workspace back into view.
        </p>
        <button
          onClick={onCreateNote}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create note</span>
        </button>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map((note) => {
            const folderName = getFolderName(note.folderId);

            return (
              <button
                key={note.id}
                onClick={() => setCurrentNote(note)}
                className="text-left bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {note.title}
                  </h3>
                  <span className="text-xs text-gray-400 shrink-0">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-4">
                  {note.content ? truncateContent(note.content) : 'Empty note ready for your ideas.'}
                </p>

                <div className="space-y-3">
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{note.wordCount} words</span>
                    {folderName && (
                      <span className="inline-flex items-center space-x-1">
                        <Folder className="w-3 h-3" />
                        <span>{folderName}</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {notes.map((note) => {
          const folderName = getFolderName(note.folderId);

          return (
            <button
              key={note.id}
              onClick={() => setCurrentNote(note)}
              className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {note.title}
                    </h3>
                    {folderName && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full inline-flex items-center space-x-1">
                        <Folder className="w-3 h-3" />
                        <span>{folderName}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {note.content ? truncateContent(note.content, 220) : 'Empty note ready for your ideas.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                      </span>
                    </span>
                    <span>{note.wordCount} words</span>
                  </div>
                </div>

                {note.tags.length > 0 && (
                  <div className="flex items-start space-x-2 lg:max-w-xs">
                    <Tag className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NotesList;
