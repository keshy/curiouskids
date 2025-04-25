
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
    <div className="mb-8">
      <h3 className="text-xl font-bold text-center mb-4 text-primary">Try asking...</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {displaySuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className={`button-press ${colors[index % colors.length]} font-bold py-2 px-4 rounded-full shadow-md transition-colors text-lg`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
