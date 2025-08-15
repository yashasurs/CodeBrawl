import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UserInfoCardProps {
  username: string;
  elo: number;
  rank: number;
  joinedDate: string;
  country: string;
  badge: string;
  tier: string;
  wins: number;
  winRate: number;
}

export default function UserInfoCard({ 
  username, 
  elo, 
  rank, 
  joinedDate, 
  country, 
  badge, 
  tier, 
  wins, 
  winRate 
}: UserInfoCardProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Failed to logout:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/40 backdrop-blur-sm border border-purple-600/50 rounded-2xl p-8 mb-8 relative">
      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`absolute top-6 right-6 px-4 py-2 border border-red-500/70 text-red-400 hover:bg-red-600/20 hover:text-red-300 rounded-lg font-medium transition-colors duration-200 text-sm ${
          isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>

      <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 pr-20">
        {/* Avatar and Basic Info */}
        <div className="text-center md:text-left">
          <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center text-6xl mb-4 mx-auto md:mx-0">
            {badge}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{username}</h1>
          <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
            <span className="text-2xl">{country}</span>
            <span className="text-purple-300">{tier}</span>
          </div>
          <p className="text-gray-400">Joined {joinedDate}</p>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">{elo}</div>
            <div className="text-gray-400 text-sm">ELO Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">#{rank}</div>
            <div className="text-gray-400 text-sm">Global Rank</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">{wins}</div>
            <div className="text-gray-400 text-sm">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{winRate}%</div>
            <div className="text-gray-400 text-sm">Win Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
