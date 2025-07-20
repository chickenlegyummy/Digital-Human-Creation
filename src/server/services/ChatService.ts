import { ChatMessage, DigitalHuman, ChatRequest } from '../types/index.js';
import { DigitalHumanService } from './DigitalHumanService.js';
import { DatabaseService } from './DatabaseService.js';

export class ChatService {
  private digitalHumanService: DigitalHumanService;
  private dbService: DatabaseService;
  private chatHistory: Map<string, ChatMessage[]> = new Map();

  constructor() {
    this.digitalHumanService = new DigitalHumanService();
    this.dbService = new DatabaseService();
  }

  // Create user-specific chat key
  private getChatKey(userId: number, digitalHumanId: string): string {
    return `${userId}_${digitalHumanId}`;
  }

  async getChatHistory(userId: number, digitalHumanId: string): Promise<ChatMessage[]> {
    const chatKey = this.getChatKey(userId, digitalHumanId);
    
    // Check if we have it in memory
    if (this.chatHistory.has(chatKey)) {
      return this.chatHistory.get(chatKey)!;
    }
    
    // Load from database if not in memory
    try {
      const session = await this.dbService.getOrCreateChatSession(userId, digitalHumanId);
      const storedMessages = await this.dbService.getChatMessages(session.id);
      
      // Convert stored messages to ChatMessage format
      const messages: ChatMessage[] = storedMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        digitalHumanId: digitalHumanId
      }));
      
      // Cache in memory for faster access
      this.chatHistory.set(chatKey, messages);
      return messages;
    } catch (error) {
      console.error('Error loading chat history from database:', error);
      return [];
    }
  }

  async addMessage(message: ChatMessage, userId: number): Promise<void> {
    const chatKey = this.getChatKey(userId, message.digitalHumanId);
    const history = await this.getChatHistory(userId, message.digitalHumanId);
    history.push(message);
    this.chatHistory.set(chatKey, history);

    // Keep only last 50 messages per user per digital human
    if (history.length > 50) {
      const trimmedHistory = history.slice(-50);
      this.chatHistory.set(chatKey, trimmedHistory);
    }
    
    // Save to database
    try {
      const session = await this.dbService.getOrCreateChatSession(userId, message.digitalHumanId);
      await this.dbService.saveChatMessage(session.id, message.role, message.content);
    } catch (error) {
      console.error('Error saving chat message to database:', error);
    }
  }

  async processMessage(request: ChatRequest, digitalHuman: DigitalHuman, userId: number): Promise<ChatMessage> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: request.message,
      timestamp: new Date(),
      digitalHumanId: request.digitalHumanId
    };

    await this.addMessage(userMessage, userId);

    try {
      // Get chat history for context
      const history = await this.getChatHistory(userId, request.digitalHumanId);
      const contextMessages = history.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate response using the digital human
      const responseContent = await this.digitalHumanService.generateResponse(
        request.message,
        digitalHuman,
        contextMessages
      );

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        digitalHumanId: request.digitalHumanId
      };

      await this.addMessage(assistantMessage, userId);
      return assistantMessage;
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Create error response
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
        digitalHumanId: request.digitalHumanId
      };

      await this.addMessage(errorMessage, userId);
      return errorMessage;
    }
  }

  clearChatHistory(userId: number, digitalHumanId: string): void {
    const chatKey = this.getChatKey(userId, digitalHumanId);
    this.chatHistory.delete(chatKey);
  }

  getAllChatSessions(): string[] {
    return Array.from(this.chatHistory.keys());
  }
}
