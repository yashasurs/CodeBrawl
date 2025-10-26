"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatsOverview from '@/components/practice/StatsOverview';
import ProblemFilters from '@/components/practice/ProblemFilters';
import ProblemsTable from '@/components/practice/ProblemsTable';
import QuickPractice from '@/components/practice/QuickPractice';
import { useEffect, useMemo, useState } from 'react';
import practiceService from '@/services/practice.service';
import { notify } from '@/utils/notifications';
import type {
  PracticeProblemSummary,
  PracticeProblem,
  PracticeLanguage,
  PracticeSubmission,
} from '@/types/practice';

interface ProblemRow extends PracticeProblemSummary {
  solved?: boolean;
  topic?: string;
}

type LoadingState = {
  list: boolean;
  random: boolean;
  submission: boolean;
};

const DEFAULT_LOADING_STATE: LoadingState = {
  list: false,
  random: false,
  submission: false,
};

export default function PracticePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState<PracticeProblemSummary[]>([]);
  const [stats, setStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState<LoadingState>(DEFAULT_LOADING_STATE);
  const [topics, setTopics] = useState<string[]>([]);
  const [activeProblem, setActiveProblem] = useState<PracticeProblem | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<PracticeSubmission | null>(null);

  // Fetch all available topics once on mount
  useEffect(() => {
    const fetchAllTopics = async () => {
      try {
        const { data } = await practiceService.getAllTags();
        setTopics(data.tags);
      } catch (error) {
        console.error('Failed to load topics', error);
      }
    };

    fetchAllTopics();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProblems = async () => {
      setLoading((prev) => ({ ...prev, list: true }));

      try {
        // First try to get LeetCode problems from dataset
        const { data } = await practiceService.getLeetCodeProblems({
          page: pagination.page,
          limit: 20,
          difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
          search: searchQuery || undefined,
          tags: selectedTopic === 'all' ? undefined : [selectedTopic],
        });

        setProblems(data.problems);
        setPagination({
          page: data.currentPage,
          totalPages: data.totalPages,
          total: data.total,
        });

        // Update stats based on current results
        const easySolved = data.problems.filter((p: PracticeProblemSummary) => p.difficulty === 'Easy').length;
        const mediumSolved = data.problems.filter((p: PracticeProblemSummary) => p.difficulty === 'Medium').length;
        const hardSolved = data.problems.filter((p: PracticeProblemSummary) => p.difficulty === 'Hard').length;
        setStats({
          totalSolved: 0,
          easySolved,
          mediumSolved,
          hardSolved,
        });
      } catch (error) {
        console.error('Failed to load practice problems', error);
        notify.error('Failed to load problems', error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading((prev) => ({ ...prev, list: false }));
      }
    };

    fetchProblems();

    return () => {
      controller.abort();
    };
  }, [selectedDifficulty, selectedTopic, searchQuery, pagination.page]);

  const handleResetFilters = () => {
    setSelectedDifficulty('all');
    setSelectedTopic('all');
    setSearchQuery('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRandomProblem = async (difficulty?: string) => {
    setLoading((prev) => ({ ...prev, random: true }));

    try {
      const { data } = await practiceService.getRandomProblem({
        difficulty,
        source: 'database',
      });

      if ('_id' in data) {
        setActiveProblem(data as PracticeProblem);
      } else {
        // For LeetCode dataset problems, they need to be in DB first
        notify.error('Problem not ready', 'This problem needs to be imported to the database first.');
      }
    } catch (error) {
      console.error('Failed to fetch random problem', error);
      notify.error('Random problem failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading((prev) => ({ ...prev, random: false }));
    }
  };

  const handleSubmitSolution = async (payload: { problemId: string; code: string; language: PracticeLanguage }) => {
    setLoading((prev) => ({ ...prev, submission: true }));

    try {
      const { data, message } = await practiceService.submitPracticeSolution(payload);
      notify.info('Solution submitted', message);
      setActiveSubmission(data);

      if (data.isCorrect) {
        notify.success('Accepted', 'All tests passed!');
      } else if (data.status === 'wrong_answer') {
        notify.error('Wrong Answer', 'Check failing test cases.');
      }
    } catch (error) {
      console.error('Failed to submit solution', error);
      notify.error('Submission failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading((prev) => ({ ...prev, submission: false }));
    }
  };

  const handlePaginationChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const tableProblems: ProblemRow[] = useMemo(() => {
    return problems.map((problem) => ({
      ...problem,
      topic: problem.tags?.[0],
      solved: false,
    }));
  }, [problems]);

  return (
    <>
      <Navbar showAuthButtons={false} />

      <div className="max-w-6xl mx-auto px-6 pt-8">
        <StatsOverview
          totalSolved={stats.totalSolved}
          easySolved={stats.easySolved}
          mediumSolved={stats.mediumSolved}
          hardSolved={stats.hardSolved}
        />

        <ProblemFilters
          selectedDifficulty={selectedDifficulty}
          selectedTopic={selectedTopic}
          searchQuery={searchQuery}
          topics={topics}
          onDifficultyChange={(value) => {
            setSelectedDifficulty(value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          onTopicChange={(value) => {
            setSelectedTopic(value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          onResetFilters={handleResetFilters}
          resultCount={tableProblems.length}
          totalCount={pagination.total}
          isLoading={loading.list}
        />

        <ProblemsTable
          problems={tableProblems.map((problem) => ({
            id: problem._id || problem.leetcodeId || problem.titleSlug || '',
            title: problem.title,
            difficulty: problem.difficulty,
            topic: problem.topic || 'General',
            solved: problem.solved ?? false,
            acceptance: problem.acceptanceRate ? `${problem.acceptanceRate.toFixed(1)}%` : '—',
            likes: problem.points ?? 0,
            slug: problem.titleSlug || problem.leetcodeId || problem._id,
          }))}
          isLoading={loading.list}
        />

        <div className="flex justify-between items-center mt-6 text-purple-200">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="space-x-3">
            <button
              type="button"
              onClick={() => handlePaginationChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1 || loading.list}
              className="px-4 py-2 rounded-lg border border-purple-600/60 bg-black/50 hover:bg-purple-900/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePaginationChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages || loading.list}
              className="px-4 py-2 rounded-lg border border-purple-600/60 bg-black/50 hover:bg-purple-900/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <QuickPractice
        onRandomProblem={handleRandomProblem}
        activeProblem={activeProblem}
        onSubmitSolution={handleSubmitSolution}
        loadingState={loading}
        activeSubmission={activeSubmission}
        problems={problems}
      />

      <Footer />
    </>
  );
}
