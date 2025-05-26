import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@shared/schema";
import { getBadgeImageUrl } from "@/lib/badgeUtils";

interface BadgesResponse {
  earnedBadges: Badge[];
  availableBadges: Badge[];
}

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [showBadgeTooltip, setShowBadgeTooltip] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Display name and avatar for authenticated users
  const displayName = user?.firebaseUser.displayName || user?.displayName || "User";

  // Avatar URL for authenticated users
  const avatarUrl = user?.firebaseUser.photoURL || null;

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

  // Fetch user badges when user is logged in
  useEffect(() => {
    if (!user) {
      setEarnedBadges([]);
      return;
    }
    
    const fetchUserBadges = async () => {
      try {
        const data = await apiRequest<BadgesResponse>(`/api/badges`);
        
        if (data && Array.isArray(data.earnedBadges)) {
          setEarnedBadges(data.earnedBadges);
        } else {
          setEarnedBadges([]);
        }
      } catch (err) {
        console.error("Error fetching badges for user menu:", err);
        setEarnedBadges([]);
      }
    };

    fetchUserBadges();
  }, [user]);
  
  // Handle clicking outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setShowBadgeTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
    setLocation("/login");
  };

  // Handle upgrade account (for guests)
  const handleUpgrade = () => {
    setIsMenuOpen(false);
    setLocation("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar & Button */}
      <div className="relative group">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          onMouseEnter={() => !user?.isGuest && earnedBadges.length > 0 && setShowBadgeTooltip(true)}
          onMouseLeave={() => setShowBadgeTooltip(false)}
          className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:shadow-md"
          style={{
            background: user?.isGuest
              ? "linear-gradient(to right, #f59e0b, #d97706)"
              : "linear-gradient(to right, #4f46e5, #7c3aed)",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <span className="text-white font-bold">{getInitials()}</span>
          )}
          
          {/* Badge indicator dot for authenticated users with badges */}
          {!user?.isGuest && earnedBadges.length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center">
              <span className="text-[9px] font-bold text-yellow-800">{earnedBadges.length}</span>
            </div>
          )}
        </button>
        
        {/* Badge tooltip */}
        {!user?.isGuest && earnedBadges.length > 0 && showBadgeTooltip && (
          <div className="absolute top-full right-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-64">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Your Achievements ({earnedBadges.length})</h3>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.slice(0, 6).map((badge) => (
                <div 
                  key={badge.id}
                  className="group relative"
                  title={badge.description}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <img 
                      src={getBadgeImageUrl(badge)}
                      alt={badge.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/badges/default.svg';
                      }}
                    />
                  </div>
                </div>
              ))}
              {earnedBadges.length > 6 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 border border-gray-200">
                  +{earnedBadges.length - 6}
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-right">
              <Link 
                href="/profile"
                className="text-primary hover:underline"
                onClick={() => setShowBadgeTooltip(false)}
              >
                View all in profile →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-pink-50 shadow-lg border border-indigo-200 z-50">
          <div className="p-4 border-b border-indigo-100">
            <p className="font-bold text-primary">{displayName}</p>
            <p className="text-sm text-gray-600">
              {user?.isGuest ? "Guest Account" : "Signed in with Google"}
            </p>
            {!user?.isGuest && earnedBadges.length > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <span className="text-xs text-indigo-600 font-medium">
                  {earnedBadges.length} Badge{earnedBadges.length !== 1 ? 's' : ''} earned
                </span>
                <div className="flex -space-x-1.5">
                  {earnedBadges.slice(0, 3).map((badge) => (
                    <div 
                      key={badge.id}
                      className="w-5 h-5 rounded-full border border-white"
                      title={badge.name}
                    >
                      <img 
                        src={getBadgeImageUrl(badge)}
                        alt={badge.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/badges/default.svg';
                        }}
                      />
                    </div>
                  ))}
                  {earnedBadges.length > 3 && (
                    <div className="w-5 h-5 rounded-full bg-indigo-100 border border-white flex items-center justify-center">
                      <span className="text-[8px] font-bold text-indigo-800">+{earnedBadges.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-2">
            {user?.isGuest ? (
              <>
                <button
                  onClick={handleUpgrade}
                  className="flex items-center w-full px-4 py-2 text-sm text-left rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <span className="mr-2">⭐</span>
                  <span>Upgrade your account</span>
                </button>
                <div className="px-4 py-2 bg-yellow-50 rounded-lg my-2 border border-yellow-200">
                  <p className="text-xs text-gray-700">
                    Sign in with Google to save your progress and unlock more features!
                  </p>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setLocation("/profile");
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-left rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <span className="mr-2">👤</span>
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setLocation("/settings");
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-left rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <span className="mr-2">⚙️</span>
                  <span>Settings</span>
                </button>
              </>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-left rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <span className="mr-2">🚪</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}