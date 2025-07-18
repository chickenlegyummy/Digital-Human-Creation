import express from 'express';
import { AuthRequest, ApiResponse, CreateUserRequest, LoginRequest } from '../types/interfaces.js';
import UserService from '../services/UserService.js';

const router = express.Router();

// Register new user
router.post('/register', async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password }: CreateUserRequest = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      } as ApiResponse);
    }

    // Check if user already exists
    const existingUser = UserService.getUserByUsername(username) || UserService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists with this username or email'
      } as ApiResponse);
    }

    const user = await UserService.createUser({
      username,
      email,
      password
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Login user
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { username, password }: LoginRequest = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      } as ApiResponse);
    }

    const user = await UserService.authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user,
      message: 'Login successful'
    } as ApiResponse);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Create guest user
router.post('/guest', async (req: express.Request, res: express.Response) => {
  try {
    const user = await UserService.createGuestUser();
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'Guest user created successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Guest creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get user profile
router.get('/profile/:id', (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse);
    }

    const user = UserService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user
    } as ApiResponse);

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Update user profile
router.put('/profile/:id', (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt(req.params.id);
    const updates = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse);
    }

    // Remove sensitive fields from updates
    delete updates.id;
    delete updates.password_hash;
    delete updates.created_at;

    const user = UserService.updateUser(userId, updates);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;
