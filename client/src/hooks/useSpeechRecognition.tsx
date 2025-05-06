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
  // State to track silence detection
  const [lastSpeechTimestamp, setLastSpeechTimestamp] = useState<number | null>(null);
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const SILENCE_TIMEOUT = 6000; // 6 seconds of silence before auto-submit - longer for better user experience

  // Define the SpeechRecognition constructor
  const SpeechRecognition = 
    window.SpeechRecognition || 
    window.webkitSpeechRecognition;

  // Check if browser supports speech recognition
  const isBrowserSupported = !!SpeechRecognition;
  
  // Check if this is likely a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check specifically for Amazon Silk browser
  const isSilkBrowser = /silk/i.test(navigator.userAgent);
  
  // Speech recognition is supported if the browser supports it, but Amazon Silk has issues
  const isSupported = isBrowserSupported && !isSilkBrowser;

  // Use state to store the recognition instance
  const [recognitionInstance, setRecognitionInstance] = useState<SpeechRecognition | null>(null);

  // Function to request permission for the microphone
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // This will prompt for microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error requesting microphone permission:', err);
      return false;
    }
  };

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    // Clear any previous errors
    setError(null);

    // Try to get microphone permission first
    const hasMicPermission = await requestMicrophonePermission();
    if (!hasMicPermission) {
      setError('Microphone access is required for voice input. Please allow microphone access in your browser settings.');
      return;
    }

    try {
      // Create a new recognition instance each time to prevent issues
      const recognition = new SpeechRecognition();
      setRecognitionInstance(recognition);
      
      // Configure the recognition
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;

      // Clear previous transcript
      setTranscript('');
      
      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Make sure to handle potentially multiple results
        const results = event.results;
        let latestTranscript = '';
        
        // Get the latest transcript from all results
        for (let i = event.resultIndex; i < results.length; i++) {
          latestTranscript += results[i][0].transcript;
        }
        
        setTranscript(latestTranscript);
        
        // Update the last speech timestamp for silence detection
        setLastSpeechTimestamp(Date.now());
        
        // Clear any existing silence timer
        if (silenceTimer !== null) {
          window.clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
        
        // Set a new silence timer - if no speech is detected for SILENCE_TIMEOUT ms, auto-submit
        const timer = window.setTimeout(() => {
          if (listening && latestTranscript.trim() !== '') {
            console.log('Silence detected - auto-submitting');
            stopListening();
            if (onResult) {
              onResult(latestTranscript);
            }
          }
        }, SILENCE_TIMEOUT);
        
        setSilenceTimer(timer);
        
        // If this is a final result, call the onResult callback
        if (results[results.length - 1].isFinal && onResult) {
          onResult(latestTranscript);
        }
      };

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific error cases with more user-friendly messages
        if (event.error === 'not-allowed') {
          if (isMobile) {
            setError('Microphone access was denied. On mobile devices, you may need to grant microphone permissions in your browser settings.');
          } else {
            setError('Microphone access was denied. Please allow microphone access to use voice input.');
          }
        } else if (event.error === 'no-speech') {
          setError('No speech was detected. Please try speaking again and make sure your microphone is working.');
        } else if (event.error === 'network') {
          setError('A network error occurred. Please check your connection and try again.');
        } else if (event.error === 'aborted') {
          setError('Speech recognition was aborted. Please try again.');
        } else if (event.error === 'audio-capture') {
          setError('No microphone was found. Please ensure your device has a working microphone.');
        } else if (event.error === 'service-not-allowed') {
          setError('Speech recognition service is not allowed. This might be due to browser restrictions.');
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        
        setListening(false);
      };

      // Handle when recognition stops
      recognition.onend = () => {
        setListening(false);
      };
      
      // Start listening
      recognition.start();
      setListening(true);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start speech recognition. Please try again or use text input instead.');
      setListening(false);
    }
  }, [continuous, isSupported, language, onResult]);

  const stopListening = useCallback(() => {
    // Clear any existing silence timer
    if (silenceTimer !== null) {
      window.clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      setListening(false);
    }
  }, [recognitionInstance, silenceTimer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear any running timers
      if (silenceTimer !== null) {
        window.clearTimeout(silenceTimer);
      }
      
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (error) {
          console.error('Error stopping speech recognition during cleanup:', error);
        }
      }
    };
  }, [recognitionInstance, silenceTimer]);

  return {
    transcript,
    listening,
    error,
    isSupported,
    isMobile,
    isSilkBrowser,
    isBrowserSupported,
    startListening,
    stopListening,
  };
}
