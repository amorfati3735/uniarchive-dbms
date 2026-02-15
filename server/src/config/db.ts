import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let cachedFn: any = null;

const connectDB = async () => {
    if (cachedFn) {
        return cachedFn;
    }

    try {
        const opts = {
            bufferCommands: false, // Disable Mongoose buffering to fail fast if not connected
        };

        cachedFn = mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniarchive', opts);
        const conn = await cachedFn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        throw new Error(`Database connection failed: ${error.message}`);
    }
};

export default connectDB;
