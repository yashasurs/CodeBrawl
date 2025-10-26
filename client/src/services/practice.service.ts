import apiClient from '@/utils/apiClient';
import type {
  ApiResponse,
  DatasetProblem,
  PracticeProblem,
  PracticeProblemListResponse,
  PracticeSubmission,
} from '@/types/practice';

interface ListProblemsParams {
  page?: number;
  limit?: number;
  difficulty?: string;
  tags?: string[];
  search?: string;
  isActive?: boolean;
}

interface GetProblemParams {
  includeTestCases?: boolean;
}

interface GenerateProblemPayload {
  problemId: string;  // MongoDB ID or titleSlug (required)
}

interface RandomProblemParams {
  difficulty?: string;
  source?: 'database' | 'leetcode';
}

interface SubmitPracticePayload {
  problemId: string;
  code: string;
  language: string;
}

interface RunCodePayload {
  problemId: string;
  code: string;
  language: string;
}

const practiceService = {
  async listProblems(params: ListProblemsParams = {}) {
    const response = await apiClient.get<ApiResponse<PracticeProblemListResponse>>('/api/v1/problems', {
      params,
    });
    return response.data;
  },

  async getLeetCodeProblems(params: ListProblemsParams = {}) {
    const response = await apiClient.get<ApiResponse<PracticeProblemListResponse>>('/api/v1/problems/leetcode/search', {
      params,
    });
    return response.data;
  },

  async getAllTags() {
    const response = await apiClient.get<ApiResponse<{ tags: string[] }>>('/api/v1/problems/tags');
    return response.data;
  },

  async getProblem(problemId: string, params: GetProblemParams = {}) {
    const response = await apiClient.get<ApiResponse<PracticeProblem>>(`/api/v1/problems/${problemId}`, {
      params,
    });
    return response.data;
  },

  async generateProblem(payload: GenerateProblemPayload) {
    const response = await apiClient.post<ApiResponse<PracticeProblem>>('/api/v1/problems/generate', payload);
    return response.data;
  },

  async getRandomProblem(params: RandomProblemParams = {}) {
    const response = await apiClient.get<ApiResponse<PracticeProblem | DatasetProblem>>('/api/v1/problems/random', {
      params,
    });
    return response.data;
  },

  async submitPracticeSolution(payload: SubmitPracticePayload) {
    const response = await apiClient.post<ApiResponse<PracticeSubmission>>('/api/v1/submissions/practice', payload);
    return response.data;
  },

  async runCode(payload: RunCodePayload) {
    const response = await apiClient.post<ApiResponse<PracticeSubmission>>('/api/v1/submissions/practice/run', payload);
    return response.data;
  },

  async getSubmission(submissionId: string) {
    const response = await apiClient.get<ApiResponse<PracticeSubmission>>(`/api/v1/submissions/${submissionId}`);
    return response.data;
  },
};

export default practiceService;
