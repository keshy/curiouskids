import { useState, useEffect, useCallback } from 'react';

// Define types for the Web Speech API, which is not fully typed in TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
}

// Augment the Window interface to include Web Speech API properties
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface SpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  continuous?: boolean;
  language?: string;
}

export default function useSpeechRecognition({
  onResult,
  continuous = false,
  language = 'en-US',
}: SpeechRecognitionOptions = {}) {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define the SpeechRecognition constructor
  const SpeechRecognition = 
    window.SpeechRecognition || 
    window.webkitSpeechRecognition;

  // Check if browser supports speech recognition
  const isBrowserSupported = !!SpeechRecognition;
  
  // Check if this is likely a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Speech recognition is supported if the browser supports it
  // We'll try to use it on mobile too, but with appropriate warnings
  const isSupported = isBrowserSupported;

  // Initialize the recognition instance
  let recognitionInstance: any = null;

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      // Create a new recognition instance each time to prevent issues
      recognitionInstance = new SpeechRecognition();
      
      // Configure the recognition
      recognitionInstance.continuous = continuous;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;

      // Clear previous transcript
      setTranscript('');
      
      // Start listening
      recognitionInstance.start();
      setListening(true);

      // Handle results
      recognitionInstance.onresult = (event: any) => {
        const result = event.results[0];
        const transcript = result[0].transcript;
        setTranscript(transcript);
        
        if (result.isFinal && onResult) {
          onResult(transcript);
        }
      };

      // Handle errors
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific error cases with more user-friendly messages
        if (event.error === 'not-allowed') {
          if (isMobile) {
            setError('Microphone access was denied. On mobile devices, you may need to grant microphone permissions in your browser settings.');
          } else {
            setError('Microphone access was denied. Please allow microphone access to use voice input.');
          }
        } else if (event.error === 'no-speech') {
          setError('No speech was detected. Please try speaking again.');
        } else if (event.error === 'network') {
          setError('A network error occurred. Please check your connection and try again.');
        } else {
          setError(event.error);
        }
        
        setListening(false);
      };

      // Handle when recognition stops
      recognitionInstance.onend = () => {
        setListening(false);
      };
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start speech recognition.');
      setListening(false);
    }
  }, [continuous, isSupported, language, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setListening(false);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, []);

  return {
    transcript,
    listening,
    error,
    isSupported,
    isMobile,
    isBrowserSupported,
    startListening,
    stopListening,
  };
}
