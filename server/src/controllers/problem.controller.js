import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Problem } from "../models/Problem.model.js";
import Judge0Client from "../utils/judge0Client.js";
import LeetCodeDataUtils from "../utils/leetcodeDataUtils.js";

// Get all problems with filtering
const getProblems = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 20, 
        difficulty, 
        tags, 
        search,
        isActive = true 
    } = req.query;

    const matchConditions = { isActive };

    if (difficulty) {
        matchConditions.difficulty = difficulty;
    }

    if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(',');
        matchConditions.tags = { $in: tagArray };
    }

    if (search) {
        matchConditions.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const problems = await Problem.find(matchConditions)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-testCases'); // Exclude test cases from list view for performance

    const total = await Problem.countDocuments(matchConditions);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            problems,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        }, "Problems fetched successfully"));
});

// Get single problem by ID
const getProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const { includeTestCases = false } = req.query;

    let selectFields = '';
    if (!includeTestCases) {
        selectFields = '-testCases';
    }

    const problem = await Problem.findById(problemId).select(selectFields);

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    // If user is not authenticated, don't include hidden test cases
    if (includeTestCases && problem.testCases && !req.user) {
        problem.testCases = problem.testCases.filter(tc => !tc.isHidden);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, problem, "Problem details fetched successfully"));
});

// Generate a new problem using AI service
const generateProblem = asyncHandler(async (req, res) => {
    const { leetcodeId, title, difficulty } = req.body;

    if (!leetcodeId && !title) {
        throw new ApiError(400, "Either LeetCode ID or title must be provided");
    }

    try {
        // Call the AI service to generate problem
        const generatedProblem = await Judge0Client.generateProblem({
            leetcode_id: leetcodeId,
            title,
            difficulty
        });

        // Check if problem with same LeetCode ID already exists
        if (generatedProblem.leetcode_id) {
            const existingProblem = await Problem.findOne({ 
                $or: [
                    { leetcodeId: generatedProblem.leetcode_id },
                    { title: generatedProblem.title },
                    { titleSlug: generatedProblem.title_slug }
                ]
            });

            if (existingProblem) {
                return res
                    .status(200)
                    .json(new ApiResponse(200, existingProblem, "Problem already exists"));
            }
        }

        // Create problem in database
        const problem = await Problem.create({
            leetcodeId: generatedProblem.leetcode_id,
            titleSlug: generatedProblem.title_slug,
            acceptanceRate: generatedProblem.acceptance_rate,
            title: generatedProblem.title,
            description: generatedProblem.formatted_statement,
            difficulty: generatedProblem.difficulty,
            tags: generatedProblem.tags || [],
            constraints: generatedProblem.constraints,
            examples: [], // Will be extracted from formatted statement
            testCases: generatedProblem.test_cases.map(tc => ({
                input: tc.input,
                expectedOutput: tc.expected_output,
                isHidden: tc.is_hidden || false
            })),
            timeLimit: generatedProblem.time_limit || 2,
            memoryLimit: generatedProblem.memory_limit || 256,
            points: generatedProblem.scoring_weight * 100,
            createdBy: req.user?._id
        });

        return res
            .status(201)
            .json(new ApiResponse(201, problem, "Problem generated and saved successfully"));

    } catch (error) {
        console.error('Problem generation error:', error);
        throw new ApiError(500, "Failed to generate problem. AI service may be unavailable.");
    }
});

// Create a new problem manually
const createProblem = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        difficulty,
        tags,
        constraints,
        examples,
        testCases,
        starterCode,
        timeLimit,
        memoryLimit,
        points
    } = req.body;

    if (!title?.trim() || !description?.trim() || !difficulty) {
        throw new ApiError(400, "Title, description, and difficulty are required");
    }

    // Check if problem with same title already exists
    const existingProblem = await Problem.findOne({ 
        title: { $regex: new RegExp(`^${title.trim()}$`, 'i') }
    });

    if (existingProblem) {
        throw new ApiError(400, "Problem with this title already exists");
    }

    const problem = await Problem.create({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        tags: tags || [],
        constraints: constraints || "",
        examples: examples || [],
        testCases: testCases || [],
        starterCode: starterCode || {},
        timeLimit: timeLimit || 2,
        memoryLimit: memoryLimit || 256,
        points: points || (difficulty === "Easy" ? 100 : difficulty === "Medium" ? 200 : 300),
        createdBy: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, problem, "Problem created successfully"));
});

