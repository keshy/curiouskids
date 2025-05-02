import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { Response } from "./AskMeBuddy";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";

interface ResponseDisplayProps {
  response: Response | null;
  isLoading: boolean;
  textToSpeech: boolean;
  onSpeakingEnd: () => void;
  isGuestUser?: boolean; // Flag to check if user is a guest
}

export default function ResponseDisplay({ 
  response, 
  isLoading,
  textToSpeech,
  onSpeakingEnd,
  isGuestUser = false
}: ResponseDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [shouldShowPlayButton, setShouldShowPlayButton] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { speak, speaking, cancel } = useSpeechSynthesis({
    onEnd: onSpeakingEnd,
  });

  useEffect(() => {
    console.log("Response changed:", response);
    setIsPlaying(false);
    setAudioProgress(0);
    setShouldShowPlayButton(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [response]);

  useEffect(() => {
    // Skip audio playback for guest users
    if (isGuestUser) {
      return;
    }
    
    if (response && textToSpeech && !isLoading) {
      setShouldShowPlayButton(true);
      if (response.audioUrl && audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setShouldShowPlayButton(false);
          })
          .catch(error => {
            console.warn("Failed to autoplay audio:", error);
            // Keep showing play button for manual interaction
            setShouldShowPlayButton(true);
          });
      } else {
        console.warn("No audio URL provided, falling back to browser TTS");
        if (response.text) {
          speak(response.text);
        }
      }
    }

    return () => {
      cancel();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [response, isLoading, textToSpeech, isGuestUser]);

  useEffect(() => {
    if (!response?.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    
    // Determine if the audio URL is using the new database format or the old filesystem format
    const isNewDatabaseAudio = response.audioUrl.startsWith('/api/audio/');
    
    // Set the correct source URL
    audio.src = response.audioUrl;

    const handleAudioEnd = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setShouldShowPlayButton(true);
      onSpeakingEnd();
    };

    const handleAudioError = (e: Event) => {
      console.error("Error playing audio:", e);
      setIsPlaying(false);
      setAudioProgress(0);
      setShouldShowPlayButton(true);

      // Log additional details to help with debugging
      console.warn(`Audio playback failed for URL: ${response.audioUrl} (${isNewDatabaseAudio ? 'database audio' : 'filesystem audio'})`);
      
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
    
    // Skip audio playback for guest users
    if (isGuestUser) {
      return;
    }

    if (response.audioUrl && audioRef.current) {
      if (!isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setShouldShowPlayButton(false);
          })
          .catch(error => {
            console.error("Failed to play audio:", error);
            speak(response.text);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
        setShouldShowPlayButton(true);
      }
    } else if (response.text) {
      if (!isPlaying) {
        speak(response.text);
        setIsPlaying(true);
        setShouldShowPlayButton(false);
      } else {
        cancel();
        setIsPlaying(false);
        setShouldShowPlayButton(true);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-100 to-green-100 rounded-3xl p-6 shadow-lg mb-8 border-2 border-purple-200">
      <h2 className="text-2xl font-bold text-center mb-4 text-primary">My Answer</h2>

      {isLoading ? (
        <div className="flex flex-col items-center py-8">
          <div className="thinking-animation relative w-24 h-24 mb-4">
            <div className="absolute inset-0 bg-pink-500 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="absolute top-1 left-5 w-4 h-4 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="absolute top-3 right-4 w-5 h-5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }}></div>
          </div>
          <p className="text-xl text-primary font-semibold text-center">Thinking about your question...</p>
        </div>
      ) : !response ? (
        <div className="flex flex-col items-center py-8">
          <div className="w-48 h-48 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-2xl flex items-center justify-center mb-4 border-2 border-yellow-300">
            <i className="ri-question-mark text-yellow-600 text-7xl"></i>
          </div>
          <p className="text-xl text-black text-center">Ask me a question and I'll give you a fun answer!</p>
        </div>
      ) : (
        <div>
          {/* For guest users, show a message about signing in to unlock audio features */}
          {response && isGuestUser && (
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 flex items-center shadow-md border border-blue-200 max-w-md">
                <div className="flex items-center gap-2 text-blue-800">
                  <i className="ri-information-line text-xl"></i>
                  <p className="text-sm">
                    <span className="font-semibold">Sign in to unlock audio!</span> Listen to answers with friendly voice narration.
                  </p>
                  <Link to="/login" className="ml-2">
                    <button className="button-press bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full">
                      Sign In
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* For signed-in users, show the audio controls */}
          {response && !isGuestUser && (
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full p-3 flex items-center space-x-3 shadow-md border border-indigo-300">
                <button 
                  onClick={handlePlay}
                  className="button-press bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full p-3 transition-colors"
                >
                  <i className={`ri-${isPlaying ? 'pause' : 'play'}-fill text-2xl`}></i>
                </button>
                <div className="bg-white h-3 rounded-full w-48 relative border border-blue-300">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" 
                    style={{ 
                      width: `${audioProgress}%`,
                      transition: 'width 0.1s linear'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="md:w-1/2 order-2 md:order-1 bg-white/60 p-4 rounded-xl border border-purple-200">
              <p className="text-xl leading-relaxed text-black">{response.text}</p>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              {response.imageUrl && (
                <img 
                  src={response.imageUrl} 
                  alt="Visual representation of the answer"
                  className="w-full h-64 object-cover rounded-2xl shadow-md border-2 border-purple-300" 
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}