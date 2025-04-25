import { 
  users, 
  type User, 
  type InsertUser, 
  type Question, 
  type InsertQuestion, 
  type Badge,
  type InsertBadge,
  type UserBadge,
  type Achievement,
  type InsertAchievement
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Question history
  createQuestion(question: InsertQuestion): Promise<Question>;
  getRecentQuestions(limit: number): Promise<Question[]>;
  getUserQuestions(userId: number, limit: number): Promise<Question[]>;
  
  // Badge management
  getBadges(): Promise<Badge[]>;
  getBadgeById(id: number): Promise<Badge | undefined>;
  getBadgesByCategory(category: string): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  
  // User badges (rewards)
  getUserBadges(userId: number): Promise<(UserBadge & {badge: Badge})[]>;
  awardBadgeToUser(userId: number, badgeId: number): Promise<UserBadge>;
  updateUserBadge(userId: number, badgeId: number, updates: Partial<Omit<UserBadge, 'userId' | 'badgeId'>>): Promise<UserBadge>;
  
  // Achievements
  getUserAchievements(userId: number): Promise<Achievement[]>;
  getAchievement(userId: number, name: string): Promise<Achievement | undefined>;
  createOrUpdateAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievementProgress(userId: number, name: string, progress: number): Promise<Achievement>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  private badges: Map<number, Badge>;
  private userBadges: Map<string, UserBadge>; // Composite key: userId-badgeId
  private achievements: Map<string, Achievement>; // Composite key: userId-name
  
  userCurrentId: number;
  questionCurrentId: number;
  badgeCurrentId: number;
  achievementCurrentId: number;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    this.achievements = new Map();
    
    this.userCurrentId = 1;
    this.questionCurrentId = 1;
    this.badgeCurrentId = 1;
    this.achievementCurrentId = 1;
    
    // Add some starter badges
    this.initializeDefaultBadges();
  }

  private initializeDefaultBadges() {
    // Science badges
    this.createBadge({
      name: "Science Explorer",
      description: "Asked your first science question",
      imageUrl: "/badges/science-explorer.svg",
      category: "science",
      rarity: "common",
      unlockCriteria: JSON.stringify({ type: "category_first", category: "science" })
    });
    
    this.createBadge({
      name: "Math Whiz",
      description: "Asked your first math question",
      imageUrl: "/badges/math-whiz.svg",
      category: "math",
      rarity: "common",
      unlockCriteria: JSON.stringify({ type: "category_first", category: "math" })
    });
    
    this.createBadge({
      name: "Reading Star",
      description: "Asked your first question about reading or books",
      imageUrl: "/badges/reading-star.svg",
      category: "reading",
      rarity: "common",
      unlockCriteria: JSON.stringify({ type: "category_first", category: "reading" })
    });
    
    // Milestone badges
    this.createBadge({
      name: "Curious Mind",
      description: "Asked 5 questions",
      imageUrl: "/badges/curious-mind.svg",
      category: "milestone",
      rarity: "common",
      unlockCriteria: JSON.stringify({ type: "question_count", count: 5 })
    });
    
    this.createBadge({
      name: "Knowledge Seeker",
      description: "Asked 10 questions",
      imageUrl: "/badges/knowledge-seeker.svg",
      category: "milestone",
      rarity: "uncommon",
      unlockCriteria: JSON.stringify({ type: "question_count", count: 10 })
    });
    
    this.createBadge({
      name: "Super Learner",
      description: "Asked questions from 3 different categories",
      imageUrl: "/badges/super-learner.svg",
      category: "special",
      rarity: "rare",
      unlockCriteria: JSON.stringify({ type: "category_diversity", count: 3 })
    });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Question history
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.questionCurrentId++;
    const question: Question = { 
      ...insertQuestion, 
      id,
      createdAt: new Date()
    };
    this.questions.set(id, question);
    return question;
  }
  
  async getRecentQuestions(limit: number): Promise<Question[]> {
    // Get all questions and sort by createdAt in descending order
    const allQuestions = Array.from(this.questions.values());
    const sortedQuestions = allQuestions.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Return the specified number of most recent questions
    return sortedQuestions.slice(0, limit);
  }
  
  async getUserQuestions(userId: number, limit: number): Promise<Question[]> {
    // Get all questions by this user and sort by createdAt in descending order
    const userQuestions = Array.from(this.questions.values())
      .filter(question => question.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    
    // Return the specified number of most recent questions
    return userQuestions.slice(0, limit);
  }
  
  // Badge management
  async getBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }
  
  async getBadgeById(id: number): Promise<Badge | undefined> {
    return this.badges.get(id);
  }
  
  async getBadgesByCategory(category: string): Promise<Badge[]> {
    return Array.from(this.badges.values())
      .filter(badge => badge.category === category);
  }
  
  async createBadge(badge: InsertBadge): Promise<Badge> {
    const id = this.badgeCurrentId++;
    const now = new Date();
    const newBadge: Badge = {
      ...badge,
      id,
      createdAt: now
    };
    this.badges.set(id, newBadge);
    return newBadge;
  }
  
  // User badges (rewards)
  async getUserBadges(userId: number): Promise<(UserBadge & {badge: Badge})[]> {
    // Find all user badges for this user
    const userBadgeEntries = Array.from(this.userBadges.values())
      .filter(userBadge => userBadge.userId === userId);
    
    // Join with badge data
    return userBadgeEntries.map(userBadge => {
      const badge = this.badges.get(userBadge.badgeId)!;
      return {
        ...userBadge,
        badge
      };
    });
  }
  
  async awardBadgeToUser(userId: number, badgeId: number): Promise<UserBadge> {
    const key = `${userId}-${badgeId}`;
    
    // Check if user already has this badge
    if (this.userBadges.has(key)) {
      return this.userBadges.get(key)!;
    }
    
    // Award the badge
    const now = new Date();
    const userBadge: UserBadge = {
      userId,
      badgeId,
      earnedAt: now,
      displayOrder: 0,
      favorite: false
    };
    
    this.userBadges.set(key, userBadge);
    return userBadge;
  }
  
  async updateUserBadge(
    userId: number, 
    badgeId: number, 
    updates: Partial<Omit<UserBadge, 'userId' | 'badgeId'>>
  ): Promise<UserBadge> {
    const key = `${userId}-${badgeId}`;
    
    if (!this.userBadges.has(key)) {
      throw new Error(`User ${userId} does not have badge ${badgeId}`);
    }
    
    const userBadge = this.userBadges.get(key)!;
    const updatedBadge = { ...userBadge, ...updates };
    this.userBadges.set(key, updatedBadge);
    
    return updatedBadge;
  }
  
  // Achievements
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.userId === userId);
  }
  
  async getAchievement(userId: number, name: string): Promise<Achievement | undefined> {
    const key = `${userId}-${name}`;
    return this.achievements.get(key);
  }
  
  async createOrUpdateAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const key = `${achievement.userId}-${achievement.name}`;
    
    // If it exists, update it
    if (this.achievements.has(key)) {
      const existing = this.achievements.get(key)!;
      const updated: Achievement = {
        ...existing,
        ...achievement,
        updatedAt: new Date()
      };
      
      this.achievements.set(key, updated);
      return updated;
    }
    
    // Otherwise create it
    const id = this.achievementCurrentId++;
    const now = new Date();
    const newAchievement: Achievement = {
      ...achievement,
      id,
      updatedAt: now
    };
    
    this.achievements.set(key, newAchievement);
    return newAchievement;
  }
  
  async updateAchievementProgress(userId: number, name: string, progress: number): Promise<Achievement> {
    const key = `${userId}-${name}`;
    
    if (!this.achievements.has(key)) {
      throw new Error(`Achievement ${name} for user ${userId} not found`);
    }
    
    const achievement = this.achievements.get(key)!;
    const completed = progress >= achievement.goal;
    
    const updated: Achievement = {
      ...achievement,
      progress,
      completed,
      updatedAt: new Date().toISOString()
    };
    
    this.achievements.set(key, updated);
    return updated;
  }
}

export const storage = new MemStorage();
