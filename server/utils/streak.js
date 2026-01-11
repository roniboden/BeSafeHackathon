import { getLocalDateISO, dayBetweenISO } from "./localDate.js";

export function applyDailyStreak(user, timeZone = "Asia/Jerusalem") {
  const today = getLocalDateISO(timeZone);

  user.streak ||= { current: 0, best: 0, lastActiveDate: null };

  const last = user.streak.lastActiveDate;

  if (!last) {
    user.streak.current = 1;
  } else {
    const diff = dayBetweenISO(last, today);

    if (diff === 0) return user;        // already counted today
    if (diff === 1) user.streak.current += 1;
    else user.streak.current = 1;       // missed days → reset to 1 for today
  }

  user.streak.lastActiveDate = today;
  user.streak.best = Math.max(user.streak.best || 0, user.streak.current);
}
