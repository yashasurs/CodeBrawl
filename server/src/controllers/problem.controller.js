import  asyncHandler  from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Problem } from "../models/Problem.model.js";
import Judge0Client from "../utils/judge0Client.js";
import aiServiceClient from "../utils/aiServiceClient.js";

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

    const total = await Problem.countDocuments(matchConditions);

    // Define difficulty order for sorting
    const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

    // Fetch all matching problems
    const allProblems = await Problem.find(matchConditions)
        .select('-testCases') // Exclude test cases from list view for performance
        .lean();

    // Sort by difficulty (Easy -> Medium -> Hard), then by leetcodeId or title
    const sortedProblems = allProblems.sort((a, b) => {
        const diffA = difficultyOrder[a.difficulty] || 999;
        const diffB = difficultyOrder[b.difficulty] || 999;
        
        if (diffA !== diffB) {
            return diffA - diffB;
        }
        
        // If same difficulty, sort by leetcodeId (if available) or title
        if (a.leetcodeId && b.leetcodeId) {
            return parseInt(a.leetcodeId) - parseInt(b.leetcodeId);
        }
        
        return (a.title || '').localeCompare(b.title || '');
    });

    // Apply pagination after sorting
    const problems = sortedProblems.slice(
        (parseInt(page) - 1) * parseInt(limit),
        parseInt(page) * parseInt(limit)
    );

    return res
        .status(200)
        .json(new ApiResponse(200, {
            problems,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        }, "Problems fetched successfully"));
});

