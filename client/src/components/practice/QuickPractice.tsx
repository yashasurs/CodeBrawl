export default function QuickPractice() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
          Quick Practice
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-black/40 backdrop-blur-sm border border-green-800/30 rounded-xl p-6 text-center hover:bg-green-900/20 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">🟢</div>
            <h3 className="text-xl font-bold mb-3 text-green-300">Easy Challenge</h3>
            <p className="text-gray-400 mb-4">Start with fundamental problems to build confidence</p>
            <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg font-bold transition-all duration-300">
              Start Easy
            </button>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-yellow-800/30 rounded-xl p-6 text-center hover:bg-yellow-900/20 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">🟡</div>
            <h3 className="text-xl font-bold mb-3 text-yellow-300">Medium Challenge</h3>
            <p className="text-gray-400 mb-4">Take on intermediate problems for steady growth</p>
            <button className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 rounded-lg font-bold transition-all duration-300">
              Start Medium
            </button>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-red-800/30 rounded-xl p-6 text-center hover:bg-red-900/20 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">🔴</div>
            <h3 className="text-xl font-bold mb-3 text-red-300">Hard Challenge</h3>
            <p className="text-gray-400 mb-4">Push your limits with advanced algorithms</p>
            <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg font-bold transition-all duration-300">
              Start Hard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
