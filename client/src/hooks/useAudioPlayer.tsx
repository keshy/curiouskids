import { useState, useRef, useEffect } from 'react';

interface AudioPlayerOptions {
  src?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export default function useAudioPlayer({
  src,
  autoPlay = false,
  onEnded,
}: AudioPlayerOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    // Set up event listeners
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setLoading(false);
      if (autoPlay) {
        play();
      }
    });
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      setLoading(false);
      setIsPlaying(false);
    });
    
    // Clean up on unmount
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('error', () => {});
      }
    };
  }, [autoPlay, onEnded]);
  
  // Update source when src changes
  useEffect(() => {
    if (audioRef.current && src) {
      setLoading(true);
      audioRef.current.src = src;
      audioRef.current.load();
    }
  }, [src]);
  
  // Playback controls
  const play = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
        });
    }
  };
  
  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  const toggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };
  
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  // Progress as percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return {
    isPlaying,
    duration,
    currentTime,
    progress,
    loading,
    play,
    pause,
    toggle,
    seek,
  };
}
