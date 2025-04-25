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
          <div className="absolute inset-0 bg-gray-700 rounded-full transform scale-95"></div>
          {/* Batman face */}
          <div className="z-10 flex flex-col items-center">
            {/* Mask */}
            <div className="absolute top-2 w-32 h-24 bg-black rounded-t-[80px]"></div>
            {/* Eyes */}
            <div className="flex space-x-6 mb-2 relative top-6">
              <div className="w-8 h-4 bg-white skew-x-12"></div>
              <div className="w-8 h-4 bg-white -skew-x-12"></div>
            </div>
            {/* Mouth */}
            <div className={`${mouthClasses} relative top-10`}></div>
            {/* Ears */}
            <div className="absolute -top-4 w-full">
              <div className="relative w-full h-8">
                <div className="absolute left-2 w-6 h-12 bg-black transform -skew-x-12 rotate-12"></div>
                <div className="absolute right-2 w-6 h-12 bg-black transform skew-x-12 -rotate-12"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Speech bubble */}
        <div className="absolute -top-4 -right-28 bg-white rounded-2xl p-4 shadow-lg max-w-[200px] transform rotate-3 z-20">
          <p className="text-lg text-black">{speechBubbleText}</p>
          <div className="absolute -left-3 bottom-5 w-0 h-0 border-t-[10px] border-r-[15px] border-b-[10px] border-transparent border-r-white"></div>
        </div>
      </div>
    </div>
  );
}
