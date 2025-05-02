import { Badge } from '@shared/schema';

/**
 * Helper function to get the URL of a badge image with proper fallbacks
 * Uses multiple strategies to find the correct badge image
 */
export const getBadgeImageUrl = (badge: Badge): string => {
  // Check if the badge has an imageUrl property that's not empty
  if (badge.imageUrl && badge.imageUrl.trim().length > 0) {
    return badge.imageUrl;
  }
  
  // Exact match mapping to database badge IDs
  if (badge.id) {
    switch (badge.id) {
      case 1: return '/badges/science-explorer.svg';
      case 2: return '/badges/math-whiz.svg';
      case 3: return '/badges/reading-star.svg';
      case 4: return '/badges/curious-mind.svg';
      case 5: return '/badges/knowledge-seeker.svg';
      case 6: return '/badges/super-learner.svg';
    }
  }

  // Based on badge name for milestone and special badges
  if (badge.name) {
    const nameLower = badge.name.toLowerCase().replace(/\s+/g, '-');
    return `/badges/${nameLower}.svg`;
  }
  
  // Category-based fallback
  if (badge.category) {
    // If it's a standard category, use the plain category name
    if (['science', 'math', 'reading', 'history', 'geography', 'art'].includes(badge.category)) {
      return `/badges/${badge.category}.svg`;
    }
    
    // Otherwise try with the category name
    return `/badges/${badge.category}.svg`;
  }
  
  // Default fallback
  return '/badges/default.svg';
};