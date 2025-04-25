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

  // Redirect to login if user is not authenticated or is a guest
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (user.isGuest) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Fetch user's questions on component mount
  useEffect(() => {
    if (!user || user.isGuest) return; // Don't fetch if not logged in
    
    const fetchUserQuestions = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<Question[]>(`/api/questions/user`);
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching question history:", err);
        setError("Failed to load your question history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserQuestions();
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
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-md">
            <p>No questions have been asked yet. Go back and ask BrainSpark something!</p>
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
                  
                  {q.audioUrl && (
                    <div className="mt-4 flex justify-center">
                      <audio 
                        controls 
                        src={q.audioUrl}
                        className="w-full max-w-md" 
                      >
                        Your browser does not support the audio element.
                      </audio>
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