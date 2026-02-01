import express from 'express';
import { getMyBalance, getAllBalances } from '../Controllers/balanceController.js';
import { authMiddleware, managerMiddleware } from '../Middleware/authMiddleware.js';

const balanceRouter = express.Router();

// Protected routes
balanceRouter.get("/my-balance", authMiddleware, getMyBalance);
balanceRouter.get("/all", authMiddleware, managerMiddleware, getAllBalances);

export default balanceRouter;
