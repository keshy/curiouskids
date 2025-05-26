import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Response } from '@/components/AskMeBuddy';

interface QuestionContextType {
  currentQuestion: string | null;
  isProcessing: boolean;
  response: Response | null;
  setCurrentQuestion: (question: string | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setResponse: (response: Response | null) => void;
  clearQuestionState: () => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const QuestionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<Response | null>(null);

  const clearQuestionState = () => {
    setCurrentQuestion(null);
    setIsProcessing(false);
    setResponse(null);
  };

  return (
    <QuestionContext.Provider value={{
      currentQuestion,
      isProcessing,
      response,
      setCurrentQuestion,
      setIsProcessing,
      setResponse,
      clearQuestionState
    }}>
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestion = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestion must be used within a QuestionProvider');
  }
  return context;
};