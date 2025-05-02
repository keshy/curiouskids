import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if user is not authenticated
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

  // Fetch badges for the user
  useEffect(() => {
    if (!user || user.isGuest) return;

    const fetchUserBadges = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<Badge[]>(`/api/badges`);
        setBadges(data || []);
      } catch (err) {
        console.error("Error fetching badges:", err);
        // Don't set error, just treat as empty badges
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBadges();
  }, [user]);

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

  // Get the display name for the user
  const displayName = user
    ? user.isGuest
      ? user.displayName
      : user.firebaseUser.displayName || "User"
    : "Guest";

  // Get avatar URL for authenticated users or placeholder for guests
  const avatarUrl = user?.isGuest
    ? null  // We'll use initials for guests
    : user?.firebaseUser.photoURL || null;

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!displayName) return "?";
    return displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Decorative stars */}
      {renderStars()}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex justify-between items-center bg-white p-5 rounded-xl shadow-md">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">My Profile</h1>
          <Link href="/">
            <div className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center cursor-pointer transition-all hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to BrainSpark
            </div>
          </Link>
        </div>

        {/* User profile section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-full border-4 border-indigo-100"
                />
              ) : (
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white"
                  style={{
                    background: "linear-gradient(to right, #4f46e5, #7c3aed)",
                  }}
                >
                  {getInitials()}
                </div>
              )}
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-gray-800">{displayName}</h2>
              <p className="text-gray-600">
                {user?.isGuest ? "Guest User" : "Signed in with Google"}
              </p>
            </div>
          </div>
        </div>

        {/* My Achievements Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Achievements</h2>
          
          {/* Badge Info Notice */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-indigo-800 mb-2">How to Earn Badges</h3>
            <p className="text-indigo-700 mb-3">
              BrainSpark rewards your curiosity! Here's how you can collect badges:
            </p>
            <ul className="text-indigo-700 space-y-2 pl-5 list-disc">
              <li>Ask questions about different subjects like science, math, history, or art</li>
              <li>Complete a series of questions on the same topic</li>
              <li>Use BrainSpark regularly and reach learning streaks</li>
              <li>Explore challenging topics appropriate for your age</li>
              <li>Discover special seasonal badges during holidays</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Legendary
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Epic
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Rare
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Uncommon
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Common
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
              <p>{error}</p>
            </div>
          ) : badges.length === 0 ? (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md">
              <p>You haven't earned any badges yet. Keep asking questions to earn your first badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {badges.map(badge => (
                <div key={badge.id} className="bg-gradient-to-b from-indigo-50 to-blue-50 rounded-lg p-4 flex flex-col items-center text-center border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 mb-2 flex items-center justify-center">
                    <img 
                      src={badge.imageUrl}
                      alt={badge.name}
                      className="max-w-full max-h-full"
                      onError={(e) => {
                        // Fallback for missing images
                        (e.target as HTMLImageElement).src = '/badges/default.svg';
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-gray-800">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                  <span className={`text-xs mt-1 px-2 py-1 rounded-full ${
                    badge.rarity === 'legendary' ? 'bg-amber-100 text-amber-800' :
                    badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                    badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                    badge.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {badge.rarity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User stats section - placeholder for future expansion */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Learning Stats</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <p className="text-yellow-800">Coming soon! Track your learning progress with fun statistics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}