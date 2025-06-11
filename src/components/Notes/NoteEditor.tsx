import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit3, 
  Tag, 
  Folder,
  Sparkles,
  Brain,
  Download,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useStore } from '../../store/useStore';
import { aiService } from '../../services/aiService';
import ApiKeyModal from '../AI/ApiKeyModal';
import SummaryModal from '../AI/SummaryModal';
import { SummaryResult } from '../../services/aiService';

const NoteEditor = () => {
  const { 
    currentNote, 
    setCurrentNote, 
    updateNote, 
    deleteNote,
    folders,
    addFlashcard
  } = useStore();
  
  const [title, setTitle] = useState(currentNote?.title || '');
  const [content, setContent] = useState(currentNote?.content || '');
  const [tags, setTags] = useState<string[]>(currentNote?.tags || []);
  const [folderId, setFolderId] = useState(currentNote?.folderId || '');
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // AI-related state
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setTags(currentNote.tags);
      setFolderId(currentNote.folderId || '');
    }
  }, [currentNote]);

  const handleSave = () => {
    if (!currentNote) return;
    
    updateNote(currentNote.id, {
      title: title || 'Untitled Note',
      content,
      tags,
      folderId: folderId || undefined,
    });
    
    setLastSaved(new Date());
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDelete = () => {
    if (currentNote && window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(currentNote.id);
      setCurrentNote(null);
    }
  };

  const handleAISummarize = async () => {
    // Check if we have an API key
    if (!aiService.getApiKey()) {
      setShowApiKeyModal(true);
      return;
    }

    // Check if we have content to summarize
    if (!content.trim()) {
      alert('Please add some content to your note before summarizing.');
      return;
    }

    setIsLoadingSummary(true);
    setShowSummaryModal(true);
    setSummaryResult(null);

    try {
      const result = await aiService.summarizeNote(title || 'Untitled Note', content);
      setSummaryResult(result);
    } catch (error: any) {
      console.error('Error summarizing note:', error);
      alert(error.message || 'Failed to summarize note. Please try again.');
      setShowSummaryModal(false);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const generateFlashcards = async () => {
    if (!currentNote || !content.trim()) {
      alert('Please add some content to your note before generating flashcards.');
      return;
    }

    // Check if we have an API key
    if (!aiService.getApiKey()) {
      setShowApiKeyModal(true);
      return;
    }
    
    setIsGeneratingFlashcards(true);
    
    try {
      const flashcardSuggestions = await aiService.generateFlashcards(title || 'Untitled Note', content, 5);
      
      // Add the generated flashcards
      flashcardSuggestions.forEach(suggestion => {
        addFlashcard({
          question: suggestion.question,
          answer: suggestion.answer,
          noteId: currentNote.id,
          difficulty: suggestion.difficulty,
        });
      });
      
      alert(`Generated ${flashcardSuggestions.length} flashcards from this note!`);
    } catch (error: any) {
      console.error('Error generating flashcards:', error);
      alert(error.message || 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const exportNote = () => {
    const exportContent = `# ${title}\n\n${content}\n\n---\n**Tags:** ${tags.join(', ')}\n**Created:** ${currentNote?.createdAt}\n**Updated:** ${currentNote?.updatedAt}`;
    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!currentNote) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentNote(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title || 'Untitled Note'}
                </h2>
                {lastSaved && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Saved {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAISummarize}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Summarize</span>
              </button>
              
              <button
                onClick={generateFlashcards}
                disabled={isGeneratingFlashcards}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors text-sm"
              >
                <Brain className="w-4 h-4" />
                <span>{isGeneratingFlashcards ? 'Generating...' : 'Generate Cards'}</span>
              </button>
              
              <button
                onClick={exportNote}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={() => setIsPreview(!isPreview)}
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
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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

        {/* Editor Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-auto">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Folder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Folder className="w-4 h-4 inline mr-2" />
                  Folder
                </label>
                <select
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No folder</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Tags
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>Words: {content.split(/\s+/).filter(w => w.length > 0).length}</div>
                  <div>Characters: {content.length}</div>
                  <div>Created: {new Date(currentNote.createdAt).toLocaleDateString()}</div>
                  <div>Updated: {new Date(currentNote.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="flex-1 flex flex-col">
            {isPreview ? (
              <div className="flex-1 p-6 overflow-auto prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content || '*Start writing to see preview...*'}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note... Supports Markdown!"
                className="flex-1 p-6 border-none outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 font-mono text-base leading-relaxed"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Monaco, Consolas, monospace' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSuccess={() => {
          setShowApiKeyModal(false);
          // Retry the action that triggered the modal
          if (isGeneratingFlashcards) {
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