import express from 'express';
import { sendOtp, verifyOtp, register, login, me } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);
export default router;
