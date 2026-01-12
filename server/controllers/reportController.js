import { getUserSummaryService } from "../services/userSummaryService.js";
import { createReportService } from "../services/reportService.js";

export const getUserSummary = (req, res) => {
  try {
    const result = getUserSummaryService(req.params.userID);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Server error"
    });
  }
};

export const createReport = async (req, res) => {
  try {
    const { userId, action, description, isDailyChallenge } = req.body;

    const result = await createReportService({
      userId,
      action,
      description,
      isDailyChallenge: isDailyChallenge === true || isDailyChallenge === "true"
    });

    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Server error",
      reason: err.aiReason || err.reason
    });
  }
};