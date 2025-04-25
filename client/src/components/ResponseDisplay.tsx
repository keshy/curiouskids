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
    if (response && textToSpeech && !isLoading) {
      setShouldShowPlayButton(true);
      if (response.audioUrl) {
        handlePlay().catch(error => {
          console.warn("Failed to autoplay audio:", error);
          // Keep showing play button for manual interaction
        });
      } else {
        console.warn("No audio URL provided, falling back to browser TTS");
      }
    }

    return () => {
      cancel();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [response, isLoading, textToSpeech]);

  useEffect(() => {
    if (!response?.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
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
        <div className="flex flex-col items-center py-8">
          <div className="w-48 h-48 bg-gray-200 rounded-2xl flex items-center justify-center mb-4">
            <i className="ri-question-mark text-gray-400 text-7xl"></i>
          </div>
          <p className="text-xl text-gray-500 text-center">Ask me a question and I'll give you a fun answer!</p>
        </div>
      ) : (
        <div>
          {shouldShowPlayButton && (
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
              </div>
            </div>
          )}

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