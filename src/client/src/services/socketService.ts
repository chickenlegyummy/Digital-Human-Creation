import { io, Socket } from 'socket.io-client';
import { SocketEvents, DigitalHuman, ChatMessage, GeneratePromptRequest, ChatRequest } from '../types/index';

class SocketService {
  private socket: Socket<SocketEvents> | null = null;
  private readonly serverUrl = 'http://localhost:3001';
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
    this.socket.off('pong');

    // Set up message listeners
    this.socket.on('message-received', (message: ChatMessage) => {
      console.log('📨 SOCKET: Received message from server:', message);
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('error', (error: { message: string; code?: string }) => {
      console.error('🚨 SOCKET: Error received:', error);
      this.errorCallbacks.forEach(callback => callback(error));
    });

    this.socket.on('pong', (data) => {
      console.log('🏓 SOCKET: Received pong from server:', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Authentication
  authenticate(token: string): void {
    if (this.socket) {
      this.socket.emit('authenticate', token);
    }
  }

  // Dashboard Operations
  getDashboardData(): void {
    if (this.socket) {
      this.socket.emit('get-dashboard-data');
    }
  }

  saveDigitalHuman(digitalHuman: DigitalHuman): void {
    if (this.socket) {
      this.socket.emit('save-digital-human', digitalHuman);
    }
  }

  deleteDigitalHuman(digitalHumanId: string): void {
    if (this.socket) {
      this.socket.emit('delete-digital-human', digitalHumanId);
    }
  }

  getUserBots(): void {
    if (this.socket) {
      this.socket.emit('get-user-bots');
    }
  }

  // Digital Human Operations
  generatePrompt(request: GeneratePromptRequest): void {
    if (this.socket) {
      this.socket.emit('generate-prompt', request);
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
      this.socket.on('prompt-generated', callback);
    }
  }

  onDigitalHumanUpdated(callback: (digitalHuman: DigitalHuman) => void): void {
    if (this.socket) {
      this.socket.on('digital-human-updated', callback);
    }
  }

  onAuthenticated(callback: (user: any) => void): void {
    if (this.socket) {
      this.socket.on('authenticated', callback);
    }
  }

  onDashboardData(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('dashboard-data', callback);
    }
  }

  onDigitalHumanSaved(callback: (digitalHuman: DigitalHuman) => void): void {
    if (this.socket) {
      this.socket.on('digital-human-saved', callback);
    }
  }

  onDigitalHumanDeleted(callback: (digitalHumanId: string) => void): void {
    if (this.socket) {
      this.socket.on('digital-human-deleted', callback);
    }
  }

  onUserBots(callback: (digitalHumans: DigitalHuman[]) => void): void {
    if (this.socket) {
      this.socket.on('user-bots', callback);
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

  // Test connection
  testConnection(): void {
    if (this.socket) {
      console.log('🏓 Sending ping to server...');
      this.socket.emit('ping', { test: 'Hello from client!' });
      
      this.socket.once('pong', (data) => {
        console.log('🏓 Received pong from server:', data);
      });
    }
  }
}

export const socketService = new SocketService();
