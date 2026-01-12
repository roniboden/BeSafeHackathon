import { readDB, saveDB } from '../utils/databaseHelper.js';

export const getShopItems = (req, res) => {
    const db = readDB();
    res.json(db.shop || []); 
};


// Helper function (You can move this to a separate utility later)
const sendPurchaseEmail = (userEmail, itemName) => {
    console.log(`Email sent to ${userEmail}: You successfully bought ${itemName}!`);
    // Logic for Nodemailer 
};

export const purchaseItem = (req, res) => {
    const { userId, itemId } = req.body;
    const db = readDB();

    const user = db.users.find(u => u.id == userId);
    const item = db.shop.find(i => i.id === itemId);

    if (!user || !item) {
        return res.status(404).json({ message: "User or Item not found" });
    }

    if (user.totalPoints < item.price) {
        return res.status(400).json({ message: "Insufficient points" });
    }

    // 1. Deduct points
    user.totalPoints -= item.price;

    // 2. Record the history
    // We initialize the array if it doesn't exist yet
    if (!user.purchaseHistory) {
        user.purchaseHistory = [];
    }

    const purchaseRecord = {
        purchaseId: Date.now(), // Unique-ish timestamp ID
        itemId: item.id,
        itemName: item.name,
        pricePaid: item.price,
        date: new Date().toISOString()
    };

    user.purchaseHistory.push(purchaseRecord);

    // 3. Save to Database
    saveDB(db);

    // 4. Trigger Email (Asynchronous)
    if (user.email) {
        sendPurchaseEmail(user.email, item.name);
    }

    res.json({ 
        success: true, 
        newBalance: user.totalPoints,
        history: user.purchaseHistory 
    });
};