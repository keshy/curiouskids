
import React, { useState } from "react";

interface QuestionSuggestionsProps {
  suggestions?: string[];
  defaultSuggestions?: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  "Why is the sky blue?",
  "How do birds fly?",
  "What makes rainbows appear?"
];

export default function QuestionSuggestions({ 
  suggestions,
  defaultSuggestions = DEFAULT_SUGGESTIONS, 
  onSelectSuggestion 
}: QuestionSuggestionsProps) {
  const displaySuggestions = suggestions || defaultSuggestions;
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  
  // Function to speak the suggestion text
  const speakSuggestion = (text: string, index: number) => {
    // Only set speaking index if not already speaking this suggestion
    if (speakingIndex !== index) {
      // Cancel any existing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      setSpeakingIndex(index);
      
      // Use browser's speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice to an Indian English voice if available
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(voice => 
          voice.lang.includes('en-IN') || voice.name.includes('Indian'));
        
        if (indianVoice) {
          utterance.voice = indianVoice;
        } else {
          // Find another English voice as fallback
          const englishVoice = voices.find(voice => voice.lang.includes('en'));
          if (englishVoice) utterance.voice = englishVoice;
        }
        
        // When speech ends, reset the state
        utterance.onend = () => {
          setSpeakingIndex(null);
        };
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      // If already speaking this suggestion, stop speaking
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingIndex(null);
    }
  };
  
  const colors = [
    "bg-secondary hover:bg-yellow-400 text-gray-800",
    "bg-green hover:bg-green-600 text-white",
    "bg-primary hover:bg-blue-600 text-white",
    "bg-orange hover:bg-orange-600 text-white",
    "bg-accent hover:bg-purple-700 text-white"
  ];

  return (
    <div className="mb-8 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-3xl p-5 border-2 border-yellow-200 shadow-lg">
      <h3 className="text-xl font-bold text-center mb-4 text-primary">Try asking...</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {displaySuggestions.map((suggestion, index) => {
          // More vibrant button styles with gradients
          const buttonStyles = [
            "from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-800",
            "from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500 text-white",
            "from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white",
            "from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white",
            "from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white"
          ];
          
          return (
            <div key={index} className="flex items-center">
              <button
                onClick={() => onSelectSuggestion(suggestion)}
                className={`button-press bg-gradient-to-r ${buttonStyles[index % buttonStyles.length]} font-bold py-3 px-5 rounded-full shadow-md transition-all text-lg border border-white/20`}
              >
                {suggestion}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  speakSuggestion(suggestion, index);
                }}
                className={`ml-2 p-2 button-press rounded-full shadow-md bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all ${speakingIndex === index ? 'animate-pulse' : ''}`}
                aria-label={speakingIndex === index ? "Stop reading" : "Read aloud"}
                title={speakingIndex === index ? "Stop reading" : "Read aloud"}
              >
                {speakingIndex === index ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                    <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                    <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                    <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
