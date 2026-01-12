import { readDB, saveDB } from "../utils/databaseHelper.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import { updateUserPoints } from "../services/pointsService.js";

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
export async function coachScenario(req, res) {
  try {
    const { scenarioId, nodeId, userText } = req.body;

    if (!scenarioId || !nodeId) {
      return res.status(400).json({ error: "scenarioId and nodeId are required" });
    }

    const db = readDB();
    const scenario = findScenario(db, scenarioId);
    if (!scenario) return res.status(404).json({ error: "Scenario not found" });

    const node = findNode(scenario, nodeId);
    if (!node) return res.status(404).json({ error: "Node not found" });

    const options = node.options || [];
    if (!options.length) return res.status(500).json({ error: "Node has no options" });

    const text = clampText(userText, 500);

    const prompt = `
      You are a Safety Coach for a youth online-safety simulation.

      CRITICAL RULES:
      - Do NOT roleplay as the other person.
      - Provide coaching, but your selected optionId MUST reflect what the user said they would do.
      - Do NOT "upgrade" the user's choice to a safer option if the user clearly described an unsafe action.
      - Only choose the safest option if the user is unclear or explicitly asks for advice ("what should I do?").

      Return JSON: coachMessage (2-4 sentences), followUpQuestion (short or empty), optionId, reason (1 sentence max).

      Scenario: ${scenario.title} (${scenario.category}, ${scenario.channel})
      Current message: "${node.message}"
      Red flags: ${(node.redFlagsHere || []).join("; ")}

      Options:
      ${options.map(o => `- ${o.id}: ${o.text}`).join("\n")}

      User: "${text}"
      `.trim();


    const ai = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.2,
      text: {
        format: {
          type: "json_schema",
          name: "coach_pick",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              coachMessage: { type: "string" },
              followUpQuestion: { type: "string" },
              optionId: { type: "string" },
              reason: { type: "string" }
            },
            required: ["coachMessage", "followUpQuestion", "optionId", "reason"]
          }
        }
      }
    });

    const parsed = JSON.parse(ai.output_text);

    // Ensure optionId is valid, otherwise neutral fallback
    const picked = options.find(o => o.id === parsed.optionId) || options[0];

    return res.json({
      coach: {
        message: clampText(parsed.coachMessage, 800),
        followUp: clampText(parsed.followUpQuestion, 200)
      },
      suggestion: {
        optionId: picked.id,
        optionText: picked.text,
        reason: clampText(parsed.reason, 200)
      }
    });
  } catch (error) {
    console.error("coachScenario error:", error?.message);
    return res.status(500).json({ error: "Failed to coach scenario" });
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
      let pointsData = {
        pointsEarned: Number(ending.pointsReward ?? 0),
        monthlyGoalAchieved: false,
        newTotalPoints: 0
      };

      // Add points if userId provided
      if (userId != null) {
        const user = (db.users || []).find((u) => u.id === Number(userId));
        if (user) {
          const result = updateUserPoints(user, "simulation");
          pointsData.monthlyGoalAchieved = result.monthlyGoalAchieved;
          pointsData.newTotalPoints = result.newTotal;
          saveDB(db);
          saveDB(db);
        }
      }

      return res.json({
        done: true,
        ending: { type: ending.type, summary: ending.summary },
        result: pointsData
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
