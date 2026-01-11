import { readDB, saveDB } from "../utils/databaseHelper.js";
import { updateUserPoints } from "../services/pointsService.js"; // uses action="safetyTips"
import { updateGoalStatus } from "../services/goalService.js";
import { ensurePeriodsCurrent } from "../services/periodService.js";
import { applyDailyStreak } from "../utils/streak.js";

/**
 * get a random tip for the user
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const getRandomTip = (_req, res) => {
  const db = readDB();
  const tips = db["safety-tips"] || [];

  if (!tips.length) return res.status(404).json({ message: "No tips available" });

  const tip = tips[Math.floor(Math.random() * tips.length)];

  // IMPORTANT: we want to avoid sending the correct answer to the client :(
  return res.status(200).json({
    id: tip.id,
    title: tip.title,
    text: tip.text,
    quiz: {
      question: tip.quiz.question,
      options: tip.quiz.options
    }
  });
};

export const submitTipAnswer = (req, res) => {
  try {
    const { userID, tipId, selectedAnswer } = req.body;

    const db = readDB();
    const user = db.users.find(u => u.id === Number(userID));
    if (!user) return res.status(404).json({ message: "User not found" });

    ensurePeriodsCurrent(user);

    const tips = db["safety-tips"] || [];
    const tip = tips.find(t => t.id === tipId);
    if (!tip) return res.status(404).json({ message: "Tip not found" });

    if (!tipId || !selectedAnswer) {
        return res.status(400).json({ message: "Missing tipId or selectedAnswer" });
    }

    const isCorrect = selectedAnswer === tip.quiz.correctAnswer;

    if (!isCorrect) {
      saveDB(db);
      return res.status(200).json({
        isCorrect: false,
        message: "Wrong answer, try again!",
        newTotalPoints: user.totalPoints,
        weeklyCounts: user.weeklyCounts,
        monthlyCounts: user.monthlyCounts
      });
    }

    const pointsEarned = updateUserPoints(user, "safetyTips");
    applyDailyStreak(user); // update streak
    const monthlyGoalAchieved = updateGoalStatus(user);

    saveDB(db);

    return res.status(200).json({
      isCorrect: true,
      message: `Correct! You earned ${pointsEarned} points, keep it up!`,
      pointsEarned,
      newTotalPoints: user.totalPoints,
      weeklyCounts: user.weeklyCounts,
      monthlyCounts: user.monthlyCounts,
      monthlyGoalAchieved
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Server error",
      reason: error.reason || "Safety tips answer submit failed"
    });
  }
};