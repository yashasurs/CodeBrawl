import  asyncHandler  from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Match } from "../models/Match.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, leetcodeUsername } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        leetcodeUsername: leetcodeUsername || ""
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    loggedInUser.isOnline = true;
    loggedInUser.lastActive = new Date();
    await loggedInUser.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            },
            isOnline: false,
            lastActive: new Date()
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, leetcodeUsername } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
                leetcodeUsername
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar image updated successfully")
        );
});

const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const user = await User.findOne({ username }).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User profile fetched successfully")
        );
});

const updateEloRating = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);

    if (!user.leetcodeUsername || user.leetcodeUsername.trim() === '') {
        throw new ApiError(400, "LeetCode username is required to update ELO rating");
    }

    try {
        await user.updateEloFromLeetCode();
        await user.save();

        return res
            .status(200)
            .json(new ApiResponse(200, { eloRating: user.eloRating }, "ELO rating updated successfully"));
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to update ELO rating");
    }
});

const getDetailedProfile = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    try {
        // Get user data with virtual fields
        const user = await User.findById(userId)
            .select("-password -refreshToken")
            .lean({ virtuals: true });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Get recent matches for this user
        const recentMatches = await Match.find({
            "participants.user": userId,
            status: "completed"
        })
        .populate("participants.user", "username avatar")
        .populate("problem", "title difficulty")
        .populate("winner", "username")
        .sort({ endTime: -1 })
        .limit(10)
        .lean();

        // Format match history
        const formattedMatches = recentMatches.map(match => {
            const userParticipant = match.participants.find(p => 
                p.user._id.toString() === userId.toString()
            );
            const opponent = match.participants.find(p => 
                p.user._id.toString() !== userId.toString()
            );
            
            const isWinner = match.winner && match.winner._id.toString() === userId.toString();
            const eloChange = match.eloChanges?.find(e => 
                e.user.toString() === userId.toString()
            );

            return {
                id: match._id,
                opponent: opponent ? opponent.user.username : "Unknown",
                result: isWinner ? "Win" : "Loss",
                eloChange: eloChange ? eloChange.change : 0,
                date: match.endTime,
                problem: match.problem ? match.problem.title : "Unknown Problem",
                duration: match.actualDuration || 0
            };
        });

        // Calculate global rank (simplified - in production, use proper ranking system)
        const higherRatedUsers = await User.countDocuments({
            eloRating: { $gt: user.eloRating }
        });
        const globalRank = higherRatedUsers + 1;

        // Update user's global rank
        await User.findByIdAndUpdate(userId, { globalRank });

        // Prepare comprehensive profile data
        const profileData = {
            ...user,
            globalRank,
            recentMatches: formattedMatches,
            tier: user.calculatedTier || user.tier || "Novice",
            favoriteLanguage: user.favoriteLanguage || user.preferredLanguage || "cpp",
            practiceStats: user.practiceStatsWithPercentages || {
                easy: { solved: 0, total: 60, percentage: 0 },
                medium: { solved: 0, total: 80, percentage: 0 },
                hard: { solved: 0, total: 70, percentage: 0 }
            },
            // Ensure we have proper default achievements if none exist
            achievements: user.achievements && user.achievements.length > 0 ? user.achievements : [
                { id: 1, title: "First Steps", description: "Created your account", icon: "🚀", unlocked: true, unlockedAt: user.createdAt },
                { id: 2, title: "First Victory", description: "Win your first battle", icon: "🏆", unlocked: user.wins > 0, unlockedAt: user.wins > 0 ? new Date() : null },
                { id: 3, title: "Speed Demon", description: "Solve a problem in under 5 minutes", icon: "⚡", unlocked: false, unlockedAt: null },
                { id: 4, title: "Streak Master", description: "Win 5 battles in a row", icon: "🔥", unlocked: user.winStreak >= 5, unlockedAt: user.winStreak >= 5 ? new Date() : null },
                { id: 5, title: "Problem Solver", description: "Solve 100 practice problems", icon: "🧩", unlocked: user.practiceProblemsSolved >= 100, unlockedAt: user.practiceProblemsSolved >= 100 ? new Date() : null },
                { id: 6, title: "Giant Slayer", description: "Defeat someone 200+ ELO higher", icon: "⚔️", unlocked: false, unlockedAt: null },
                { id: 7, title: "Perfectionist", description: "Win 10 battles without any wrong submissions", icon: "💎", unlocked: false, unlockedAt: null }
            ]
        };

        return res
            .status(200)
            .json(new ApiResponse(200, profileData, "Detailed profile fetched successfully"));

    } catch (error) {
        console.error("Error fetching detailed profile:", error);
        throw new ApiError(500, error.message || "Failed to fetch profile data");
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    getUserProfile,
    updateEloRating,
    getDetailedProfile
};
