import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { DigitalHumanService } from './services/DigitalHumanService.js';
import { ChatService } from './services/ChatService.js';
import { DigitalHuman, SocketEvents } from './types/index.js';

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
const digitalHumanService = new DigitalHumanService();
const chatService = new ChatService();

// Store active digital humans
const activeDigitalHumans = new Map<string, DigitalHuman>();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Add a simple ping test
  socket.on('ping', (data) => {
    console.log('Received ping:', data);
    socket.emit('pong', { message: 'Pong from server!', timestamp: new Date() });
  });

  // Handle digital human generation
  socket.on('generate-prompt', async (request) => {
    try {
      console.log('Generating digital human:', request);
      const digitalHuman = await digitalHumanService.generateDigitalHuman(request);
      activeDigitalHumans.set(digitalHuman.id, digitalHuman);
      
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

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Digital Human Creation Server running on port ${PORT}`);
  console.log(`📡 Socket.IO enabled for real-time communication`);
  console.log(`🔑 Using ${digitalHumanService ? '2' : '0'} DeepSeek API keys`);
});
