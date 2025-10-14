import { Router } from "express";
import { 
    submitCodeForDuel,
    submitCodeForPractice,
    getSubmission,
    getUserSubmissions,
    getDuelSubmissions,
    getProblemSubmissions,
    updateSubmissionResult
} from "../controllers/submission.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (for viewing submissions)
router.route("/:submissionId").get(getSubmission);
router.route("/duel/:duelId").get(getDuelSubmissions);

// Protected routes
router.use(verifyJWT); // Apply JWT middleware to all routes below

router.route("/duel").post(submitCodeForDuel);
router.route("/practice").post(submitCodeForPractice);
router.route("/user/my-submissions").get(getUserSubmissions);
router.route("/problem/:problemId").get(getProblemSubmissions);

// Route for judge service to update results (should be protected by API key in production)
router.route("/:submissionId/result").put(updateSubmissionResult);

export default router;