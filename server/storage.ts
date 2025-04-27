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
  type InsertAchievement,
  questions as questionsTable, 
  users as usersTable,
  badges as badgesTable,
  userBadges as userBadgesTable,
  achievements as achievementsTable
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Question history
  createQuestion(question: InsertQuestion): Promise<Question>;
  getRecentQuestions(limit: number): Promise<Question[]>;
  getUserQuestions(userId: number, limit: number): Promise<Question[]>;
  getGuestQuestions(guestId: string, limit: number): Promise<Question[]>;
  
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

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
    return user || undefined;
  }
  
  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.firebaseId, firebaseId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(usersTable)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Question history
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db
      .insert(questionsTable)
      .values(insertQuestion)
      .returning();
    return question;
  }
  
  async getRecentQuestions(limit: number): Promise<Question[]> {
    return await db
      .select()
      .from(questionsTable)
      .orderBy(desc(questionsTable.createdAt))
      .limit(limit);
  }
  
  async getUserQuestions(userId: number, limit: number): Promise<Question[]> {
    return await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.userId, userId))
      .orderBy(desc(questionsTable.createdAt))
      .limit(limit);
  }
  
  async getGuestQuestions(guestId: string, limit: number): Promise<Question[]> {
    return await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.guestId, guestId))
      .orderBy(desc(questionsTable.createdAt))
      .limit(limit);
  }
  
  // Badge management
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badgesTable);
  }
  
  async getBadgeById(id: number): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badgesTable).where(eq(badgesTable.id, id));
    return badge || undefined;
  }
  
  async getBadgesByCategory(category: string): Promise<Badge[]> {
    return await db
      .select()
      .from(badgesTable)
      .where(eq(badgesTable.category, category));
  }
  
  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db
      .insert(badgesTable)
      .values(badge)
      .returning();
    return newBadge;
  }
  
  // User badges (rewards)
  async getUserBadges(userId: number): Promise<(UserBadge & {badge: Badge})[]> {
    // We need to fetch user badges and join with badge data
    const userBadgesWithBadges = await db
      .select({
        userId: userBadgesTable.userId,
        badgeId: userBadgesTable.badgeId,
        earnedAt: userBadgesTable.earnedAt,
        displayOrder: userBadgesTable.displayOrder,
        favorite: userBadgesTable.favorite
      })
      .from(userBadgesTable)
      .where(eq(userBadgesTable.userId, userId));
    
    // Fetch all badges in one go
    const badges = await db.select().from(badgesTable);
    const badgesMap = new Map(badges.map(badge => [badge.id, badge]));
    
    // Join the data manually to ensure proper typing
    return userBadgesWithBadges.map(userBadge => {
      const badge = badgesMap.get(userBadge.badgeId)!;
      return {
        ...userBadge,
        badge
      };
    });
  }
  
  async awardBadgeToUser(userId: number, badgeId: number): Promise<UserBadge> {
    try {
      // Check if user already has this badge
      const [existingBadge] = await db
        .select()
        .from(userBadgesTable)
        .where(
          and(
            eq(userBadgesTable.userId, userId),
            eq(userBadgesTable.badgeId, badgeId)
          )
        );
      
      if (existingBadge) {
        return existingBadge;
      }
      
      // Award the badge
      const [userBadge] = await db
        .insert(userBadgesTable)
        .values({
          userId,
          badgeId,
          displayOrder: 0,
          favorite: false
        })
        .returning();
      
      return userBadge;
    } catch (error) {
      console.error("Error awarding badge:", error);
      throw error;
    }
  }
  
  async updateUserBadge(
    userId: number, 
    badgeId: number, 
    updates: Partial<Omit<UserBadge, 'userId' | 'badgeId'>>
  ): Promise<UserBadge> {
    // Check if badge exists for user
    const [existingBadge] = await db
      .select()
      .from(userBadgesTable)
      .where(
        and(
          eq(userBadgesTable.userId, userId),
          eq(userBadgesTable.badgeId, badgeId)
        )
      );
    
    if (!existingBadge) {
      throw new Error(`User ${userId} does not have badge ${badgeId}`);
    }
    
    // Update the user badge
    const [updatedBadge] = await db
      .update(userBadgesTable)
      .set(updates)
      .where(
        and(
          eq(userBadgesTable.userId, userId),
          eq(userBadgesTable.badgeId, badgeId)
        )
      )
      .returning();
    
    return updatedBadge;
  }
  
  // Achievements
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievementsTable)
      .where(eq(achievementsTable.userId, userId));
  }
  
  async getAchievement(userId: number, name: string): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievementsTable)
      .where(
        and(
          eq(achievementsTable.userId, userId),
          eq(achievementsTable.name, name)
        )
      );
    
    return achievement || undefined;
  }
  
  async createOrUpdateAchievement(achievement: InsertAchievement): Promise<Achievement> {
    // Check if achievement already exists
    const existingAchievement = await this.getAchievement(achievement.userId, achievement.name);
    
    if (existingAchievement) {
      // Update existing achievement
      const [updated] = await db
        .update(achievementsTable)
        .set({
          ...achievement,
          updatedAt: new Date()
        })
        .where(eq(achievementsTable.id, existingAchievement.id))
        .returning();
      
      return updated;
    }
    
    // Create new achievement
    const [newAchievement] = await db
      .insert(achievementsTable)
      .values(achievement)
      .returning();
    
    return newAchievement;
  }
  
  async updateAchievementProgress(userId: number, name: string, progress: number): Promise<Achievement> {
    // Get the achievement
    const existingAchievement = await this.getAchievement(userId, name);
    
    if (!existingAchievement) {
      throw new Error(`Achievement ${name} for user ${userId} not found`);
    }
    
    // Determine if completed
    const completed = progress >= existingAchievement.goal;
    
    // Update progress
    const [updated] = await db
      .update(achievementsTable)
      .set({
        progress,
        completed,
        updatedAt: new Date()
      })
      .where(eq(achievementsTable.id, existingAchievement.id))
      .returning();
    
    return updated;
  }
}

