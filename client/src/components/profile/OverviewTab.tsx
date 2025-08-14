interface OverviewTabProps {
  totalBattles: number;
  currentStreak: number;
  longestStreak: number;
  totalProblemsSolved: number;
  favoriteLanguage: string;
}

export default function OverviewTab({ 
  totalBattles, 
  currentStreak, 
  longestStreak, 
  totalProblemsSolved, 
  favoriteLanguage 
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-300 mb-4">Battle Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Battles:</span>
              <span className="text-white font-semibold">{totalBattles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Streak:</span>
              <span className="text-white font-semibold">{currentStreak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Longest Streak:</span>
              <span className="text-white font-semibold">{longestStreak}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-300 mb-4">Practice Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Problems Solved:</span>
              <span className="text-white font-semibold">{totalProblemsSolved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Favorite Language:</span>
              <span className="text-white font-semibold">{favoriteLanguage}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-300 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Last battle: 2 hours ago</div>
            <div className="text-sm text-gray-400">Practice session: Yesterday</div>
            <div className="text-sm text-gray-400">Achievement unlocked: 3 days ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}
