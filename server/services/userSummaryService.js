import { readDB, saveDB } from "../utils/databaseHelper.js";
import { ensurePeriodsCurrent } from "./periodService.js";
import { WEEKLY_TARGETS, getMonthlyTarget } from "./targets.js";

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const getUserSummaryService = (userID) => {
  const db = readDB();
  const id = Number(userID);

  const user = db.users.find(u => u.id === id);
  if (!user) throw { status: 404, message: "User not found" };

  ensurePeriodsCurrent(user);

  const today = getTodayStr();
  let needsSave = false;

  if (user.lastDailyDate !== today) {
    user.dailyCounts = { safetyTips: 0 }; 
    user.lastDailyDate = today;           
    needsSave = true;                     
  }

  if (needsSave) {
    saveDB(db);
  }

  const monthlyTargets = Object.fromEntries(
    Object.keys(WEEKLY_TARGETS).map(a => [a, getMonthlyTarget(a)])
  );

  return {
    username: user.username,
    totalPoints: user.totalPoints,
    purchaseHistory: user.purchaseHistory || [],

    streak: {
      current: user.streak?.current ?? 0,
      best: user.streak?.best ?? 0,
      lastActiveDate: user.streak?.lastActiveDate ?? null
    },

    weeklyCounts: user.weeklyCounts,
    weeklyTargets: WEEKLY_TARGETS,

    monthlyCounts: user.monthlyCounts,
    monthlyTargets,

    monthlyGoalAchieved: !!user.monthlyGoalAchieved //!! converts to boolean
  };
};
