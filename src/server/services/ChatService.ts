import { DigitalHuman } from '../types/interfaces.js';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class ChatService {
  async generateResponse(
    digitalHuman: DigitalHuman,
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    // For now, return a simple demo response
    // In production, this would integrate with AI APIs
    
    const responses = [
      `As ${digitalHuman.name}, I find that interesting! Tell me more about your thoughts on this.`,
      `That's a fascinating perspective! Based on my background in ${digitalHuman.background || 'various fields'}, I think we could explore this further.`,
      `I appreciate you sharing that with me. Let me think about this from the perspective of ${digitalHuman.personality || 'someone who cares about understanding'}.`,
      `Thank you for bringing this up! Given my experience, I'd love to discuss how we might approach this differently.`,
      `That resonates with me deeply. As someone with my background, I find there are often multiple ways to look at these situations.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  formatConversationHistory(messages: ChatMessage[]): string {
    return messages
      .slice(-10) // Keep last 10 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  validateMessage(message: string): boolean {
    return message.trim().length > 0 && message.length <= 1000;
  }
}

export default new ChatService();
