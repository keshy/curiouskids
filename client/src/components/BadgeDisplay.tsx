import React from 'react';
import { Badge, BadgeRarity } from '@shared/schema';

// Helper function to get badge image URL with fallbacks
const getBadgeImageUrl = (badge: Badge): string => {
  // Special mapping for milestone and special badges
  if (badge.category === 'milestone' || badge.category === 'special') {
    const imageName = badge.name.toLowerCase().replace(/\s+/g, '-');
    return `/badges/${imageName}.svg`;
  }
  
  // For category badges like science, math, reading, etc.
  if (badge.category) {
    // Try to use the category-specific image name pattern
    if (badge.category === 'science') return '/badges/science-explorer.svg';
    if (badge.category === 'math') return '/badges/math-whiz.svg';
    if (badge.category === 'reading') return '/badges/reading-star.svg';
    
    // Fallback to just the category name
    return `/badges/${badge.category}.svg`;
  }
  
  // Default fallback
  return '/badges/default.svg';
};

interface BadgeItemProps {
  badge: Badge;
  earned?: boolean;
  onSelect?: (badge: Badge) => void;
}

// Component for individual badge display
const BadgeItem = ({ badge, earned = false, onSelect }: BadgeItemProps) => {
  // Different styles based on badge rarity
  const rarityStyles = {
    common: "bg-gray-100 border-gray-300",
    uncommon: "bg-green-100 border-green-300",
    rare: "bg-blue-100 border-blue-400",
    epic: "bg-purple-100 border-purple-400",
    legendary: "bg-yellow-100 border-yellow-400"
  };

  const rarityGlow = {
    common: "",
    uncommon: "shadow-sm shadow-green-200", 
    rare: "shadow-md shadow-blue-300",
    epic: "shadow-lg shadow-purple-300",
    legendary: "shadow-xl shadow-yellow-300 animate-pulse"
  };

  const style = rarityStyles[badge.rarity as keyof typeof rarityStyles] || rarityStyles.common;
  const glow = rarityGlow[badge.rarity as keyof typeof rarityGlow] || "";
  
  return (
    <div 
      className={`relative rounded-full p-1 ${style} ${glow} transition-all duration-200 transform hover:scale-105 cursor-pointer border-2`}
      onClick={() => onSelect && onSelect(badge)}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden relative">
        {/* Badge Image */}
        <img 
          src={getBadgeImageUrl(badge)}
          alt={badge.name} 
          className={`w-full h-full object-cover ${earned ? 'opacity-100' : 'opacity-40 grayscale'}`}
          onError={(e) => {
            console.log(`Badge image failed to load: ${badge.name} (${badge.category})`);
            (e.target as HTMLImageElement).src = '/badges/default.svg';
          }}
        />
        
        {/* Lock icon for unearned badges */}
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-white opacity-80" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
        )}
      </div>

      {/* Badge Name Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {badge.name}
      </div>
    </div>
  );
};

interface BadgeDisplayProps {
  earnedBadges: Badge[];
  availableBadges?: Badge[];
  onSelectBadge?: (badge: Badge) => void;
}

// Component for displaying badge collection
export default function BadgeDisplay({ 
  earnedBadges, 
  availableBadges = [], 
  onSelectBadge 
}: BadgeDisplayProps) {
  const earnedBadgeIds = new Set(earnedBadges.map(badge => badge.id));
  
  // Combine earned and available badges, marking which ones are earned
  const allBadges = [
    ...earnedBadges,
    ...availableBadges.filter(badge => !earnedBadgeIds.has(badge.id))
  ];
  
  return (
    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl p-6 border-2 border-indigo-200 shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4 text-primary">My Badge Collection</h2>
      
      {earnedBadges.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">You haven't earned any badges yet. Keep learning to collect them all!</p>
        </div>
      ) : (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-purple-700">Badges Earned: {earnedBadges.length}</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {earnedBadges.map(badge => (
              <BadgeItem 
                key={`earned-${badge.id}`} 
                badge={badge} 
                earned={true}
                onSelect={onSelectBadge}
              />
            ))}
          </div>
        </div>
      )}
      
      {availableBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-purple-700">Badges to Discover</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {availableBadges
              .filter(badge => !earnedBadgeIds.has(badge.id))
              .map(badge => (
                <BadgeItem 
                  key={`available-${badge.id}`} 
                  badge={badge} 
                  earned={false}
                  onSelect={onSelectBadge}
                />
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}