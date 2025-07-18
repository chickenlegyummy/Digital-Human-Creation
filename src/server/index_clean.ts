import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { SocketData } from './types/interfaces.js';

// Import routes
import authRoutes from './routes/auth.js';
import digitalHumanRoutes from './routes/digitalHumans.js';
import chatRoutes from './routes/chat.js';

// Import services
import UserService from './services/UserService.js';
import DigitalHumanService from './services/DigitalHumanService.js';
import ChatService from './services/ChatService.js';

const app = express();
const server = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/digital-humans', digitalHumanRoutes);
app.use('/api/chat', chatRoutes);

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
          socket.data = { userId: user.id, username: user.username } as SocketData;
          socket.join(`user_${user.id}`);
          socket.emit('authenticated', { success: true, user });
          console.log('User authenticated:', user.username);
        } else {
          socket.emit('authenticated', { success: false, error: 'User not found' });
        }
      } else if (data.username) {
        // Create a guest user for now since we don't have getUserByUsername
        const guestUser = await UserService.createGuestUser();
        socket.data = { userId: guestUser.id, username: guestUser.username } as SocketData;
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
      socket.data = { userId: guestUser.id, username: guestUser.username } as SocketData;
      socket.join(`user_${guestUser.id}`);
      socket.emit('guest_created', { success: true, user: guestUser });
      console.log('Guest user created:', guestUser.username);
    } catch (error) {
      console.error('Guest creation error:', error);
      socket.emit('guest_created', { success: false, error: 'Failed to create guest user' });
    }
  });

  // Handle digital human creation
  socket.on('create_digital_human', async (data) => {
    try {
      const { userId } = socket.data as SocketData;
      if (!userId) {
        socket.emit('digital_human_created', { success: false, error: 'User not authenticated' });
        return;
      }

      const digitalHumanData = {
        ...data,
        createdBy: userId,
        isPublic: data.isPublic || false
      };

      const digitalHuman = await DigitalHumanService.createDigitalHuman(digitalHumanData);
      socket.emit('digital_human_created', { success: true, digitalHuman });

      // Broadcast to all users if public
      if (digitalHuman.isPublic) {
        socket.broadcast.emit('new_public_digital_human', digitalHuman);
      }

      console.log('Digital human created:', digitalHuman.name);
    } catch (error) {
      console.error('Digital human creation error:', error);
      socket.emit('digital_human_created', { success: false, error: 'Failed to create digital human' });
    }
  });

  // Handle getting user's digital humans
  socket.on('get_user_digital_humans', async () => {
    try {
      const { userId } = socket.data as SocketData;
      if (!userId) {
        socket.emit('user_digital_humans', { success: false, error: 'User not authenticated' });
        return;
      }

      const digitalHumans = await DigitalHumanService.getAllDigitalHumans(userId);
      socket.emit('user_digital_humans', { success: true, digitalHumans });
    } catch (error) {
      console.error('Get user digital humans error:', error);
      socket.emit('user_digital_humans', { success: false, error: 'Failed to get digital humans' });
    }
  });

  // Handle getting public digital humans
  socket.on('get_public_digital_humans', async (params: { limit?: number; offset?: number } = {}) => {
    try {
      const { limit = 50, offset = 0 } = params;
      const digitalHumans = await DigitalHumanService.getAllDigitalHumans();
      socket.emit('public_digital_humans', { success: true, digitalHumans });
    } catch (error) {
      console.error('Get public digital humans error:', error);
      socket.emit('public_digital_humans', { success: false, error: 'Failed to get public digital humans' });
    }
  });

  // Handle chat messages
  socket.on('send_message', async (data: { digitalHumanId: string; message: string }) => {
    try {
      const { userId } = socket.data as SocketData;
      if (!userId) {
        socket.emit('message_response', { success: false, error: 'User not authenticated' });
        return;
      }

      if (!ChatService.validateMessage(data.message)) {
        socket.emit('message_response', { success: false, error: 'Invalid message' });
        return;
      }

      const digitalHuman = await DigitalHumanService.getDigitalHumanById(data.digitalHumanId);
      if (!digitalHuman) {
        socket.emit('message_response', { success: false, error: 'Digital human not found' });
        return;
      }

      const response = await ChatService.generateResponse(digitalHuman, data.message);
      
      socket.emit('message_response', {
        success: true,
        message: {
          id: `msg_${Date.now()}`,
          role: 'assistant' as const,
          content: response,
          timestamp: new Date(),
          digitalHumanId: data.digitalHumanId
        }
      });

      console.log('Message processed for digital human:', digitalHuman.name);
    } catch (error) {
      console.error('Message processing error:', error);
      socket.emit('message_response', { success: false, error: 'Failed to process message' });
    }
  });

  // Handle digital human updates
  socket.on('update_digital_human', async (data: { id: string; updates: any }) => {
    try {
      const { userId } = socket.data as SocketData;
      if (!userId) {
        socket.emit('digital_human_updated', { success: false, error: 'User not authenticated' });
        return;
      }

      const digitalHuman = await DigitalHumanService.updateDigitalHuman(data.id, data.updates);
      if (!digitalHuman) {
        socket.emit('digital_human_updated', { success: false, error: 'Digital human not found' });
        return;
      }

      socket.emit('digital_human_updated', { success: true, digitalHuman });
      console.log('Digital human updated:', digitalHuman.name);
    } catch (error) {
      console.error('Digital human update error:', error);
      socket.emit('digital_human_updated', { success: false, error: 'Failed to update digital human' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const { username } = socket.data as SocketData || {};
    console.log('Client disconnected:', socket.id, username ? `(${username})` : '');
  });
});

// Start server
const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`🚀 Digital Human Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled with CORS for development`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
