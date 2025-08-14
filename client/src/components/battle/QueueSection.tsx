interface QueueSectionProps {
  isInQueue: boolean;
  queueTime: number;
  onJoinQueue: () => void;
  onLeaveQueue: () => void;
  formatTime: (seconds: number) => string;
}

export default function QueueSection({ 
  isInQueue, 
  queueTime, 
  onJoinQueue, 
  onLeaveQueue, 
  formatTime 
}: QueueSectionProps) {
  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
            ELO Matchmaking Queue
          </h2>
          
          {!isInQueue ? (
            <div className="text-center space-y-6">
              <div className="mb-8">
                <button 
                  onClick={onJoinQueue}
                  className="px-12 py-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Join Queue
                </button>
              </div>
              
              <p className="text-gray-400">
                You'll be matched with players of similar ELO rating for a fair and competitive battle
              </p>
              
              <div className="bg-black/20 rounded-lg p-4 mt-6">
                <p className="text-purple-300 font-semibold">Your Current ELO: <span className="text-white">1456</span></p>
                <p className="text-gray-400 text-sm mt-1">Looking for opponents: 1350 - 1550 ELO range</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="text-xl text-purple-300">Searching for opponent...</span>
              </div>
              
              <div className="text-3xl font-bold text-white mb-4">
                {formatTime(queueTime)}
              </div>
              
              <div className="bg-black/20 rounded-lg p-4 mb-6">
                <p className="text-purple-300 font-semibold">Your ELO: <span className="text-white">1456</span></p>
                <p className="text-gray-400 text-sm mt-1">Searching in range: 1350 - 1550</p>
              </div>
              
              <button 
                onClick={onLeaveQueue}
                className="px-8 py-3 border-2 border-red-600 text-red-400 hover:bg-red-600/20 hover:text-red-300 rounded-lg font-bold transition-all duration-300"
              >
                Leave Queue
              </button>
            </div>
          )}
        </div>

        {/* Queue Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">54</div>
            <div className="text-gray-400">Players in Queue</div>
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">12</div>
            <div className="text-gray-400">Active Battles</div>
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">2:34</div>
            <div className="text-gray-400">Avg Queue Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
