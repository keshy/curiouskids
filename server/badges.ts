import { Badge, Question, User } from '@shared/schema';
import { storage } from './storage';

// Categories for question classification
type QuestionCategory = 'science' | 'math' | 'reading' | 'history' | 'geography' | 'art' | 'music' | 'sports' | 'general';

// Interface for badge check results
interface BadgeCheckResult {
  badgeEarned?: Badge;
}

// Helper function to classify a question into a category based on keywords
function classifyQuestion(question: string): QuestionCategory {
  const lowerQuestion = question.toLowerCase();
  
  // Simple keyword classification
  if (lowerQuestion.match(/science|scientist|experiment|chemistry|physics|biology|atom|molecule|energy|force|gravity|magnet/)) {
    return 'science';
  }
  if (lowerQuestion.match(/math|mathematics|number|add|subtract|multiply|divide|equation|geometry|algebra|calculation|count|shape|triangle|circle|square/)) {
    return 'math';
  }
  if (lowerQuestion.match(/read|book|story|author|word|letter|alphabet|write|writing|poem|character|novel/)) {
    return 'reading';
  }
  if (lowerQuestion.match(/history|historical|ancient|king|queen|emperor|war|country|nation|president|past|timeline/)) {
    return 'history';
  }
  if (lowerQuestion.match(/geography|map|country|city|ocean|river|mountain|earth|planet|continent|world/)) {
    return 'geography';
  }
  if (lowerQuestion.match(/art|draw|paint|color|artist|picture|sculpture|design|create/)) {
    return 'art';
  }
  if (lowerQuestion.match(/music|song|sing|instrument|note|rhythm|melody|piano|guitar|drum|musician/)) {
    return 'music';
  }
  if (lowerQuestion.match(/sport|game|play|ball|team|win|athlete|exercise|run|jump|swim|race/)) {
    return 'sports';
  }
  
  // Default category
  return 'general';
}

// Check if a user qualifies for a new badge
export async function checkForBadges(userId: number, question: Question): Promise<BadgeCheckResult> {
  // First get the user
  const user = await storage.getUser(userId);
  if (!user) {
    return {};
  }
  
  // Get user's existing badges
  const userBadges = await storage.getUserBadges(userId);
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
  
  // Get all badges
  const allBadges = await storage.getBadges();
  
  // Get user's questions history (including the current one)
  const userQuestions = await storage.getUserQuestions(userId, 100);
  
  // Check for category first badges (first question in a specific category)
  const category = classifyQuestion(question.question);
  const categoryFirstBadges = allBadges.filter(badge => {
    try {
      const criteria = JSON.parse(badge.unlockCriteria);
      return criteria.type === 'category_first' && criteria.category === category;
    } catch (e) {
      return false;
    }
  });
  
  // If user has asked their first question in this category, award the badge
  const isFirstInCategory = categoryFirstBadges.length > 0 && 
    userQuestions.filter(q => classifyQuestion(q.question) === category).length === 1;
  
  if (isFirstInCategory) {
    const badgeToAward = categoryFirstBadges[0];
    if (badgeToAward && !earnedBadgeIds.has(badgeToAward.id)) {
      await storage.awardBadgeToUser(userId, badgeToAward.id);
      return { badgeEarned: badgeToAward };
    }
  }
  
  // Check for question count badges
  const questionCountBadges = allBadges.filter(badge => {
    try {
      const criteria = JSON.parse(badge.unlockCriteria);
      return criteria.type === 'question_count';
    } catch (e) {
      return false;
    }
  }).sort((a, b) => {
    // Sort by count in descending order
    try {
      const criteriaA = JSON.parse(a.unlockCriteria);
      const criteriaB = JSON.parse(b.unlockCriteria);
      return criteriaB.count - criteriaA.count;
    } catch (e) {
      return 0;
    }
  });
  
  // Check if user qualifies for any question count badges
  for (const badge of questionCountBadges) {
    if (earnedBadgeIds.has(badge.id)) {
      continue; // Already earned this badge
    }
    
    try {
      const criteria = JSON.parse(badge.unlockCriteria);
      if (userQuestions.length >= criteria.count) {
        await storage.awardBadgeToUser(userId, badge.id);
        return { badgeEarned: badge };
      }
    } catch (e) {
      continue;
    }
  }
  
  // Check for category diversity badges
  const categoryDiversityBadges = allBadges.filter(badge => {
    try {
      const criteria = JSON.parse(badge.unlockCriteria);
      return criteria.type === 'category_diversity';
    } catch (e) {
      return false;
    }
  }).sort((a, b) => {
    // Sort by count in descending order
    try {
      const criteriaA = JSON.parse(a.unlockCriteria);
      const criteriaB = JSON.parse(b.unlockCriteria);
      return criteriaB.count - criteriaA.count;
    } catch (e) {
      return 0;
    }
  });
  
  // Check if user qualifies for any category diversity badges
  const uniqueCategories = new Set(userQuestions.map(q => classifyQuestion(q.question)));
  
  for (const badge of categoryDiversityBadges) {
    if (earnedBadgeIds.has(badge.id)) {
      continue; // Already earned this badge
    }
    
    try {
      const criteria = JSON.parse(badge.unlockCriteria);
      if (uniqueCategories.size >= criteria.count) {
        await storage.awardBadgeToUser(userId, badge.id);
        return { badgeEarned: badge };
      }
    } catch (e) {
      continue;
    }
  }
  
  // No badges earned this time
  return {};
}

// Get a user's badge collection
export async function getUserBadges(userId: number) {
  // Get the user's earned badges
  const userBadges = await storage.getUserBadges(userId);
  
  // Get all available badges
  const allBadges = await storage.getBadges();
  
  // Extract just the badge data from userBadges
  const earnedBadges = userBadges.map(ub => ub.badge);
  
  // Return both earned and available badges
  return {
    earnedBadges,
    availableBadges: allBadges.filter(badge => 
      !earnedBadges.some(eb => eb.id === badge.id)
    )
  };
}