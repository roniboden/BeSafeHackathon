import { readDB, saveDB } from "../utils/databaseHelper.js";
import bcrypt from 'bcryptjs';


export const register = async (req, res) => {
    const { username, password, email } = req.body;
    const db = readDB();

    if (!username || !password || !email) {
        return res.status(400).json({ message: "missing fields" });
    }

    const usernameTaken = db.users.some(u => u.username === username);
    if (usernameTaken) {
        return res.status(409).json({ message: "username already exists" });
    }

    const emailTaken = db.users.some(u => u.email === email);
    if (emailTaken) {
        return res.status(409).json({ message: "email already exists" });
    }

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const nextId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;

      const newUser = {
          id: nextId,
          username,
          hashedPassword,   // secured now
          email,
          totalPoints: 0,
          weeklyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
          monthlyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
          weekKey: db.users[0]?.weekKey || "2026-W02",
          monthKey: db.users[0]?.monthKey || "2026-01",
          achievedGoal: false,
          lastReportTime: null,
          monthlyGoalAchieved: false,
          streak : {
          current: 1,
          best: 1,
          lastActiveDate: new Date().toISOString().slice(0, 10)
        },
        profile: {
          displayName: username,
          bio: "",
          avatarUrl: "",
          achievements: [],
          friends: [],
          privacy: {
            showStats: true
          }
        }

      }

      db.users.push(newUser);
      saveDB(db);

      return res.status(201).json({
          message: "Registration successful",
          user: {
          id: newUser.id,
          username: newUser.username,
          totalPoints: newUser.totalPoints
          }
    });
    
    } catch (error) {
        return res.status(500).json({ message: "Error creating user", reason: error.message });
    }

    
};
