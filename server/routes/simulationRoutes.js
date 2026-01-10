import express from "express";
import { getScenario, stepScenario, advancedStepScenario } from "../controllers/simulationController.js";

const router = express.Router(); 

router.get("/scenario", getScenario);
router.post("/step", stepScenario);
router.post("/advanced-step", advancedStepScenario);

export default router;