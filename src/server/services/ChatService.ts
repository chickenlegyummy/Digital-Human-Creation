import { ChatMessage, DigitalHuman, ChatRequest } from '../types/index.js';
import { DigitalHumanService } from './DigitalHumanService.js';

export class ChatService {
  private digitalHumanService: DigitalHumanService;
  private chatHistory: Map<string, ChatMessage[]> = new Map();

  constructor() {
    this.digitalHumanService = new DigitalHumanService();
  }

  getChatHistory(digitalHumanId: string): ChatMessage[] {
    return this.chatHistory.get(digitalHumanId) || [];
  }

  addMessage(message: ChatMessage): void {
    const history = this.getChatHistory(message.digitalHumanId);
    history.push(message);
    this.chatHistory.set(message.digitalHumanId, history);

    // Keep only last 50 messages per digital human
    if (history.length > 50) {
      this.chatHistory.set(message.digitalHumanId, history.slice(-50));
    }
  }

  async processMessage(request: ChatRequest, digitalHuman: DigitalHuman): Promise<ChatMessage> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: request.message,
      timestamp: new Date(),
      digitalHumanId: request.digitalHumanId
    };

    this.addMessage(userMessage);

    try {
      // Get chat history for context
      const history = this.getChatHistory(request.digitalHumanId);
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

      this.addMessage(assistantMessage);
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

      this.addMessage(errorMessage);
      return errorMessage;
    }
  }

  clearChatHistory(digitalHumanId: string): void {
    this.chatHistory.delete(digitalHumanId);
  }

  getAllChatSessions(): string[] {
    return Array.from(this.chatHistory.keys());
  }
}
