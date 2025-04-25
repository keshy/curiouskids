import { useState } from "react";
import Header from "./Header";
import MascotCharacter from "./MascotCharacter";
import QuestionInput from "./QuestionInput";
import ResponseDisplay from "./ResponseDisplay";
import QuestionSuggestions from "./QuestionSuggestions";
import ParentSettingsModal from "./ParentSettingsModal";

export type MascotState = "idle" | "listening" | "thinking" | "speaking";
export type Response = {
  text: string;
  imageUrl: string;
  audioUrl?: string;
  suggestedQuestions?: string[];
};

export type Settings = {
  textToSpeech: boolean;
  showImages: boolean;
  contentFilter: "strict" | "moderate" | "standard";
  highContrastMode: boolean;
};

export default function AskMeBuddy() {
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [speechBubbleText, setSpeechBubbleText] = useState<string>("Hi there! What would you like to know?");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [response, setResponse] = useState<Response | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    textToSpeech: true,
    showImages: true,
    contentFilter: "strict",
    highContrastMode: false,
  });

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  };
  
  const handleStartListening = () => {
    setMascotState("listening");
    setSpeechBubbleText("I'm listening carefully!");
  };

  const handleStopListening = () => {
    setMascotState("thinking");
    setSpeechBubbleText("Great question! Let me think...");
  };

  const handleQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setMascotState("thinking");
    setSpeechBubbleText("Great question! Let me think...");

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          contentFilter: settings.contentFilter,
          generateImage: settings.showImages,
          generateAudio: settings.textToSpeech
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get an answer');
      }

      const data = await res.json();
      setResponse(data);
      
      // After getting response, set mascot to speaking if text-to-speech is enabled
      if (settings.textToSpeech) {
        setMascotState("speaking");
      } else {
        setMascotState("idle");
      }
      
      setSpeechBubbleText("How was that? Ask me something else!");
    } catch (error) {
      console.error("Error asking question:", error);
      setSpeechBubbleText("Oops! I couldn't answer that. Try asking something else!");
      setMascotState("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakingEnd = () => {
    setMascotState("idle");
  };

  // Predefined question suggestions
  const suggestions = [
    "Why is the sky blue?",
    "How do birds fly?",
    "What are dinosaurs?",
    "Why do we need to sleep?",
  ];

  // Create decorative clouds
  const clouds = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    width: Math.random() * 100 + 100,
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: Math.random() * 100 + 50,
  }));

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Decorative background elements */}
      <div className="clouds">
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            className="cloud"
            style={{
              width: `${cloud.width}px`,
              height: `${cloud.width}px`,
              top: `${cloud.top}%`,
              left: `${cloud.left}%`,
              animationDuration: `${cloud.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Header onOpenSettings={handleOpenSettings} />
        
        <MascotCharacter 
          state={mascotState}
          speechBubbleText={speechBubbleText}
        />
        
        <QuestionInput
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          onSubmitQuestion={handleQuestion}
          isListening={mascotState === "listening"}
        />
        
        <ResponseDisplay 
          response={response}
          isLoading={isLoading}
          textToSpeech={settings.textToSpeech}
          onSpeakingEnd={handleSpeakingEnd}
        />
        
        <QuestionSuggestions 
          suggestions={response?.suggestedQuestions || suggestions}
          onSelectSuggestion={handleQuestion}
        />
      </div>

      {isSettingsOpen && (
        <ParentSettingsModal
          settings={settings}
          onClose={handleCloseSettings}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}
