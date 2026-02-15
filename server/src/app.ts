import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/db';
import resourceRoutes from './routes/resourceRoutes';
import statsRoutes from './routes/statsRoutes';
import aiRoutes from './routes/aiRoutes';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

// Connect to Database
connectDB().catch(err => {
    console.error("Database Connection Failure:", err);
    // We don't exit, allowing the app to start so /health works
});

// Middleware
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
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        dbState: mongoose.connection.readyState
    });
});

const PORT = process.env.PORT || 5000;

// Only listen if the file is run directly (not imported)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
