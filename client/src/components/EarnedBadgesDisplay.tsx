import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { getBadgeImageUrl } from '@/lib/badgeUtils';
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

  // We won't render this component at all now
  return null;
}