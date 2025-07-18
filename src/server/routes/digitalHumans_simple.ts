import express from 'express';

const router = express.Router();

// Health check for digital humans service
router.get('/health', (req, res) => {
  res.json({ status: 'Digital Humans service operational', timestamp: new Date().toISOString() });
});

// For now, most digital human functionality is handled via Socket.IO
// These endpoints can be expanded later if needed

export default router;
