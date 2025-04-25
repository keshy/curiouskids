
interface QuestionSuggestionsProps {
  suggestions?: string[];
  defaultSuggestions?: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  "Why is the sky blue?",
  "How do birds fly?",
  "What makes rainbows appear?"
];

export default function QuestionSuggestions({ 
  suggestions,
  defaultSuggestions = DEFAULT_SUGGESTIONS, 
  onSelectSuggestion 
}: QuestionSuggestionsProps) {
  const displaySuggestions = suggestions || defaultSuggestions;
  const colors = [
    "bg-secondary hover:bg-yellow-400 text-gray-800",
    "bg-green hover:bg-green-600 text-white",
    "bg-primary hover:bg-blue-600 text-white",
    "bg-orange hover:bg-orange-600 text-white",
    "bg-accent hover:bg-purple-700 text-white"
  ];

  return (
    <div className="mb-8 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-3xl p-5 border-2 border-yellow-200 shadow-lg">
      <h3 className="text-xl font-bold text-center mb-4 text-primary">Try asking...</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {displaySuggestions.map((suggestion, index) => {
          // More vibrant button styles with gradients
          const buttonStyles = [
            "from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-800",
            "from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500 text-white",
            "from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white",
            "from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white",
            "from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white"
          ];
          
          return (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              className={`button-press bg-gradient-to-r ${buttonStyles[index % buttonStyles.length]} font-bold py-3 px-5 rounded-full shadow-md transition-all text-lg border border-white/20`}
            >
              {suggestion}
            </button>
          );
        })}
      </div>
    </div>
  );
}
