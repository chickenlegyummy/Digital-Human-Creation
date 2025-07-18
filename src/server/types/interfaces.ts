import { Request } from 'express';

// Authentication middleware
export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email?: string;
    isGuest: boolean;
  };
}

// User interfaces
export interface User {
  id: string;
  username: string;
  email?: string;
  password_hash?: string;
  isGuest: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  username: string;
  email?: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Digital Human interfaces
export interface DigitalHuman {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  imageUrl?: string;
  isPublic: boolean;
  createdBy?: string;
  personality?: string;
  background?: string;
  expertise?: string;
  communicationStyle?: string;
  createdAt: string;
}

export interface CreateDigitalHumanRequest {
  name: string;
  description: string;
  systemPrompt: string;
  imageUrl?: string;
  isPublic?: boolean;
  personality?: string;
  background?: string;
  expertise?: string;
  communicationStyle?: string;
  appearance: string;
  voice_settings: string;
  is_public?: boolean;
}

// Chat interfaces
export interface ChatMessage {
  id?: number;
  user_id: number;
  digital_human_id: number;
  message: string;
  response?: string;
  timestamp?: string;
}

export interface ChatRequest {
  digital_human_id: number;
  message: string;
}

// Socket events
export interface SocketData {
  userId?: string;
  username?: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Search interfaces
export interface SearchParams {
  query: string;
  includePrivate?: boolean;
  userId?: number;
}

// Error interfaces
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
