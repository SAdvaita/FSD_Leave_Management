import express from 'express';
import { clockIn, clockOut, getStatus, getMyHistory, getAllAttendance } from '../Controllers/attendanceController.js';
import { authMiddleware as protect, managerMiddleware } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/status', protect, getStatus);
router.get('/my-history', protect, getMyHistory);
router.get('/all', protect, managerMiddleware, getAllAttendance);

export default router;
