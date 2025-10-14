import { Router } from "express";
import { 
    getProblems,
    getProblem,
    generateProblem,
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemsByDifficulty,
    getRandomProblem,
    getLeetCodeStats,
    searchLeetCodeProblems
} from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getProblems);
router.route("/random").get(getRandomProblem);
router.route("/difficulty/:difficulty").get(getProblemsByDifficulty);
router.route("/leetcode/stats").get(getLeetCodeStats);
router.route("/leetcode/search").get(searchLeetCodeProblems);
router.route("/:problemId").get(getProblem);

// Protected routes (require authentication)
router.use(verifyJWT); 

router.route("/").post(createProblem);
router.route("/generate").post(generateProblem);
router.route("/:problemId").put(updateProblem);
router.route("/:problemId").delete(deleteProblem);

export default router;