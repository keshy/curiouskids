import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Question } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

export default function History() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Redirect to login if no user
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  // Fetch user's questions on component mount
  useEffect(() => {
    if (!user) return; // Don't fetch if not logged in
    
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // Fetch questions for authenticated user
        console.log("Fetching questions for authenticated user");
        
        // Pass the Firebase UID as a query parameter
        const firebaseId = user.firebaseUser.uid;
        console.log("Using Firebase ID for authentication:", firebaseId);
        
        const result = await apiRequest<Question[]>(
          `/api/questions/user?firebaseId=${encodeURIComponent(firebaseId)}`, 
          { on401: "returnNull" }
        );
          
        // If we get null back due to 401, the user session might have expired
        if (result === null) {
          console.log("Session expired or user unauthorized");
          setError("Your session has expired. Please log in again.");
          setQuestions([]);
        } else {
          setQuestions(result || []); // Ensure we always have an array
        }
      } catch (err) {
        console.error("Error fetching question history:", err);
        setError("Error loading your questions. Please try again later.");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user, navigate]);

  // Format date string
  const formatDate = (dateValue: string | Date) => {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleString();
  };

  // Create decorative elements for a kid-friendly UI
  const renderStars = () => {
    return Array.from({ length: 8 }, (_, i) => (
      <div 
        key={i}
        className="absolute w-6 h-6 text-yellow-400"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
          transform: `rotate(${Math.random() * 45}deg)`,
        }}
      >
        ★
      </div>
    ));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Decorative stars */}
      {renderStars()}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex justify-between items-center bg-white p-5 rounded-xl shadow-md">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">My Questions and Answers</h1>
          <Link href="/">
            <div className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center cursor-pointer transition-all hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Questions
            </div>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-bounce bg-blue-500 p-2 w-12 h-12 ring-1 ring-slate-200 shadow-lg rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">No Questions Yet</h2>
            <p className="text-gray-600 mb-6">Ask your first question to start your learning adventure!</p>
            <Link href="/">
              <div className="inline-block bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-all hover:scale-105">
                Ask a Question
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                  <div className="p-6 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-gray-500">
                        Asked on {formatDate(q.createdAt)}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-primary mb-2">Question:</h2>
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-lg">{q.question}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-primary mb-2">Answer:</h2>
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="text-lg">{q.answer}</p>
                      </div>
                    </div>
                    
                    {q.imageUrl && (
                      <div className="mt-4 flex justify-center">
                        <img 
                          src={q.imageUrl} 
                          alt="Visual for the answer" 
                          className="max-h-64 max-w-full object-contain rounded-xl border-2 border-purple-200 shadow-md"
                          onError={(e) => {
                            console.warn(`Failed to load image: ${q.imageUrl}`);
                            // Hide the image if it fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                            
                            // Show a friendly error message
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'bg-gray-50 border border-gray-200 p-2 rounded text-gray-600 text-sm text-center mt-2';
                            errorDiv.innerHTML = '<i class="ri-image-line mr-1"></i> Image is no longer available.';
                            
                            (e.target as HTMLImageElement).parentNode?.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    )}
                    
                    {q.audioUrl && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-primary mb-2">Listen to Answer:</h3>
                        <div className="flex justify-center">
                          <audio
                            className="w-full max-w-md rounded bg-gray-100 p-2"
                            controls
                            src={q.audioUrl}
                            onError={(e) => {
                              console.warn(`Failed to load audio: ${q.audioUrl}`);
                              // Hide the audio player if it fails to load
                              (e.target as HTMLAudioElement).style.display = 'none';
                              
                              // Show a friendly error message based on the URL type
                              const errorDiv = document.createElement('div');
                              
                              if (q.audioUrl?.startsWith('/api/audio/')) {
                                // Database-stored audio should persist, so this is odd
                                errorDiv.className = 'bg-yellow-50 border border-yellow-200 p-2 rounded text-yellow-800 text-sm text-center mt-2';
                                errorDiv.innerHTML = '<i class="ri-information-line mr-1"></i> The audio playback failed to load. Please try again later.';
                              } else {
                                // Filesystem-stored audio that no longer exists after restart
                                errorDiv.className = 'bg-gray-50 border border-gray-200 p-2 rounded text-gray-600 text-sm text-center mt-2';
                                errorDiv.innerHTML = '<i class="ri-time-line mr-1"></i> This audio is no longer available after app restart.';
                              }
                              
                              (e.target as HTMLAudioElement).parentNode?.appendChild(errorDiv);
                            }}
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}