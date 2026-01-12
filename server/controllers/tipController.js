import { readDB, saveDB } from "../utils/databaseHelper.js";
import { updateUserPoints } from "../services/pointsService.js";

export const getRandomTip = (_req, res) => {
  const db = readDB();
  const tips = db["safety-tips"] || [];

  if (!tips.length) return res.status(404).json({ message: "No tips available" });

  const tip = tips[Math.floor(Math.random() * tips.length)];

  // Transform the string array into an object array for React
  const formattedOptions = tip.quiz.options.map((optionText, index) => ({
    id: `opt-${index}`, // Create a temporary ID
    text: optionText
  }));

  return res.status(200).json({
    id: tip.id,
    title: tip.title,
    scenario: tip.text, 
    question: tip.quiz.question, // Added the question text
    options: formattedOptions 
  });
};

export const submitTipAnswer = (req, res) => {
  try {
    const { userID, tipId, selectedAnswer } = req.body; // selectedAnswer will be the text string

    const db = readDB();
    const user = db.users.find(u => u.id === Number(userID));
    if (!user) return res.status(404).json({ message: "User not found" });

    const tips = db["safety-tips"] || [];
    const tip = tips.find(t => t.id === tipId);
    if (!tip) return res.status(404).json({ message: "Tip not found" });

    // Compare the selected text directly to the correctAnswer string in DB
    const isCorrect = selectedAnswer === tip.quiz.correctAnswer;

    if (!isCorrect) {
      return res.status(200).json({
        isCorrect: false,
        explanation: `Not quite. The correct answer is: ${tip.quiz.correctAnswer}`,
        message: "Try another one!"
      });
    }

    const { pointsEarned, newTotal } = updateUserPoints(user, "safetyTips");
    saveDB(db);

    return res.status(200).json({
      isCorrect: true,
      explanation: "Exactly! Being mindful of your digital footprint keeps you safe.",
      pointsEarned,
      newTotalPoints: newTotal
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", reason: error.message });
  }
};