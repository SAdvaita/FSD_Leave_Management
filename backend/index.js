import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './Database/connection.js';
import authRouter from './Routes/authRoutes.js';
import leaveRouter from './Routes/leaveRoutes.js';
import balanceRouter from './Routes/balanceRoutes.js';
import attendanceRouter from './Routes/attendanceRoutes.js';
import profileRouter from './Routes/profileRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Routes
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Leave Management System API",
        version: "1.0.0",
        status: "running"
    });
});

app.use("/api/auth", authRouter);
app.use("/api/leaves", leaveRouter);
app.use("/api/balance", balanceRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/profile", profileRouter);
app.use("/uploads", express.static("uploads"));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    connectDB();
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
