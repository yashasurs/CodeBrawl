interface Problem {
  id: number;
  title: string;
  difficulty: string;
  topic: string;
  solved: boolean;
  acceptance: string;
  likes: number;
}

interface ProblemsTableProps {
  problems: Problem[];
}

export default function ProblemsTable({ problems }: ProblemsTableProps) {
  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-900/30 border-b border-purple-800/30">
            <tr>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Status</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Title</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Difficulty</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Topic</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Acceptance</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Likes</th>
              <th className="text-left py-4 px-6 text-purple-300 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id} className="border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors">
                <td className="py-4 px-6">
                  {problem.solved ? (
                    <span className="text-green-400 text-xl">✓</span>
                  ) : (
                    <span className="text-gray-500 text-xl">○</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span className="text-white font-medium hover:text-purple-300 cursor-pointer">
                    {problem.title}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`font-semibold ${
                    problem.difficulty === 'Easy' ? 'text-green-400' :
                    problem.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-400">{problem.topic}</td>
                <td className="py-4 px-6 text-gray-400">{problem.acceptance}</td>
                <td className="py-4 px-6 text-gray-400">{problem.likes}</td>
                <td className="py-4 px-6">
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-bold text-sm transition-all duration-300 transform hover:scale-105">
                    Solve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
