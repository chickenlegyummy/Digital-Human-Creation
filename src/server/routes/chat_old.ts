import express from 'express';
import { ApiResponse, ChatRequest } from '../types/interfaces.js';
import ChatService from '../services/ChatService.js';

const router = express.Router();

// Send chat message
router.post('/', (req: express.Request, res: express.Response) => {
  try {
    const { user_id, digital_human_id, message, response }: any = req.body;
    
    if (!user_id || !digital_human_id || !message) {
      return res.status(400).json({
        success: false,
        error: 'User ID, digital human ID, and message are required'
      } as ApiResponse);
    }

    const chatMessage = ChatService.saveChatMessage({
      user_id,
      digital_human_id,
      message,
      response
    });

    res.status(201).json({
      success: true,
      data: chatMessage,
      message: 'Chat message saved successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Chat message creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get chat history
router.get('/history/:userId/:digitalHumanId', (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const digitalHumanId = parseInt(req.params.digitalHumanId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    
    if (isNaN(userId) || isNaN(digitalHumanId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID or digital human ID'
      } as ApiResponse);
    }

    const chatHistory = ChatService.getChatHistory(userId, digitalHumanId, limit, offset);

    res.json({
      success: true,
      data: chatHistory
    } as ApiResponse);

  } catch (error) {
    console.error('Chat history fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get user chat history
router.get('/user/:userId', (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse);
    }

    const chatHistory = ChatService.getUserChatHistory(userId, limit, offset);

    res.json({
      success: true,
      data: chatHistory
    } as ApiResponse);

  } catch (error) {
    console.error('User chat history fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get digital human chat history
router.get('/digital-human/:digitalHumanId', (req: express.Request, res: express.Response) => {
  try {
    const digitalHumanId = parseInt(req.params.digitalHumanId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;
    
    if (isNaN(digitalHumanId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid digital human ID'
      } as ApiResponse);
    }

    const chatHistory = ChatService.getDigitalHumanChatHistory(digitalHumanId, limit, offset);

    res.json({
      success: true,
      data: chatHistory
    } as ApiResponse);

  } catch (error) {
    console.error('Digital human chat history fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Update chat response
router.put('/:id/response', (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id);
    const { response } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid chat message ID'
      } as ApiResponse);
    }

    if (!response) {
      return res.status(400).json({
        success: false,
        error: 'Response is required'
      } as ApiResponse);
    }

    const chatMessage = ChatService.updateChatResponse(id, response);
    
    if (!chatMessage) {
      return res.status(404).json({
        success: false,
        error: 'Chat message not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: chatMessage,
      message: 'Chat response updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Chat response update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Delete chat message
router.delete('/:id/:userId', (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid chat message ID or user ID'
      } as ApiResponse);
    }

    const deleted = ChatService.deleteChatMessage(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Chat message not found or unauthorized'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Chat message deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Chat message delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Delete chat history
router.delete('/history/:userId/:digitalHumanId', (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const digitalHumanId = parseInt(req.params.digitalHumanId);
    
    if (isNaN(userId) || isNaN(digitalHumanId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID or digital human ID'
      } as ApiResponse);
    }

    const deleted = ChatService.deleteChatHistory(userId, digitalHumanId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'No chat history found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Chat history deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Chat history delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Search chat messages
router.get('/search/:query', (req: express.Request, res: express.Response) => {
  try {
    const query = req.params.query;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const digitalHumanId = req.query.digitalHumanId ? parseInt(req.query.digitalHumanId as string) : undefined;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      } as ApiResponse);
    }

    const chatMessages = ChatService.searchChatMessages(query, userId, digitalHumanId);

    res.json({
      success: true,
      data: chatMessages
    } as ApiResponse);

  } catch (error) {
    console.error('Chat search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get chat statistics
router.get('/stats/:userId?/:digitalHumanId?', (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId) : undefined;
    const digitalHumanId = req.params.digitalHumanId ? parseInt(req.params.digitalHumanId) : undefined;
    
    const stats = ChatService.getChatStatistics(userId, digitalHumanId);

    res.json({
      success: true,
      data: stats
    } as ApiResponse);

  } catch (error) {
    console.error('Chat stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get recent activity
router.get('/activity/recent', (req: express.Request, res: express.Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const activity = ChatService.getRecentActivity(limit);

    res.json({
      success: true,
      data: activity
    } as ApiResponse);

  } catch (error) {
    console.error('Recent activity fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;
