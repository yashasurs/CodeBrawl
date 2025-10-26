export type PracticeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface PracticeProblemSummary {
  _id: string;
  title: string;
  difficulty: PracticeDifficulty;
  tags: string[];
  acceptanceRate?: number;
  totalSubmissions?: number;
  successfulSubmissions?: number;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
  titleSlug?: string;
  leetcodeId?: string;
}

export interface PracticeExample {
  input?: string;
  output?: string;
  explanation?: string;
}

export interface PracticeTestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface PracticeStarterCode {
  javascript?: string;
  python?: string;
  java?: string;
  cpp?: string;
  c?: string;
  csharp?: string;
  go?: string;
  rust?: string;
}

export interface PracticeProblem extends PracticeProblemSummary {
  description: string;
  constraints?: string;
  examples?: PracticeExample[];
  testCases?: PracticeTestCase[];
  starterCode?: PracticeStarterCode;
  timeLimit?: number;
  memoryLimit?: number;
  leetcodeId?: string;
  titleSlug?: string;
  // Quality metrics from AI generation
  validationPassed?: boolean;
  testCaseDiversityScore?: number;
  coverageScore?: number;
  retryCount?: number;
}

export type PracticeLanguage =
  | 'python'
  | 'javascript'
  | 'java'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust';

export type PracticeSubmissionStatus =
  | 'pending'
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'runtime_error'
  | 'compilation_error'
  | 'memory_limit_exceeded';

export interface PracticeSubmissionTestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime?: number;
  memoryUsage?: number;
}

export interface PracticeSubmission {
  _id: string;
  problem: {
    _id: string;
    title: string;
    difficulty: PracticeDifficulty;
  };
  user: {
    _id: string;
    username?: string;
    fullName?: string;
  };
  status: PracticeSubmissionStatus;
  code: string;
  language: PracticeLanguage;
  output?: string;
  errorMessage?: string;
  executionTime?: number;
  memoryUsage?: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  testResults?: PracticeSubmissionTestResult[];
  submittedAt?: string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  score?: number;
  isCorrect?: boolean;
}

export interface PracticeProblemListResponse {
  problems: PracticeProblemSummary[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface DatasetProblem {
  leetcodeId: string;
  title: string;
  titleSlug: string;
  difficulty: PracticeDifficulty;
  acceptanceRate?: number;
  tags?: string[];
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}
