import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const validateReportsWithAI = async (description, action) => {
  const prompt = `
You are an automated moderator for a web safety-reporting app.

Action: "${action}"
Description: "${description}"

Rules:
- VALID: realistic safety concerns, helpful tips, or detailed reports.
- INVALID: gibberish ("asdf"), low effort ("cool", "hi"), extremely vague or unrelated.
- If unsure, mark INVALID.

Return ONLY JSON with:
{ "isValid": boolean, "reason": string }
`.trim();

  try {
    const response = await openai.responses.create({
      // apperantly this is a model that supports json_schema reliably
      model: "gpt-4o-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "validation_result",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              isValid: { type: "boolean" },
              reason: { type: "string" }
            },
            required: ["isValid", "reason"]
          }
        }
      }
    });

    // grab the text output and JSON.parse it
    const raw = response.output_text;
    return JSON.parse(raw);
  } catch (error) {
    // Log the real reason so you can see 401/429/400 etc.
    console.error("AI Validator error:", {
      status: error?.status,
      message: error?.message,
      error: error?.error
    });

    // choose fail-closed or fail-open; for moderation fail-closed is safer
    return { isValid: false, reason: "Validation service unavailable (OpenAI error)." };
  }
};


