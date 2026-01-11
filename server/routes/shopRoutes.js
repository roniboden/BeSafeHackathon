import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/database.json');

const readDb = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database:", error);
        return { users: [], shop: [] };
    }
};

const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

router.get('/items', (req, res) => {
    const db = readDb();
    res.json(db.shop || []);
});

router.post('/buy', (req, res) => {
    const { userId, itemId } = req.body;

    try {
        const db = readDb();

        const user = db.users.find(u => u.id == userId);
        const item = db.shop.find(p => p.id === itemId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        if (user.totalPoints < item.price) {
            return res.status(400).json({ message: "Insufficient points for this purchase" });
        }

        user.totalPoints -= item.price;
        
        writeDb(db);

        res.json({
            success: true,
            newBalance: user.totalPoints,
            message: `Successfully purchased ${item.name}`
        });

    } catch (error) {
        console.error("Purchase error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;