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
        <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-8 mb-8">
          
          {!isInQueue ? (
            <div className="text-center space-y-6">
              <div className="mb-8">
                <button 
                  onClick={onJoinQueue}
                  className="px-12 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-bold text-xl transition-colors duration-200 text-white shadow-lg"
                >
                  ⚡ Join Queue
                </button>
              </div>
              
              <p className="text-gray-400 max-w-xl mx-auto">
                Get matched with skilled opponents for competitive coding battles
              </p>
              
              <div className="bg-black/20 rounded-xl p-6 mt-6 border border-purple-700/30">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-xl mb-1">★</div>
                    <p className="text-purple-300 font-medium">Skill Level</p>
                    <p className="text-white font-semibold">Intermediate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl mb-1">⌕</div>
                    <p className="text-purple-300 font-medium">Match Type</p>
                    <p className="text-gray-400">Fair Matchmaking</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500/30 border-t-purple-500"></div>
                <span className="text-xl text-purple-300">Searching for opponent...</span>
              </div>
              
              <div className="text-4xl font-bold text-white mb-4 font-mono">
                {formatTime(queueTime)}
              </div>
              
              <div className="bg-black/20 rounded-xl p-4 mb-6 border border-purple-700/30">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-xl mb-1">⚡</div>
                    <p className="text-purple-300 font-medium">Mode</p>
                    <p className="text-white">Competitive</p>
                  </div>
                  <div className="w-px h-8 bg-purple-600/50"></div>
                  <div className="text-center">
                    <div className="text-xl mb-1">⌕</div>
                    <p className="text-purple-300 font-medium">Status</p>
                    <p className="text-yellow-400 animate-pulse">Searching...</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onLeaveQueue}
                className="px-8 py-3 border border-red-500/70 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg font-medium transition-colors duration-200"
              >
                × Leave Queue
              </button>
            </div>
          )}
        </div>

        {/* Queue Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 text-center hover:bg-black/50 transition-colors duration-200">
            <div className="text-3xl font-bold text-purple-400 mb-2">54</div>
            <div className="text-gray-400">Players in Queue</div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm border border-green-800/30 rounded-xl p-6 text-center hover:bg-black/50 transition-colors duration-200">
            <div className="text-3xl font-bold text-green-400 mb-2">12</div>
            <div className="text-gray-400">Active Battles</div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 text-center hover:bg-black/50 transition-colors duration-200">
            <div className="text-3xl font-bold text-blue-400 mb-2">2:34</div>
            <div className="text-gray-400">Avg Queue Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
