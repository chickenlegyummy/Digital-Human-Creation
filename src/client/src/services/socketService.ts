import { io, Socket } from 'socket.io-client';
import { SocketEvents, DigitalHuman, ChatMessage, GeneratePromptRequest, ChatRequest } from '../types/index';

class SocketService {
  private socket: Socket<SocketEvents> | null = null;
  private readonly serverUrl = 'http://localhost:3004';
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private errorCallbacks: ((error: { message: string; code?: string }) => void)[] = [];

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔌 Attempting to connect to socket server...');
      
      // Disconnect existing connection if any
      if (this.socket) {
        this.socket.disconnect();
      }
      
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        timeout: 20000,
        forceNew: false, // Allow reconnection
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server, socket ID:', this.socket?.id);
        this.setupEventListeners();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason);
      });

      // Handle reconnection manually
      this.socket.io.on('reconnect', () => {
        console.log('🔄 Reconnected to server');
        this.setupEventListeners();
      });
    });
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Clear existing listeners to avoid duplicates
    this.socket.off('message-received');
    this.socket.off('error');
    this.socket.off('user-digital-humans');
    this.socket.off('chat-history');
    this.socket.off('digital-human-deleted');
    this.socket.off('chat-history-cleared');

    // Set up message listeners
    this.socket.on('message-received', (message: ChatMessage) => {
      console.log('📨 SOCKET: Received message from server:', message);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('error', (error: { message: string; code?: string }) => {
      console.error('🚨 SOCKET: Error received:', error);
      this.errorCallbacks.forEach(callback => callback(error));
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Authentication
  authenticate(userData: { username?: string; userId?: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.emit('authenticate', userData);
        
        // Listen for authentication response
        this.socket.off('authenticated');
        this.socket.on('authenticated', (response: { success: boolean; user?: any; error?: string }) => {
          if (response.success) {
            console.log('✅ Authentication successful:', response.user);
            resolve(response.user);
          } else {
            console.error('❌ Authentication failed:', response.error);
            reject(new Error(response.error));
          }
        });
      } else {
        reject(new Error('Socket not connected'));
      }
    });
  }

  // Digital Human Operations
  generatePrompt(request: GeneratePromptRequest): void {
    console.log('🚀 Attempting to generate prompt, socket connected:', !!this.socket?.connected);
    if (this.socket && this.socket.connected) {
      console.log('✅ Emitting generate-prompt event');
      this.socket.emit('generate-prompt', request);
    } else {
      console.error('❌ Socket not connected, cannot generate prompt');
    }
  }

  updateDigitalHuman(digitalHuman: DigitalHuman): void {
    if (this.socket) {
      this.socket.emit('update-digital-human', digitalHuman);
    }
  }

  // Chat Operations
  joinChat(digitalHumanId: string): void {
    if (this.socket) {
      this.socket.emit('join-chat', digitalHumanId);
    }
  }

  sendMessage(request: ChatRequest): void {
    if (this.socket) {
      console.log('Sending message to server:', request);
      this.socket.emit('send-message', request);
    } else {
      console.error('Socket not connected when trying to send message');
    }
  }

  // Event Listeners
  onPromptGenerated(callback: (digitalHuman: DigitalHuman) => void): void {
    if (this.socket) {
      console.log('🎯 Setting up prompt-generated event listener');
      // Remove existing listeners first to avoid duplicates
      this.socket.off('prompt-generated');
      this.socket.on('prompt-generated', (digitalHuman) => {
        console.log('🎉 Received prompt-generated event:', digitalHuman);
        callback(digitalHuman);
      });
    }
  }

  onDigitalHumanUpdated(callback: (digitalHuman: DigitalHuman) => void): void {
    if (this.socket) {
      // Remove existing listeners first to avoid duplicates  
      this.socket.off('digital-human-updated');
      this.socket.on('digital-human-updated', callback);
    }
  }

  onMessageReceived(callback: (message: ChatMessage) => void): void {
    console.log('🔗 Adding message received callback');
    this.messageCallbacks.push(callback);
  }

  onError(callback: (error: { message: string; code?: string }) => void): void {
    console.log('🔗 Adding error callback');
    this.errorCallbacks.push(callback);
  }

  // Remove listeners
  off(event: keyof SocketEvents, callback?: (...args: any[]) => void): void {
    if (event === 'message-received') {
      const index = this.messageCallbacks.indexOf(callback as any);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
        console.log('🧹 Removed message callback');
      }
    } else if (event === 'error') {
      const index = this.errorCallbacks.indexOf(callback as any);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
        console.log('🧹 Removed error callback');
      }
    } else if (this.socket) {
      this.socket.off(event as any, callback);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Database Operations
  loadDigitalHumans(): void {
    if (this.socket) {
      this.socket.emit('load-digital-humans');
    }
  }

  loadChatHistory(digitalHumanId: string): void {
    if (this.socket) {
      this.socket.emit('load-chat-history', digitalHumanId);
    }
  }

  deleteDigitalHuman(digitalHumanId: string): void {
    if (this.socket) {
      this.socket.emit('delete-digital-human', digitalHumanId);
    }
  }

  clearChatHistory(digitalHumanId: string): void {
    if (this.socket) {
      this.socket.emit('clear-chat-history', digitalHumanId);
    }
  }

  // Database Event Listeners
  onUserDigitalHumans(callback: (digitalHumans: DigitalHuman[]) => void): void {
    if (this.socket) {
      this.socket.off('user-digital-humans');
      this.socket.on('user-digital-humans', callback);
    }
  }

  onChatHistory(callback: (messages: ChatMessage[]) => void): void {
    if (this.socket) {
      this.socket.off('chat-history');
      this.socket.on('chat-history', callback);
    }
  }

  onDigitalHumanDeleted(callback: (digitalHumanId: string) => void): void {
    if (this.socket) {
      this.socket.off('digital-human-deleted');
      this.socket.on('digital-human-deleted', callback);
    }
  }

  onChatHistoryCleared(callback: (digitalHumanId: string) => void): void {
    if (this.socket) {
      this.socket.on('chat-history-cleared', callback);
    }
  }

  // Public Digital Humans
  getPublicDigitalHumans(params = {}): void {
    if (this.socket) {
      this.socket.emit('get-public-digital-humans', params);
    }
  }

  onPublicDigitalHumans(callback: (digitalHumans: any[]) => void): void {
    if (this.socket) {
      this.socket.off('public-digital-humans');
      this.socket.on('public-digital-humans', callback);
    }
  }

}

export const socketService = new SocketService();
