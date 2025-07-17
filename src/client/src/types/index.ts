export interface DigitalHuman {
  id: string;
  name: string;
  prompt: string;
  rules: string[];
  personality: string;
  temperature: number;
  maxTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  digitalHumanId: string;
}

export interface GeneratePromptRequest {
  description: string;
  personality?: string;
  domain?: string;
  specialInstructions?: string;
}

export interface ChatRequest {
  message: string;
  digitalHumanId: string;
  chatHistory: ChatMessage[];
}

export interface SocketEvents {
  // Client to Server
  'generate-prompt': (request: GeneratePromptRequest) => void;
  'update-digital-human': (digitalHuman: DigitalHuman) => void;
  'send-message': (request: ChatRequest) => void;
  'join-chat': (digitalHumanId: string) => void;
  'ping': (data: any) => void;
  
  // Server to Client
  'prompt-generated': (digitalHuman: DigitalHuman) => void;
  'digital-human-updated': (digitalHuman: DigitalHuman) => void;
  'message-received': (message: ChatMessage) => void;
  'error': (error: { message: string; code?: string }) => void;
  'pong': (data: { message: string; timestamp: Date }) => void;
}