// Define default badges to initialize the database
async function initializeDefaultBadges(storage: DatabaseStorage) {
  console.log("Checking for default badges...");
  const existingBadges = await storage.getBadges();
  
  // If we already have badges, no need to create more
  if (existingBadges.length > 0) {
    console.log(`Found ${existingBadges.length} existing badges, skipping initialization.`);
    return;
  }
  
  console.log("Initializing default badges...");
  
  // Create science badge
  await storage.createBadge({
    name: "Science Explorer",
    description: "Asked your first science question",
    imageUrl: "/badges/science-explorer.svg",
    category: "science",
    rarity: "common",
    unlockCriteria: JSON.stringify({ type: "category_first", category: "science" })
  });
  
  // Create math badge
  await storage.createBadge({
    name: "Math Whiz",
    description: "Asked your first math question",
    imageUrl: "/badges/math-whiz.svg",
    category: "math",
    rarity: "common",
    unlockCriteria: JSON.stringify({ type: "category_first", category: "math" })
  });
  
  // Create reading badge
  await storage.createBadge({
    name: "Reading Star",
    description: "Asked your first question about reading or books",
    imageUrl: "/badges/reading-star.svg",
    category: "reading",
    rarity: "common",
    unlockCriteria: JSON.stringify({ type: "category_first", category: "reading" })
  });
  
  // Create milestone badges
  await storage.createBadge({
    name: "Curious Mind",
    description: "Asked 5 questions",
    imageUrl: "/badges/curious-mind.svg",
    category: "milestone",
    rarity: "common",
    unlockCriteria: JSON.stringify({ type: "question_count", count: 5 })
  });
  
  await storage.createBadge({
    name: "Knowledge Seeker",
    description: "Asked 10 questions",
    imageUrl: "/badges/knowledge-seeker.svg",
    category: "milestone",
    rarity: "uncommon",
    unlockCriteria: JSON.stringify({ type: "question_count", count: 10 })
  });
  
  await storage.createBadge({
    name: "Super Learner",
    description: "Asked questions from 3 different categories",
    imageUrl: "/badges/super-learner.svg",
    category: "special",
    rarity: "rare",
    unlockCriteria: JSON.stringify({ type: "category_diversity", count: 3 })
  });
  
  console.log("Default badges initialized successfully.");
}

// Use the database storage implementation
export const storage = new DatabaseStorage();

// Initialize default badges when the server starts
initializeDefaultBadges(storage as DatabaseStorage).catch(error => {
  console.error("Error initializing default badges:", error);
});