// Update problem
const updateProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const updates = req.body;

    const problem = await Problem.findById(problemId);

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    // Only admin or creator can update
    if (req.user && problem.createdBy && 
        problem.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to update this problem");
    }

    // Update fields
    Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
            problem[key] = updates[key];
        }
    });

    await problem.save();

    return res
        .status(200)
        .json(new ApiResponse(200, problem, "Problem updated successfully"));
});

// Delete problem (soft delete - set isActive to false)
const deleteProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;

    const problem = await Problem.findById(problemId);

    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    // Only admin or creator can delete
    if (req.user && problem.createdBy && 
        problem.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this problem");
    }

    problem.isActive = false;
    await problem.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Problem deleted successfully"));
});

// Get problems by difficulty
const getProblemsByDifficulty = asyncHandler(async (req, res) => {
    const { difficulty } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
        throw new ApiError(400, "Invalid difficulty level");
    }

    const problems = await Problem.find({ 
        difficulty, 
        isActive: true 
    })
        .select('-testCases')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Problem.countDocuments({ difficulty, isActive: true });

    return res
        .status(200)
        .json(new ApiResponse(200, {
            problems,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        }, `${difficulty} problems fetched successfully`));
});

// Get random problem
const getRandomProblem = asyncHandler(async (req, res) => {
    const { difficulty, source = 'database' } = req.query;

    if (source === 'leetcode') {
        // Get random problem from LeetCode dataset
        try {
            const leetcodeProblem = await LeetCodeDataUtils.getRandomProblem(difficulty);
            
            if (!leetcodeProblem) {
                throw new ApiError(404, "No LeetCode problems found for the specified difficulty");
            }

            return res
                .status(200)
                .json(new ApiResponse(200, leetcodeProblem, "Random LeetCode problem fetched successfully"));
        } catch (error) {
            throw new ApiError(500, "Failed to fetch random LeetCode problem");
        }
    }

    // Get random problem from database (default behavior)
    const matchConditions = { isActive: true };
    if (difficulty) {
        matchConditions.difficulty = difficulty;
    }

    const problems = await Problem.aggregate([
        { $match: matchConditions },
        { $sample: { size: 1 } }
    ]);

    if (problems.length === 0) {
        throw new ApiError(404, "No problems found");
    }

    const problem = problems[0];
    
    // Remove hidden test cases for non-authenticated users
    if (problem.testCases && !req.user) {
        problem.testCases = problem.testCases.filter(tc => !tc.isHidden);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, problem, "Random problem fetched successfully"));
});

// Get LeetCode dataset statistics
const getLeetCodeStats = asyncHandler(async (req, res) => {
    try {
        const stats = await LeetCodeDataUtils.getDatasetStats();
        
        return res
            .status(200)
            .json(new ApiResponse(200, stats, "LeetCode dataset statistics fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to fetch LeetCode dataset statistics");
    }
});

// Search LeetCode problems
const searchLeetCodeProblems = asyncHandler(async (req, res) => {
    const { query, difficulty, tags, limit = 20 } = req.query;

    if (!query && !difficulty && !tags) {
        throw new ApiError(400, "At least one search parameter is required");
    }

    try {
        let problems = [];

        if (query) {
            problems = await LeetCodeDataUtils.searchProblems(query, limit);
        } else if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',');
            problems = await LeetCodeDataUtils.getProblemsByTags(tagArray, limit);
        } else if (difficulty) {
            problems = await LeetCodeDataUtils.getProblemsByDifficulty(difficulty, limit);
        }

        return res
            .status(200)
            .json(new ApiResponse(200, problems, "LeetCode problems search completed"));
    } catch (error) {
        throw new ApiError(500, "Failed to search LeetCode problems");
    }
});

export {
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
};