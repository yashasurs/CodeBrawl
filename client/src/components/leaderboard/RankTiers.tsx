export default function RankTiers() {
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
        Rank Tiers
      </h2>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-black/40 backdrop-blur-sm border border-yellow-800/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2 text-yellow-300">Grandmaster</h3>
          <p className="text-gray-400 text-sm mb-2">2000+ ELO</p>
          <p className="text-yellow-400 font-semibold">Top 1%</p>
        </div>

        <div className="bg-black/40 backdrop-blur-sm border border-gray-800/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">💎</div>
          <h3 className="text-xl font-bold mb-2 text-gray-300">Master</h3>
          <p className="text-gray-400 text-sm mb-2">1700-1999 ELO</p>
          <p className="text-gray-300 font-semibold">Top 5%</p>
        </div>

        <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">⭐</div>
          <h3 className="text-xl font-bold mb-2 text-purple-300">Expert</h3>
          <p className="text-gray-400 text-sm mb-2">1400-1699 ELO</p>
          <p className="text-purple-300 font-semibold">Top 20%</p>
        </div>

        <div className="bg-black/40 backdrop-blur-sm border border-blue-800/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold mb-2 text-blue-300">Specialist</h3>
          <p className="text-gray-400 text-sm mb-2">1000-1399 ELO</p>
          <p className="text-blue-300 font-semibold">Everyone Else</p>
        </div>
      </div>
    </div>
  );
}
