# 🤖 Digital Human Creation Studio

> **A comprehensive full-stack web application for creating, managing, and interacting with AI-powered digital humans**

Built with **TypeScript**, **React**, **Node.js**, **Socket.IO**, and **SQLite** - featuring real-time chat, user authentication, and advanced digital human management.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎯 Overview

Digital Human Creation Studio is a modern web platform that enables users to create personalized AI digital humans with unique personalities, chat with them in real-time, and manage their digital human collection through an intuitive dashboard interface.

### ✨ Key Highlights

- 🔐 **Secure User Authentication** - JWT-based authentication with bcrypt password hashing
- 🤖 **AI-Powered Generation** - Create digital humans using DeepSeek API integration
- 💬 **Real-Time Chat** - WebSocket communication for instant messaging
- 📊 **Dashboard Management** - Comprehensive interface for digital human management  
- 🔒 **Ownership & Privacy** - Public/private digital humans with ownership controls
- 📋 **Prompt Export** - Export digital human prompts for external use
- 🗃️ **Persistent Storage** - SQLite database for all user data and chat history

## 🏗️ Architecture Overview

The system implements a three-tier architecture based on the original design diagrams:

### 1. 🌐 General System Layer
- **User Authentication**: Registration, login, and session management
- **Database Management**: SQLite-based persistent storage
- **API Gateway**: RESTful endpoints and WebSocket communication
- **Security**: JWT tokens, password hashing, and ownership verification

### 2. 📱 Dashboard System Layer  
- **React Frontend**: Modern, responsive user interface
- **Real-Time Updates**: Socket.IO integration for live data synchronization
- **User Management**: Profile handling and session persistence
- **Statistics & Analytics**: Usage tracking and digital human metrics

### 3. 🤖 Bot System Layer
- **AI Generation**: DeepSeek API integration for personality creation
- **Chat Engine**: Real-time conversation management
- **Prompt Engineering**: Advanced system prompt configuration
- **Memory Management**: Persistent chat history and context retention

## 🚀 Features

### 🔐 Authentication & User Management
- **User Registration & Login** with email/password
- **JWT-based Session Management** with automatic token refresh  
- **Secure Password Handling** using bcryptjs hashing
- **User Profile Management** with persistent sessions

### 🤖 Digital Human Creation & Management
- **AI-Powered Generation** using DeepSeek language models
- **Customizable Personalities** with detailed trait configuration
- **Behavior Rules System** for consistent character responses
- **Temperature & Token Controls** for fine-tuning AI behavior
- **Public/Private Sharing** with ownership-based access control
- **Bulk Operations** - Edit, delete, and manage multiple digital humans

### 💬 Real-Time Chat System
- **WebSocket Communication** for instant messaging
- **User-Separated Chat History** - Private conversations per user
- **Multiple Concurrent Chats** with different digital humans
- **Persistent Message Storage** in SQLite database
- **Typing Indicators** and message delivery status

### 📊 Advanced Dashboard Features
- **My Digital Humans** - Personal collection management
- **Public Discovery** - Explore community-shared digital humans
- **Recent Activity** - Quick access to recently used digital humans
- **Usage Statistics** - Track chat activity and digital human performance
- **Search & Filter** - Find digital humans by name, traits, or keywords

### 📋 Professional Prompt Export
- **Quick Copy** - Extract system prompts for external AI tools
- **Full Documentation Export** - Comprehensive markdown format with usage instructions
- **Ownership-Protected** - Only owners can access export functionality
- **Multiple Format Support** - Raw prompts or formatted documentation

### 🔒 Security & Privacy
- **Ownership Verification** - Users can only edit/delete their own digital humans
- **Private Chat Histories** - No cross-user data leakage
- **Permission-Based Actions** - Server-side authorization for all operations
- **Data Isolation** - Complete separation of user data and sessions

## 🛠️ Technology Stack

