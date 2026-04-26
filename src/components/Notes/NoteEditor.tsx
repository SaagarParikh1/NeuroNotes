import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Brain,
  Download,
  Edit3,
  Eye,
  Folder,
  Save,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { aiService, SummaryResult } from '../../services/aiService';
import ApiKeyModal from '../AI/ApiKeyModal';
import SummaryModal from '../AI/SummaryModal';
import {
  calculateWordCount,
  createFileName,
  downloadFile,
  exportNoteMarkdown,
} from '../../utils/appData';

type PendingAiAction = 'summary' | 'flashcards' | null;

const MarkdownPreview = lazy(() => import('./MarkdownPreview'));

const editorFontStyles = {
  system:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Monaco, Consolas, monospace',
  serif: 'Iowan Old Style, Georgia, Cambria, serif',
};

const editorSizeClasses = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
};

const NoteEditor = () => {
  const {
    currentNote,
    setCurrentNote,
    updateNote,
    deleteNote,
    folders,
    addFlashcard,
    preferences,
  } = useStore();

  const [title, setTitle] = useState(currentNote?.title || '');
  const [content, setContent] = useState(currentNote?.content || '');
  const [tags, setTags] = useState<string[]>(currentNote?.tags || []);
  const [folderId, setFolderId] = useState(currentNote?.folderId || '');
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingAiAction, setPendingAiAction] = useState<PendingAiAction>(null);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (!currentNote) {
      return;
    }

    setTitle(currentNote.title);
    setContent(currentNote.content);
    setTags(currentNote.tags);
    setFolderId(currentNote.folderId || '');
    setLastSaved(currentNote.updatedAt ? new Date(currentNote.updatedAt) : null);
    setHasUnsavedChanges(false);
  }, [currentNote]);

  useEffect(() => {
    if (!currentNote) {
      return;
    }

    const noteChanged =
      title !== currentNote.title ||
      content !== currentNote.content ||
      folderId !== (currentNote.folderId || '') ||
      tags.join('|') !== currentNote.tags.join('|');

    setHasUnsavedChanges(noteChanged);
  }, [content, currentNote, folderId, tags, title]);

  useEffect(() => {
    if (!currentNote || !preferences.autoSaveNotes || !hasUnsavedChanges) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateNote(currentNote.id, {
        title: title.trim() || 'Untitled Note',
        content,
        tags,
        folderId: folderId || undefined,
      });
      setLastSaved(new Date());
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [
    content,
    currentNote,
    folderId,
    hasUnsavedChanges,
    preferences.autoSaveNotes,
    tags,
    title,
    updateNote,
  ]);

  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleSaveShortcut);
    return () => window.removeEventListener('keydown', handleSaveShortcut);
  });

  const handleSave = () => {
    if (!currentNote) {
      return;
    }

    updateNote(currentNote.id, {
      title: title.trim() || 'Untitled Note',
      content,
      tags,
      folderId: folderId || undefined,
    });

    setLastSaved(new Date());
  };

  const handleBack = () => {
    if (hasUnsavedChanges && !preferences.autoSaveNotes) {
      const shouldLeave = window.confirm(
        'You have unsaved changes. Leave the editor without saving?',
      );

      if (!shouldLeave) {
        return;
      }
    }

    setCurrentNote(null);
  };

  const addTag = () => {
    const sanitizedTag = newTag.trim();

    if (!sanitizedTag || tags.includes(sanitizedTag)) {
      return;
    }

    setTags([...tags, sanitizedTag]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleDelete = () => {
    if (currentNote && window.confirm('Delete this note and its linked flashcards?')) {
      deleteNote(currentNote.id);
      setCurrentNote(null);
    }
  };

  const handleAISummarize = async () => {
    if (!aiService.getApiKey()) {
      setPendingAiAction('summary');
      setShowApiKeyModal(true);
      return;
    }

    if (!content.trim()) {
      alert('Add some note content before generating a summary.');
      return;
    }

    setPendingAiAction(null);
    setIsLoadingSummary(true);
    setShowSummaryModal(true);
    setSummaryResult(null);

    try {
      const result = await aiService.summarizeNote(title || 'Untitled Note', content);
      setSummaryResult(result);
    } catch (error: unknown) {
      console.error('Error summarizing note:', error);
      alert(error instanceof Error ? error.message : 'Failed to summarize note. Please try again.');
      setShowSummaryModal(false);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const generateFlashcards = async () => {
    if (!currentNote || !content.trim()) {
      alert('Add some note content before generating flashcards.');
      return;
    }

    if (!aiService.getApiKey()) {
      setPendingAiAction('flashcards');
      setShowApiKeyModal(true);
      return;
    }

    setPendingAiAction(null);
    setIsGeneratingFlashcards(true);

    try {
      const flashcardSuggestions = await aiService.generateFlashcards(
        title || 'Untitled Note',
        content,
        5,
      );

      flashcardSuggestions.forEach((suggestion) => {
        addFlashcard({
          question: suggestion.question,
          answer: suggestion.answer,
          noteId: currentNote.id,
          difficulty: suggestion.difficulty,
        });
      });

      alert(`Generated ${flashcardSuggestions.length} flashcards from this note.`);
    } catch (error: unknown) {
      console.error('Error generating flashcards:', error);
      alert(
        error instanceof Error ? error.message : 'Failed to generate flashcards. Please try again.',
      );
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const exportDraft = () => {
    if (!currentNote) {
      return;
    }

    downloadFile(
      exportNoteMarkdown({
        ...currentNote,
        title: title.trim() || 'Untitled Note',
        content,
        tags,
        folderId: folderId || undefined,
        updatedAt: lastSaved || currentNote.updatedAt,
        wordCount: calculateWordCount(content),
      }),
      'text/markdown',
      createFileName(title || 'note', 'md'),
    );
  };

  if (!currentNote) {
    return null;
  }

  const currentWordCount = calculateWordCount(content);
  const saveStatus = hasUnsavedChanges
    ? preferences.autoSaveNotes
      ? 'Saving changes...'
      : 'Unsaved changes'
    : lastSaved
      ? `Saved ${lastSaved.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}`
      : 'Ready';

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {title || 'Untitled Note'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{saveStatus}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAISummarize}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-colors text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Summary</span>
              </button>

              <button
                onClick={generateFlashcards}
                disabled={isGeneratingFlashcards}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl transition-colors text-sm"
              >
                <Brain className="w-4 h-4" />
                <span>{isGeneratingFlashcards ? 'Generating...' : 'Generate Cards'}</span>
              </button>

              <button
                onClick={exportDraft}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Export markdown"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              <button
                onClick={() => setIsPreview((current) => !current)}
                className={`p-2 rounded-lg transition-colors ${
                  isPreview
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>

              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter note title..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Folder className="w-4 h-4 inline mr-2" />
                  Folder
                </label>
                <select
                  value={folderId}
                  onChange={(event) => setFolderId(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Tags
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(event) => setNewTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => removeTag(tag)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-700 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Draft stats
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Words</p>
                      <p className="font-semibold">{currentWordCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Characters</p>
                      <p className="font-semibold">{content.length}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>Created: {new Date(currentNote.createdAt).toLocaleDateString()}</div>
                  <div>
                    Updated:{' '}
                    {new Date(lastSaved || currentNote.updatedAt).toLocaleDateString()}
                  </div>
                  <div>Auto-save: {preferences.autoSaveNotes ? 'On' : 'Off'}</div>
                  <div>Markdown preview: {isPreview ? 'Visible' : 'Hidden'}</div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
            {isPreview ? (
              <Suspense
                fallback={
                  <div className="flex-1 p-6">
                    <div className="h-full rounded-2xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
                  </div>
                }
              >
                <MarkdownPreview
                  content={content}
                  className={`flex-1 p-6 overflow-auto prose prose-slate dark:prose-invert max-w-none ${editorSizeClasses[preferences.fontSize]}`}
                  style={{ fontFamily: editorFontStyles[preferences.editorFont] }}
                />
              </Suspense>
            ) : (
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing your note... Markdown is supported."
                className={`flex-1 p-6 border-none outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 leading-relaxed ${editorSizeClasses[preferences.fontSize]}`}
                style={{ fontFamily: editorFontStyles[preferences.editorFont] }}
              />
            )}
          </div>
        </div>
      </div>

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
          setPendingAiAction(null);
        }}
        onSuccess={() => {
          setShowApiKeyModal(false);
          if (pendingAiAction === 'flashcards') {
            generateFlashcards();
          } else {
            handleAISummarize();
          }
        }}
      />

      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        summary={summaryResult}
        isLoading={isLoadingSummary}
        noteTitle={title || 'Untitled Note'}
      />
    </>
  );
};

export default NoteEditor;
