import { useEffect, useState, useRef } from "react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Use speech synthesis as a fallback if no server audio is available
  const { speak, speaking, cancel } = useSpeechSynthesis({
    onEnd: onSpeakingEnd,
  });
  
  // Reset playing state when response changes
  useEffect(() => {
    console.log("Response changed:", response);
    setIsPlaying(false);
    setAudioProgress(0);
    
    // If there's an audio element, stop it
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [response]);
  
  // Auto-play audio when a new response arrives and text-to-speech is enabled
  useEffect(() => {
    if (response && textToSpeech && !isLoading) {
      handlePlay();
    }
    
    return () => {
      cancel();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [response, isLoading, textToSpeech]);
  
  // State for audio progress
  const [audioProgress, setAudioProgress] = useState(0);
  
  // Set up audio event listeners when the audio URL changes
  useEffect(() => {
    if (!response?.audioUrl) return;
    
    // Create a new audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    // Set up event listeners for the audio element
    const audio = audioRef.current;
    audio.src = response.audioUrl;
    
    const handleAudioEnd = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      onSpeakingEnd();
    };
    
    const handleAudioError = (e: Event) => {
      console.error("Error playing audio:", e);
      setIsPlaying(false);
      setAudioProgress(0);
      
      // Fallback to browser speech synthesis if server audio fails
      if (textToSpeech && response.text) {
        speak(response.text);
      }
    };
    
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    
    audio.addEventListener("ended", handleAudioEnd);
    audio.addEventListener("error", handleAudioError);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    
    return () => {
      audio.removeEventListener("ended", handleAudioEnd);
      audio.removeEventListener("error", handleAudioError);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [response?.audioUrl, textToSpeech, onSpeakingEnd]);
  
  const handlePlay = () => {
    if (!response) return;
    
    console.log("Playing response with audioUrl:", response.audioUrl);
    
    // If we have server-generated audio, play that
    if (response.audioUrl && audioRef.current) {
      console.log("Using server audio:", response.audioUrl);
      if (!isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Failed to play audio:", error);
            // Fallback to speech synthesis
            speak(response.text);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } 
    // Otherwise use browser speech synthesis
    else if (response.text) {
      console.log("Using browser speech synthesis");
      if (!isPlaying) {
        speak(response.text);
        setIsPlaying(true);
      } else {
        cancel();
        setIsPlaying(false);
      }
    }
  };
  
  const handleReplay = () => {
    if (!response) return;
    
    // Cancel any ongoing speech or audio
    cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Start playback again
    if (response.audioUrl && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Fallback to speech synthesis
          speak(response.text);
        });
    } else if (response.text) {
      speak(response.text);
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-center mb-4 text-primary">My Answer</h2>
      
      {isLoading ? (
        <div className="flex flex-col items-center py-8">
          <div className="thinking-animation relative w-24 h-24 mb-4">
            <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="absolute top-1 left-5 w-3 h-3 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="absolute top-3 right-4 w-4 h-4 bg-orange rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
            <div className="absolute bottom-3 left-3 w-5 h-5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.5s" }}></div>
          </div>
          <p className="text-xl text-primary font-semibold text-center">Thinking about your question...</p>
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
                  style={{ 
                    width: `${audioProgress}%`,
                    transition: 'width 0.1s linear'
                  }}
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
