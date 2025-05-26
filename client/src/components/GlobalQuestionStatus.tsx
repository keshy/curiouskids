import React from 'react';
import { useQuestion } from '@/contexts/QuestionContext';
import { Link } from 'wouter';

export default function GlobalQuestionStatus() {
  const { currentQuestion, isProcessing, response } = useQuestion();

  // Only show if there's an active question being processed or a response ready
  if (!currentQuestion && !isProcessing && !response) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {isProcessing && (
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-lg shadow-lg border-2 border-white">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            <div>
              <p className="font-semibold text-sm">Processing your question...</p>
              <p className="text-xs opacity-90 truncate">{currentQuestion}</p>
            </div>
          </div>
          <Link href="/">
            <button className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">
              Go back to see answer
            </button>
          </Link>
        </div>
      )}
      
      {response && !isProcessing && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-lg shadow-lg border-2 border-white">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-500 text-xs">✓</span>
            </div>
            <p className="font-semibold text-sm">Answer ready!</p>
          </div>
          <Link href="/">
            <button className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">
              View your answer
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}