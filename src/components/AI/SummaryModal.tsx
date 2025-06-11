import React from 'react';
import { X, BookOpen, Lightbulb, Hash, Sparkles } from 'lucide-react';
import { SummaryResult } from '../../services/aiService';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SummaryResult | null;
  isLoading: boolean;
  noteTitle: string;
}

const SummaryModal = ({ isOpen, onClose, summary, isLoading, noteTitle }: SummaryModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Summary
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{noteTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Analyzing your note with AI...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            </div>
          ) : summary ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Summary</h4>
                </div>
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">{summary.summary}</p>
              </div>

              {/* Key Points */}
              {summary.keyPoints.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">Key Points</h4>
                  </div>
                  <ul className="space-y-2">
                    {summary.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2 text-green-800 dark:text-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Definitions */}
              {summary.definitions.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">Key Terms</h4>
                  </div>
                  <div className="space-y-3">
                    {summary.definitions.map((def, index) => (
                      <div key={index} className="border-l-4 border-purple-300 dark:border-purple-600 pl-4">
                        <h5 className="font-medium text-purple-900 dark:text-purple-100">{def.term}</h5>
                        <p className="text-purple-700 dark:text-purple-200 text-sm mt-1">{def.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Tags */}
              {summary.suggestedTags.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Hash className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100">Suggested Tags</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary.suggestedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Failed to generate summary. Please try again.</p>
            </div>
          )}
        </div>

        {summary && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryModal;