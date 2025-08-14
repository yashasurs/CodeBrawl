interface ProblemFiltersProps {
  selectedDifficulty: string;
  selectedTopic: string;
  searchQuery: string;
  onDifficultyChange: (difficulty: string) => void;
  onTopicChange: (topic: string) => void;
  onSearchChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function ProblemFilters({ 
  selectedDifficulty, 
  selectedTopic, 
  searchQuery,
  onDifficultyChange, 
  onTopicChange, 
  onSearchChange,
  resultCount, 
  totalCount 
}: ProblemFiltersProps) {
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
            className="w-full pl-10 pr-4 py-3 bg-black/60 border border-purple-600/70 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-purple-300 font-semibold">Filter by:</span>
          
          <select 
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="bg-black/60 border border-purple-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select 
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="bg-black/60 border border-purple-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Topics</option>
            <option value="Arrays">Arrays</option>
            <option value="Trees">Trees</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="Linked Lists">Linked Lists</option>
            <option value="Strings">Strings</option>
            <option value="Binary Search">Binary Search</option>
          </select>
        </div>

        <div className="text-gray-400">
          Showing {resultCount} of {totalCount} problems
        </div>
      </div>
    </div>
  );
}
