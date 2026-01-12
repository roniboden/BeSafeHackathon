import { getUserSummaryService } from "../services/userSummaryService.js";
import { createReportService } from "../services/reportService.js";
import { uploadImage } from "../utils/cloudinary.js";

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
    const { userId, action, description } = req.body;
    if (!userId || !action) {
      return res.status(400).json({ message: "Missing required fields: userId or action" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "Image is required for reports." });
    }

    // 1. Upload to Cloudinary
    const imageUrl = await uploadImage(req.file.buffer);

    // 2. Run the logic (AI verification + DB save)
    const result = await createReportService({ 
      userId, 
      action, 
      description, 
      imageUrl 
    });

    res.status(201).json(result);
  } catch (error) {
      console.error("Report Creation Error:", error);
      return res.status(error.status || 500).json({ 
        message: error.message || "An internal error occurred.",
        reason: error.reason || "The AI could not validate your report."
      });
  }
};
