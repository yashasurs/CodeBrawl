import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";

const getLeaderboard = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find({})
        .select("username fullName eloRating totalMatches matchesWon matchesLost avatar")
        .sort({ eloRating: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await User.countDocuments();

    return res
        .status(200)
        .json(new ApiResponse(200, {
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        }, "Leaderboard fetched successfully"));
});

const searchUsers = asyncHandler(async (req, res) => {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query?.trim()) {
        throw new ApiError(400, "Search query is required");
    }

    const users = await User.find({
        $or: [
            { username: { $regex: query, $options: 'i' } },
            { fullName: { $regex: query, $options: 'i' } }
        ]
    })
        .select("username fullName eloRating avatar")
        .limit(limit * 1)
        .skip((page - 1) * limit);

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users found successfully"));
});

const getUserStats = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const user = await User.findOne({ username })
        .select("username fullName eloRating totalMatches matchesWon matchesLost problemsSolved badges avatar leetcodeUsername");

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const winRate = user.totalMatches > 0 ? ((user.matchesWon / user.totalMatches) * 100).toFixed(2) : 0;

    const userStats = {
        ...user.toObject(),
        winRate: parseFloat(winRate)
    };

    return res
        .status(200)
        .json(new ApiResponse(200, userStats, "User stats fetched successfully"));
});

export {
    getLeaderboard,
    searchUsers,
    getUserStats
};
