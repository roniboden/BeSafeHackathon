import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Update parameters to accept the imageUrl
export const validateReportsWithAI = async ({ description, action, imageUrl }) => {
  const prompt = `
You are an automated moderator. 
The user is reporting content categorized as: "${action}".
Rules:
- If action is "reportPost": VALID if it shows harmful content or safety risks.
- If action is "reportGood": VALID if it shows positive, helpful, or inspiring content.
- Mark INVALID if the image is gibberish, unrelated to the description, or low effort.

Response Instructions:
- If VALID: Provide a short confirmation reason.
- If INVALID: Provide a specific, polite explanation of why the evidence didn't match the category so the user can learn.

Description: "${description}"
`.trim();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageUrl, // The Cloudinary URL
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "validation_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              isValid: { type: "boolean" },
              reason: { type: "string" }
            },
            required: ["isValid", "reason"],
            additionalProperties: false
          }
        }
      }
    });

    // OpenAI returns the JSON string in the message content
    const raw = response.choices[0].message.content;
    return JSON.parse(raw);
    
  } catch (error) {
    console.error("AI Validator error:", error.message);

    return { 
      isValid: false, 
      reason: "Validation service unavailable (Vision/AI error)." 
    };
  }
};