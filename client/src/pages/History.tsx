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
        let data: Question[] = [];
        
        if (user.isGuest) {
          // Send the guest ID as a query parameter for guest users
          console.log("Fetching guest questions with ID:", user.id);
          console.log("Guest user object:", user);
          const result = await apiRequest<Question[]>(`/api/questions/guest?guestId=${encodeURIComponent(user.id)}`);
          data = result || []; // Ensure we always have an array
        } else {
          // Use the user-specific endpoint for logged-in users
          console.log("Fetching questions for authenticated user");
          try {
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
              // We'll just show empty state rather than error
              data = [];
            } else {
              data = result;
            }
          } catch (authErr) {
            console.error("Error with authentication:", authErr);
            // Just show empty state if there's an auth error
            data = [];
          }
        }
        
        setQuestions(data || []); // Ensure we always have an array
      } catch (err) {
        console.error("Error fetching question history:", err);
        // Don't show error for empty states, just set empty questions
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user]);

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
              Back to BrainSpark
            </div>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
            <p>{error}</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-6 rounded-xl shadow-md text-center">
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-blue-700 mb-2">No Questions Yet!</h3>
              <p className="text-blue-600 mb-4">You haven't asked any questions yet. Return to BrainSpark and ask something exciting!</p>
              <Link href="/">
                <div className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full cursor-pointer transition-all hover:scale-105 inline-flex items-center">
                  <span className="mr-2">Ask Your First Question</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{q.question}</h2>
                    <span className="text-sm text-gray-500">{formatDate(q.createdAt)}</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-4">{q.answer}</p>
                  
                  {q.imageUrl && (
                    <div className="mt-4">
                      <img 
                        src={q.imageUrl} 
                        alt="Answer visual" 
                        className="rounded-lg max-h-48 object-cover mx-auto"
                      />
                    </div>
                  )}
                  
                  {/* Only show audio for logged-in users, not guests */}
                  {q.audioUrl && !user?.isGuest && (
                    <div className="mt-4 flex justify-center">
                      <div className="w-full max-w-md">
                        <p className="text-xs text-gray-500 mb-1 text-center">
                          {q.audioUrl.startsWith('/api/audio/') ? 'Enhanced persistent audio' : 'Standard audio'}
                        </p>
                        <audio 
                          controls 
                          src={q.audioUrl}
                          className="w-full" 
                          onError={(e) => {
                            console.warn(`Failed to load audio: ${q.audioUrl}`);
                            // Hide the audio player if it fails to load
                            (e.target as HTMLAudioElement).style.display = 'none';
                            // Show an error message
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'text-red-500 text-sm text-center mt-2';
                            errorDiv.innerText = 'Audio is no longer available';
                            (e.target as HTMLAudioElement).parentNode?.appendChild(errorDiv);
                          }}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  )}
                  
                  {/* For guest users with audio available, show sign-in prompt */}
                  {q.audioUrl && user?.isGuest && (
                    <div className="mt-4 flex justify-center">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center max-w-md w-full">
                        <i className="ri-lock-line text-blue-500 mr-2"></i>
                        <span className="text-blue-700 text-sm mr-2">Sign in to access audio playback</span>
                        <Link to="/login">
                          <button className="button-press bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-full">
                            Sign In
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}