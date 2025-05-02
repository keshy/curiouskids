import React, { useState, useEffect } from 'react';
import { Badge } from '@shared/schema';

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

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
  autoCloseTime?: number; // Time in milliseconds before auto-closing
}

export default function BadgeNotification({ 
  badge, 
  onClose, 
  autoCloseTime = 5000 
}: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation states
  useEffect(() => {
    // Start entrance animation
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Auto-close after specified time
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Allow exit animation to complete
    }, autoCloseTime);
    
    return () => clearTimeout(timer);
  }, [autoCloseTime, onClose]);
  
  // Get colors based on badge rarity
  const getColors = () => {
    switch (badge.rarity) {
      case 'legendary':
        return {
          bg: 'from-yellow-300 to-amber-500',
          border: 'border-amber-600',
          text: 'text-amber-900',
          shadow: 'shadow-amber-300'
        };
      case 'epic':
        return {
          bg: 'from-purple-300 to-indigo-500',
          border: 'border-purple-600',
          text: 'text-white',
          shadow: 'shadow-purple-300'
        };
      case 'rare':
        return {
          bg: 'from-blue-300 to-cyan-500',
          border: 'border-blue-600',
          text: 'text-white',
          shadow: 'shadow-blue-300'
        };
      case 'uncommon':
        return {
          bg: 'from-green-300 to-emerald-500',
          border: 'border-green-600',
          text: 'text-white',
          shadow: 'shadow-green-300'
        };
      default:
        return {
          bg: 'from-gray-200 to-gray-400',
          border: 'border-gray-500',
          text: 'text-gray-800',
          shadow: 'shadow-gray-300'
        };
    }
  };
  
  const colors = getColors();
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className={`
          max-w-md w-full mx-4 rounded-2xl overflow-hidden border-4 ${colors.border} 
          transform transition-all duration-500 shadow-lg ${colors.shadow}
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          pointer-events-auto
        `}
      >
        <div className={`bg-gradient-to-r ${colors.bg} p-4`}>
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              <div className="w-16 h-16 rounded-full bg-white/80 p-1 flex items-center justify-center">
                <img 
                  src={getBadgeImageUrl(badge)} 
                  alt={badge.name} 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    console.log(`Badge image failed to load: ${badge.name} (${badge.category})`);
                    // Fallback for missing images
                    (e.target as HTMLImageElement).src = '/badges/default.svg';
                  }}
                />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-bold ${colors.text} text-lg`}>New Badge Earned!</h3>
                  <p className={`${colors.text} font-semibold text-lg`}>{badge.name}</p>
                  <p className={`${colors.text} opacity-90`}>{badge.description}</p>
                </div>
                
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 500);
                  }}
                  className={`${colors.text} opacity-70 hover:opacity-100 transition-opacity`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Confetti animation elements */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: getRandomColor(),
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Animation styles are in index.css */}
    </div>
  );
}

// Helper function to generate random colors for confetti
function getRandomColor() {
  const colors = [
    '#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93',
    '#ff7b00', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}