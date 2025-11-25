import { type ChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  addMessage(playerName: string, message: string): Promise<ChatMessage>;
  getMessages(): Promise<ChatMessage[]>;
  clearMessages(): Promise<void>;
}

export class MemStorage implements IStorage {
  private messages: ChatMessage[];

  constructor() {
    this.messages = [];
  }

  async addMessage(playerName: string, message: string): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: randomUUID(),
      playerName,
      message,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(chatMessage);
    return chatMessage;
  }

  async getMessages(): Promise<ChatMessage[]> {
    return [...this.messages];
  }

  async clearMessages(): Promise<void> {
    this.messages = [];
  }
}

export const storage = new MemStorage();
