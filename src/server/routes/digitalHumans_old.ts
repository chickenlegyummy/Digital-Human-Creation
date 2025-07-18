import express from 'express';
import { ApiResponse, CreateDigitalHumanRequest, PaginationParams } from '../types/interfaces.js';
import DigitalHumanService from '../services/DigitalHumanService_new.js';

const router = express.Router();

// Create new digital human
router.post('/', (req: express.Request, res: express.Response) => {
  try {
    const { user_id, ...digitalHumanData }: CreateDigitalHumanRequest & { user_id: number } = req.body;
    
    if (!user_id || !digitalHumanData.name || !digitalHumanData.personality) {
      return res.status(400).json({
        success: false,
        error: 'User ID, name, and personality are required'
      } as ApiResponse);
    }

    const digitalHuman = DigitalHumanService.createDigitalHuman({
      user_id,
      ...digitalHumanData
    });

    res.status(201).json({
      success: true,
      data: digitalHuman,
      message: 'Digital human created successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Digital human creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get digital human by ID
router.get('/:id', (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid digital human ID'
      } as ApiResponse);
    }

    const digitalHuman = DigitalHumanService.getDigitalHumanById(id);
    
    if (!digitalHuman) {
      return res.status(404).json({
        success: false,
        error: 'Digital human not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: digitalHuman
    } as ApiResponse);

  } catch (error) {
    console.error('Digital human fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get digital humans by user
router.get('/user/:userId', (req: express.Request, res: express.Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse);
    }

    const digitalHumans = DigitalHumanService.getDigitalHumansByUserId(userId);

    res.json({
      success: true,
      data: digitalHumans
    } as ApiResponse);

  } catch (error) {
    console.error('User digital humans fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get public digital humans
router.get('/public/list', (req: express.Request, res: express.Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const digitalHumans = DigitalHumanService.getPublicDigitalHumans(limit, offset);

    res.json({
      success: true,
      data: digitalHumans
    } as ApiResponse);

  } catch (error) {
    console.error('Public digital humans fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Update digital human
router.put('/:id', (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid digital human ID'
      } as ApiResponse);
    }

    // Remove sensitive fields from updates
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;

    const digitalHuman = DigitalHumanService.updateDigitalHuman(id, updates);
    
    if (!digitalHuman) {
      return res.status(404).json({
        success: false,
        error: 'Digital human not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: digitalHuman,
      message: 'Digital human updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Digital human update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Delete digital human
router.delete('/:id/:userId', (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid digital human ID or user ID'
      } as ApiResponse);
    }

    const deleted = DigitalHumanService.deleteDigitalHuman(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Digital human not found or unauthorized'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Digital human deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Digital human delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Search digital humans
router.get('/search/:query', (req: express.Request, res: express.Response) => {
  try {
    const query = req.params.query;
    const includePrivate = req.query.includePrivate === 'true';
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      } as ApiResponse);
    }

    const digitalHumans = DigitalHumanService.searchDigitalHumans(query, includePrivate, userId);

    res.json({
      success: true,
      data: digitalHumans
    } as ApiResponse);

  } catch (error) {
    console.error('Digital human search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Toggle public status
router.patch('/:id/:userId/toggle-public', (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid digital human ID or user ID'
      } as ApiResponse);
    }

    const digitalHuman = DigitalHumanService.togglePublicStatus(id, userId);
    
    if (!digitalHuman) {
      return res.status(404).json({
        success: false,
        error: 'Digital human not found or unauthorized'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: digitalHuman,
      message: `Digital human ${digitalHuman.is_public ? 'made public' : 'made private'} successfully`
    } as ApiResponse);

  } catch (error) {
    console.error('Digital human toggle public error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// Get statistics
router.get('/stats/:userId?', (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId) : undefined;
    
    const stats = DigitalHumanService.getStatistics(userId);

    res.json({
      success: true,
      data: stats
    } as ApiResponse);

  } catch (error) {
    console.error('Digital human stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;
