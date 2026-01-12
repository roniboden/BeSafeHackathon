import express from "express";
import { getScenario, stepScenario, coachScenario } from "../controllers/simulationController.js";

const router = express.Router(); 

router.get("/scenario", getScenario);
router.post("/step", stepScenario);
router.post("/coach", coachScenario);

export default router;