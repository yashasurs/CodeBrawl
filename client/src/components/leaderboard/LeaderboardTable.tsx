interface Player {
  rank: number;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  streak: number;
  badge: string;
  country: string;
  isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
  players: Player[];
}

export default function LeaderboardTable({ players }: LeaderboardTableProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-600";
    return "text-purple-300";
  };

  const getWinRate = (wins: number, losses: number) => {
    const total = wins + losses;
    return total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-900/30 border-b border-purple-800/30">
            <tr>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Rank</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Player</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">ELO</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Wins</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Losses</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Win Rate</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Streak</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr 
                key={player.rank} 
                className={`border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors ${
                  player.isCurrentUser ? 'bg-purple-900/30 border-purple-600/50' : ''
                }`}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xl font-bold ${getRankColor(player.rank)}`}>
                      #{player.rank}
                    </span>
                    <span className="text-2xl">{player.badge}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{player.country}</span>
                    <span className={`font-medium ${player.isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                      {player.username}
                      {player.isCurrentUser && <span className="text-purple-400 ml-2">(You)</span>}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-white font-bold text-lg">{player.elo}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-green-400 font-semibold">{player.wins}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-red-400 font-semibold">{player.losses}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="text-gray-300">{getWinRate(player.wins, player.losses)}%</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`font-bold ${player.streak > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                    {player.streak > 0 ? `🔥 ${player.streak}` : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
