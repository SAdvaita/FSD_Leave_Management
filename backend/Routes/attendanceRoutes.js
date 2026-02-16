import express from 'express';
import { clockIn, clockOut, getStatus } from '../Controllers/attendanceController.js';
import { authMiddleware as protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/status', protect, getStatus);

export default router;
