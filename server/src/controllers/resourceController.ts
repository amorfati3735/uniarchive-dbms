import { Request, Response } from 'express';
import Resource, { IResource } from '../models/Resource.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Get all resources
// @route   GET /api/resources
export const getResources = async (req: Request, res: Response) => {
    try {
        const { type, slot, course, search } = req.query;
        const query: any = {};

        if (type && type !== 'ALL') query.type = type;
        if (slot && slot !== 'ALL') query.slot = slot;
        if (course) query.courseCode = { $regex: course, $options: 'i' };

        if (search) {
            query.$text = { $search: search as string };
        }

        const resources = await Resource.find(query).sort({ createdAt: -1 });
        res.json(resources);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
export const getResourceById = async (req: Request, res: Response) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (resource) {
            res.json(resource);
        } else {
            res.status(404).json({ message: 'Resource not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new resource
// @route   POST /api/resources
export const createResource = async (req: Request, res: Response) => {
    try {
        // req.file contains the uploaded file
        // req.body.data contains the JSON string of metadata

        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const metadata = JSON.parse(req.body.data);

        let result;
        try {
            console.log('[Upload] Starting Cloudinary upload...');
            result = await uploadToCloudinary(req.file.buffer);
            console.log('[Upload] Cloudinary success:', result.secure_url);
        } catch (uploadError: any) {
            console.error('[Upload] Cloudinary Failed:', uploadError);
            res.status(500).json({ message: 'Cloud Upload Failed: ' + (uploadError.message || uploadError) });
            return;
        }

        const resource = new Resource({
            ...metadata,
            pdfUrl: result.secure_url,
            author: 'You', // Mock user for now
        });

        const createdResource = await resource.save();
        res.status(201).json(createdResource);
    } catch (error: any) {
        console.error('[CreateResource] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment interaction counters
// @route   POST /api/resources/:id/:action
export const updateInteraction = async (req: Request, res: Response) => {
    try {
        const { id, action } = req.params;
        const resource = await Resource.findById(id);

        if (!resource) {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }

        switch (action) {
            case 'view':
                resource.views = (resource.views || 0) + 1;
                break;
            case 'download':
                resource.downloads = (resource.downloads || 0) + 1;
                break;
            case 'upvote':
                resource.upvotes = (resource.upvotes || 0) + 1;
                break;
            case 'downvote': // Optional
                resource.upvotes = (resource.upvotes || 0) - 1;
                break;
            default:
                res.status(400).json({ message: 'Invalid action' });
                return;
        }

        await resource.save();
        res.json({ success: true, [action + 's']: resource[action as keyof IResource] });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment
// @route   POST /api/resources/:id/comments
export const addComment = async (req: Request, res: Response) => {
    try {
        const { text, author } = req.body;
        const resource = await Resource.findById(req.params.id);

        if (resource) {
            const comment = {
                id: new Date().getTime().toString(), // Simple ID generation
                text,
                author: author || 'Anonymous',
                timestamp: new Date(),
                upvotes: 0,
                isOp: false // Logic to check if author is resource author can be added here
            };

            resource.comments.unshift(comment as any);
            await resource.save();
            res.status(201).json(comment);
        } else {
            res.status(404).json({ message: 'Resource not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
