export default function RecentResults() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
          Recent Battle Results
        </h2>
        
        <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-purple-800/30">
              <div className="flex items-center space-x-4">
                <span className="text-green-400 font-bold">W</span>
                <span className="text-white">CodeMaster</span>
                <span className="text-gray-400">defeated</span>
                <span className="text-white">ByteWarrior</span>
              </div>
              <div className="text-gray-400 text-sm">2 minutes ago</div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-purple-800/30">
              <div className="flex items-center space-x-4">
                <span className="text-green-400 font-bold">W</span>
                <span className="text-white">AlgoNinja</span>
                <span className="text-gray-400">defeated</span>
                <span className="text-white">StackOverflow</span>
              </div>
              <div className="text-gray-400 text-sm">5 minutes ago</div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-purple-800/30">
              <div className="flex items-center space-x-4">
                <span className="text-green-400 font-bold">W</span>
                <span className="text-white">DevGuru</span>
                <span className="text-gray-400">defeated</span>
                <span className="text-white">CodingBeast</span>
              </div>
              <div className="text-gray-400 text-sm">8 minutes ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
