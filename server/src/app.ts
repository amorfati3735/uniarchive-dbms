import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB, queryOne } from './config/db.js';
import resourceRoutes from './routes/resourceRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Connect to Database
console.log("Attempting DB Connect. URI present?", !!process.env.MONGO_URI);
connectDB().catch(err => {
    console.error("Database Connection Failure:", err);
    // We don't exit, allowing the app to start so /health works
});

// Middleware
// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    console.log(`[Request] ${req.method} ${req.path}`);
    if (req.path === '/api/health' || req.path === '/api/ping') {
        next();
        return;
    }

    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("DB Connection Await Error:", error);
        res.status(500).json({ message: "Database connection failed" });
    }
});
app.use(cors());
app.use(express.json());

// Static folder not needed for Vercel/Cloudinary
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/resources', resourceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('UniArchive API is running...');
});

// Health Check
app.get('/api/health', async (req, res) => {
    let dbState = 'disconnected';
    try {
        await queryOne('SELECT 1 AS ok');
        dbState = 'connected';
    } catch {
        dbState = 'error';
    }
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        dbState
    });
});

const PORT = process.env.PORT || 5000;

// Start the HTTP listener unless we are running as a serverless function.
// On Vercel the app is imported and invoked per-request (see api/index.ts),
// so it must not bind a port itself.
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
