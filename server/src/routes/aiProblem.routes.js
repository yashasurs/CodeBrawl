import { Router } from "express";
import {
  generateAIProblem,
  switchLanguage,
  getCache,
  getCacheStats,
  clearCache,
  aiHealth,
  getLanguages
} from "../controllers/aiProblem.controller.js";

const router = Router();

router.post("/generate", generateAIProblem);
router.post("/switch-language", switchLanguage);
router.get("/cache/:id", getCache);
router.get("/cache/stats", getCacheStats);
router.delete("/cache/:id", clearCache);
router.get("/health", aiHealth);
router.get("/languages", getLanguages);

export default router;
