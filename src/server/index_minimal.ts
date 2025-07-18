import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

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

  // Simple demo responses
  socket.on('authenticate', (data) => {
    console.log('Authentication attempt:', data);
    socket.emit('authenticated', { 
      success: true, 
      user: { 
        id: 'demo_user', 
        username: 'Demo User', 
        isGuest: true 
      } 
    });
  });

  socket.on('guest_login', () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      username: `Guest_${Math.random().toString(36).substr(2, 6)}`,
      isGuest: true,
      createdAt: new Date().toISOString()
    };
    
    socket.emit('guest_created', { success: true, user: guestUser });
    console.log('Guest user created:', guestUser.username);
  });

  socket.on('send_message', (data) => {
    console.log('Message received:', data);
    
    // Simple demo response
    const demoResponses = [
      "That's an interesting perspective! Tell me more.",
      "I understand what you're saying. How does that make you feel?",
      "Thank you for sharing that with me. What would you like to explore next?",
      "That's a great question! Let me think about that...",
      "I appreciate your thoughts on this topic."
    ];
    
    const response = demoResponses[Math.floor(Math.random() * demoResponses.length)];
    
    socket.emit('message_response', {
      success: true,
      message: {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        digitalHumanId: data.digitalHumanId || 'demo'
      }
    });
  });

  socket.on('get_user_digital_humans', () => {
    // Demo digital humans
    const demoDigitalHumans = [
      {
        id: 'demo1',
        name: 'Alex the Helper',
        description: 'A friendly assistant ready to chat',
        systemPrompt: 'You are a helpful AI assistant.',
        isPublic: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo2', 
        name: 'Sophia the Wise',
        description: 'A wise counselor for deep conversations',
        systemPrompt: 'You are a wise counselor.',
        isPublic: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    socket.emit('user_digital_humans', { success: true, digitalHumans: demoDigitalHumans });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
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
