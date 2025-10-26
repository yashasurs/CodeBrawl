interface ProblemFiltersProps {
  selectedDifficulty: string;
  selectedTopic: string;
  searchQuery: string;
  topics: string[];
  onDifficultyChange: (difficulty: string) => void;
  onTopicChange: (topic: string) => void;
  onSearchChange: (query: string) => void;
  onResetFilters?: () => void;
  resultCount: number;
  totalCount: number;
  isLoading?: boolean;
}

export default function ProblemFilters({
  selectedDifficulty,
  selectedTopic,
  searchQuery,
  topics,
  onDifficultyChange,
  onTopicChange,
  onSearchChange,
  onResetFilters,
  resultCount,
  totalCount,
  isLoading = false,
}: ProblemFiltersProps) {
  const disabled = isLoading;

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 mb-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search problems by title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-3 bg-black/60 border border-purple-600/70 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-purple-300 font-semibold">Filter by:</span>
          
          <select 
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            disabled={disabled}
            className="bg-black/60 border border-purple-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select 
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            disabled={disabled}
            className="bg-black/60 border border-purple-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Topics</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <span>
            Showing {resultCount} of {totalCount} problems
          </span>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              disabled={disabled}
              className="px-3 py-2 text-sm font-semibold text-purple-300 border border-purple-600/60 rounded-lg bg-black/40 hover:bg-purple-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
