import express from 'express';
import {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    approveLeave,
    rejectLeave
} from '../Controllers/leaveController.js';
import { authMiddleware, employeeMiddleware, managerMiddleware } from '../Middleware/authMiddleware.js';

const leaveRouter = express.Router();

// Employee routes
leaveRouter.post("/apply", authMiddleware, employeeMiddleware, applyLeave);
leaveRouter.get("/my-leaves", authMiddleware, getMyLeaves);

// Manager routes
leaveRouter.get("/all", authMiddleware, managerMiddleware, getAllLeaves);
leaveRouter.put("/:id/approve", authMiddleware, managerMiddleware, approveLeave);
leaveRouter.put("/:id/reject", authMiddleware, managerMiddleware, rejectLeave);

export default leaveRouter;
