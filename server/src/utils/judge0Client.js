/**
 * Judge0 API client for code execution
 * This client communicates directly with Judge0 API for code evaluation
 */

const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
    'python': 71,      // Python 3.8.1
    'javascript': 63,  // JavaScript (Node.js 12.14.0)
    'java': 62,        // Java (OpenJDK 13.0.1)
    'cpp': 54,         // C++ (GCC 9.2.0)
    'c': 50,           // C (GCC 9.2.0)
    'csharp': 51,      // C# (Mono 6.6.0.161)
    'go': 60,          // Go (1.13.5)
    'rust': 73,        // Rust (1.40.0)
};

class Judge0Client {
    
    /**
     * Submit code for execution against test cases
     * @param {boolean} waitForResult - If true, wait for execution to complete before returning
     */
    static async submitCode(submissionData, waitForResult = false) {
        try {
            const { 
                submission_id, 
                source_code, 
                language, 
                test_cases, 
                time_limit = 2.0, 
                memory_limit = 256 
            } = submissionData;

            const languageId = LANGUAGE_IDS[language];
            if (!languageId) {
                throw new Error(`Unsupported language: ${language}`);
            }

            console.log(`Executing code with Judge0 for submission ${submission_id}...`);
            console.log(`Language: ${language} (ID: ${languageId}), Test cases: ${test_cases.length}, Wait: ${waitForResult}`);

            const results = [];
            
            // Submit code for each test case
            for (let i = 0; i < test_cases.length; i++) {
                const testCase = test_cases[i];
                
                const submissionPayload = {
                    language_id: languageId,
                    source_code: source_code,
                    stdin: testCase.input || '',
                    expected_output: testCase.expected_output || '',
                    cpu_time_limit: time_limit,
                    memory_limit: memory_limit * 1024, // Convert MB to KB
                };

                try {
                    // Submit for execution
                    const submitResponse = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-RapidAPI-Key': JUDGE0_API_KEY,
                            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                        },
                        body: JSON.stringify(submissionPayload)
                    });

                    if (!submitResponse.ok) {
                        console.error(`Judge0 submission failed for test case ${i}:`, await submitResponse.text());
                        results.push({
                            test_case_index: i,
                            input: testCase.input,
                            expected_output: testCase.expected_output,
                            passed: false,
                            status_id: 13, // Internal Error
                            stdout: '',
                            stderr: 'Submission failed',
                            time: 0,
                            memory: 0
                        });
                        continue;
                    }

                    const submission = await submitResponse.json();
                    const token = submission.token;

                    if (!token) {
                        console.error('No token received from Judge0');
                        results.push({
                            test_case_index: i,
                            input: testCase.input,
                            expected_output: testCase.expected_output,
                            passed: false,
                            status_id: 13,
                            stdout: '',
                            stderr: 'No token received',
                            time: 0,
                            memory: 0
                        });
                        continue;
                    }

                    // Wait for execution to complete and get result
                    const result = await this._getSubmissionResult(token);
                    result.test_case_index = i;
                    result.input = testCase.input;
                    result.expected_output = testCase.expected_output;
                    
                    // Check if output matches expected
                    const stdout = (result.stdout || '').trim();
                    const expected = (testCase.expected_output || '').trim();
                    result.passed = result.status_id === 3 && stdout === expected;
                    
                    results.push(result);

                } catch (error) {
                    console.error(`Error executing test case ${i}:`, error);
                    results.push({
                        test_case_index: i,
                        input: testCase.input,
                        expected_output: testCase.expected_output,
                        passed: false,
                        status_id: 13,
                        stdout: '',
                        stderr: error.message,
                        time: 0,
                        memory: 0
                    });
                }
            }

            // Analyze overall results
            const analysisResult = this._analyzeResults(results);
            
            console.log(`Execution completed for submission ${submission_id}:`, {
                status: analysisResult.status,
                passed: analysisResult.passed_tests,
                total: analysisResult.total_tests
            });

            // If this is a Run (waitForResult=true), return immediately
            if (waitForResult) {
                return analysisResult;
            }

            // For Submit, send results back to submission controller asynchronously
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            await fetch(`${backendUrl}/api/v1/submissions/${submission_id}/result`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(analysisResult)
            }).catch(err => {
                console.error('Failed to update submission result:', err);
            });

            return analysisResult;

        } catch (error) {
            console.error('Judge0 submission error:', error);
            throw error;
        }
    }

    /**
     * Get submission result by token (with retries)
     */
    static async _getSubmissionResult(token, maxAttempts = 20) {  // Increased from 10 to 20
        console.log(`Polling Judge0 for token: ${token} (max attempts: ${maxAttempts})`);
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await fetch(`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false&fields=*`, {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': JUDGE0_API_KEY,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    const status = result.status || {};
                    const statusId = status.id;

                    // Log current status for debugging
                    if (attempt % 5 === 0 || statusId !== 1 && statusId !== 2) {
                        console.log(`Attempt ${attempt + 1}/${maxAttempts}: Status ${statusId} (${status.description})`);
                    }

                    // Status IDs: 1 = In Queue, 2 = Processing
                    // If not in queue or processing, execution is complete
                    if (statusId !== 1 && statusId !== 2) {
                        console.log(`✓ Execution completed: ${status.description}`);
                        return {
                            status_id: statusId,
                            status_description: status.description || 'Unknown',
                            stdout: result.stdout || '',
                            stderr: result.stderr || '',
                            compile_output: result.compile_output || '',
                            time: parseFloat(result.time) || 0,
                            memory: parseInt(result.memory) || 0
                        };
                    }
                }

                // Wait before next attempt (reduced from 1000ms to 500ms for faster polling)
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.error(`Error getting submission result (attempt ${attempt + 1}):`, error.message);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Timeout after max attempts
        console.error(`✗ Timeout after ${maxAttempts} attempts for token: ${token}`);
        return {
            status_id: 13, // Internal Error
            status_description: 'Execution timeout',
            stdout: '',
            stderr: 'Maximum retry attempts reached. Judge0 API may be overloaded or code execution is taking too long.',
            compile_output: '',
            time: 0,
            memory: 0
        };
    }

    /**
     * Analyze execution results across all test cases
     */
    static _analyzeResults(results) {
        if (!results || results.length === 0) {
            return {
                status: 'runtime_error',
                error_message: 'No results',
                execution_time: 0,
                memory_usage: 0,
                passed_tests: 0,
                total_tests: 0,
                test_results: []
            };
        }

        let passedTests = 0;
        let totalExecutionTime = 0;
        let maxMemory = 0;
        let firstError = null;

        for (const result of results) {
            const statusId = result.status_id || 13;

            // Check if test passed
            if (result.passed) {
                passedTests++;
            }

            // Track performance metrics
            totalExecutionTime += result.time || 0;
            maxMemory = Math.max(maxMemory, result.memory || 0);

            // Capture first error
            if (!result.passed && !firstError) {
                firstError = {
                    status_id: statusId,
                    description: result.status_description || 'Unknown error',
                    stderr: result.stderr || '',
                    compile_output: result.compile_output || ''
                };
            }
        }

        // Determine overall status
        const overallStatus = this._determineOverallStatus(results, passedTests, results.length);

        return {
            status: overallStatus,
            error_message: this._getErrorMessage(firstError),
            execution_time: totalExecutionTime,
            memory_usage: maxMemory,
            passed_tests: passedTests,
            total_tests: results.length,
            test_results: results.map(r => ({
                input: r.input,
                expectedOutput: r.expected_output,
                actualOutput: r.stdout || '',
                passed: r.passed,
                status: r.status_description,
                time: r.time,
                memory: r.memory
            }))
        };
    }

    /**
     * Determine overall submission status
     */
    static _determineOverallStatus(results, passed, total) {
        if (passed === total) {
            return 'accepted';
        }

        // Check for common error types
        for (const result of results) {
            const statusId = result.status_id || 13;

            if (statusId === 5) return 'time_limit_exceeded';
            if (statusId === 6) return 'compilation_error';
            if (statusId >= 7 && statusId <= 12) return 'runtime_error';
            if (statusId === 17) return 'memory_limit_exceeded';
        }

        // Default to wrong answer
        return 'wrong_answer';
    }

    /**
     * Get human-readable error message
     */
    static _getErrorMessage(error) {
        if (!error) return '';

        const description = error.description || '';
        const stderr = (error.stderr || '').trim();
        const compileOutput = (error.compile_output || '').trim();

        if (compileOutput) {
            return `Compilation Error: ${compileOutput}`;
        } else if (stderr) {
            return `${description}: ${stderr}`;
        } else {
            return description;
        }
    }

    /**
     * Get execution result by submission ID (legacy method for compatibility)
     */
    static async getResult(submissionId) {
        try {
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            const response = await fetch(`${backendUrl}/api/v1/submissions/${submissionId}`);

            if (!response.ok) {
                throw new Error(`Failed to get result: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting submission result:', error);
            throw new Error('Failed to retrieve submission result');
        }
    }

    /**
     * Generate problem using AI service (forwarding to Python service)
     */
    static async generateProblem(problemData) {
        try {
            const JUDGE0_SERVICE_URL = process.env.JUDGE0_SERVICE_URL || "http://localhost:8000";
            const response = await fetch(`${JUDGE0_SERVICE_URL}/api/v1/problems/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(problemData)
            });

            if (!response.ok) {
                throw new Error(`Problem generation service error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error communicating with problem generation service:', error);
            throw new Error('Problem generation service unavailable');
        }
    }
}

export default Judge0Client;