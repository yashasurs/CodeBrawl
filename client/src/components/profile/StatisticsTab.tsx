interface SolvingStats {
  easy: { solved: number; total: number; percentage: number };
  medium: { solved: number; total: number; percentage: number };
  hard: { solved: number; total: number; percentage: number };
}

interface StatisticsTabProps {
  solvingStats: SolvingStats;
}

export default function StatisticsTab({ solvingStats }: StatisticsTabProps) {
  return (
    <div className="space-y-8">
      <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-purple-300 mb-6">Problem Solving Statistics</h3>
        
        <div className="space-y-6">
          {Object.entries(solvingStats).map(([difficulty, stats]) => (
            <div key={difficulty}>
              <div className="flex justify-between items-center mb-2">
                <span className={`font-semibold capitalize ${
                  difficulty === 'easy' ? 'text-green-400' :
                  difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {difficulty}
                </span>
                <span className="text-gray-400">
                  {stats.solved}/{stats.total} ({stats.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    difficulty === 'easy' ? 'bg-green-400' :
                    difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${stats.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-300 mb-4">Battle Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Average Battle Duration:</span>
              <span className="text-white">12:34</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fastest Solve:</span>
              <span className="text-white">3:42</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Preferred Time:</span>
              <span className="text-white">Evening</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-300 mb-4">Language Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">JavaScript:</span>
              <span className="text-white">45%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Python:</span>
              <span className="text-white">30%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Java:</span>
              <span className="text-white">25%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
