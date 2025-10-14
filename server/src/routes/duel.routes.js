import { Router } from "express";
import { 
    createDuel,
    joinDuel,
    getDuel,
    listDuels,
    getUserDuels,
    cancelDuel
} from "../controllers/duel.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/").get(listDuels);
router.route("/:duelId").get(getDuel);

// Protected routes
router.use(verifyJWT); // Apply JWT middleware to all routes below

router.route("/").post(createDuel);
router.route("/:duelId/join").post(joinDuel);
router.route("/:duelId/cancel").put(cancelDuel);
router.route("/user/my-duels").get(getUserDuels);

export default router;