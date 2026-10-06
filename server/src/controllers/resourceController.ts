import { Request, Response } from 'express';
import {
    listResources,
    getResourceById,
    createResource,
    incrementInteraction,
    addComment
} from '../repositories/resourceRepository.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Get all resources
// @route   GET /api/resources
export const getResources = async (req: Request, res: Response) => {
    try {
        const { type, slot, course, search } = req.query;
        const resources = await listResources({
            type: type as string,
            slot: slot as string,
            course: course as string,
            search: search as string
        });
        res.json(resources);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
export const getResourceByIdHandler = async (req: Request, res: Response) => {
    try {
        const resource = await getResourceById(req.params.id);
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
export const createResourceHandler = async (req: Request, res: Response) => {
    try {
        // req.file holds the uploaded file; req.body.data is the JSON metadata.
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const metadata = JSON.parse(req.body.data);

        let result;
        try {
            console.log('[Upload] Starting Cloudinary upload...');
            // 'image' for images, 'raw' for everything else (PDFs, Docs) to prevent corruption.
            const isImage = req.file.mimetype.startsWith('image/');
            const resourceType = isImage ? 'image' : 'raw';
            result = await uploadToCloudinary(req.file.buffer, 'uniarchive', resourceType);
            console.log('[Upload] Cloudinary success:', result.secure_url);
        } catch (uploadError: any) {
            console.error('[Upload] Cloudinary Failed:', uploadError);
            res.status(500).json({ message: 'Cloud Upload Failed: ' + (uploadError.message || uploadError) });
            return;
        }

        const created = await createResource(metadata, result.secure_url, 'You');
        res.status(201).json(created);
    } catch (error: any) {
        console.error('[CreateResource] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment interaction counters
// @route   POST /api/resources/:id/:action
export const updateInteractionHandler = async (req: Request, res: Response) => {
    try {
        const { id, action } = req.params;
        const valid = ['view', 'download', 'upvote', 'downvote'];
        if (!valid.includes(action)) {
            res.status(400).json({ message: 'Invalid action' });
            return;
        }

        const result = await incrementInteraction(id, action as any);
        if (!result) {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }

        res.json({ success: true, [action + 's']: result.value });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment
// @route   POST /api/resources/:id/comments
export const addCommentHandler = async (req: Request, res: Response) => {
    try {
        const { text, author } = req.body;
        if (!text || !String(text).trim()) {
            res.status(400).json({ message: 'Comment text is required' });
            return;
        }

        const comment = await addComment(req.params.id, String(text).trim(), author || 'Anonymous');
        if (!comment) {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }
        res.status(201).json(comment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
