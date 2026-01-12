import { readDB } from "../utils/databaseHelper.js";
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
    const {username, password} = req.body;
    const db = readDB();

    const user = db.users.find(us => us.username === username); // removed the password check for now

    if(user){
        try{
            const isMatch = await bcrypt.compare(password, user.hashedPassword);
            if(isMatch){
                return res.status(200).json({
                    message: "Login successful",
                    user: {
                        id: user.id,
                        username: user.username,
                        totalPoints: user.totalPoints,
                        streak: user.streak,
                        profile: user.profile
                    }
                });
            }
            else{
                return res.status(401).json({ message: "Invalid username or password" });
            }

            

        } catch(error){
            return res.status(500).json({ 
                message: `Error verifying credentials: ${error.message}` 
            });
        }

        return res.status(401).json({
            message: "Invalid username or password"
        });
    }
};