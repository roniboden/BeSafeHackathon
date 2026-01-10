const pad2 = (n) => String(n).padStart(2, "0");

// ISO week key like 2026-W02 (simple approximation using JS date).
export const getWeekKey = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${pad2(weekNo)}`;
};

export const getMonthKey = (date = new Date()) => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`; // e.g. 2026-01
};

export const ensurePeriodsCurrent = (user) => {
  const now = new Date();
  const currentWeekKey = getWeekKey(now);
  const currentMonthKey = getMonthKey(now);

  // init if missing
  if (!user.weeklyCounts) user.weeklyCounts = {};
  if (!user.monthlyCounts) user.monthlyCounts = {};

  // week rollover => reset weeklyCounts
  if (user.weekKey !== currentWeekKey) {
    user.weekKey = currentWeekKey;
    user.weeklyCounts = { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 };
  }

  // month rollover => reset monthlyCounts + monthly achieved
  if (user.monthKey !== currentMonthKey) {
    user.monthKey = currentMonthKey;
    user.monthlyCounts = { reportPost: 0, safetyTips: 0, reportGood: 0, simulation: 0 };
    user.monthlyGoalAchieved = false;
  }
};
