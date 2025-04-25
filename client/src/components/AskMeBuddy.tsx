import { useState } from "react";
import Header from "./Header";
import MascotCharacter from "./MascotCharacter";
import QuestionInput from "./QuestionInput";
import ResponseDisplay from "./ResponseDisplay";
import QuestionSuggestions from "./QuestionSuggestions";
import ParentSettingsModal from "./ParentSettingsModal";
import BadgeNotification from "./BadgeNotification";
import type { Badge, Achievement } from "@shared/schema";

export type MascotState = "idle" | "listening" | "thinking" | "speaking";
export type Response = {
  text: string;
  imageUrl: string;
  audioUrl?: string;
  suggestedQuestions?: string[];
  isLoading?: boolean;
  rewards?: {
    badgeEarned?: Badge;
    achievementProgress?: Achievement;
  };
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
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);
  const [showBadgeNotification, setShowBadgeNotification] = useState(false);
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
    // Keep the previous response for suggestions, but mark as loading
    setResponse(prevResponse => prevResponse ? {...prevResponse, isLoading: true} : null);
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
      
      // Update current suggestions with the new ones from response
      if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
        setCurrentSuggestions(data.suggestedQuestions);
      }
      
      // Check for earned badges
      if (data.rewards && data.rewards.badgeEarned) {
        setEarnedBadge(data.rewards.badgeEarned);
        setShowBadgeNotification(true);
        
        // Change speech bubble text to celebrate badge
        setSpeechBubbleText(`Wow! You earned the ${data.rewards.badgeEarned.name} badge! Great job!`);
      } else {
        setSpeechBubbleText("How was that? Ask me something else!");
      }
      
      // After getting response, set mascot to speaking if text-to-speech is enabled
      if (settings.textToSpeech) {
        setMascotState("speaking");
      } else {
        setMascotState("idle");
      }
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
  
  // Keep track of the current active suggestions to avoid going back to defaults
  const [currentSuggestions, setCurrentSuggestions] = useState<string[] | undefined>(suggestions);

  // Create decorative clouds and bubbles
  const clouds = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    width: Math.random() * 100 + 100,
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: Math.random() * 100 + 50,
  }));
  
  // Create colorful floating bubbles with vibrant colors
  const bubbles = Array.from({ length: 15 }, (_, i) => {
    // More saturated and colorful palette
    const colorPalette = [
      'rgba(255, 105, 180, 0.7)', // Hot pink
      'rgba(75, 0, 130, 0.6)',    // Indigo
      'rgba(255, 69, 0, 0.7)',    // Orange-red
      'rgba(0, 191, 255, 0.7)',   // Deep sky blue
      'rgba(50, 205, 50, 0.7)',   // Lime green
      'rgba(255, 215, 0, 0.7)',   // Gold
      'rgba(138, 43, 226, 0.7)',  // Blue violet
      'rgba(0, 206, 209, 0.7)',   // Turquoise
    ];
    
    return {
      id: i,
      size: Math.random() * 40 + 15,
      top: Math.random() * 100,
      left: Math.random() * 100,
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      duration: Math.random() * 15 + 5,
      delay: Math.random() * 5,
    };
  });

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
          suggestions={response?.suggestedQuestions || currentSuggestions}
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

      {/* Badge notification when a new badge is earned */}
      {showBadgeNotification && earnedBadge && (
        <BadgeNotification
          badge={earnedBadge}
          onClose={() => setShowBadgeNotification(false)}
          autoCloseTime={6000}
        />
      )}
    </div>
  );
}
