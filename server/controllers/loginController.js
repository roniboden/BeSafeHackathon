import { readDB } from "../utils/databaseHelper.js";

export const login = (req, res) => {
    const {username, password} = req.body;
    const db = readDB();

    const user = db.users.find(us => us.username === username && us.password === password);

    if(user){
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                totalPoints: user.totalPoints
            }
        });
    } else{
        //unauthorized
        res.status(401).json({
            message: "invalid user"
        });
    }
};