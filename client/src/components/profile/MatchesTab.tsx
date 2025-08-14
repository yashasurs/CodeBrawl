interface Match {
  id: number;
  opponent: string;
  result: string;
  eloChange: number;
  date: string;
  problem: string;
}

interface MatchesTabProps {
  matches: Match[];
}

export default function MatchesTab({ matches }: MatchesTabProps) {
  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-purple-800/30">
        <h3 className="text-2xl font-bold text-purple-300">Recent Battle History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-900/30 border-b border-purple-800/30">
            <tr>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Result</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Opponent</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Problem</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">ELO Change</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} className="border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors">
                <td className="py-4 px-6">
                  <span className={`font-bold ${match.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>
                    {match.result}
                  </span>
                </td>
                <td className="py-4 px-6 text-white">{match.opponent}</td>
                <td className="py-4 px-6 text-gray-400">{match.problem}</td>
                <td className="py-4 px-6">
                  <span className={`font-bold ${match.eloChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {match.eloChange > 0 ? '+' : ''}{match.eloChange}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-400">{match.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