### Backend Architecture
- **🟢 Node.js** `v20.x` - Runtime environment
- **⚡ Express.js** `v4.21+` - Web application framework
- **🔌 Socket.IO** `v4.8+` - Real-time WebSocket communication
- **💾 SQLite** `v5.1+` - Embedded database with zero configuration
- **🔑 JWT** `v9.0+` - Stateless authentication tokens
- **🔐 bcryptjs** `v3.0+` - Password hashing and salt generation
- **🧠 DeepSeek API** - Advanced language model integration
- **🔧 TypeScript** `v5.2+` - Type-safe backend development

### Frontend Architecture  
- **⚛️ React** `v18.2+` - Modern component-based UI framework
- **🎨 Tailwind CSS** `v3.3+` - Utility-first styling framework
- **🔌 Socket.IO Client** `v4.8+` - Real-time client communication
- **🎯 Lucide React** - Beautiful, consistent icon library
- **⚡ Vite** `v5.0+` - Ultra-fast build tool and dev server
- **📝 TypeScript** `v5.2+` - Type-safe frontend development

### Development & Build Tools
- **🔄 Concurrently** - Run multiple npm scripts simultaneously
- **👀 tsx** - TypeScript execution and watch mode
- **🔧 ts-node** - TypeScript Node.js execution
- **📦 npm** - Package management and script execution

## 📦 Installation & Setup

### Option 1: Quick Setup with Init Script

```bash
# Clone the repository
git clone https://github.com/your-username/Digital-Human-Creation.git
cd Digital-Human-Creation

# Run the automated setup script
bash init.sh
```

The init script will:
1. Install all dependencies automatically
2. Create and configure the `.env` file
3. Set up the database structure
4. Provide setup completion confirmation

### Option 2: Manual Setup

```bash
# 1. Clone and navigate
git clone https://github.com/your-username/Digital-Human-Creation.git
cd Digital-Human-Creation

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# DeepSeek API Keys (Get from: https://platform.deepseek.com/)
DeepSeek_R1=your-deepseek-api-key-1
DS_V3=your-deepseek-api-key-2

# JWT Secret (Generate a strong secret key)
JWT_SECRET=your-very-secure-jwt-secret-key-change-this-in-production

# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:3000

# Database Configuration (Auto-created)
DATABASE_PATH=./database/digital_humans.db
```

```bash
# 4. Start development servers
npm run dev
```

### 🌐 Access the Application

- **Frontend**: http://localhost:3000 (React + Vite)
- **Backend API**: http://localhost:3001 (Express + Socket.IO)
- **Database**: `./database/digital_humans.db` (SQLite - auto-created)

## 💻 Usage Guide

### 🚀 Getting Started

1. **Launch the Application**
   ```bash
   npm run dev
   ```

2. **Create Your Account**
   - Navigate to http://localhost:3000
   - Click "Sign Up" and register with email/password
   - Login with your new credentials

3. **Create Your First Digital Human**
   - Click "Create New" on the dashboard
   - Provide a personality description
   - Customize traits, rules, and behavior settings
   - Save to your personal collection

4. **Start Chatting**
   - Select any digital human from your dashboard
   - Begin real-time conversations
   - Chat history is automatically saved

### 📊 Dashboard Navigation

#### 📁 My Digital Humans Tab
- **View** all your personal digital humans
- **Edit** personalities, prompts, and settings
- **Toggle Privacy** between public and private
- **Delete** digital humans with confirmation
- **Export Prompts** for use in other AI tools

#### 🌍 Public Discovery Tab
- **Browse** community-shared digital humans
- **Chat** with public digital humans (read-only)
- **Discover** new personalities and use cases
- **No Editing** - ownership protection enforced

#### ⏱️ Recent Activity Tab
- **Quick Access** to recently used digital humans
- **Resume Conversations** from where you left off
- **Activity Tracking** across all your interactions

### 💬 Chat Interface Features

- **Real-Time Messages** - Instant delivery and response
- **Message History** - Persistent across browser sessions
- **User Isolation** - Private conversations per account
- **Multiple Chats** - Concurrent conversations supported
- **Auto-Save** - All messages stored in database

### 📋 Prompt Export System

