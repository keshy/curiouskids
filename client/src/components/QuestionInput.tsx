import { useState } from "react";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";

interface QuestionInputProps {
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitQuestion: (question: string) => void;
  isListening: boolean;
}

export default function QuestionInput({
  onStartListening,
  onStopListening,
  onSubmitQuestion,
  isListening,
}: QuestionInputProps) {
  const [textInput, setTextInput] = useState("");
  
  const { transcript, listening, startListening, stopListening } = useSpeechRecognition({
    onResult: (result) => {
      // We'll handle the final result in handleStopRecording
    },
  });

  const handleStartRecording = () => {
    startListening();
    onStartListening();
  };

  const handleStopRecording = () => {
    stopListening();
    onStopListening();
    
    // Submit the transcript as the question
    if (transcript) {
      onSubmitQuestion(transcript);
    }
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (textInput.trim()) {
      onSubmitQuestion(textInput);
      setTextInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTextSubmit();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg mb-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-4 text-primary">Ask Your Question</h2>
      
      <div className="flex flex-col space-y-4">
        {/* Voice input button - show when not listening */}
        {!isListening && (
          <button 
            onClick={handleStartRecording}
            className="button-press flex items-center justify-center bg-orange hover:bg-orange-400 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all mx-auto"
          >
            <i className="ri-mic-line mr-2 text-2xl"></i>
            <span>Talk to Me!</span>
          </button>
        )}
        
        {/* Text input alternative - show when not listening */}
        {!isListening && (
          <div className="flex flex-col items-center">
            <p className="text-center text-gray-600 mb-2">Or type your question:</p>
            <div className="relative w-full">
              <input 
                type="text" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border-2 border-primary rounded-full py-3 px-6 text-xl focus:outline-none focus:ring-2 focus:ring-accent" 
                placeholder="What's on your mind?"
              />
              <button 
                onClick={() => handleTextSubmit()}
                className="button-press absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-blue-600 text-white rounded-full p-2 transition-colors"
              >
                <i className="ri-send-plane-fill text-xl"></i>
              </button>
            </div>
          </div>
        )}
        
        {/* Recording state - show when listening */}
        {isListening && (
          <div className="flex flex-col items-center">
            <div className="recording-animation w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-2">
              <i className="ri-mic-line text-white text-3xl"></i>
            </div>
            <p className="text-xl">I'm listening...</p>
            {transcript && (
              <p className="my-2 text-lg text-gray-600 italic">"{transcript}"</p>
            )}
            <button 
              onClick={handleStopRecording}
              className="button-press mt-2 bg-red-500 hover:bg-red-600 text-white text-lg font-bold py-2 px-4 rounded-full shadow-md transition-colors"
            >
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
