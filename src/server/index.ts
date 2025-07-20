import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { DigitalHumanService } from './services/DigitalHumanService.js';
import { ChatService } from './services/ChatService.js';
import { DatabaseService } from './services/DatabaseService.js';
import { AuthService } from './services/AuthService.js';
import { DigitalHuman, SocketEvents, AuthRequest, User } from './types/index.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server<SocketEvents>(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Services
const dbService = new DatabaseService();
const authService = new AuthService(dbService);
const digitalHumanService = new DigitalHumanService();
const chatService = new ChatService();

// Store active digital humans and user sessions
const activeDigitalHumans = new Map<string, DigitalHuman>();
const userSessions = new Map<string, User>(); // socketId -> User

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Add a simple ping test
  socket.on('ping', (data) => {
    console.log('Received ping:', data);
    socket.emit('pong', { message: 'Pong from server!', timestamp: new Date() });
  });

  // Handle authentication
  socket.on('authenticate', async (token: string) => {
    try {
      console.log('🔐 Authentication attempt for socket:', socket.id);
      console.log('🔐 Token received:', token ? 'Yes' : 'No');
      
      const authResult = await authService.verifyToken(token);
      console.log('🔐 Auth result:', authResult);
      
      if (authResult.success && authResult.user) {
        const user = authResult.user as User;
        userSessions.set(socket.id, user);
        socket.emit('authenticated', user);
        console.log(`User authenticated: ${user.username} (${socket.id})`);
        
        // Automatically send dashboard data after authentication
        console.log('📊 Auto-requesting dashboard data after authentication...');
        setTimeout(async () => {
          try {
            const userDigitalHumans = await dbService.getUserDigitalHumans(user.id);
            console.log('📊 User digital humans count:', userDigitalHumans.length);
            
            const publicDigitalHumans = await dbService.getPublicDigitalHumans();
            console.log('📊 Public digital humans count:', publicDigitalHumans.length);
            
            const chatSessions = await dbService.getUserChatSessions(user.id);
            console.log('📊 Chat sessions count:', chatSessions.length);

            // Convert stored digital humans to DigitalHuman format
            const userBots = userDigitalHumans.map(dh => ({
              id: dh.id,
              name: dh.name,
              prompt: dh.prompt,
              rules: JSON.parse(dh.rules),
              personality: dh.personality,
              temperature: dh.temperature,
              maxTokens: dh.max_tokens,
              isPublic: dh.is_public,
              createdAt: new Date(dh.created_at),
              updatedAt: new Date(dh.updated_at)
            }));

            const publicBots = publicDigitalHumans.slice(0, 10).map(dh => ({
              id: dh.id,
              name: dh.name,
              prompt: dh.prompt,
              rules: JSON.parse(dh.rules),
              personality: dh.personality,
              temperature: dh.temperature,
              maxTokens: dh.max_tokens,
              isPublic: dh.is_public,
              createdAt: new Date(dh.created_at),
              updatedAt: new Date(dh.updated_at)
            }));

            socket.emit('dashboard-data', {
              user,
              digitalHumans: {
                userBots,
                publicBots,
                recentBots: userBots.slice(0, 5)
              },
              chatSessions
            });
            
            console.log('📊 Dashboard data sent successfully after authentication');
          } catch (error: any) {
            console.error('Error fetching dashboard data after auth:', error);
            socket.emit('error', { 
              message: error.message || 'Failed to load dashboard data', 
              code: 'DASHBOARD_ERROR'
            });
          }
        }, 100);
        
      } else {
        console.log('🚨 Authentication failed:', authResult.message);
        socket.emit('error', { 
          message: authResult.message || 'Authentication failed', 
          code: 'AUTH_ERROR' 
        });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      console.error('Authentication error stack:', error.stack);
      socket.emit('error', { 
        message: 'Authentication failed', 
        code: 'AUTH_ERROR' 
      });
    }
  });

  // Handle dashboard data request
  socket.on('get-dashboard-data', async () => {
    try {
      console.log('📊 Dashboard data request for socket:', socket.id);
      const user = userSessions.get(socket.id);
      console.log('📊 User in session:', user ? user.username : 'None');
      
      if (!user) {
        console.log('🚨 User not authenticated for dashboard data');
        socket.emit('error', { 
          message: 'User not authenticated', 
          code: 'AUTH_REQUIRED' 
        });
        return;
      }

      console.log('📊 Fetching user digital humans...');
      const userDigitalHumans = await dbService.getUserDigitalHumans(user.id);
      console.log('📊 User digital humans count:', userDigitalHumans.length);
      
      console.log('📊 Fetching public digital humans...');
      const publicDigitalHumans = await dbService.getPublicDigitalHumans();
      console.log('📊 Public digital humans count:', publicDigitalHumans.length);
      
      console.log('📊 Fetching chat sessions...');
      const chatSessions = await dbService.getUserChatSessions(user.id);
      console.log('📊 Chat sessions count:', chatSessions.length);

      // Convert stored digital humans to DigitalHuman format
      const userBots = userDigitalHumans.map(dh => ({
        id: dh.id,
        name: dh.name,
        prompt: dh.prompt,
        rules: JSON.parse(dh.rules),
        personality: dh.personality,
        temperature: dh.temperature,
        maxTokens: dh.max_tokens,
        isPublic: dh.is_public,
        createdAt: new Date(dh.created_at),
        updatedAt: new Date(dh.updated_at)
      }));

      const publicBots = publicDigitalHumans.slice(0, 10).map(dh => ({
        id: dh.id,
        name: dh.name,
        prompt: dh.prompt,
        rules: JSON.parse(dh.rules),
        personality: dh.personality,
        temperature: dh.temperature,
        maxTokens: dh.max_tokens,
        isPublic: dh.is_public,
        createdAt: new Date(dh.created_at),
        updatedAt: new Date(dh.updated_at)
      }));

      socket.emit('dashboard-data', {
        user,
        digitalHumans: {
          userBots,
          publicBots,
          recentBots: userBots.slice(0, 5)
        },
        chatSessions
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      socket.emit('error', { 
        message: error.message || 'Failed to load dashboard data', 
        code: 'DASHBOARD_ERROR'
      });
    }
  });

  // Handle saving digital human
  socket.on('save-digital-human', async (digitalHuman: DigitalHuman) => {
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        socket.emit('error', { 
          message: 'User not authenticated', 
          code: 'AUTH_REQUIRED' 
        });
        return;
      }

      await dbService.saveDigitalHuman(digitalHuman, user.id);
      socket.emit('digital-human-saved', digitalHuman);
      console.log(`Digital human saved: ${digitalHuman.name} for user ${user.username}`);
    } catch (error: any) {
      console.error('Error saving digital human:', error);
      socket.emit('error', { 
        message: 'Failed to save digital human', 
        code: 'SAVE_ERROR' 
      });
    }
  });

  // Handle digital human generation
  socket.on('generate-prompt', async (request) => {
    try {
      console.log('Generating digital human:', request);
      const digitalHuman = await digitalHumanService.generateDigitalHuman(request);
      activeDigitalHumans.set(digitalHuman.id, digitalHuman);
      
      // If user is authenticated, save to database
      const user = userSessions.get(socket.id);
      if (user) {
        await dbService.saveDigitalHuman(digitalHuman, user.id);
      }
      
      socket.emit('prompt-generated', digitalHuman);
      console.log(`Digital human generated: ${digitalHuman.name} (${digitalHuman.id})`);
    } catch (error: any) {
      console.error('Error generating digital human:', error);
      socket.emit('error', { 
        message: 'Failed to generate digital human', 
        code: 'GENERATION_ERROR' 
      });
    }
  });

  // Handle digital human updates
  socket.on('update-digital-human', (digitalHuman) => {
    try {
      digitalHuman.updatedAt = new Date();
      activeDigitalHumans.set(digitalHuman.id, digitalHuman);
      
      // If user is authenticated, save to database
      const user = userSessions.get(socket.id);
      if (user) {
        dbService.saveDigitalHuman(digitalHuman, user.id);
      }
      
      socket.emit('digital-human-updated', digitalHuman);
      console.log(`Digital human updated: ${digitalHuman.name} (${digitalHuman.id})`);
    } catch (error: any) {
      console.error('Error updating digital human:', error);
      socket.emit('error', { 
        message: 'Failed to update digital human', 
        code: 'UPDATE_ERROR' 
      });
    }
  });

  // Handle deleting digital human
  socket.on('delete-digital-human', async (digitalHumanId: string) => {
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        socket.emit('error', { 
          message: 'User not authenticated', 
          code: 'AUTH_REQUIRED' 
        });
        return;
      }

      const deleted = await dbService.deleteDigitalHuman(digitalHumanId, user.id);
      if (deleted) {
        activeDigitalHumans.delete(digitalHumanId);
        socket.emit('digital-human-deleted', digitalHumanId);
        console.log(`Digital human deleted: ${digitalHumanId} for user ${user.username}`);
      } else {
        socket.emit('error', { 
          message: 'Digital human not found or permission denied', 
          code: 'DELETE_ERROR' 
        });
      }
    } catch (error: any) {
      console.error('Error deleting digital human:', error);
      socket.emit('error', { 
        message: 'Failed to delete digital human', 
        code: 'DELETE_ERROR' 
      });
    }
  });

  // Handle get user bots
  socket.on('get-user-bots', async () => {
    try {
      const user = userSessions.get(socket.id);
      if (!user) {
        socket.emit('error', { 
          message: 'User not authenticated', 
          code: 'AUTH_REQUIRED' 
        });
        return;
      }

      const userDigitalHumans = await dbService.getUserDigitalHumans(user.id);
      const userBots = userDigitalHumans.map(dh => ({
        id: dh.id,
        name: dh.name,
        prompt: dh.prompt,
        rules: JSON.parse(dh.rules),
        personality: dh.personality,
        temperature: dh.temperature,
        maxTokens: dh.max_tokens,
        isPublic: dh.is_public,
        createdAt: new Date(dh.created_at),
        updatedAt: new Date(dh.updated_at)
      }));

      socket.emit('user-bots', userBots);
    } catch (error: any) {
      console.error('Error fetching user bots:', error);
      socket.emit('error', { 
        message: 'Failed to fetch user bots', 
        code: 'FETCH_ERROR' 
      });
    }
  });

  // Handle chat messages
  socket.on('send-message', async (request) => {
    try {
      console.log('=== CHAT MESSAGE DEBUG ===');
      console.log('Received message request:', {
        message: request.message,
        digitalHumanId: request.digitalHumanId,
        historyLength: request.chatHistory?.length || 0
      });
      
      const digitalHuman = activeDigitalHumans.get(request.digitalHumanId);
      if (!digitalHuman) {
        console.log('ERROR: Digital human not found:', request.digitalHumanId);
        socket.emit('error', { 
          message: 'Digital human not found', 
          code: 'HUMAN_NOT_FOUND' 
        });
        return;
      }

      console.log(`Processing message for ${digitalHuman.name}: ${request.message}`);
      const response = await chatService.processMessage(request, digitalHuman);
      
      console.log('Generated response:', {
        id: response.id,
        role: response.role,
        content: response.content.substring(0, 100) + '...',
        timestamp: response.timestamp
      });
      
      socket.emit('message-received', response);
      console.log(`Response sent for ${digitalHuman.name}`);
      console.log('=== END CHAT DEBUG ===');
    } catch (error: any) {
      console.error('=== CHAT ERROR ===');
      console.error('Error processing message:', error);
      console.error('Error stack:', error.stack);
      socket.emit('error', { 
        message: 'Failed to process message', 
        code: 'MESSAGE_ERROR' 
      });
    }
  });

  // Handle joining chat room
  socket.on('join-chat', (digitalHumanId) => {
    socket.join(`chat_${digitalHumanId}`);
    console.log(`Client ${socket.id} joined chat for digital human: ${digitalHumanId}`);
    
    // Send a test message to confirm socket communication
    socket.emit('message-received', {
      id: 'test_' + Date.now(),
      role: 'assistant' as const,
      content: 'Test message: Socket connection is working!',
      timestamp: new Date(),
      digitalHumanId: digitalHumanId
    });
    
    // Send chat history
    const history = chatService.getChatHistory(digitalHumanId);
    history.forEach(message => {
      socket.emit('message-received', message);
    });
  });

  socket.on('disconnect', () => {
    userSessions.delete(socket.id);
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeHumans: activeDigitalHumans.size,
    chatSessions: chatService.getAllChatSessions().length
  });
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const authRequest: AuthRequest = req.body;
    const result = await authService.register(authRequest);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('Registration endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const authRequest: AuthRequest = req.body;
    const result = await authService.login(authRequest);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error: any) {
    console.error('Login endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const result = await authService.verifyToken(token);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error: any) {
    console.error('Token verification endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// API endpoint to get active digital humans
app.get('/api/digital-humans', (req, res) => {
  const humans = Array.from(activeDigitalHumans.values());
  res.json(humans);
});

// API endpoint to get specific digital human
app.get('/api/digital-humans/:id', (req, res) => {
  const digitalHuman = activeDigitalHumans.get(req.params.id);
  if (!digitalHuman) {
    return res.status(404).json({ error: 'Digital human not found' });
  }
  res.json(digitalHuman);
});

// API endpoint to get public digital humans
app.get('/api/digital-humans/public', async (req, res) => {
  try {
    const publicHumans = await dbService.getPublicDigitalHumans();
    res.json(publicHumans);
  } catch (error: any) {
    console.error('Error fetching public digital humans:', error);
    res.status(500).json({ error: 'Failed to fetch public digital humans' });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Digital Human Creation Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled for real-time communication`);
  console.log(`🔑 Using ${digitalHumanService ? '2' : '0'} DeepSeek API keys`);
});
