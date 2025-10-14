import { Router } from "express";
import {
    getAllUsers,
    getAllProblems,
    getAllMatches,
    getUserById,
    getProblemById,
    getMatchById
} from "../controllers/sync.controller.js";

const router = Router();

// Routes for data synchronization
router.route("/users").get(getAllUsers);
router.route("/users/:id").get(getUserById);
router.route("/problems").get(getAllProblems);
router.route("/problems/:id").get(getProblemById);
router.route("/matches").get(getAllMatches);
router.route("/matches/:id").get(getMatchById);

export default router;