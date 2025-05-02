import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@shared/schema';

interface BadgesResponse {
  earnedBadges: Badge[];
  availableBadges: Badge[];
}

export default function EarnedBadgesDisplay() {
  const { user } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!user || user.isGuest) {
      setEarnedBadges([]);
      setLoading(false);
      return;
    }
    
    const fetchUserBadges = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<BadgesResponse>(`/api/badges`);
        console.log("Badge data received:", data);
        
        if (data && Array.isArray(data.earnedBadges)) {
          console.log("Earned badges:", data.earnedBadges);
          setEarnedBadges(data.earnedBadges);
        } else {
          console.warn("Unexpected badge data format:", data);
          setEarnedBadges([]);
        }
      } catch (err) {
        console.error("Error fetching badges:", err);
        setEarnedBadges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBadges();
  }, [user]);
  
  // Hide the badges section if user is guest or has no badges
  useEffect(() => {
    if (!user) {
      setIsVisible(false);
      return;
    }
    
    setIsVisible(!user.isGuest && earnedBadges.length > 0);
  }, [user, earnedBadges]);
  
  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-100 p-4 rounded-2xl mb-6 shadow-md border border-indigo-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-indigo-800">Your Collection</h2>
        <Link href="/profile">
          <button className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-full hover:bg-indigo-600 transition-colors">
            View All
          </button>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : earnedBadges.length > 0 ? (
        <div className="flex overflow-x-auto py-2 space-x-3 pb-2">
          {earnedBadges.map((badge) => (
            <div 
              key={badge.id}
              className="flex-shrink-0 flex flex-col items-center w-16"
              title={badge.description}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden mb-1 group hover:scale-110 transition-transform">
                <img 
                  src={badge.imageUrl || `/badges/${badge.category.replace(/-/g, '_')}.svg`} 
                  alt={badge.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Try the category name with underscore if imageUrl fails
                    if (badge.category) {
                      (e.target as HTMLImageElement).src = `/badges/${badge.category.replace(/-/g, '_')}.svg`;
                    } else {
                      // Final fallback
                      (e.target as HTMLImageElement).src = '/badges/default.svg';
                    }
                  }}
                />
              </div>
              <span className="text-xs text-center truncate w-full">{badge.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 text-sm text-indigo-600">
          You haven't earned any badges yet. Keep asking questions!
        </div>
      )}
    </div>
  );
}