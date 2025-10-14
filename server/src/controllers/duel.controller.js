import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Duel } from "../models/Duel.model.js";
import { Problem } from "../models/Problem.model.js";
import { User } from "../models/User.model.js";
import { Submission } from "../models/Submission.model.js";

// Create a new duel
const createDuel = asyncHandler(async (req, res) => {
    const { title, problemId, timeLimit, isPublic, maxParticipants } = req.body;
    const player1 = req.user._id;

    if (!title?.trim()) {
        throw new ApiError(400, "Duel title is required");
    }

    if (!problemId) {
        throw new ApiError(400, "Problem ID is required");
    }

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    const duel = await Duel.create({
        title: title.trim(),
        problem: problemId,
        player1,
        timeLimit: timeLimit || 3600,
        isPublic: isPublic ?? true,
        maxParticipants: maxParticipants || 2
    });

    const populatedDuel = await Duel.findById(duel._id)
        .populate('problem', 'title difficulty points')
        .populate('player1', 'username fullName avatar eloRating');

    return res
        .status(201)
        .json(new ApiResponse(201, populatedDuel, "Duel created successfully"));
});

// Join an existing duel
const joinDuel = asyncHandler(async (req, res) => {
    const { duelId } = req.params;
    const player2 = req.user._id;

    const duel = await Duel.findById(duelId)
        .populate('player1', 'username fullName avatar eloRating')
        .populate('player2', 'username fullName avatar eloRating');

    if (!duel) {
        throw new ApiError(404, "Duel not found");
    }

    if (duel.status !== 'waiting') {
        throw new ApiError(400, "Duel is not accepting new players");
    }

    if (duel.player2) {
        throw new ApiError(400, "Duel is already full");
    }

    if (duel.player1._id.toString() === player2.toString()) {
        throw new ApiError(400, "You cannot join your own duel");
    }

    // Update duel
    duel.player2 = player2;
    duel.status = 'in_progress';
    duel.startedAt = new Date();

    await duel.save();

    const updatedDuel = await Duel.findById(duel._id)
        .populate('problem', 'title difficulty points')
        .populate('player1', 'username fullName avatar eloRating')
        .populate('player2', 'username fullName avatar eloRating');

    return res
        .status(200)
        .json(new ApiResponse(200, updatedDuel, "Joined duel successfully"));
});

// Get duel details
const getDuel = asyncHandler(async (req, res) => {
    const { duelId } = req.params;

    const duel = await Duel.findById(duelId)
        .populate('problem')
        .populate('player1', 'username fullName avatar eloRating')
        .populate('player2', 'username fullName avatar eloRating')
        .populate('winner', 'username fullName avatar eloRating');

    if (!duel) {
        throw new ApiError(404, "Duel not found");
    }

    // Check if user is participant (for private duels)
    if (!duel.isPublic && req.user) {
        const userId = req.user._id.toString();
        const isParticipant = duel.player1._id.toString() === userId || 
                             (duel.player2 && duel.player2._id.toString() === userId);
        
        if (!isParticipant) {
            throw new ApiError(403, "Access denied to private duel");
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, duel, "Duel details fetched successfully"));
});

// List duels with filters
const listDuels = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        status, 
        isPublic, 
        userId,
        difficulty 
    } = req.query;

    const matchConditions = {};

    if (status) {
        matchConditions.status = status;
    }

    if (isPublic !== undefined) {
        matchConditions.isPublic = isPublic === 'true';
    }

    if (userId) {
        matchConditions.$or = [
            { player1: userId },
            { player2: userId }
        ];
    }

    const pipeline = [
        { $match: matchConditions },
        {
            $lookup: {
                from: 'problems',
                localField: 'problem',
                foreignField: '_id',
                as: 'problem'
            }
        },
        { $unwind: '$problem' },
        {
            $lookup: {
                from: 'users',
                localField: 'player1',
                foreignField: '_id',
                as: 'player1',
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1, eloRating: 1 } }
                ]
            }
        },
        { $unwind: '$player1' },
        {
            $lookup: {
                from: 'users',
                localField: 'player2',
                foreignField: '_id',
                as: 'player2',
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1, eloRating: 1 } }
                ]
            }
        },
        {
            $addFields: {
                player2: { $arrayElemAt: ['$player2', 0] }
            }
        }
    ];

    if (difficulty) {
        pipeline.splice(2, 0, {
            $match: { 'problem.difficulty': difficulty }
        });
    }

    pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
    );

    const duels = await Duel.aggregate(pipeline);
    const total = await Duel.countDocuments(matchConditions);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            duels,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        }, "Duels fetched successfully"));
});

// Get user's duels
const getUserDuels = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const duels = await Duel.find({
        $or: [
            { player1: userId },
            { player2: userId }
        ]
    })
    .populate('problem', 'title difficulty points')
    .populate('player1', 'username fullName avatar eloRating')
    .populate('player2', 'username fullName avatar eloRating')
    .populate('winner', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Duel.countDocuments({
        $or: [
            { player1: userId },
            { player2: userId }
        ]
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {
            duels,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        }, "User duels fetched successfully"));
});

// Cancel duel (only by creator and if status is waiting)
const cancelDuel = asyncHandler(async (req, res) => {
    const { duelId } = req.params;
    const userId = req.user._id;

    const duel = await Duel.findById(duelId);
    
    if (!duel) {
        throw new ApiError(404, "Duel not found");
    }

    if (duel.player1.toString() !== userId.toString()) {
        throw new ApiError(403, "Only the creator can cancel the duel");
    }

    if (duel.status !== 'waiting') {
        throw new ApiError(400, "Can only cancel waiting duels");
    }

    duel.status = 'cancelled';
    await duel.save();

    return res
        .status(200)
        .json(new ApiResponse(200, duel, "Duel cancelled successfully"));
});

export {
    createDuel,
    joinDuel,
    getDuel,
    listDuels,
    getUserDuels,
    cancelDuel
};