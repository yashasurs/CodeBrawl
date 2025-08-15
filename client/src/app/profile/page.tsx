"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UserInfoCard from '@/components/profile/UserInfoCard';
import TabNavigation from '@/components/profile/TabNavigation';
import OverviewTab from '@/components/profile/OverviewTab';
import MatchesTab from '@/components/profile/MatchesTab';
import AchievementsTab from '@/components/profile/AchievementsTab';
import StatisticsTab from '@/components/profile/StatisticsTab';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { user, loading, getDetailedProfile } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch detailed profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user && !loading) {
        try {
          setProfileLoading(true);
          const detailedData = await getDetailedProfile();
          setProfileData(detailedData);
        } catch (error) {
          console.error('Error fetching profile data:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [user, loading, getDetailedProfile]);

  // Show loading while checking authentication or fetching profile
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user || !profileData) {
    return null;
  }

  // Use real profile data from backend
  const userData = {
    username: profileData.username,
    elo: profileData.eloRating,
    rank: profileData.globalRank || 1,
    joinedDate: new Date(profileData.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }),
    country: profileData.country || "🌍",
    badge: getBadgeForTier(profileData.tier),
    tier: profileData.tier || "Novice",
    wins: profileData.wins,
    losses: profileData.losses,
    totalBattles: profileData.totalMatches,
    winRate: profileData.winRate,
    currentStreak: profileData.winStreak || 0,
    longestStreak: profileData.longestWinStreak || 0,
    totalProblemsSolved: profileData.practiceProblemsSolved || 0,
    favoriteLanguage: profileData.favoriteLanguage || profileData.preferredLanguage || "C++"
  };

  // Helper function to get badge emoji based on tier
  function getBadgeForTier(tier: string): string {
    switch (tier) {
      case 'Novice': return '🌱';
      case 'Apprentice': return '⚡';
      case 'Specialist': return '🔥';
      case 'Expert': return '💎';
      case 'Master': return '👑';
      case 'Grandmaster': return '🏆';
      default: return '⚡';
    }
  }

  // Use real match data from backend
  const recentMatches = profileData.recentMatches.map((match: any) => ({
    id: match.id,
    opponent: match.opponent,
    result: match.result,
    eloChange: match.eloChange,
    date: new Date(match.date).toLocaleDateString(),
    problem: match.problem
  }));

  // Use real achievements from backend
  const achievements = profileData.achievements;

  // Use real practice stats from backend
  const solvingStats = profileData.practiceStats || {
    easy: { solved: 0, total: 60, percentage: 0 },
    medium: { solved: 0, total: 80, percentage: 0 },
    hard: { solved: 0, total: 70, percentage: 0 }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            totalBattles={userData.totalBattles}
            currentStreak={userData.currentStreak}
            longestStreak={userData.longestStreak}
            totalProblemsSolved={userData.totalProblemsSolved}
            favoriteLanguage={userData.favoriteLanguage}
          />
        );
      case 'matches':
        return <MatchesTab matches={recentMatches} />;
      case 'achievements':
        return <AchievementsTab achievements={achievements} />;
      case 'statistics':
        return <StatisticsTab solvingStats={solvingStats} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar showAuthButtons={false} />

      <div className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <UserInfoCard
            username={userData.username}
            elo={userData.elo}
            rank={userData.rank}
            joinedDate={userData.joinedDate}
            country={userData.country}
            badge={userData.badge}
            tier={userData.tier}
            wins={userData.wins}
            winRate={userData.winRate}
          />

          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {renderTabContent()}
        </div>
      </div>

      <Footer />
    </>
  );
}
