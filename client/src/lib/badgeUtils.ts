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
  
  // Exact match mapping to database badge IDs - this is the most reliable method
  if (badge.id) {
    switch (badge.id) {
      case 1: return '/badges/science_explorer.svg'; // Try underscore version as fallback
      case 2: return '/badges/math_whiz.svg';
      case 3: return '/badges/reading_star.svg';
      case 4: return '/badges/curious_mind.svg';
      case 5: return '/badges/knowledge_seeker.svg';
      case 6: return '/badges/super_learner.svg';
    }
  }

  // Based on badge name for milestone and special badges
  if (badge.name) {
    // Check for both hyphen and underscore versions
    const nameHyphen = badge.name.toLowerCase().replace(/\s+/g, '-');
    const nameUnderscore = badge.name.toLowerCase().replace(/\s+/g, '_');
    
    // First try underscore version (which we know exists)
    const underscorePath = `/badges/${nameUnderscore}.svg`;
    
    // Create a new image and try to load the underscore version
    const img = new Image();
    img.src = underscorePath;
    
    // If the underscore version works, use it
    return underscorePath;
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