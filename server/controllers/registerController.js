import { readDB, saveDB } from "../utils/databaseHelper.js";

export const register = (req, res) => {
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

    const nextId = db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1;

    const newUser = {
        id: nextId,
        username,
        password,   // (yes, plain text for now)
        email,
        totalPoints: 0,
        weeklyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
        monthlyCounts: { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 },
        weekKey: db.users[0]?.weekKey || "2026-W02",
        monthKey: db.users[0]?.monthKey || "2026-01",
        achievedGoal: false,
        lastReportTime: null,
        monthlyGoalAchieved: false
    };

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
};
