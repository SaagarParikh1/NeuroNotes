import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, BookOpen, Brain } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface FlashcardCreatorProps {
  onClose: () => void;
}

const FlashcardCreator = ({ onClose }: FlashcardCreatorProps) => {
  const { addFlashcard, notes } = useStore();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedNoteId, setSelectedNoteId] = useState('');

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) {
      alert('Please enter both question and answer');
      return;
    }

    addFlashcard({
      question: question.trim(),
      answer: answer.trim(),
      difficulty,
      noteId: selectedNoteId || undefined,
    });

    // Reset form
    setQuestion('');
    setAnswer('');
    setDifficulty('medium');
    setSelectedNoteId('');
    
    alert('Flashcard created successfully!');
  };

  const generateFromNote = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Simple AI simulation - extract key phrases
    const sentences = note.content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      const randomSentence = sentences[Math.floor(Math.random() * sentences.length)].trim();
      const words = randomSentence.split(' ');
      
      if (words.length > 6) {
        const midPoint = Math.floor(words.length / 2);
        setQuestion(`What comes after: "${words.slice(0, midPoint).join(' ')}..."`);
        setAnswer(words.slice(midPoint).join(' '));
        setSelectedNoteId(noteId);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Flashcards</h2>
              <p className="text-gray-500 dark:text-gray-400">Build your study deck</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Card</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Manual Creation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-blue-600" />
              Create Manually
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full h-32 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the answer..."
                  className="w-full h-32 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link to Note (Optional)
                </label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No note selected</option>
                  {notes.map((note) => (
                    <option key={note.id} value={note.id}>
                      {note.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Generate from Notes */}
          {notes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                Generate from Notes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors cursor-pointer"
                    onClick={() => generateFromNote(note.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <BookOpen className="w-5 h-5 text-purple-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {note.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {note.wordCount} words • {note.tags.length} tags
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                          Click to generate flashcard
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {(question || answer) && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Question</h4>
                  <p className="text-gray-700 dark:text-gray-300">{question || 'Enter a question...'}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-purple-600 dark:text-purple-400 mb-2">Answer</h4>
                  <p className="text-gray-700 dark:text-gray-300">{answer || 'Enter an answer...'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardCreator;