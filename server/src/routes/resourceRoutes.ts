import express from 'express';
import {
    getResources,
    getResourceByIdHandler,
    createResourceHandler,
    updateInteractionHandler,
    addCommentHandler
} from '../controllers/resourceController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getResources)
    .post(upload.single('file'), createResourceHandler);

router.route('/:id').get(getResourceByIdHandler);

router.route('/:id/comments').post(addCommentHandler);

router.route('/:id/:action').post(updateInteractionHandler); // action: view, download, upvote

export default router;
