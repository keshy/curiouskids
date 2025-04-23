import { useEffect, useState } from "react";
import { Response } from "./AskMeBuddy";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";

interface ResponseDisplayProps {
  response: Response | null;
  isLoading: boolean;
  textToSpeech: boolean;
  onSpeakingEnd: () => void;
}

export default function ResponseDisplay({ 
  response, 
  isLoading,
  textToSpeech,
  onSpeakingEnd
}: ResponseDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use speech synthesis for text-to-speech
  const { speak, speaking, cancel } = useSpeechSynthesis();
  
  // Reset playing state when response changes
  useEffect(() => {
    setIsPlaying(false);
  }, [response]);
  
  // Auto-play speech when a new response arrives and text-to-speech is enabled
  useEffect(() => {
    if (response && textToSpeech && !isLoading) {
      handlePlay();
    }
    
    return () => {
      cancel();
    };
  }, [response, isLoading, textToSpeech]);
  
  // Monitor speaking state and notify parent when done
  useEffect(() => {
    if (!speaking && isPlaying) {
      setIsPlaying(false);
      onSpeakingEnd();
    }
  }, [speaking, isPlaying, onSpeakingEnd]);
  
  const handlePlay = () => {
    if (!response) return;
    
    if (!isPlaying) {
      speak(response.text);
      setIsPlaying(true);
    } else {
      cancel();
      setIsPlaying(false);
    }
  };
  
  const handleReplay = () => {
    if (!response) return;
    
    cancel();
    speak(response.text);
    setIsPlaying(true);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-center mb-4 text-green">My Answer</h2>
      
      {isLoading ? (
        <div className="flex flex-col items-center py-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl text-gray-500 text-center">Thinking about your question...</p>
        </div>
      ) : !response ? (
        // Empty state (shown initially)
        <div className="flex flex-col items-center py-8">
          <div className="w-48 h-48 bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
            <i className="ri-question-mark text-gray-400 text-7xl"></i>
          </div>
          <p className="text-xl text-gray-500 text-center">Ask me a question and I'll give you a fun answer!</p>
        </div>
      ) : (
        // Response content
        <div>
          {/* Audio player */}
          <div className="flex justify-center mb-4">
            <div className="bg-lightGray rounded-full p-3 flex items-center space-x-3 shadow-md">
              <button 
                onClick={handlePlay}
                className="button-press bg-accent hover:bg-purple-700 text-white rounded-full p-3 transition-colors"
              >
                <i className={`ri-${isPlaying ? 'pause' : 'play'}-fill text-2xl`}></i>
              </button>
              <div className="bg-gray-300 h-2 rounded-full w-48 relative">
                <div 
                  className="bg-accent h-full rounded-full" 
                  style={{ width: isPlaying ? '100%' : '0%', transition: 'width 0.3s' }}
                ></div>
              </div>
              <button 
                onClick={handleReplay}
                className="button-press text-gray-600 hover:text-accent transition-colors"
              >
                <i className="ri-repeat-one-line text-xl"></i>
              </button>
            </div>
          </div>
          
          {/* Text and image response */}
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="md:w-1/2 order-2 md:order-1">
              <p className="text-xl leading-relaxed">{response.text}</p>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              {response.imageUrl && (
                <img 
                  src={response.imageUrl} 
                  alt="Visual representation of the answer"
                  className="w-full h-64 object-cover rounded-2xl shadow-md" 
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
