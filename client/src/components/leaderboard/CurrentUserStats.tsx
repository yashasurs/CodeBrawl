interface CurrentUserStatsProps {
  rank: number;
  elo: number;
  wins: number;
  losses: number;
  badge: string;
}

export default function CurrentUserStats({ rank, elo, wins, losses, badge }: CurrentUserStatsProps) {
  const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/40 backdrop-blur-sm border border-purple-600/50 rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-6 mb-4 md:mb-0">
          <div className="text-6xl">{badge}</div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Your Rank: #{rank}</h3>
            <p className="text-purple-300">ELO Rating: {elo}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{wins}</div>
            <div className="text-gray-400 text-sm">Wins</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{losses}</div>
            <div className="text-gray-400 text-sm">Losses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{winRate}%</div>
            <div className="text-gray-400 text-sm">Win Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
