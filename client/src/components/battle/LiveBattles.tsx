interface Match {
  id: number;
  player1: string;
  player2: string;
  rating1: number;
  rating2: number;
  timeLeft: string;
}

interface LiveBattlesProps {
  matches: Match[];
}

export default function LiveBattles({ matches }: LiveBattlesProps) {
  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
          Live Battles
        </h2>
        
        <div className="grid gap-6">
          {matches.map((match) => (
            <div key={match.id} className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 hover:bg-purple-900/20 transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-8 mb-4 md:mb-0">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-300">{match.player1}</div>
                    <div className="text-sm text-gray-400">ELO: {match.rating1}</div>
                  </div>
                  
                  <div className="text-2xl text-purple-400">⚔️</div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-300">{match.player2}</div>
                    <div className="text-sm text-gray-400">ELO: {match.rating2}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">ELO Difference</div>
                    <div className="font-bold text-white">
                      {Math.abs(match.rating1 - match.rating2)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Time Left</div>
                    <div className="font-bold text-white">{match.timeLeft}</div>
                  </div>
                  
                  <button className="px-4 py-2 border-2 border-purple-600 text-purple-300 hover:bg-purple-600/20 hover:text-white rounded-lg font-bold transition-all duration-300">
                    Spectate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
