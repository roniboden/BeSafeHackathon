import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/database.json');

//manage db
const readDB = () => {
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

const saveDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const resetUsersWeeklyGoal = () =>{
// reset on sunday 12am
    cron.schedule('0 0 * * 0', () => {
    console.log('--STARTING: weekly goal reset');
    const db = readDB();
    db.users.forEach(user => {
            user.weeklyGoalCount = 0;
            user.achievedGoal = false;
    });
    saveDB(db);
    
    console.log('--FINISHED: weekly goal reset');
    });
};

export{
    saveDB,
    readDB,
    resetUsersWeeklyGoal
};
