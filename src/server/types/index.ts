export interface DigitalHuman {
  id: string;
  name: string;
  prompt: string;
  rules: string[];
  personality: string;
  temperature: number;
  maxTokens: number;
  isPublic: boolean;
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
  isPublic?: boolean;
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
  'load-digital-humans': () => void;
  'load-chat-history': (digitalHumanId: string) => void;
  'delete-digital-human': (digitalHumanId: string) => void;
  'clear-chat-history': (digitalHumanId: string) => void;
  'authenticate': (userData: { username: string; email: string; displayName: string }) => void;
  'get-public-digital-humans': (params?: { limit?: number; offset?: number }) => void;
  
  // Server to Client
  'prompt-generated': (digitalHuman: DigitalHuman) => void;
  'digital-human-updated': (digitalHuman: DigitalHuman) => void;
  'message-received': (message: ChatMessage) => void;
  'user-digital-humans': (digitalHumans: DigitalHuman[]) => void;
  'chat-history': (messages: ChatMessage[]) => void;
  'digital-human-deleted': (digitalHumanId: string) => void;
  'chat-history-cleared': (digitalHumanId: string) => void;
  'auth-success': (user: any) => void;
  'public-digital-humans': (digitalHumans: any[]) => void;
  'error': (error: { message: string; code?: string }) => void;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