// Get single problem by ID or slug
const getProblem = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const { includeTestCases = false } = req.query;

    let selectFields = '';
    if (!includeTestCases) {
        selectFields = '-testCases';
    }

    // Try to find by ID first, then by titleSlug
    let problem;
    
    // Check if problemId is a valid MongoDB ObjectId
    if (problemId.match(/^[0-9a-fA-F]{24}$/)) {
        problem = await Problem.findById(problemId).select(selectFields);
    }
    
    // If not found by ID, try by titleSlug
    if (!problem) {
        problem = await Problem.findOne({ titleSlug: problemId }).select(selectFields);
    }

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
    const { problemId, useValidation = true, force = false } = req.body;

    console.log('=== PROBLEM GENERATION REQUEST ===');
    console.log('Request body:', { problemId, useValidation, force });

    if (!problemId) {
        throw new ApiError(400, "Problem ID is required");
    }

    try {
        // Step 1: Retrieve problem from database
        console.log('Fetching problem from database...');
        let problem = await Problem.findById(problemId);
        
        if (!problem) {
            // Try by titleSlug
            problem = await Problem.findOne({ titleSlug: problemId });
        }
        
        if (!problem) {
            throw new ApiError(404, "Problem not found. Please ensure the problem exists in the database before generating AI content.");
        }

        // Check if problem already has generated content (unless force is true)
        if (!force && problem.testCases && problem.testCases.length > 0) {
            console.log('Problem already has generated content, skipping generation');
            return res
                .status(200)
                .json(new ApiResponse(200, problem, "Problem already has generated content"));
        }

        console.log('Problem found:', {
            id: problem._id,
            title: problem.title,
            difficulty: problem.difficulty
        });

        // Step 2: Send problem data to AI service for generation
        console.log(`Sending problem data to AI service (validation: ${useValidation ? 'enabled' : 'disabled'})...`);
        
        const generatedContent = await aiServiceClient.generateProblem({
            leetcode_id: problem.leetcodeId,
            title: problem.title,
            title_slug: problem.titleSlug,
            description: problem.description,
            difficulty: problem.difficulty,
            tags: problem.tags || [],
            examples: problem.examples || [],
            constraints: problem.constraints || ''
        }, useValidation);

        console.log('AI service response received:', {
            formatted_statement_length: generatedContent.formatted_statement?.length || 0,
            test_cases_count: generatedContent.test_cases?.length || 0,
            validation_passed: generatedContent.validation_passed,
            diversity_score: generatedContent.test_case_diversity_score,
            coverage_score: generatedContent.coverage_score,
            retry_count: generatedContent.retry_count
        });

        // Step 3: Update problem with generated content using findByIdAndUpdate to avoid version conflicts
        // Validate and filter test cases to ensure they have required fields
        const validTestCases = generatedContent.test_cases?.filter(tc => {
            const hasInput = tc.input !== undefined && tc.input !== null && tc.input !== '';
            const hasOutput = tc.expected_output !== undefined && tc.expected_output !== null && tc.expected_output !== '';
            
            if (!hasInput || !hasOutput) {
                console.warn('Skipping invalid test case:', { 
                    hasInput, 
                    hasOutput,
                    input: tc.input?.substring(0, 50),
                    output: tc.expected_output?.substring(0, 50)
                });
                return false;
            }
            return true;
        }) || [];

        console.log(`Validated ${validTestCases.length} test cases out of ${generatedContent.test_cases?.length || 0}`);

        // If no valid test cases, keep existing ones or create a minimal set
        if (validTestCases.length === 0) {
            console.warn('No valid test cases generated, keeping existing test cases');
        }

        const exampleTestCases = validTestCases.filter(tc => !tc.is_hidden).slice(0, 3);
        const examples = exampleTestCases.length > 0 
            ? exampleTestCases.map(tc => ({
                input: String(tc.input || ''),
                output: String(tc.expected_output || ''),
                explanation: tc.explanation || ''
              }))
            : problem.examples;

        const testCases = validTestCases.length > 0
            ? validTestCases.map(tc => ({
                input: String(tc.input || ''),
                expectedOutput: String(tc.expected_output || ''),
                isHidden: tc.is_hidden || false
              }))
            : problem.testCases;

        const updateData = {
            description: generatedContent.formatted_statement || problem.description,
            constraints: generatedContent.constraints || problem.constraints,
            examples: examples,
            testCases: testCases.length > 0 ? testCases : problem.testCases, // Keep existing if validation fails
            timeLimit: generatedContent.time_limit || problem.timeLimit || 2,
            memoryLimit: generatedContent.memory_limit || problem.memoryLimit || 256
        };

        // Use findByIdAndUpdate with new option to get the updated document and avoid version conflicts
        const updatedProblem = await Problem.findByIdAndUpdate(
            problem._id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProblem) {
            throw new ApiError(404, "Problem not found after update");
        }

        console.log('Problem updated successfully in database:', updatedProblem._id);

        // Step 4: Generate Python boilerplate automatically
        try {
            console.log('Generating Python boilerplate...');
            const AI_SERVICE_URL = process.env.AI_SERVICE_URL || process.env.JUDGE0_SERVICE_URL || 'http://localhost:8001';
            
            // Prepare test cases for boilerplate generation
            const testCasesForAnalysis = updatedProblem.testCases && Array.isArray(updatedProblem.testCases)
                ? updatedProblem.testCases.slice(0, 3)
                    .filter(tc => tc && (tc.input || tc.expectedOutput || tc.expected_output))
                    .map(tc => ({
                        input: tc.input || '',
                        expected_output: tc.expectedOutput || tc.expected_output || ''
                    }))
                : [];
            
            const boilerplateResponse = await fetch(`${AI_SERVICE_URL}/api/v1/problems/boilerplate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: updatedProblem.title,
                    description: updatedProblem.description,
                    language: 'python',
                    input_format: generatedContent.input_format || '',
                    output_format: generatedContent.output_format || '',
                    constraints: updatedProblem.constraints || '',
                    examples: updatedProblem.examples || [],
                    test_cases: testCasesForAnalysis  // Pass test cases for type inference
                })
            });

            if (boilerplateResponse.ok) {
                const { code } = await boilerplateResponse.json();
                
                // Update problem with Python boilerplate
                if (!updatedProblem.starterCode) {
                    updatedProblem.starterCode = {};
                }
                updatedProblem.starterCode.python = code;
                await updatedProblem.save();
                
                console.log('Python boilerplate generated and cached');
            } else {
                console.warn('Failed to generate Python boilerplate, will generate on demand');
            }
        } catch (boilerplateError) {
            console.warn('Boilerplate generation error (non-critical):', boilerplateError.message);
            // Don't fail the whole request if boilerplate generation fails
        }

        // Step 5: Return problem with quality metrics
        const responseData = {
            ...updatedProblem.toObject(),
            // Include quality metrics from validation
            validationPassed: generatedContent.validation_passed,
            testCaseDiversityScore: generatedContent.test_case_diversity_score,
            coverageScore: generatedContent.coverage_score,
            retryCount: generatedContent.retry_count
        };

        return res
            .status(200)
            .json(new ApiResponse(200, responseData, "Problem generated and updated successfully"));

    } catch (error) {
        console.error('=== PROBLEM GENERATION ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Check if it's a fetch/network error
        if (error.message?.includes('fetch') || error.message?.includes('ECONNREFUSED')) {
            throw new ApiError(503, `AI service unavailable: ${error.message}`);
        }
        
        // Check if it's an AI service error
        if (error.message?.includes('AI service')) {
            throw new ApiError(500, error.message);
        }
        
        throw new ApiError(500, `Failed to generate problem: ${error.message}`);
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

    const total = await Problem.countDocuments({ difficulty, isActive: true });

    // Fetch all problems with this difficulty
    const allProblems = await Problem.find({ 
        difficulty, 
        isActive: true 
    })
        .select('-testCases')
        .lean();

    // Sort by leetcodeId or title
    const sortedProblems = allProblems.sort((a, b) => {
        if (a.leetcodeId && b.leetcodeId) {
            return parseInt(a.leetcodeId) - parseInt(b.leetcodeId);
        }
        return (a.title || '').localeCompare(b.title || '');
    });

    // Apply pagination
    const problems = sortedProblems.slice(
        (parseInt(page) - 1) * parseInt(limit),
        parseInt(page) * parseInt(limit)
    );

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
    const { difficulty } = req.query;

    // Get random problem from database
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

// Get database statistics
const getLeetCodeStats = asyncHandler(async (req, res) => {
    try {
        // Get statistics from MongoDB
        const [totalProblems, easyCount, mediumCount, hardCount, allTags] = await Promise.all([
            Problem.countDocuments({ isActive: true }),
            Problem.countDocuments({ difficulty: 'Easy', isActive: true }),
            Problem.countDocuments({ difficulty: 'Medium', isActive: true }),
            Problem.countDocuments({ difficulty: 'Hard', isActive: true }),
            Problem.distinct('tags', { isActive: true })
        ]);

        const stats = {
            totalProblems,
            difficulties: {
                easy: easyCount,
                medium: mediumCount,
                hard: hardCount
            },
            totalTags: allTags.length,
            tags: allTags.sort()
        };
        
        return res
            .status(200)
            .json(new ApiResponse(200, stats, "Database statistics fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to fetch database statistics");
    }
});

// Get all available tags/topics
const getAllTags = asyncHandler(async (req, res) => {
    try {
        const allTags = await Problem.distinct('tags', { isActive: true });
        
        return res
            .status(200)
            .json(new ApiResponse(200, { tags: allTags.sort() }, "Tags fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to fetch tags");
    }
});

// Search problems from MongoDB database
const searchLeetCodeProblems = asyncHandler(async (req, res) => {
    const { 
        query, 
        search,
        difficulty, 
        tags, 
        limit = 20,
        page = 1 
    } = req.query;

    try {
        // Build MongoDB query
        const matchConditions = { isActive: true };
        const searchTerm = query || search;

        // Text search
        if (searchTerm) {
            matchConditions.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { titleSlug: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Difficulty filter
        if (difficulty) {
            matchConditions.difficulty = difficulty;
        }

        // Tags filter
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',');
            matchConditions.tags = { $in: tagArray };
        }

        // Get total count for pagination
        const total = await Problem.countDocuments(matchConditions);
        const totalPages = Math.ceil(total / limit);

        // Define difficulty order for sorting
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

        // Fetch problems from MongoDB with pagination
        const problems = await Problem.find(matchConditions)
            .select('leetcodeId title titleSlug difficulty tags points acceptanceRate')
            .lean();

        // Sort by difficulty (Easy -> Medium -> Hard), then by leetcodeId or title
        const sortedProblems = problems.sort((a, b) => {
            const diffA = difficultyOrder[a.difficulty] || 999;
            const diffB = difficultyOrder[b.difficulty] || 999;
            
            if (diffA !== diffB) {
                return diffA - diffB;
            }
            
            // If same difficulty, sort by leetcodeId (if available) or title
            if (a.leetcodeId && b.leetcodeId) {
                return parseInt(a.leetcodeId) - parseInt(b.leetcodeId);
            }
            
            return (a.title || '').localeCompare(b.title || '');
        });

        // Apply pagination after sorting
        const paginatedProblems = sortedProblems.slice(
            (parseInt(page) - 1) * parseInt(limit),
            parseInt(page) * parseInt(limit)
        );

        // Transform to match frontend expectations
        const transformedProblems = paginatedProblems.map(problem => ({
            _id: problem._id.toString(),
            leetcodeId: problem.leetcodeId,
            title: problem.title,
            titleSlug: problem.titleSlug,
            difficulty: problem.difficulty,
            tags: problem.tags || [],
            points: problem.points || (problem.difficulty === 'Easy' ? 100 : problem.difficulty === 'Medium' ? 200 : 300),
        }));

        return res
            .status(200)
            .json(new ApiResponse(200, {
                problems: transformedProblems,
                totalPages,
                currentPage: parseInt(page),
                total
            }, "Problems fetched successfully from database"));
    } catch (error) {
        console.error('Problem search error:', error);
        throw new ApiError(500, "Failed to search problems");
    }
});

// Generate boilerplate code for a specific language
const generateBoilerplate = asyncHandler(async (req, res) => {
    const { problemId, language } = req.body;

    if (!problemId || !language) {
        throw new ApiError(400, "Problem ID and language are required");
    }

    console.log(`Generating boilerplate for problem ${problemId} in ${language}`);

    try {
        // Find the problem
        let problem = await Problem.findById(problemId);
        if (!problem) {
            problem = await Problem.findOne({ titleSlug: problemId });
        }
        if (!problem) {
            throw new ApiError(404, "Problem not found");
        }

        // Check if boilerplate already exists in cache
        if (problem.starterCode && problem.starterCode[language]) {
            console.log(`Boilerplate for ${language} found in cache`);
            return res
                .status(200)
                .json(new ApiResponse(200, {
                    language,
                    code: problem.starterCode[language],
                    cached: true
                }, "Boilerplate fetched from cache"));
        }

        // Generate boilerplate using AI service
        console.log(`Requesting boilerplate generation from AI service...`);
        const AI_SERVICE_URL = process.env.AI_SERVICE_URL || process.env.JUDGE0_SERVICE_URL || 'http://localhost:8001';
        
        // Prepare test cases (first 3 for analysis)
        const testCasesForAnalysis = problem.testCases && Array.isArray(problem.testCases)
            ? problem.testCases.slice(0, 3)
                .filter(tc => tc && (tc.input || tc.expectedOutput || tc.expected_output))
                .map(tc => ({
                    input: tc.input || '',
                    expected_output: tc.expectedOutput || tc.expected_output || ''
                }))
            : [];
        
        const response = await fetch(`${AI_SERVICE_URL}/api/v1/problems/boilerplate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: problem.title,
                description: problem.description,
                language: language,
                input_format: problem.inputFormat || '',
                output_format: problem.outputFormat || '',
                constraints: problem.constraints || '',
                examples: problem.examples || [],
                test_cases: testCasesForAnalysis  // Pass test cases for type inference
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('AI service error:', errorText);
            throw new Error(`AI service returned ${response.status}: ${errorText}`);
        }

        const { code } = await response.json();
        console.log(`Boilerplate generated successfully (${code.length} chars)`);

        // Cache the boilerplate in the problem document
        if (!problem.starterCode) {
            problem.starterCode = {};
        }
        problem.starterCode[language] = code;
        await problem.save();

        console.log(`Boilerplate cached for language: ${language}`);

        return res
            .status(200)
            .json(new ApiResponse(200, {
                language,
                code,
                cached: false
            }, "Boilerplate generated and cached successfully"));

    } catch (error) {
        console.error('Boilerplate generation error:', error);
        throw new ApiError(500, `Failed to generate boilerplate: ${error.message}`);
    }
});

