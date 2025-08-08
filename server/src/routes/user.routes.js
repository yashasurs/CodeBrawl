import { Router } from "express";
import {
    getLeaderboard,
    searchUsers,
    getUserStats
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/leaderboard").get(getLeaderboard);
router.route("/search").get(verifyJWT, searchUsers);
router.route("/stats/:username").get(getUserStats);

export default router;
