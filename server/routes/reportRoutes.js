import express from 'express';

import{
    getAllReports,
    getReport,
    createReport
} from '../controllers/reportController.js';

const router = express.Router();

// GET all reports
router.get('/', getAllReports);
// GET a user's reports
router.get('/user/:userID', getReport);
// POST a new report
router.post('/', createReport);

export default router;
