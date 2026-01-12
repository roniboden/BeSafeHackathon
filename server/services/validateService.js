import { validateReportsWithAI } from "../utils/aiHelper.js";

// 1. Add imageUrl to the function parameters
export const validateReport = async ({ description, action, imageUrl }) => {
  if (!description || typeof description !== "string" || description.trim().length < 3) {
    throw {
      status: 400,
      message: "Invalid report description",
      reason: "Description too short"
    };
  }

  // 2. Pass as an OBJECT and include the imageUrl
  const aiDecision = await validateReportsWithAI({ 
    description, 
    action, 
    imageUrl 
  });

  if (!aiDecision.isValid) {
    throw {
      status: 400,
      message: "The AI decided this is not a valid report",
      reason: aiDecision.reason
    };
  }

  return aiDecision;
};