// Get boilerplate code (from cache or generate if needed)
const getBoilerplate = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const { language = 'python' } = req.query;

    console.log(`Getting boilerplate for problem ${problemId} in ${language}`);

    try {
        // Find the problem
        let problem = await Problem.findById(problemId);
        if (!problem) {
            problem = await Problem.findOne({ titleSlug: problemId });
        }
        if (!problem) {
            throw new ApiError(404, "Problem not found");
        }

        // Check if boilerplate exists
        if (problem.starterCode && problem.starterCode[language]) {
            return res
                .status(200)
                .json(new ApiResponse(200, {
                    language,
                    code: problem.starterCode[language],
                    allLanguages: Object.keys(problem.starterCode || {})
                }, "Boilerplate retrieved successfully"));
        }

        // If Python boilerplate doesn't exist, generate it immediately
        if (language === 'python') {
            console.log('Python boilerplate not found, generating...');
            
            const AI_SERVICE_URL = process.env.AI_SERVICE_URL || process.env.JUDGE0_SERVICE_URL || 'http://localhost:8001';
            
            // Prepare test cases (first 3 for analysis)
            const testCasesForAnalysis = problem.testCases && Array.isArray(problem.testCases)
                ? problem.testCases.slice(0, 3)
                    .filter(tc => tc && (tc.input || tc.expectedOutput || tc.expected_output))
                    .map(tc => ({
                        input: tc.input || '',
                        expected_output: tc.expectedOutput || tc.expected_output || ''
                    }))
                : [];
            
            const response = await fetch(`${AI_SERVICE_URL}/api/v1/problems/boilerplate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: problem.title,
                    description: problem.description,
                    language: 'python',
                    input_format: problem.inputFormat || '',
                    output_format: problem.outputFormat || '',
                    constraints: problem.constraints || '',
                    examples: problem.examples || [],
                    test_cases: testCasesForAnalysis  // Pass test cases for type inference
                })
            });

            if (response.ok) {
                const { code } = await response.json();
                
                // Cache it
                if (!problem.starterCode) {
                    problem.starterCode = {};
                }
                problem.starterCode['python'] = code;
                await problem.save();

                return res
                    .status(200)
                    .json(new ApiResponse(200, {
                        language: 'python',
                        code,
                        allLanguages: ['python']
                    }, "Python boilerplate generated successfully"));
            }
        }

        // Return empty if not found
        return res
            .status(200)
            .json(new ApiResponse(200, {
                language,
                code: '',
                allLanguages: Object.keys(problem.starterCode || {})
            }, "Boilerplate not found for this language"));

    } catch (error) {
        console.error('Get boilerplate error:', error);
        throw new ApiError(500, `Failed to get boilerplate: ${error.message}`);
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
    searchLeetCodeProblems,
    getAllTags,
    generateBoilerplate,
    getBoilerplate
};