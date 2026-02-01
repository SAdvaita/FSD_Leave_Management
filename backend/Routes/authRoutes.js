import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getProfile
} from '../Controllers/authController.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

const authRouter = express.Router();

// Public routes
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

// Protected routes
authRouter.get("/logout", authMiddleware, logoutUser);
authRouter.get("/profile", authMiddleware, getProfile);

export default authRouter;
