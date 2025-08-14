interface ProblemFiltersProps {
  selectedDifficulty: string;
  selectedTopic: string;
  onDifficultyChange: (difficulty: string) => void;
  onTopicChange: (topic: string) => void;
  resultCount: number;
  totalCount: number;
}

export default function ProblemFilters({ 
  selectedDifficulty, 
  selectedTopic, 
  onDifficultyChange, 
  onTopicChange, 
  resultCount, 
  totalCount 
}: ProblemFiltersProps) {
  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 mb-8">
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
