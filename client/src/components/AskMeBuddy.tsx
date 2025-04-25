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
  const [question, setQuestion] = useState("");
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

  const handleQuestion = async (newQuestion: string) => {
    if (!newQuestion.trim()) return;
    
    setQuestion(newQuestion);
    setIsLoading(true);
    setResponse(null); // Clear previous response
    setMascotState("thinking");
    setSpeechBubbleText("Great question! Let me think...");

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: newQuestion, // Use the newQuestion parameter, not the state
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

  // Default question suggestions (will be replaced by dynamic suggestions after first query)
  const [suggestions, setSuggestions] = useState<string[]>([
    "Why is the sky blue?",
    "How do birds fly?",
    "What are dinosaurs?",
    "Why do we need to sleep?",
  ]);

  // Create decorative clouds and bubbles
  const clouds = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    width: Math.random() * 100 + 100,
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: Math.random() * 100 + 50,
  }));
  
  // Create colorful floating bubbles
  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 30 + 10,
    top: Math.random() * 100,
    left: Math.random() * 100,
    color: `hsl(${Math.random() * 360}, 80%, 75%)`,
    duration: Math.random() * 15 + 5,
    delay: Math.random() * 5,
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
      
      {/* Colorful floating bubbles */}
      <div className="bubbles">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="bubble"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              top: `${bubble.top}%`,
              left: `${bubble.left}%`,
              backgroundColor: bubble.color,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
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
          isLoading={isLoading}
          currentQuestion={isLoading ? question : undefined}
        />
        
        <ResponseDisplay 
          response={response}
          isLoading={isLoading}
          textToSpeech={settings.textToSpeech}
          onSpeakingEnd={handleSpeakingEnd}
        />
        
        <QuestionSuggestions 
          suggestions={response?.suggestedQuestions}
          defaultSuggestions={suggestions}
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
