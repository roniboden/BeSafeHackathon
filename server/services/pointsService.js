import { ensurePeriodsCurrent } from "./periodService.js";
import { WEEKLY_TARGETS } from "./targets.js";
import { applyDailyStreak } from "../utils/streak.js";
import { updateGoalStatus } from "./goalService.js"; // Import your goal logic

const POINT_VALUES = {
    "reportPost": 30,
    "safetyTips": 10,
    "reportGood": 20,
    "simulation": 30
};

export const updateUserPoints = (user, action) => {
    ensurePeriodsCurrent(user);

    const currentWeeklyCount = user.weeklyCounts[action] || 0;
    const weeklyLimit = WEEKLY_TARGETS[action];

    // 1. Check Weekly Limits
    if (weeklyLimit !== undefined && currentWeeklyCount >= weeklyLimit) {
        console.log(`Limit reached for ${action}. No points awarded.`);
        return { pointsEarned: 0, monthlyGoalAchieved: user.monthlyGoalAchieved }; 
    }
        
    const pointsEarned = POINT_VALUES[action] || 0;

    // 2. Apply Rewards
    user.totalPoints += pointsEarned;
    user.weeklyCounts[action] = (user.weeklyCounts[action] || 0) + 1;
    user.monthlyCounts[action] = (user.monthlyCounts[action] || 0) + 1;
    user.lastReportTime = new Date().toISOString();
    
    applyDailyStreak(user);

    // 3. Check the "All Targets Met" Monthly Goal
    // This uses your logic: checking if every action's monthly count >= target
    const justAchievedGoal = updateGoalStatus(user);

    return {
        pointsEarned,
        monthlyGoalAchieved: justAchievedGoal,
        newTotal: user.totalPoints
    };
};