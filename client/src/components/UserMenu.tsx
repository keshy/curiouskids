import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
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

  // Display name and avatar for both guest and authenticated users
  const displayName = user
    ? user.isGuest
      ? user.displayName
      : user.firebaseUser.displayName || "User"
    : "Guest";

  // Avatar URL for authenticated users or placeholder for guests
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

  // Fetch user badges when user is logged in
  useEffect(() => {
    if (!user || user.isGuest) {
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
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
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
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 to-pink-50 shadow-lg border border-indigo-200 z-50">
          <div className="p-4 border-b border-indigo-100">
            <p className="font-bold text-primary">{displayName}</p>
            <p className="text-sm text-gray-600">
              {user?.isGuest ? "Guest Account" : "Signed in with Google"}
            </p>
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