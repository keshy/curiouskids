import { useState, useEffect } from "react";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { Link } from "wouter";

interface QuestionInputProps {
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitQuestion: (question: string) => void;
  isListening: boolean;
  isLoading?: boolean;
  currentQuestion?: string;
  isGuestUser?: boolean; // Flag to identify guest users
}

export default function QuestionInput({
  onStartListening,
  onStopListening,
  onSubmitQuestion,
  isListening,
  isLoading = false,
  currentQuestion = "",
  isGuestUser = false,
}: QuestionInputProps) {
  const [textInput, setTextInput] = useState("");
  const [showError, setShowError] = useState(false);
  
  const { 
    transcript, 
    listening, 
    startListening, 
    stopListening, 
    isSupported, 
    isMobile,
    isSilkBrowser,
    isProblematicBrowser,
    error
  } = useSpeechRecognition({
    onResult: (result) => {
      // This will be triggered both by manual stop and auto-stop after silence
      if (result.trim()) {
        onSubmitQuestion(result);
      }
    },
  });

  const handleStartRecording = async () => {
    // Clear any previous errors when starting a new recording
    setShowError(false);
    
    try {
      await startListening();
      onStartListening();
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setShowError(true);
    }
  };
  
  // Show error message when an error occurs
  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

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
    <div className={`bg-gradient-to-br from-blue-100 to-pink-100 rounded-3xl p-6 shadow-lg mb-6 border border-purple-200 ${isLoading ? 'opacity-80' : ''}`}>
      <h2 className="text-2xl font-bold text-center mb-4 text-primary">
        {isLoading ? "Thinking deeply about..." : "Ask Your Question"}
      </h2>
      
      <div className="flex flex-col space-y-4">
        {/* Error message */}
        {showError && error && (
          <div className="text-center p-4 bg-red-50 rounded-xl border-2 border-red-300 mb-4">
            <p className="text-red-700">
              <i className="ri-error-warning-line mr-2 text-xl"></i>
              {error}
            </p>
            <button 
              onClick={() => setShowError(false)}
              className="text-sm text-red-600 hover:text-red-800 underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}
      
        {isLoading && currentQuestion && (
          <div className="text-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl animate-pulse border-2 border-yellow-300">
            <p className="text-lg text-gray-700 mb-2">"{currentQuestion}"</p>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        {/* Voice input feature for guest users (disabled with info message) */}
        {!isListening && !isLoading && isGuestUser && (
          <div className="flex flex-col items-center mb-4">
            <div className="text-center p-4 bg-blue-50 border-2 border-blue-200 rounded-xl max-w-md">
              <div className="flex items-center justify-center mb-2">
                <i className="ri-lock-line text-blue-500 text-2xl mr-2"></i>
                <h3 className="text-xl font-semibold text-blue-700">Voice Feature Locked</h3>
              </div>
              <p className="text-gray-700 mb-3">
                Voice input is only available for signed-in users.
              </p>
              <Link to="/login">
                <button className="button-press bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors">
                  Sign In to Unlock
                </button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Voice input button - show for all supported browsers, including mobile, but ONLY for logged-in users */}
        {/* Specific message for Amazon Silk browser users */}
        {!isListening && !isLoading && isSilkBrowser && !isGuestUser && (
          <div className="flex flex-col items-center mb-4">
            <div className="text-center p-4 bg-orange-50 border-2 border-orange-200 rounded-xl max-w-md">
              <div className="flex items-center justify-center mb-2">
                <i className="ri-information-line text-orange-500 text-2xl mr-2"></i>
                <h3 className="text-xl font-semibold text-orange-700">Amazon Fire Tablet Detected</h3>
              </div>
              <p className="text-gray-700 mb-3">
                Voice input is not supported on Amazon Silk browser. Please use the text input option below or try Chrome browser for voice features.
              </p>
            </div>
          </div>
        )}
        
        {/* Voice input button - show for all supported browsers, including mobile, but ONLY for logged-in users */}
        {!isListening && !isLoading && isSupported && !isGuestUser && !isSilkBrowser && (
          <div className="flex flex-col items-center">
            <button 
              onClick={handleStartRecording}
              className="button-press flex items-center justify-center bg-primary hover:bg-primary/80 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all mx-auto"
            >
              <i className="ri-mic-line mr-2 text-2xl"></i>
              <span>Talk to Me!</span>
            </button>
            
            {/* Show helpful tips for mobile users */}
            {isMobile && (
              <div className="text-center mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg max-w-sm">
                <p className="text-sm text-yellow-800">
                  <i className="ri-information-line mr-1"></i>
                  Voice input may work differently on mobile devices. Make sure to grant microphone permissions when prompted.
                </p>
                {isProblematicBrowser && (
                  <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded text-sm text-orange-800">
                    <i className="ri-alert-line mr-1"></i>
                    Your browser may have limited voice support. For best results, try using Chrome or Safari on a newer device.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Text input alternative - show when not listening */}
        {!isListening && (
          <div className="flex flex-col items-center mt-4">
            <p className="text-center text-gray-600 mb-2">
              {isSupported ? "Or type your question:" : "Type your question here:"}
            </p>
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
            <p className="text-xl mb-1">I'm listening...</p>
            <p className="text-xs text-gray-500 mb-2">Take your time! I'll wait 6 seconds after you finish speaking before submitting</p>
            {transcript && (
              <p className="my-2 text-lg text-gray-600 italic">"{transcript}"</p>
            )}
            
            {/* Show error during recording if it occurs */}
            {error && (
              <div className="my-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
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
