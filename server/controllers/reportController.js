import {readDB, saveDB} from '../utils/databaseHelper.js';

//weekly goal
const WEEKLY_GOAL_TARGET = 5;
const WEEKLY_GOAL_REWARD = 500; 

// map for points per action
const POINT_VALUES = {
    "reportPost": 50,
    "safetyTips": 10,
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
        stats: user.reportCounts,      // { watch_video: 5, steps: 2...}
        weeklyGoalStat: user.weeklyGoalCount,
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

    
    const COOLDOWN_MS = 5 * 60 * 1000; //5 minutes cooldown
    const now = new Date();

    if(user.lastReportTime != null){
        const lastTime = new Date(user.lastReportTime);
        if(now - lastTime < COOLDOWN_MS){
            const timeLeft = Math.ceil((COOLDOWN_MS - (now - lastTime))/1000);
            //429 - too many requests
            return res.status(429).json({
                message: `Request sent too close to last report update ${timeLeft} seconds left`
            });
        }
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
    user.lastReportTime = now.toISOString(); //store last update
    db.reports.push(newReport); //save the report
    //add report to user's count
    if (!user.reportCounts) user.reportCounts = {};
    user.reportCounts[action] = (user.reportCounts[action] || 0) + 1;
    let achievedGoalNow = false; //make sure we reached this only now
    //check if user completed weekly goal
    if(!user.achievedGoal){
        user.weeklyGoalCount = (user.weeklyGoalCount || 0) + 1; //update
        if(user.weeklyGoalCount >= WEEKLY_GOAL_TARGET){
            user.weeklyGoalCount = WEEKLY_GOAL_TARGET; // Make sure it stays at target
            user.totalPoints += WEEKLY_GOAL_REWARD;
            user.achievedGoal = true;
            achievedGoalNow = true;
            //add email notification?
            console.log(`${user.username} reached weekly goal`);
        }
    }
    
    saveDB(db);
    
    //201 - created
    res.status(201).json({
        message: "Report added successfully",
        report: newReport,
        newTotalPoints: user.totalPoints,
        newStats: user.reportCounts,
        weeklyGoalCount: user.weeklyGoalCount,
        goalReachedNow: user.weeklyGoalCount === WEEKLY_GOAL_TARGET && achievedGoalNow // achieved goal NOW
    });
};

export {
    getUserSummary,
    createReport
};