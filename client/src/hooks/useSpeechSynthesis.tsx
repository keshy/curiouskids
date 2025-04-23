import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisOptions {
  voice?: SpeechSynthesisVoice;
  pitch?: number;
  rate?: number;
  volume?: number;
  onEnd?: () => void;
}

export default function useSpeechSynthesis({
  voice,
  pitch = 1,
  rate = 0.9, // Slightly slower for kid-friendly speech
  volume = 1,
  onEnd,
}: SpeechSynthesisOptions = {}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  
  // Get available voices and update when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      
      // Function to get voices
      const getVoices = () => {
        const voiceList = window.speechSynthesis.getVoices();
        setVoices(voiceList);
      };
      
      // Get voices on mount
      getVoices();
      
      // Listen for voiceschanged event
      window.speechSynthesis.onvoiceschanged = getVoices;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);
  
  // Select a child-friendly voice if available
  const getChildFriendlyVoice = useCallback(() => {
    if (!voices.length) return null;
    
    // Try to find a friendly, child-appropriate voice
    // Preference for female, higher pitched voices in English
    const preferredVoices = voices.filter(v => 
      v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Girl'))
    );
    
    return preferredVoices.length > 0 ? preferredVoices[0] : voices[0];
  }, [voices]);
  
  // Speak the provided text
  const speak = useCallback((text: string) => {
    if (!supported) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure utterance
    utterance.voice = voice || getChildFriendlyVoice() || null;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;
    
    // Handle speech events
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setSpeaking(false);
      console.error('Speech synthesis error');
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [supported, voice, getChildFriendlyVoice, pitch, rate, volume, onEnd]);
  
  // Cancel ongoing speech
  const cancel = useCallback(() => {
    if (!supported) return;
    
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (supported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);
  
  return {
    speak,
    cancel,
    speaking,
    supported,
    voices,
  };
}
