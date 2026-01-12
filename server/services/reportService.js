import { readDB, saveDB } from "../utils/databaseHelper.js";
import { checkCooldown } from "./cooldownService.js";
import { validateReport } from "./validateService.js";
import { updateUserPoints } from "./pointsService.js";
import { updateGoalStatus } from "./goalService.js";
import {applyDailyStreak} from "../utils/streak.js";

const COOLDOWN_MS = 1; // 5 * 60 * 1000; // 5 minutes

export const createReportService = async ({ userId, action, description, imageUrl }) => {
  const db = readDB();
  const id = Number(userId);

  const user = db.users?.find(u => u.id === id);
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // Cooldown check
  checkCooldown(user, COOLDOWN_MS);

  // AI validation
  const aiDecision = await validateReport({ description, action, imageUrl });
  if (!aiDecision.isValid) {
    throw { 
      status: 400, 
      message: `Report rejected by AI: ${aiDecision.reason}`,
      aiReason: aiDecision.reason 
    };
  }

  // Points update
  const pointsEarned = updateUserPoints(user, action);

  //streak update
  applyDailyStreak(user);

  // Create report object
  const now = new Date();
  const newReport = {
    id: Date.now(),
    userID: id,
    action,
    description,
    imageUrl,
    pointsEarned,
    timestamp: now.toISOString(),
    aiReason: aiDecision.reason
  };

  db.reports.push(newReport);

  // Update weekly goal
  const achievedGoalNow = updateGoalStatus(user);

  saveDB(db);

  return {
    message: "Report added successfully",
    report: newReport,
    newTotalPoints: user.totalPoints,
    newStats: user.reportCounts,
    weeklyGoalCount: user.weeklyGoalCount,
    goalReachedNow: achievedGoalNow,
    aiReason: aiDecision.reason
  };
};
