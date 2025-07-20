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
  ownerId?: number; // Add optional owner ID for ownership checks
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

// Authentication interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest {
  username?: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface DashboardData {
  user: User;
  digitalHumans: {
    userBots: DigitalHuman[];
    publicBots: DigitalHuman[];
    recentBots: DigitalHuman[];
  };
  chatSessions: any[];
}

export interface SocketEvents {
  // Client to Server
  'generate-prompt': (request: GeneratePromptRequest) => void;
  'update-digital-human': (digitalHuman: DigitalHuman) => void;
  'send-message': (request: ChatRequest) => void;
  'join-chat': (digitalHumanId: string) => void;
  'ping': (data: any) => void;
  'authenticate': (token: string) => void;
  'get-dashboard-data': () => void;
  'save-digital-human': (digitalHuman: DigitalHuman) => void;
  'delete-digital-human': (digitalHumanId: string) => void;
  'get-user-bots': () => void;
  
  // Server to Client
  'prompt-generated': (digitalHuman: DigitalHuman) => void;
  'digital-human-updated': (digitalHuman: DigitalHuman) => void;
  'message-received': (message: ChatMessage) => void;
  'error': (error: { message: string; code?: string }) => void;
  'pong': (data: { message: string; timestamp: Date }) => void;
  'authenticated': (user: User) => void;
  'dashboard-data': (data: DashboardData) => void;
  'digital-human-saved': (digitalHuman: DigitalHuman) => void;
  'digital-human-deleted': (digitalHumanId: string) => void;
  'user-bots': (digitalHumans: DigitalHuman[]) => void;
}
