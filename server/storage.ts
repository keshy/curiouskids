import { users, type User, type InsertUser, type Question, type InsertQuestion } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getRecentQuestions(limit: number): Promise<Question[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  userCurrentId: number;
  questionCurrentId: number;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.userCurrentId = 1;
    this.questionCurrentId = 1;
  }

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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.questionCurrentId++;
    const question: Question = { ...insertQuestion, id };
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
}

export const storage = new MemStorage();
