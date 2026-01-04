import {readDB, saveDB} from '../utils/databaseHelper.js';

// get the shop array from the database
const getShopItems = (req, res) => {
    const db = readDB();
    res.status(200).json(db.shop || []);
};

const purchaseItem = (req, res) => {
    const { userID, itemID } = req.body;
    const db = readDB();

    //check for user and item in db
    const user = db.users.find(u => u.id === parseInt(userID));
    const item = db.shops.find(it => it.id === itemID);
    //validate them
    if(!user) return res.status(404).json({message: "User not found"});
    if(!item) return res.status(404).json({message: "Item not found"});
    //check if user has enough points
    if(user.totalPoints < item.price){
        return res.status(400).json({message: "Not enough points"});
    }

    //if successful, update
    user.totalPoints-=item.price;
    // maybe add tracking to an item? inventory?
    
    saveDB(db);
    res.status(200).json({message: "Purchase successful"});

};

export {getShopItems,
        purchaseItem
};