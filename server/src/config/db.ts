import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            return;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniarchive');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        // In serverless, do NOT exit. Throw so the function error is logged.
        throw new Error(`Database connection failed: ${error.message}`);
    }
};

export default connectDB;