#### Quick Copy (System Prompt Only)
- **One-Click Copy** of the core AI prompt
- **Ready to Use** in ChatGPT, Claude, Gemini
- **Clean Format** without extra metadata

#### Full Documentation Export
- **Comprehensive Package** with usage instructions
- **Markdown Format** for documentation
- **Configuration Details** (temperature, tokens)
- **Professional Layout** for sharing or backup

## 🔌 API Reference

### REST Endpoints

#### Authentication
```
POST   /api/auth/register    # User registration
POST   /api/auth/login       # User login  
POST   /api/auth/verify      # Token verification
GET    /api/auth/me          # Get current user
```

#### Digital Humans
```
GET    /api/digital-humans        # Get user's digital humans
GET    /api/digital-humans/:id    # Get specific digital human
GET    /api/digital-humans/public # Get public digital humans
```

#### System
```
GET    /health                    # Health check and system status
GET    /api/stats                 # System statistics
```

### WebSocket Events

#### 📤 Client → Server Events
```javascript
// Authentication
socket.emit('authenticate', token)

// Digital Human Management  
socket.emit('generate-prompt', request)
socket.emit('save-digital-human', digitalHuman)
socket.emit('update-digital-human', digitalHuman)
socket.emit('delete-digital-human', digitalHumanId)

// Chat Operations
socket.emit('send-message', chatRequest)
socket.emit('join-chat', digitalHumanId)

// Dashboard Data
socket.emit('get-dashboard-data')
socket.emit('get-user-bots')
```

#### 📥 Server → Client Events
```javascript
// Authentication Response
socket.on('authenticated', user)

// Digital Human Updates
socket.on('prompt-generated', digitalHuman)
socket.on('digital-human-saved', digitalHuman)  
socket.on('digital-human-updated', digitalHuman)
socket.on('digital-human-deleted', digitalHumanId)

// Chat Messages
socket.on('message-received', message)

// Dashboard Data
socket.on('dashboard-data', dashboardInfo)
socket.on('user-bots', digitalHumans)

// Error Handling
socket.on('error', errorInfo)
```

## 🗃️ Database Schema

### 👤 Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 🤖 Digital Humans Table
```sql
CREATE TABLE digital_humans (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    rules TEXT NOT NULL,                -- JSON array
    personality TEXT NOT NULL,
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### 💬 Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    digital_human_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (digital_human_id) REFERENCES digital_humans (id)
);
```

### 📝 Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id TEXT PRIMARY KEY,
    chat_session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_session_id) REFERENCES chat_sessions (id)
);
```

## 🏗️ Project Structure

```
Digital-Human-Creation/
├── 📁 src/
│   ├── 📁 client/                    # React Frontend
│   │   ├── index.html               # Entry HTML file
│   │   └── 📁 src/
│   │       ├── 📁 components/       # React Components
│   │       │   ├── AuthComponent.tsx
│   │       │   ├── Dashboard.tsx
│   │       │   ├── PromptPanel.tsx
│   │       │   └── ChatPanel.tsx
│   │       ├── 📁 services/         # API & Socket Services
│   │       │   └── socketService.ts
│   │       ├── 📁 types/            # TypeScript Definitions
│   │       │   └── index.ts
│   │       ├── App.tsx              # Main React App
│   │       ├── main.tsx             # React Entry Point
│   │       └── index.css            # Global Styles
│   └── 📁 server/                   # Node.js Backend
│       ├── 📁 services/             # Business Logic
│       │   ├── ChatService.ts
│       │   ├── DigitalHumanService.ts
│       │   └── DatabaseService.ts
│       ├── 📁 types/                # TypeScript Definitions
│       │   └── index.ts
│       └── index.ts                 # Server Entry Point
├── 📁 database/                     # SQLite Database (Auto-created)
│   └── digital_humans.db
├── 📁 dist/                         # Production Build Output
├── 📄 .env.example                  # Environment Template
├── 📄 .env                          # Environment Variables (Git-ignored)
├── 📄 init.sh                       # Automated Setup Script
├── 📄 package.json                  # Dependencies & Scripts
├── 📄 tsconfig.json                 # TypeScript Config
├── 📄 vite.config.ts                # Vite Build Config
├── 📄 tailwind.config.js            # Tailwind CSS Config
└── 📄 README.md                     # This Documentation
```

## 🔧 Development

### Available Scripts

```bash
# Development (Recommended)
npm run dev              # Start both client + server in watch mode

