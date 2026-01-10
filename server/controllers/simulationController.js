import { readDB, saveDB } from "../utils/databaseHelper.js";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function clampText(s, max = 400){
  if (!s) return "";
  const t = String(s).trim();
  return t.length > max ? t.slice(0, max) : t;
}

function getRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function findScenario(db, scenarioId) {
  return db.scenarios?.find((s) => s.id === scenarioId);
}

function findNode(scenario, nodeId) {
  return scenario.nodes?.find((n) => n.id === nodeId);
}

export async function advancedStepScenario(req,res){
    try {
    const { scenarioId, nodeId, userText, userId } = req.body;

    if (!scenarioId || !nodeId || !userText) {
      return res.status(400).json({ error: "scenarioId, nodeId, and userText are required" });
    }

    const db = readDB();
    const scenario = findScenario(db, scenarioId);
    if (!scenario) return res.status(404).json({ error: "Scenario not found" });

    const node = findNode(scenario, nodeId);
    if (!node) return res.status(404).json({ error: "Node not found" });

    const options = node.options || [];
    if (!options.length) {
      return res.status(500).json({ error: "This node has no options to choose from." });
    }

    const text = clampText(userText, 500);

    // Ask AI to map free text → one of the existing option IDs
    const prompt = `
      You are helping map a user's free-text response to a multiple-choice option in a safety simulation.

      Scenario category: ${scenario.category}
      Channel: ${scenario.channel}
      Scenario title: ${scenario.title}

      Current message:
      "${node.message}"

      Available options (choose exactly one):
      ${options.map(o => `- ${o.id}: ${o.text}`).join("\n")}

      User typed response:
      "${text}"

      Rules:
      - Pick the single best matching optionId from the list.
      - If the user response is unclear, pick the SAFEST option among the available ones.
      - Do NOT invent new options.
      Return JSON with keys: optionId, reason (max 1 sentence).
      `.trim();

    const ai = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,          // string is fine
      temperature: 0.2,
      text: {
        format: {
          type: "json_schema",
          name: "advanced_choice",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              optionId: { type: "string" },
              reason: { type: "string" }
            },
            required: ["optionId", "reason"]
          }
        }
      }
    });

    // Parse JSON safely (OpenAI SDK returns structured output; still guard)
    const parsed = JSON.parse(ai.output_text);
    const chosenOptionId = parsed.optionId;
    const reason = parsed.reason || "";


    const picked = options.find(o => o.id === chosenOptionId) || null;

    // If AI returns something invalid, fallback to safest option (last-resort)
    const fallbackSafe =
      options.find(o => /verify|official|report|block|mute|stop/i.test(o.text)) || options[0];

    const finalPick = picked || fallbackSafe;

    const nextId = finalPick.nextNodeId;

    // If ending
    const ending = scenario.endings?.[nextId];
    if (ending) {
      const pointsEarned = Number(ending.pointsReward ?? 0);

      if (userId != null) {
        const user = (db.users || []).find((u) => u.id === Number(userId));
        if (user) {
          user.totalPoints = Number(user.totalPoints || 0) + pointsEarned;
          user.weeklyCounts.simulation = (user.weeklyCounts.simulation || 0) + 1;
          user.monthlyCounts.simulation = (user.monthlyCounts.simulation || 0) + 1;
          saveDB(db);
        }
      }

      const handlingSummary = db.handlingSummaries?.[scenario.category] ?? null;

      return res.json({
        done: true,
        ai: {
          chosenOptionId: finalPick.id,
          chosenOptionText: finalPick.text,
          reason
        },
        ending: { type: ending.type, summary: ending.summary },
        result: { scenarioId, pointsEarned, handlingSummary }
      });
    }

    // Next node
    const nextNode = findNode(scenario, nextId);
    if (!nextNode) return res.status(500).json({ error: `Next node "${nextId}" not found` });

    return res.json({
      done: false,
      ai: {
        chosenOptionId: finalPick.id,
        chosenOptionText: finalPick.text,
        reason
      },
      node: { id: nextNode.id, message: nextNode.message, options: nextNode.options }
    });
  } catch (error) {
      console.error("advancedStepScenario error:", error?.message);
      console.error("openai error details:", error?.response?.data || error);
      return res.status(500).json({ error: "Failed to run advanced step" });
  }

}

// GET /simulations/scenario?category=phishing
export function getScenario(req, res) {
  try {
    const db = readDB();
    const { category } = req.query;

    const pool = category
      ? (db.scenarios || []).filter((s) => s.category === category)
      : (db.scenarios || []);

    if (!pool.length) {
      return res.status(404).json({ error: "No scenarios found" });
    }

    const scenario = getRandom(pool);
    const startNode = findNode(scenario, scenario.startNodeId);

    if (!startNode) {
      return res.status(500).json({ error: "Scenario start node not found" });
    }

    return res.json({
      scenario: {
        id: scenario.id,
        category: scenario.category,
        channel: scenario.channel,
        title: scenario.title,
      },
      node: {
        id: startNode.id,
        message: startNode.message,
        options: startNode.options,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get scenario" });
  }
}

// POST /simulations/step
// body: { scenarioId, nodeId, optionId, userId }
export function stepScenario(req, res) {
  try {
    const { scenarioId, nodeId, optionId, userId } = req.body;

    if (!scenarioId || !nodeId || !optionId) {
      return res.status(400).json({ error: "scenarioId, nodeId, and optionId are required" });
    }

    const db = readDB();
    const scenario = findScenario(db, scenarioId);
    if (!scenario) return res.status(404).json({ error: "Scenario not found" });

    const node = findNode(scenario, nodeId);
    if (!node) return res.status(404).json({ error: "Node not found" });

    const picked = (node.options || []).find((o) => o.id === optionId);
    if (!picked) return res.status(400).json({ error: "Option not found in this node" });

    const nextId = picked.nextNodeId;

    // Check if nextId is an ending
    const ending = scenario.endings?.[nextId];
    if (ending) {
      const pointsEarned = Number(ending.pointsReward ?? 0);

      // Add points if userId provided
      if (userId != null) {
        const user = (db.users || []).find((u) => u.id === Number(userId));
        if (user) {
          user.totalPoints = Number(user.totalPoints || 0) + pointsEarned;
          user.weeklyCounts.simulation = (user.weeklyCounts.simulation || 0) + 1;
          user.monthlyCounts.simulation = (user.monthlyCounts.simulation || 0) + 1;
          saveDB(db);
        }
      }

      // Optional: include handlingSummary from the same DB (recommended)
      const handlingSummary = db.handlingSummaries?.[scenario.category] ?? null;

      return res.json({
        done: true,
        ending: {
          type: ending.type,
          summary: ending.summary,
        },
        result: {
          scenarioId,
          category: scenario.category,
          pointsEarned,
          handlingSummary,
        },
      });
    }

    // Not an ending: continue to next node
    const nextNode = findNode(scenario, nextId);
    if (!nextNode) {
      return res.status(500).json({ error: `Next node "${nextId}" not found` });
    }

    return res.json({
      done: false,
      node: {
        id: nextNode.id,
        message: nextNode.message,
        options: nextNode.options,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to step scenario" });
  }
}
