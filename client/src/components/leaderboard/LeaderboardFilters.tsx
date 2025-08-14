interface LeaderboardFiltersProps {
  timeFilter: string;
  onTimeFilterChange: (filter: string) => void;
}

export default function LeaderboardFilters({ timeFilter, onTimeFilterChange }: LeaderboardFiltersProps) {
  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-purple-300 font-semibold">Time Period:</span>
          
          <select 
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            className="bg-black/60 border border-purple-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Time</option>
            <option value="monthly">This Month</option>
            <option value="weekly">This Week</option>
            <option value="daily">Today</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-purple-600/30 text-purple-300 rounded-lg font-medium">
            Global
          </button>
          <button className="px-4 py-2 text-gray-400 hover:text-white rounded-lg font-medium transition-colors">
            Friends
          </button>
          <button className="px-4 py-2 text-gray-400 hover:text-white rounded-lg font-medium transition-colors">
            Regional
          </button>
        </div>
      </div>
    </div>
  );
}
