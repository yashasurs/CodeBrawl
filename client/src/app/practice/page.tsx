"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatsOverview from '@/components/practice/StatsOverview';
import ProblemFilters from '@/components/practice/ProblemFilters';
import ProblemsTable from '@/components/practice/ProblemsTable';
import { useEffect, useMemo, useState } from 'react';
import practiceService from '@/services/practice.service';
import { notify } from '@/utils/notifications';
import type {
  PracticeProblemSummary,
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
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'acceptance'>('title');
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
    setSortBy('title');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePaginationChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const tableProblems: ProblemRow[] = useMemo(() => {
    let sortedProblems = problems.map((problem) => ({
      ...problem,
      topic: problem.tags?.[0],
      solved: false,
    }));

    // Filter by search query (client-side for better UX)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sortedProblems = sortedProblems.filter((problem) => {
        const titleMatch = problem.title.toLowerCase().includes(query);
        const topicMatch = problem.topic?.toLowerCase().includes(query);
        const tagsMatch = problem.tags?.some(tag => tag.toLowerCase().includes(query));
        return titleMatch || topicMatch || tagsMatch;
      });
    }

    // Sort by selected criteria
    sortedProblems.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'difficulty') {
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      } else if (sortBy === 'acceptance') {
        const aRate = a.acceptanceRate || 0;
        const bRate = b.acceptanceRate || 0;
        return bRate - aRate; // Descending order
      }
      return 0;
    });

    return sortedProblems;
  }, [problems, sortBy, searchQuery]);

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

        {/* Sort Options */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-purple-300 font-semibold text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'difficulty' | 'acceptance')}
              disabled={loading.list}
              className="bg-black/60 border border-purple-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="title">Title (A-Z)</option>
              <option value="difficulty">Difficulty</option>
              <option value="acceptance">Acceptance Rate</option>
            </select>
          </div>
          <div className="text-sm text-gray-400">
            {tableProblems.length} {tableProblems.length === 1 ? 'problem' : 'problems'} displayed
          </div>
        </div>

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

      <Footer />
    </>
  );
}
