import { readDB, saveDB } from '../utils/databaseHelper.js';
import { sendPurchaseEmail } from '../utils/mailer.js';

export const getShopItems = (req, res) => {
    const db = readDB();
    res.json(db.shop || []); 
};

export const purchaseItem = (req, res) => {
    const { userId, itemId } = req.body;
    const db = readDB();

    // 1. Initialize variables FIRST
    const user = db.users.find(u => u.id == userId);
    const item = db.shop.find(i => i.id === itemId);
  console.log("purchaseItem hit", req.body);

    // 2. Validate existence immediately after initialization
    if (!user || !item) {
        console.log("Error: User or Item not found");
        return res.status(404).json({ message: "User or Item not found" });
    }

    // 3. Log user email safely now that 'user' is initialized
    console.log("Checking user email:", user.email); 

    if (user.totalPoints < item.price) {
        return res.status(400).json({ message: "Insufficient points" });
    }

    // 4. Update data
    user.totalPoints -= item.price;
    if (!user.purchaseHistory) user.purchaseHistory = [];

    const purchaseRecord = {
        purchaseId: Date.now(),
        itemId: item.id,
        itemName: item.name,
        pricePaid: item.price,
        date: new Date().toISOString()
    };
    user.purchaseHistory.push(purchaseRecord);
        console.log("Attempting to send email to:", user.email);

    // 5. Save to Database
    saveDB(db);

    // 6. Trigger Real Email
    if (user.email) {
        console.log("Attempting to send email to:", user.email);
        // This runs in the background
        sendPurchaseEmail(user.email, item.name, item.price);
    }

    // 7. Send Response
    res.json({ 
        success: true, 
        newBalance: user.totalPoints,
        history: user.purchaseHistory 
    });
};