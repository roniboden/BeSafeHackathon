import express from 'express';
import multer from 'multer'; // 1. Import multer
import {
    getUserSummary,
    createReport
} from '../controllers/reportController.js';

const router = express.Router();

// 2. Configure multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

// GET a user's reports
router.get('/summary/:userID', getUserSummary);

// 3. Add the middleware here. 'image' must match the key name in your frontend FormData
router.post('/', upload.single('image'), createReport);

export default router;