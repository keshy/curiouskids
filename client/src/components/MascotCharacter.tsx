import { MascotState } from "./AskMeBuddy";

interface MascotCharacterProps {
  state: MascotState;
  speechBubbleText: string;
}

export default function MascotCharacter({ state, speechBubbleText }: MascotCharacterProps) {
  // Apply different classes based on mascot state
  const mascotClasses = [
    "w-40 h-40 bg-primary rounded-full flex items-center justify-center shadow-lg relative overflow-hidden",
    state === "listening" ? "animate-pulse-slow" : "",
    state === "thinking" ? "animate-bounce-slow" : "",
  ].filter(Boolean).join(" ");

  // Apply mouth animation when speaking
  const mouthClasses = [
    "w-12 h-3 bg-white rounded-full",
    state === "listening" || state === "speaking" ? "animate-wiggle" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        <div id="mascot" className={mascotClasses}>
          <div className="absolute inset-0 bg-blue-500 rounded-full transform scale-95"></div>
          {/* Robot face */}
          <div className="z-10 flex flex-col items-center">
            {/* Eyes */}
            <div className="flex space-x-4 mb-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-full"></div>
              </div>
            </div>
            {/* Mouth */}
            <div className={mouthClasses}></div>
            {/* Antenna */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-2 h-8 bg-gray-400 rounded-full">
              <div className="w-4 h-4 bg-orange rounded-full absolute -top-3 left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        </div>
        {/* Speech bubble */}
        <div className="absolute -top-4 -right-28 bg-white rounded-2xl p-4 shadow-lg max-w-[200px] transform rotate-3">
          <p className="text-lg">{speechBubbleText}</p>
          <div className="absolute -left-3 bottom-5 w-0 h-0 border-t-[10px] border-r-[15px] border-b-[10px] border-transparent border-r-white"></div>
        </div>
      </div>
    </div>
  );
}
