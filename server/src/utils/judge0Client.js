/**
 * Judge0 API client for code execution
 * This is a lightweight client that communicates with the microservice
 */

const JUDGE0_SERVICE_URL = process.env.JUDGE0_SERVICE_URL || "http://localhost:8000";

class Judge0Client {
    
    /**
     * Submit code for execution to the microservice
     */
    static async submitCode(submissionData) {
        try {
            const response = await fetch(`${JUDGE0_SERVICE_URL}/api/v1/submissions/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) {
                throw new Error(`Judge0 service error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error communicating with Judge0 service:', error);
            throw new Error('Code execution service unavailable');
        }
    }

    /**
     * Get execution result by submission ID
     */
    static async getResult(submissionId) {
        try {
            const response = await fetch(`${JUDGE0_SERVICE_URL}/api/v1/submissions/${submissionId}/result`);

            if (!response.ok) {
                throw new Error(`Judge0 service error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting result from Judge0 service:', error);
            throw new Error('Code execution service unavailable');
        }
    }

    /**
     * Generate problem using LangGraph workflow
     */
    static async generateProblem(problemData) {
        try {
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