import { useState, useEffect, useCallback } from 'react';

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
  const isSupported = !!SpeechRecognition;

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
        setError(event.error);
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
    startListening,
    stopListening,
  };
}
