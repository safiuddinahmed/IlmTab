import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'AyahTab backend is running' });
});

export default router;
