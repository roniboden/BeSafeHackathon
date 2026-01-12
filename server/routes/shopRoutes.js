import express from 'express';
import { getShopItems, purchaseItem } from '../controllers/shopControllers.js';

const router = express.Router();

router.get('/items', getShopItems);
router.post('/buy', purchaseItem);

export default router;