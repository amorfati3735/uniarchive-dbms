import { Request, Response } from 'express';
import { getCourseStats, getTopSlots } from '../repositories/statsRepository.js';

// @desc    Get dashboard stats
// @route   GET /api/stats
export const getStats = async (_req: Request, res: Response) => {
    try {
        const [courseStats, topSlots] = await Promise.all([
            getCourseStats(),
            getTopSlots(5)
        ]);
        res.json({ courseStats, topSlots });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
