import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import UserService from './services/UserService.js';
import DigitalHumanService from './services/DigitalHumanService.js';
import ChatService from './services/ChatService.js';

const app = express();
const server = createServer(app);

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Digital Human Server is running!' 
  });
});

// Socket.IO setup
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle authentication
  socket.on('authenticate', async (data: { userId?: string; username?: string }) => {
    try {
      console.log('Authentication attempt:', { userId: data.userId, username: data.username });
      
      if (data.userId) {
        const user = await UserService.getUserById(data.userId);
        if (user) {
          socket.data = { userId: user.id, username: user.username };
          socket.join(`user_${user.id}`);
          socket.emit('authenticated', { success: true, user });
          console.log('User authenticated:', user.username);
        } else {
          socket.emit('authenticated', { success: false, error: 'User not found' });
        }
      } else if (data.username) {
        // Create a guest user
        const guestUser = await UserService.createGuestUser();
        socket.data = { userId: guestUser.id, username: guestUser.username };
        socket.join(`user_${guestUser.id}`);
        socket.emit('authenticated', { success: true, user: guestUser });
        console.log('Guest user created:', guestUser.username);
      } else {
        socket.emit('authenticated', { success: false, error: 'Missing authentication data' });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authenticated', { success: false, error: 'Authentication failed' });
    }
  });

  // Handle guest login
  socket.on('guest_login', async () => {
    try {
      const guestUser = await UserService.createGuestUser();
      socket.data = { userId: guestUser.id, username: guestUser.username };
      socket.join(`user_${guestUser.id}`);
      socket.emit('guest_created', { success: true, user: guestUser });
      console.log('Guest user created:', guestUser.username);
    } catch (error) {
      console.error('Guest creation error:', error);
      socket.emit('guest_created', { success: false, error: 'Failed to create guest user' });
    }
  });

  // Handle prompt generation (AI Digital Human Creation)
  socket.on('generate-prompt', async (data: { description: string; isPublic?: boolean }) => {
    try {
      const { userId } = socket.data as any;
      if (!userId) {
        socket.emit('prompt-generated', { success: false, error: 'User not authenticated' });
        return;
      }

      console.log('Generating digital human for prompt:', data.description);
      
      const digitalHuman = await DigitalHumanService.generateDigitalHuman(data.description, userId);
      
      // Update public status if specified
      if (data.isPublic !== undefined) {
        await DigitalHumanService.updateDigitalHuman(digitalHuman.id, { isPublic: data.isPublic });
      }

      socket.emit('prompt-generated', { success: true, digitalHuman });
      
      // Broadcast if public
      if (digitalHuman.isPublic) {
        socket.broadcast.emit('new_public_digital_human', digitalHuman);
      }

      console.log('Digital human generated:', digitalHuman.name);
    } catch (error) {
      console.error('Prompt generation error:', error);
      socket.emit('prompt-generated', { success: false, error: 'Failed to generate digital human' });
    }
  });

  // Handle loading user's digital humans
  socket.on('load-digital-humans', async () => {
    try {
      const { userId } = socket.data as any;
      if (!userId) {
        socket.emit('digital-humans-loaded', { success: false, error: 'User not authenticated' });
        return;
      }

      const digitalHumans = await DigitalHumanService.getAllDigitalHumans(userId);
      socket.emit('digital-humans-loaded', { success: true, digitalHumans });
      console.log('Loaded digital humans for user:', userId);
    } catch (error) {
      console.error('Load digital humans error:', error);
      socket.emit('digital-humans-loaded', { success: false, error: 'Failed to load digital humans' });
    }
  });

  // Handle getting public digital humans
  socket.on('get-public-digital-humans', async (params: { limit?: number; offset?: number } = {}) => {
    try {
      const digitalHumans = await DigitalHumanService.getAllDigitalHumans();
      socket.emit('public-digital-humans', { success: true, digitalHumans });
      console.log('Loaded public digital humans');
    } catch (error) {
      console.error('Get public digital humans error:', error);
      socket.emit('public-digital-humans', { success: false, error: 'Failed to get public digital humans' });
    }
  });

  // Handle digital human updates
  socket.on('update-digital-human', async (data: { digitalHuman: any }) => {
    try {
      const { userId } = socket.data as any;
      if (!userId) {
        socket.emit('digital-human-updated', { success: false, error: 'User not authenticated' });
        return;
      }

      const { digitalHuman } = data;
      const updated = await DigitalHumanService.updateDigitalHuman(digitalHuman.id, digitalHuman);
      
      if (!updated) {
        socket.emit('digital-human-updated', { success: false, error: 'Digital human not found' });
        return;
      }

      socket.emit('digital-human-updated', { success: true, digitalHuman: updated });
      console.log('Digital human updated:', updated.name);
    } catch (error) {
      console.error('Digital human update error:', error);
      socket.emit('digital-human-updated', { success: false, error: 'Failed to update digital human' });
    }
  });

  // Handle chat messages
  socket.on('send-message', async (data: { digitalHumanId: string; message: string; chatHistory?: any[] }) => {
    try {
      const { userId } = socket.data as any;
      if (!userId) {
        socket.emit('message-received', { success: false, error: 'User not authenticated' });
        return;
      }

      if (!ChatService.validateMessage(data.message)) {
        socket.emit('message-received', { success: false, error: 'Invalid message' });
        return;
      }

      const digitalHuman = await DigitalHumanService.getDigitalHumanById(data.digitalHumanId);
      if (!digitalHuman) {
        socket.emit('message-received', { success: false, error: 'Digital human not found' });
        return;
      }

      const response = await ChatService.generateResponse(digitalHuman, data.message, data.chatHistory || []);
      
      const responseMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant' as const,
        content: response,
        timestamp: new Date(),
        digitalHumanId: data.digitalHumanId
      };

      socket.emit('message-received', { success: true, message: responseMessage });
      console.log('Message processed for digital human:', digitalHuman.name);
    } catch (error) {
      console.error('Message processing error:', error);
      socket.emit('message-received', { success: false, error: 'Failed to process message' });
    }
  });

  // Handle joining chat
  socket.on('join-chat', (digitalHumanId: string) => {
    socket.join(`chat_${digitalHumanId}`);
    console.log(`User joined chat for digital human: ${digitalHumanId}`);
  });

  // Handle deleting digital human
  socket.on('delete-digital-human', async (digitalHumanId: string) => {
    try {
      const { userId } = socket.data as any;
      if (!userId) {
        socket.emit('digital-human-deleted', { success: false, error: 'User not authenticated' });
        return;
      }

      const deleted = await DigitalHumanService.deleteDigitalHuman(digitalHumanId);
      
      if (deleted) {
        socket.emit('digital-human-deleted', { success: true, digitalHumanId });
        console.log('Digital human deleted:', digitalHumanId);
      } else {
        socket.emit('digital-human-deleted', { success: false, error: 'Digital human not found' });
      }
    } catch (error) {
      console.error('Delete digital human error:', error);
      socket.emit('digital-human-deleted', { success: false, error: 'Failed to delete digital human' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const { username } = socket.data as any || {};
    console.log('Client disconnected:', socket.id, username ? `(${username})` : '');
  });
});

// Start server
const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`🚀 Digital Human Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled with CORS for development`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`✨ Features: AI Generation, Chat, Digital Human Management`);
});

export default app;
