import { Request, Response } from 'express';
import Otp from '../models/Otp.js';
import { sendEmail } from '../utils/email.js';

// @desc    Send OTP to email
// @route   POST /api/auth/otp
export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // if (!email || !email.endsWith('@vitstudent.ac.in')) {
        //     res.status(400).json({ message: 'Please use a valid VIT student email (@vitstudent.ac.in)' });
        //     return;
        // }

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Create or update OTP for this email
        await Otp.findOneAndUpdate(
            { email },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        await sendEmail(
            email,
            'UniArchive Verification Code',
            `Your verification code is: ${otp}`
        );

        res.json({ message: 'OTP sent successfully' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify
export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        const record = await Otp.findOne({ email, otp });

        if (record) {
            await Otp.deleteOne({ _id: record._id });
            res.json({ success: true, message: 'Verification successful' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
