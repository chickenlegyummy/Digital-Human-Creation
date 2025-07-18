import express from 'express';

const router = express.Router();

// Health check for auth service
router.get('/health', (req, res) => {
  res.json({ status: 'Auth service operational', timestamp: new Date().toISOString() });
});

// For now, most auth functionality is handled via Socket.IO
// These endpoints can be expanded later if needed

export default router;
