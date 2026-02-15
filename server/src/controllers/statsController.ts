import { Request, Response } from 'express';
import CourseStats from '../models/CourseStats.js';
import Resource from '../models/Resource.js';

// @desc    Get dashboard stats
// @route   GET /api/stats
export const getStats = async (req: Request, res: Response) => {
    try {
        // Fetch pre-aggregated course stats
        const courseStats = await CourseStats.find({});

        // Calculate top slots dynamically or return static structure if complex
        // For MVP, we'll aggregate from Resources
        const slotAggregation = await Resource.aggregate([
            {
                $group: {
                    _id: "$slot",
                    resources: { $sum: 1 },
                    qualitySum: { $sum: "$qualityScore" }
                }
            },
            {
                $project: {
                    name: "$_id",
                    resources: 1,
                    score: { $divide: ["$qualitySum", "$resources"] }
                }
            },
            { $sort: { resources: -1 } },
            { $limit: 5 }
        ]);

        // Map aggregation to match TopSlotData format if needed, or just return as is
        // Frontend expects: { name, resources, score }
        const topSlots = slotAggregation.map(s => ({
            name: s.name,
            resources: s.resources,
            score: Math.round(s.score || 0)
        }));

        res.json({
            courseStats,
            topSlots
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
