import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/database.json');

const readDB = () => {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

const saveDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// map for points per action
const POINT_VALUES = {
    "reportPost" : 50,
    "safetyTips": 50,
    "reportGood": 20,
    "extra": 5
};


// get a specific user report?
const getUserSummary = (req, res) => {
    const db = readDB();
    const userID = parseInt(req.params.userID);

    // search for this user (use === for both type and value)
    const user = db.users.find(u => u.id === userID);
    // validate user
    if (!user){
        return res.status(404).json({message: "User not found"});
    }

    const userReports = db.reports.filter(rep => rep.userID === userID);

    res.status(200).json({
        username: user.username,
        totalPoints: user.totalPoints,
        stats: user.reportCounts,      // This is your { watch_video: 5, steps: 2 ... }
        history: userReports           // The actual list of report objects
    });
};

// create a report and update user points
const createReport = (req, res) => {
    const { userID, action, description } = req.body;
    const db = readDB();

    // search for this user (use === for both type and value)
    const user = db.users.find(u => u.id === parseInt(userID));
    // validate user
    if (!user){
        return res.status(404).json({message: "User not found"});
    }

    //get the points from the map
    const pointsEarned = POINT_VALUES[action] || POINT_VALUES["extra"];
    //create the report object
    const newReport = {
        id: db.reports.length + 1,
        userID: parseInt(userID),
        action,
        description,
        pointsEarned,
        timestamp: new Date().toISOString()
    }

    user.totalPoints += pointsEarned; //update user's points
    db.reports.push(newReport); //save the report
    //add report to user's count
    if (!user.reportCounts) user.reportCounts = {};
    user.reportCounts[action] = (user.reportCounts[action] || 0) + 1;
    
    saveDB(db);
    
    //201 - created
    res.status(201).json({
        mesage: "Report added successfully",
        report: newReport,
        newTotalPoints: user.totalPoints,
        newStats: user.reportCounts
    });
};

export {
    getUserSummary,
    createReport
};