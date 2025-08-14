interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface AchievementsTabProps {
  achievements: Achievement[];
}

export default function AchievementsTab({ achievements }: AchievementsTabProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {achievements.map((achievement) => (
        <div 
          key={achievement.id} 
          className={`bg-black/40 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 ${
            achievement.unlocked 
              ? 'border-purple-800/30 hover:bg-purple-900/20' 
              : 'border-gray-800/30 opacity-60'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{achievement.icon}</div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-1 ${
                achievement.unlocked ? 'text-purple-300' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h3>
              <p className="text-gray-400 text-sm">{achievement.description}</p>
            </div>
            {achievement.unlocked && (
              <div className="text-green-400 text-xl">✓</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
