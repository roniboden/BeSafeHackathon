import { readDB, saveDB } from "../utils/databaseHelper.js";
import { checkCooldown } from "./cooldownService.js";
import { validateReport } from "./validateService.js";
import { updateUserPoints } from "./pointsService.js";
import { updateGoalStatus } from "./goalService.js";
import {applyDailyStreak} from "../utils/streak.js";

const COOLDOWN_MS = 1; // 5 * 60 * 1000; // 5 minutes
const DAILY_CHALLENGE_BONUS = 50;

export const createReportService = async ({ userId, action, description, isDailyChallenge = false }) => {
  const db = readDB();
  const id = Number(userId);

  const user = db.users?.find(u => u.id === id);
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  if (isDailyChallenge) {
      const today = new Date().toDateString();
      const lastChallenge = user.lastChallengeDate ? new Date(user.lastChallengeDate).toDateString() : null;

      if (lastChallenge === today) {
        throw { 
          status: 403, 
          message: "You already completed today's daily challenge. see you tomorrow!" 
        };
      }
    }

  // Cooldown check
  checkCooldown(user, COOLDOWN_MS);

  // AI validation
  const aiDecision = await validateReport({ description, action });
  if (!aiDecision.isValid) {
      throw { 
          status: 400, 
          message: "Report rejected by AI", 
          aiReason: aiDecision.reason 
      };
  }

  // Points update
  let pointsEarned = updateUserPoints(user, action);

  if (isDailyChallenge) {
      pointsEarned += DAILY_CHALLENGE_BONUS;
      user.totalPoints += DAILY_CHALLENGE_BONUS;
      user.lastChallengeDate = new Date().toISOString();
  }
  //streak update
  applyDailyStreak(user);

  if (!user.dailyCounts) {
      user.dailyCounts = {};
  }
  
  if (!user.dailyCounts[action]) {
      user.dailyCounts[action] = 0;
  }

  user.dailyCounts[action]++;

  // Create report object
  const now = new Date();
  const newReport = {
    id: Date.now(),
    userID: id,
    action,
    description,
    pointsEarned,
    isChallenge: isDailyChallenge,
    timestamp: now.toISOString(),
  };

  db.reports.push(newReport);

  // Update weekly goal
  const achievedGoalNow = updateGoalStatus(user);

  saveDB(db);

  return {
    message: isDailyChallenge ? "Daily challenge completed!" : "Report added successfully",
    report: newReport,
    newTotalPoints: user.totalPoints,
    newStats: user.reportCounts,
    weeklyGoalCount: user.weeklyGoalCount,
    goalReachedNow: achievedGoalNow,
    aiReason: aiDecision.reason
  };
};
