import  asyncHandler  from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Submission } from "../models/Submission.model.js";
import { Duel } from "../models/Duel.model.js";
import { Match } from "../models/Match.model.js";
import { Problem } from "../models/Problem.model.js";
import { User } from "../models/User.model.js";
import Judge0Client from "../utils/judge0Client.js";

// Submit code for a duel
const submitCodeForDuel = asyncHandler(async (req, res) => {
    const { duelId, code, language } = req.body;
    const userId = req.user._id;

    if (!duelId || !code?.trim() || !language) {
        throw new ApiError(400, "Duel ID, code, and language are required");
    }

    // Verify duel exists and user is participant
    const duel = await Duel.findById(duelId).populate('problem');
    if (!duel) {
        throw new ApiError(404, "Duel not found");
    }

    if (duel.status !== 'in_progress') {
        throw new ApiError(400, "Duel is not active");
    }

    const isParticipant = duel.player1.toString() === userId.toString() || 
                         (duel.player2 && duel.player2.toString() === userId.toString());
    
    if (!isParticipant) {
        throw new ApiError(403, "You are not a participant in this duel");
    }

    // Create submission record
    const submission = await Submission.create({
        duel: duelId,
        user: userId,
        problem: duel.problem._id,
        code: code.trim(),
        language,
        status: 'pending'
    });

    // Send to Judge0 service for execution asynchronously
    Judge0Client.submitCode({
        submission_id: submission._id.toString(),
        source_code: code.trim(),
        language,
        test_cases: duel.problem.testCases || [],
        time_limit: duel.problem.timeLimit || 2.0,
        memory_limit: duel.problem.memoryLimit || 256
    }).then(result => {
        // Update submission with results (this happens asynchronously)
        updateSubmissionResult({ params: { submissionId: submission._id.toString() }, body: result });
    }).catch(error => {
        console.error('Judge0 execution error:', error);
        // Update submission with error status
        Submission.findByIdAndUpdate(submission._id, {
            status: 'runtime_error',
            errorMessage: 'Code execution service error',
            completedAt: new Date()
        }).exec();
    });
    
    const populatedSubmission = await Submission.findById(submission._id)
        .populate('user', 'username fullName avatar')
        .populate('problem', 'title difficulty')
        .populate('duel', 'title status');

    return res
        .status(201)
        .json(new ApiResponse(201, populatedSubmission, "Code submitted successfully"));
});

// Run code against sample test cases (non-hidden ones only)
const runCodeAgainstSamples = asyncHandler(async (req, res) => {
    const { problemId, code, language } = req.body;
    const userId = req.user._id;

    if (!problemId || !code?.trim() || !language) {
        throw new ApiError(400, "Problem ID, code, and language are required");
    }

    // Verify problem exists and has test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    if (!problem.testCases || problem.testCases.length === 0) {
        throw new ApiError(400, "Problem has no test cases. Please generate the problem first.");
    }

    // Get only non-hidden (sample) test cases - typically 2-3 cases
    const sampleTestCases = problem.testCases.filter(tc => !tc.isHidden).slice(0, 3);
    
    if (sampleTestCases.length === 0) {
        throw new ApiError(400, "No sample test cases available for testing.");
    }

    // Format test cases for Judge0
    const formattedTestCases = sampleTestCases.map(tc => ({
        input: tc.input || '',
        expected_output: tc.expectedOutput || tc.expected_output || '',
        is_hidden: false
    }));

    console.log('Running code against sample test cases:', {
        problem_id: problemId,
        language,
        sample_cases_count: formattedTestCases.length
    });

    try {
        // Execute code synchronously for sample test cases (quick feedback)
        const result = await Judge0Client.submitCode({
            submission_id: `run_${userId}_${Date.now()}`, // Temporary ID for run
            source_code: code.trim(),
            language,
            test_cases: formattedTestCases,
            time_limit: problem.timeLimit || 2.0,
            memory_limit: problem.memoryLimit || 256
        }, true); // Pass true to wait for result

        console.log('Run result:', {
            status: result.status,
            passed: result.passed_tests,
            total: result.total_tests
        });

        // Return results immediately (not stored in database)
        return res
            .status(200)
            .json(new ApiResponse(200, {
                status: result.status,
                testResults: result.test_results,
                testCasesPassed: result.passed_tests,
                totalTestCases: result.total_tests,
                executionTime: result.execution_time,
                memoryUsage: result.memory_usage,
                errorMessage: result.error_message || '',
                isCorrect: result.passed_tests === result.total_tests
            }, "Code run against sample test cases"));

    } catch (error) {
        console.error('Run code error:', error);
        throw new ApiError(500, `Failed to run code: ${error.message}`);
    }
});

