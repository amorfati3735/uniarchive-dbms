import { Request, Response } from 'express';
import { upsertOtp, verifyAndConsumeOtp } from '../repositories/authRepository.js';
import { sendEmail } from '../utils/email.js';

// @desc    Send OTP to email
// @route   POST /api/auth/otp
export const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // University-domain restriction (enable for the real deployment):
        // if (!email || !email.endsWith('@vitstudent.ac.in')) {
        //     res.status(400).json({ message: 'Please use a valid VIT student email (@vitstudent.ac.in)' });
        //     return;
        // }

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // One live OTP per email (upsert on the email primary key).
        await upsertOtp(email, otp);

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

        const ok = await verifyAndConsumeOtp(email, otp);

        if (ok) {
            res.json({ success: true, message: 'Verification successful' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
