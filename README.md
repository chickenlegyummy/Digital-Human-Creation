# Digital Human Creation Studio

A comprehensive web application for creating, managing, and interacting with AI-powered digital humans. Built with TypeScript, React, Node.js, and Socket.IO.

## Architecture Overview

The system follows the architecture diagrams and includes three main components:

### 1. General System
- **Authentication**: User registration, login, and JWT-based authentication
- **Dashboard**: User interface for managing digital humans and viewing statistics
- **Database**: SQLite database for persistent storage of users, digital humans, and chat sessions
- **Bot Creation**: AI-powered generation of digital human personalities using DeepSeek API

### 2. Dashboard System  
- **Client Interface**: React-based dashboard with real-time updates
- **Server Integration**: Socket.IO communication for real-time data synchronization
- **Database Integration**: Persistent storage and retrieval of user data
- **User Management**: Profile management and session handling

### 3. Bot System
- **Bot Creation**: Dynamic generation of digital human personalities and characteristics
- **Chat Interface**: Real-time chat with digital humans using WebSocket communication  
- **Database Storage**: Persistent storage of digital humans and chat histories
- **LLM Integration**: DeepSeek API integration for natural language processing

## Features

### Authentication System
- User registration and login
- JWT-based session management
- Secure password hashing with bcrypt
- Token verification and refresh

### Digital Human Management
- AI-powered generation of digital human personalities
- Customizable personality traits and behavior rules
- Temperature and token limit configuration
- Save and load digital humans from database
- Public and private digital human sharing

### Real-time Chat System
- WebSocket-based real-time communication
- Chat history persistence
- Multiple concurrent conversations
- Typing indicators and message status

### Dashboard Features
- User statistics and analytics
- Digital human library management
- Recent activity tracking
- Public digital human discovery

## Technology Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** for REST API
- **Socket.IO** for real-time communication
- **SQLite** for database storage
- **JWT** for authentication
- **bcryptjs** for password hashing
- **DeepSeek API** for AI language processing

### Frontend  
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time updates
- **Lucide React** for icons
- **Vite** for development and building

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Digital-Human-Creation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   DeepSeek_R1=your-deepseek-api-key-1
   DS_V3=your-deepseek-api-key-2
   JWT_SECRET=your-very-secure-jwt-secret-key
   PORT=3001
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   This will start both the client (port 3000) and server (port 3001).

## Usage

### Getting Started

1. **Access the application** at `http://localhost:3000`
2. **Register a new account** or login with existing credentials
3. **Create your first digital human** using the generation form
4. **Start chatting** with your digital human in real-time
5. **Manage your collection** through the dashboard

### Creating Digital Humans

1. Navigate to the creation panel
2. Provide a description of the desired personality
3. Optionally specify:
   - Personality traits
   - Domain expertise
   - Special instructions
4. Click "Generate" to create your digital human
5. Customize the generated prompt and rules as needed
6. Save to your personal library

### Dashboard Features

- **My Digital Humans**: View and manage your personal collection
- **Discover Public**: Explore digital humans shared by the community  
- **Recent**: Quick access to recently used digital humans
- **Statistics**: View your usage metrics and activity

### Chat Interface

- Real-time messaging with digital humans
- Chat history persistence across sessions
- Multiple conversation support
- Message timestamps and status indicators

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/verify` - Token verification

### Digital Humans
- `GET /api/digital-humans` - Get active digital humans
- `GET /api/digital-humans/:id` - Get specific digital human
- `GET /api/digital-humans/public` - Get public digital humans

### System
- `GET /health` - Health check and system status

## WebSocket Events

### Client to Server
- `authenticate` - Authenticate user session
- `generate-prompt` - Generate new digital human
- `update-digital-human` - Update existing digital human
- `send-message` - Send chat message
- `join-chat` - Join chat room
- `get-dashboard-data` - Request dashboard data
- `save-digital-human` - Save digital human to database
- `delete-digital-human` - Delete digital human
- `get-user-bots` - Get user's digital humans

### Server to Client  
- `authenticated` - Authentication success
- `prompt-generated` - New digital human generated
- `digital-human-updated` - Digital human updated
- `message-received` - New chat message
- `dashboard-data` - Dashboard data response
- `digital-human-saved` - Digital human saved
- `digital-human-deleted` - Digital human deleted
- `user-bots` - User's digital humans list
- `error` - Error notifications

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email address  
- `password` - Hashed password
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Digital Humans Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `name` - Digital human name
- `prompt` - System prompt text
- `rules` - JSON array of behavior rules
- `personality` - Personality description
- `temperature` - AI creativity setting
- `max_tokens` - Response length limit
- `is_public` - Public sharing flag
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Chat Sessions Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `digital_human_id` - Foreign key to digital humans table
- `created_at` - Session creation timestamp
- `updated_at` - Last activity timestamp

### Chat Messages Table
- `id` - Primary key
- `chat_session_id` - Foreign key to chat sessions table
- `role` - Message role ('user' or 'assistant')
- `content` - Message content
- `timestamp` - Message timestamp

## Development

### Project Structure
```
src/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API and socket services
│   │   ├── types/       # TypeScript type definitions
│   │   └── ...
│   └── index.html
├── server/              # Node.js backend  
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Server entry point
database/                # SQLite database files
```

### Available Scripts
- `npm run dev` - Start development servers (client + server)
- `npm run client:dev` - Start client development server only
- `npm run server:dev` - Start server development server only  
- `npm run build` - Build for production
- `npm run build:client` - Build client only
- `npm run build:server` - Build server only
- `npm start` - Start production server

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables** for production
3. **Start the production server**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- DeepSeek AI for language model API
- React and Node.js communities
- Socket.IO for real-time communication
- Tailwind CSS for styling framework