// Submit code for practice
const submitCodeForPractice = asyncHandler(async (req, res) => {
    const { problemId, code, language } = req.body;
    const userId = req.user._id;

    if (!problemId || !code?.trim() || !language) {
        throw new ApiError(400, "Problem ID, code, and language are required");
    }

    // Verify problem exists and has test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    if (!problem.testCases || problem.testCases.length === 0) {
        throw new ApiError(400, "Problem has no test cases. Please generate the problem first.");
    }

    // Create submission record
    const submission = await Submission.create({
        user: userId,
        problem: problemId,
        code: code.trim(),
        language,
        status: 'pending',
        testCasesPassed: 0,
        totalTestCases: problem.testCases.length
    });

    // Format test cases for Judge0 (ensure proper structure)
    const formattedTestCases = problem.testCases.map(tc => ({
        input: tc.input || '',
        expected_output: tc.expectedOutput || tc.expected_output || '',
        is_hidden: tc.isHidden || tc.is_hidden || false
    }));

    console.log('Submitting code to Judge0:', {
        submission_id: submission._id.toString(),
        language,
        test_cases_count: formattedTestCases.length
    });

    // Send to Judge0 service for execution asynchronously
    Judge0Client.submitCode({
        submission_id: submission._id.toString(),
        source_code: code.trim(),
        language,
        test_cases: formattedTestCases,
        time_limit: problem.timeLimit || 2.0,
        memory_limit: problem.memoryLimit || 256
    }).then(result => {
        console.log('Judge0 result received:', {
            submission_id: submission._id.toString(),
            status: result.status,
            passed: result.testCasesPassed || result.passed_tests,
            total: result.totalTestCases || result.total_tests
        });
        // Update submission with results (this happens asynchronously)
        updateSubmissionResult({ 
            params: { submissionId: submission._id.toString() }, 
            body: result 
        });
    }).catch(error => {
        console.error('Judge0 execution error:', error);
        // Update submission with error status
        Submission.findByIdAndUpdate(submission._id, {
            status: 'runtime_error',
            errorMessage: 'Code execution service error',
            completedAt: new Date()
        }).exec();
    });
    
    const populatedSubmission = await Submission.findById(submission._id)
        .populate('user', 'username fullName avatar')
        .populate('problem', 'title difficulty');

    return res
        .status(201)
        .json(new ApiResponse(201, populatedSubmission, "Code submitted for practice"));
});

// Get submission details
const getSubmission = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId)
        .populate('user', 'username fullName avatar')
        .populate('problem', 'title difficulty')
        .populate('duel', 'title status')
        .populate('match', 'matchId status');

    if (!submission) {
        throw new ApiError(404, "Submission not found");
    }

    // Check if user has permission to view this submission
    if (req.user && submission.user._id.toString() !== req.user._id.toString()) {
        // Allow viewing if it's in a public duel or the user is a participant
        if (submission.duel) {
            const duel = await Duel.findById(submission.duel._id);
            const isParticipant = duel.player1.toString() === req.user._id.toString() || 
                                 (duel.player2 && duel.player2.toString() === req.user._id.toString());
            
            if (!duel.isPublic && !isParticipant) {
                throw new ApiError(403, "Access denied to this submission");
            }
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, submission, "Submission details fetched successfully"));
});

// Get user's submissions
const getUserSubmissions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, language, problemId } = req.query;
    const userId = req.user._id;

    const matchConditions = { user: userId };

    if (status) {
        matchConditions.status = status;
    }

    if (language) {
        matchConditions.language = language;
    }

    if (problemId) {
        matchConditions.problem = problemId;
    }

    const submissions = await Submission.find(matchConditions)
        .populate('problem', 'title difficulty points')
        .populate('duel', 'title status')
        .populate('match', 'matchId status')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Submission.countDocuments(matchConditions);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            submissions,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        }, "User submissions fetched successfully"));
});

