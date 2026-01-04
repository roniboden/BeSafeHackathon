import express from 'express';

import{
    getShopItems,
    purchaseItem
} from '../controllers/shopControllers.js';

const router = express.Router();

// GET shop items
router.get('/items', getShopItems);
// POST purchase an item
router.post('/purchase/:itemID', purchaseItem);

export default router;
