import { Request, Response } from 'express';
import {
    upsertOtp,
    secondsSinceLastOtp,
    otpResendWindowSeconds,
    verifyAndConsumeOtp,
    authenticateUser
} from '../repositories/authRepository.js';
import { sendEmail } from '../utils/email.js';

/**
 * Whether the server can actually send email right now.  When SMTP is absent the
 * OTP flow is disabled (returns 503) so a demo deploy without SMTP does not crash.
 */
const smtpReady = ():
    | { ok: true }
    | { ok: false; reason: string } => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) return { ok: false, reason: 'SMTP not configured' };
    return { ok: true };
};

/**
 * Optional university-domain restriction. Set ALLOWED_EMAIL_DOMAIN (e.g.
 * "vitstudent.ac.in") to require it; leave unset and any address is accepted.
 */
const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;
const domainAllowed = (email: string) =>
    !allowedDomain || email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`);

// @desc    Send OTP to email (requires SMTP)
// @route   POST /api/auth/otp
export const sendOtp = async (req: Request, res: Response) => {
    const smtp = smtpReady();
    if (!smtp.ok) {
        res.status(503).json({ message: `OTP unavailable: ${smtp.reason}. Use /api/auth/login for the demo account.` });
        return;
    }

    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        if (!domainAllowed(email)) {
            res.status(400).json({ message: `Please use a valid @${allowedDomain} email address` });
            return;
        }

        // Throttle: don't burn an email if one was just requested for this address.
        const age = await secondsSinceLastOtp(email);
        if (age !== null && age < otpResendWindowSeconds) {
            res.status(429).json({
                message: `Please wait ${otpResendWindowSeconds - age}s before requesting another code`
            });
            return;
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await upsertOtp(email, otp);
        await sendEmail(email, 'UniArchive Verification Code', `Your verification code is: ${otp}`);

        res.json({ message: 'OTP sent successfully' });
    } catch (error: any) {
        console.error(error);
        // Don't leak provider details (e.g. SMTP credentials) to the client.
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify
export const verifyOtp = async (req: Request, res: Response) => {
    const smtp = smtpReady();
    if (!smtp.ok) {
        res.status(503).json({ success: false, message: `OTP unavailable: ${smtp.reason}. Use /api/auth/login for the demo account.` });
        return;
    }

    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            res.status(400).json({ success: false, message: 'Email and code are required' });
            return;
        }

        const user = await verifyAndConsumeOtp(email, otp);

        if (user) {
            res.json({ success: true, message: 'Verification successful', user });
        } else {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Password login for the demo account
// @route   POST /api/auth/login
//   Body: { username, password }
//   Demo credential:  admin123  /  scse
//   Returns the same public User shape that /api/auth/verify returns, so the
//   frontend login overlay can switch between OTP and password without changing
//   onLogin(...).
export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ success: false, message: 'Username and password are required' });
            return;
        }

        const user = await authenticateUser(String(username), String(password));
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
            return;
        }

        res.json({ success: true, message: 'Login successful', user });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
