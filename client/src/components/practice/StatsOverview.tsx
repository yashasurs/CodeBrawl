interface StatsOverviewProps {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export default function StatsOverview({ totalSolved, easySolved, mediumSolved, hardSolved }: StatsOverviewProps) {
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-12">
      <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 text-center">
        <div className="text-3xl font-bold text-purple-400 mb-2">{totalSolved}</div>
        <div className="text-gray-400">Problems Solved</div>
      </div>
      <div className="bg-black/40 backdrop-blur-sm border border-green-800/30 rounded-xl p-6 text-center">
        <div className="text-3xl font-bold text-green-400 mb-2">{easySolved}</div>
        <div className="text-gray-400">Easy Solved</div>
      </div>
      <div className="bg-black/40 backdrop-blur-sm border border-yellow-800/30 rounded-xl p-6 text-center">
        <div className="text-3xl font-bold text-yellow-400 mb-2">{mediumSolved}</div>
        <div className="text-gray-400">Medium Solved</div>
      </div>
      <div className="bg-black/40 backdrop-blur-sm border border-red-800/30 rounded-xl p-6 text-center">
        <div className="text-3xl font-bold text-red-400 mb-2">{hardSolved}</div>
        <div className="text-gray-400">Hard Solved</div>
      </div>
    </div>
  );
}
