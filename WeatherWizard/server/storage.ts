import { 
  users, 
  userPreferences, 
  chatMessages, 
  activeTimers,
  type User, 
  type InsertUser,
  type UserPreferences,
  type InsertUserPreferences,
  type ChatMessage,
  type InsertChatMessage,
  type ActiveTimer,
  type InsertActiveTimer
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // User preferences
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;

  // Chat messages
  getChatHistory(userId: number, limit?: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Timers
  getActiveTimers(userId: number): Promise<ActiveTimer[]>;
  createTimer(timer: InsertActiveTimer): Promise<ActiveTimer>;
  updateTimer(id: number, updates: Partial<ActiveTimer>): Promise<ActiveTimer | undefined>;
  deleteTimer(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userPreferences: Map<number, UserPreferences>;
  private chatMessages: Map<number, ChatMessage[]>;
  private activeTimers: Map<number, ActiveTimer>;
  private currentUserId: number;
  private currentPrefsId: number;
  private currentMessageId: number;
  private currentTimerId: number;

  constructor() {
    this.users = new Map();
    this.userPreferences = new Map();
    this.chatMessages = new Map();
    this.activeTimers = new Map();
    this.currentUserId = 1;
    this.currentPrefsId = 1;
    this.currentMessageId = 1;
    this.currentTimerId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(prefs => prefs.userId === userId);
  }

  async upsertUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(prefs.userId!);
    
    if (existing) {
      const updated: UserPreferences = {
        ...existing,
        name: prefs.name ?? existing.name,
        userId: prefs.userId ?? existing.userId,
        favoriteLocation: prefs.favoriteLocation ?? existing.favoriteLocation,
        preferredLanguages: Array.isArray(prefs.preferredLanguages) ? prefs.preferredLanguages as string[] : existing.preferredLanguages,
        miniCustomization: prefs.miniCustomization ?? existing.miniCustomization,
        themePreferences: prefs.themePreferences ?? existing.themePreferences,
        conversationMemory: prefs.conversationMemory ?? existing.conversationMemory,
        updatedAt: new Date(),
      };
      this.userPreferences.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentPrefsId++;
      const newPrefs: UserPreferences = {
        id,
        name: prefs.name ?? null,
        userId: prefs.userId ?? null,
        favoriteLocation: prefs.favoriteLocation ?? null,
        preferredLanguages: Array.isArray(prefs.preferredLanguages) ? prefs.preferredLanguages as string[] : null,
        miniCustomization: prefs.miniCustomization ?? null,
        themePreferences: prefs.themePreferences ?? null,
        conversationMemory: prefs.conversationMemory ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.userPreferences.set(id, newPrefs);
      return newPrefs;
    }
  }

  async getChatHistory(userId: number, limit = 50): Promise<ChatMessage[]> {
    const userMessages = this.chatMessages.get(userId) || [];
    return userMessages.slice(-limit).sort((a, b) => 
      new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
    );
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const chatMessage: ChatMessage = {
      id,
      message: message.message,
      userId: message.userId ?? null,
      response: message.response ?? null,
      messageType: message.messageType,
      metadata: message.metadata ?? null,
      createdAt: new Date(),
    };

    const userMessages = this.chatMessages.get(message.userId!) || [];
    userMessages.push(chatMessage);
    this.chatMessages.set(message.userId!, userMessages);

    return chatMessage;
  }

  async getActiveTimers(userId: number): Promise<ActiveTimer[]> {
    return Array.from(this.activeTimers.values()).filter(
      timer => timer.userId === userId && timer.isActive
    );
  }

  async createTimer(timer: InsertActiveTimer): Promise<ActiveTimer> {
    const id = this.currentTimerId++;
    const activeTimer: ActiveTimer = {
      id,
      type: timer.type,
      userId: timer.userId ?? null,
      duration: timer.duration,
      remaining: timer.remaining,
      isActive: timer.isActive ?? null,
      createdAt: new Date(),
    };
    this.activeTimers.set(id, activeTimer);
    return activeTimer;
  }

  async updateTimer(id: number, updates: Partial<ActiveTimer>): Promise<ActiveTimer | undefined> {
    const timer = this.activeTimers.get(id);
    if (!timer) return undefined;

    const updatedTimer = { ...timer, ...updates };
    this.activeTimers.set(id, updatedTimer);
    return updatedTimer;
  }

  async deleteTimer(id: number): Promise<boolean> {
    return this.activeTimers.delete(id);
  }
}

export const storage = new MemStorage();
