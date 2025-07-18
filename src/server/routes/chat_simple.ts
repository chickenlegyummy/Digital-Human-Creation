import express from 'express';

const router = express.Router();

// Health check for chat service
router.get('/health', (req, res) => {
  res.json({ status: 'Chat service operational', timestamp: new Date().toISOString() });
});

// For now, most chat functionality is handled via Socket.IO
// These endpoints can be expanded later if needed

export default router;
