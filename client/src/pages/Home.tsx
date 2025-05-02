import { useState, useEffect } from "react";
import AskMeBuddy from "@/components/AskMeBuddy";
import EarnedBadgesDisplay from "@/components/EarnedBadgesDisplay";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [showBadges, setShowBadges] = useState(false);
  
  // Only show badges for authenticated users after a short delay
  // to avoid layout shifts during loading
  useEffect(() => {
    if (user && !user.isGuest) {
      const timer = setTimeout(() => {
        setShowBadges(true);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setShowBadges(false);
    }
  }, [user]);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {showBadges && <EarnedBadgesDisplay />}
      <AskMeBuddy />
    </div>
  );
}
