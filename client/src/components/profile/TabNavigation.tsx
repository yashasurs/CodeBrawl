interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'matches', label: 'Recent Matches' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'statistics', label: 'Statistics' }
  ];

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl mb-8">
      <div className="flex overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-900/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
