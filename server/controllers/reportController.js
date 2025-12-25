import users from '../data/userData.js';

// map for points per action
const POINT_VALUES = {
    "report_miscondut" : 50,
    "watch_video": 50,
    "steps": 20,
    "extra": 5
};

let reports = [];


//get all reports
const getAllReports = (req, res) => {
    res.status(200).json(users);
};

// get a specific user report?
const getReport = (res, req) => {
    const userID = parseInt(req.params.userID);
    const userReports = reports.filter(rep => rep.userID === userID);
    res.status(200).json(userReports)
};

// create a report and update user points
const createReport = (req, res) => {
    const { userID, action, descrition } = req.body;

    // search for this user (use === for both type and value)
    const user = users.find(us => us.id === parseInt(userID));
    // validate user
    if (!user){
        return res.status(404).json({message: "User not found"});
    }

    //get the points from the map
    const pointsEarned = POINT_VALUES[action] || POINT_VALUES["extra"];
    //create the report object
    const newReport = {
        id: reports.length,
        userID,
        action,
        descrition,
        pointsEarned,
        timestamp: new Date().toISOString //do we need this?
    }

    reports.push(newReport); //save the report
    user.totalPoints += pointsEarned; //update user points
    
    //201 - created
    res.status(201).json({
        mesage: "Report added successfully",
        report: newReport,
        newTotalPoints: user.totalPoints
    });
};

export {
    getAllReports,
    getReport,
    createReport
};