// Get submissions for a specific duel
const getDuelSubmissions = asyncHandler(async (req, res) => {
    const { duelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify duel exists and user has access
    const duel = await Duel.findById(duelId);
    if (!duel) {
        throw new ApiError(404, "Duel not found");
    }

    if (req.user) {
        const userId = req.user._id.toString();
        const isParticipant = duel.player1.toString() === userId || 
                             (duel.player2 && duel.player2.toString() === userId);
        
        if (!duel.isPublic && !isParticipant) {
            throw new ApiError(403, "Access denied to duel submissions");
        }
    }

    const submissions = await Submission.find({ duel: duelId })
        .populate('user', 'username fullName avatar')
        .populate('problem', 'title difficulty')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Submission.countDocuments({ duel: duelId });

    return res
        .status(200)
        .json(new ApiResponse(200, {
            submissions,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        }, "Duel submissions fetched successfully"));
});

// Get submissions for a specific problem
const getProblemSubmissions = asyncHandler(async (req, res) => {
    const { problemId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user._id;

    const matchConditions = { 
        problem: problemId,
        user: userId // Only show user's own submissions
    };

    if (status) {
        matchConditions.status = status;
    }

    const submissions = await Submission.find(matchConditions)
        .populate('duel', 'title status')
        .populate('match', 'matchId status')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Submission.countDocuments(matchConditions);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            submissions,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        }, "Problem submissions fetched successfully"));
});

// Update submission result (called by judge service)
const updateSubmissionResult = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const { 
        status, 
        executionTime,
        execution_time, 
        memoryUsage,
        memory_usage, 
        output, 
        errorMessage,
        error_message, 
        testResults,
        test_results,
        testCasesPassed,
        passed_tests,
        totalTestCases,
        total_tests,
        score,
        isCorrect,
        is_correct
    } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
        throw new ApiError(404, "Submission not found");
    }

    // Handle both camelCase and snake_case from Judge0 service
    const passedCount = testCasesPassed || passed_tests || 0;
    const totalCount = totalTestCases || total_tests || 0;
    const execTime = executionTime || execution_time || 0;
    const memUsage = memoryUsage || memory_usage || 0;
    const errMsg = errorMessage || error_message || "";
    const results = testResults || test_results || [];
    const correct = isCorrect || is_correct || (passedCount === totalCount && totalCount > 0);

    // Update submission
    submission.status = status;
    submission.executionTime = execTime;
    submission.memoryUsage = memUsage;
    submission.output = output || "";
    submission.errorMessage = errMsg;
    submission.testResults = results;
    submission.testCasesPassed = passedCount;
    submission.totalTestCases = totalCount;
    submission.score = score || (correct ? 100 : 0);
    submission.isCorrect = correct;
    submission.completedAt = new Date();

    await submission.save();

    console.log('Submission updated:', {
        id: submissionId,
        status: submission.status,
        passed: passedCount,
        total: totalCount,
        isCorrect: correct
    });

    // If it's a duel submission and correct, update duel scores
    if (submission.duel && submission.isCorrect) {
        const duel = await Duel.findById(submission.duel);
        if (duel) {
            if (duel.player1.toString() === submission.user.toString()) {
                duel.player1Score = Math.max(duel.player1Score, submission.score);
            } else if (duel.player2 && duel.player2.toString() === submission.user.toString()) {
                duel.player2Score = Math.max(duel.player2Score, submission.score);
            }

            // Check if duel should be completed
            const bothSolved = duel.player1Score > 0 && duel.player2Score > 0;
            const timeExpired = duel.startedAt && 
                               (Date.now() - duel.startedAt.getTime()) > (duel.timeLimit * 1000);

            if (bothSolved || timeExpired) {
                duel.status = 'completed';
                duel.completedAt = new Date();

                // Determine winner
                if (duel.player1Score > duel.player2Score) {
                    duel.winner = duel.player1;
                } else if (duel.player2Score > duel.player1Score) {
                    duel.winner = duel.player2;
                }
            }

            await duel.save();
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, submission, "Submission result updated successfully"));
});

export {
    submitCodeForDuel,
    submitCodeForPractice,
    runCodeAgainstSamples,
    getSubmission,
    getUserSubmissions,
    getDuelSubmissions,
    getProblemSubmissions,
    updateSubmissionResult
};