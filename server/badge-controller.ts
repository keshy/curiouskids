import { Badge, Question } from '@shared/schema';
import { storage } from './storage';

/**
 * Check if a user qualifies for any badges based on their recent activities
 * and award them if criteria are met.
 */
export async function checkAndAwardBadges(userId: number, question: Question): Promise<Badge | null> {
  if (!userId) return null;
  
  try {
    // Get user's current badges
    const userBadges = await storage.getUserBadges(userId);
    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
    
    // Get all available badges
    const allBadges = await storage.getBadges();
    
    // Get user's question history
    const userQuestions = await storage.getUserQuestions(userId, 100);
    
    // Find badges that the user doesn't have yet
    const unearnedBadges = allBadges.filter(badge => !earnedBadgeIds.has(badge.id));
    
    for (const badge of unearnedBadges) {
      const unlockCriteria = JSON.parse(badge.unlockCriteria);
      
      // Check if badge requirements are met
      if (await checkBadgeCriteria(unlockCriteria, userId, userQuestions, question)) {
        // Award the badge
        await storage.awardBadgeToUser(userId, badge.id);
        return badge;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking badges:', error);
    return null;
  }
}

/**
 * Check if a specific badge criteria is met
 */
async function checkBadgeCriteria(
  criteria: any, 
  userId: number, 
  userQuestions: Question[],
  currentQuestion: Question
): Promise<boolean> {
  switch (criteria.type) {
    case 'question_count':
      // Award based on number of questions asked
      return userQuestions.length >= criteria.count;
      
    case 'category_first':
      // Award for first question in a specific category
      // This would require understanding the question context, which OpenAI could help with
      // As a simple implementation, we'll use a keyword match
      return isQuestionAboutCategory(currentQuestion, criteria.category) && 
        !userQuestions.slice(0, -1).some(q => isQuestionAboutCategory(q, criteria.category));
      
    case 'category_diversity':
      // Award for asking questions in different categories
      const categories = new Set<string>();
      
      // Add the current question's potential category
      const currentCategory = getCategoryFromQuestion(currentQuestion);
      if (currentCategory) categories.add(currentCategory);
      
      // Check previous questions
      for (const question of userQuestions.slice(0, -1)) {
        const category = getCategoryFromQuestion(question);
        if (category) categories.add(category);
        
        // Check if we've reached the criteria
        if (categories.size >= criteria.count) {
          return true;
        }
      }
      
      return categories.size >= criteria.count;
      
    default:
      return false;
  }
}

/**
 * Determine if a question is about a specific category
 * This is a simplified implementation - in a real app,
 * you would use OpenAI or a more sophisticated classifier
 */
function isQuestionAboutCategory(question: Question, category: string): boolean {
  const questionText = question.question.toLowerCase();
  
  switch (category.toLowerCase()) {
    case 'science':
      return /science|experiment|scientist|chemistry|physics|biology|nature|animal|plant|space|planet|star|solar|universe|atom|molecule|element|chemical|energy|force|gravity|light|sound|weather|climate|earth|environment|ecosystem/.test(questionText);
      
    case 'math':
      return /math|mathematics|number|add|subtract|multiply|divide|count|calculation|equation|algebra|geometry|shape|triangle|circle|square|rectangle|fraction|decimal|percent|statistics|probability|graph|chart|measurement|unit|meter|gram|liter|time|clock|hour|minute|second|money|dollar|cent/.test(questionText);
      
    case 'reading':
      return /read|book|story|author|character|word|sentence|paragraph|chapter|novel|poem|poetry|write|writing|alphabet|letter|vowel|consonant|spelling|grammar|punctuation|dictionary|library/.test(questionText);
      
    case 'history':
      return /history|past|ancient|old|civilization|country|nation|war|battle|king|queen|president|leader|government|artifact|museum|archaeology|timeline|date|century|decade|year/.test(questionText);
      
    case 'geography':
      return /geography|map|world|country|city|state|province|continent|ocean|sea|river|lake|mountain|valley|desert|forest|jungle|island|location|direction|north|south|east|west|travel|explore/.test(questionText);
      
    default:
      return false;
  }
}

/**
 * Determine the category of a question
 * Returns undefined if no clear category is detected
 */
function getCategoryFromQuestion(question: Question): string | undefined {
  const categories = [
    'science', 'math', 'reading', 'history', 'geography',
    'art', 'music', 'sports'
  ];
  
  for (const category of categories) {
    if (isQuestionAboutCategory(question, category)) {
      return category;
    }
  }
  
  return undefined;
}