# Individual Services
npm run client:dev       # Start client development server only
npm run server:dev       # Start server development server only  

# Production Build
npm run build            # Build both client and server
npm run build:client     # Build client only
npm run build:server     # Build server only

# Production Deployment
npm start               # Start production server (requires build)
npm run preview         # Preview built client application
```

### 🔄 Development Workflow

1. **Start Development Environment**
   ```bash
   npm run dev
   ```
   This starts both servers with hot-reload enabled.

2. **Frontend Development**
   - Client runs on http://localhost:3000
   - Hot-reload enabled for instant updates
   - TypeScript compilation and error checking
   - Tailwind CSS processing

3. **Backend Development**  
   - Server runs on http://localhost:3001
   - tsx watch mode for TypeScript files
   - Automatic server restart on code changes
   - SQLite database auto-initialization

4. **Database Management**
   - SQLite database in `./database/digital_humans.db`
   - Auto-created on first server start
   - Schema migrations handled automatically
   - Data persists across restarts

### 🧪 Testing & Debugging

```bash
# Database Inspection (requires sqlite3 CLI)
sqlite3 ./database/digital_humans.db ".schema"
sqlite3 ./database/digital_humans.db "SELECT * FROM users;"

# Health Check
curl http://localhost:3001/health

# WebSocket Testing (Browser Console)
const socket = io('http://localhost:3001');
socket.emit('ping', { test: 'data' });
socket.on('pong', console.log);
```

## 🚀 Production Deployment

### Build for Production

```bash
# Complete production build
npm run build

# Verify build output
ls -la dist/
```

### Environment Setup

```bash
# Production environment variables
export NODE_ENV=production
export JWT_SECRET="your-super-secure-production-jwt-secret"
export PORT=3001
export CLIENT_URL="https://your-domain.com"
export DATABASE_PATH="./database/digital_humans.db"
```

### Start Production Server

```bash
# Start built application
npm start

# With PM2 (Process Manager)
npm install -g pm2
pm2 start dist/server/index.js --name "digital-human-studio"
```

### Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

We welcome contributions to Digital Human Creation Studio! Please follow these guidelines:

### Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/Digital-Human-Creation.git
cd Digital-Human-Creation

# 2. Create a feature branch
git checkout -b feature/amazing-new-feature

# 3. Install dependencies and setup environment
npm install
cp .env.example .env
# Edit .env with your configuration

# 4. Start development environment
npm run dev
```

### Code Standards

- **TypeScript**: All new code must be written in TypeScript
- **ESLint**: Follow the existing linting configuration
- **Components**: Use functional components with React hooks
- **Database**: Use the existing DatabaseService for all data operations
- **Security**: Implement proper authentication and authorization checks

### Pull Request Process

1. **Update Documentation** - Ensure README and code comments are updated
2. **Test Your Changes** - Verify functionality works in development mode
3. **Check TypeScript** - Ensure no TypeScript errors or warnings
4. **Submit PR** - Provide clear description of changes and testing steps

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[DeepSeek AI](https://platform.deepseek.com/)** - Advanced language model API
- **[React](https://react.dev/)** - Frontend framework and ecosystem
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment
- **[Socket.IO](https://socket.io/)** - Real-time WebSocket communication
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling framework
- **[SQLite](https://sqlite.org/)** - Embedded database engine
- **[Vite](https://vitejs.dev/)** - Ultra-fast build tool and dev server

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/your-username/Digital-Human-Creation/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/Digital-Human-Creation/discussions)
- **Documentation**: This README and inline code comments

---

<div align="center">

**Built with ❤️ by the Digital Human Creation Studio Team**

[⭐ Star this project](https://github.com/your-username/Digital-Human-Creation) if you find it useful!

</div>
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
