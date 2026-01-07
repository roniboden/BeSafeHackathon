import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const validateReportsWithAI = async (description, action) => {
    //selected gemini 1.5 as recommended 
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

    const prompt = `
    You are an automated moderator for a web safety-reporting app.
    The user is reporting a "${action} with this description: "${description}".
    Instructions:
      - VALID: Realistic safety concerns, helpful tips, or detailed reports.
      - INVALID: Gibberish (e.g., "asdf"), low effort (e.g., "cool", "hi"), or testing (e.g., "test").

      Return ONLY a JSON object:
      {
        "isValid": boolean,
        "reason": "short explanation"
      }
    `;

    try{
        //get the response
        const result = await model.generateContent(prompt);
        const response = result.response;
        
        //fix string
        const fixedText = response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(fixedText);

    } catch (error) {
        console.error("AI Validator error: ", error);
        return {isValid: true, reason: "Bypassed due to service error"}; //validate if failed

    }

};