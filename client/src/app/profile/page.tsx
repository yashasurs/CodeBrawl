"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UserInfoCard from '@/components/profile/UserInfoCard';
import TabNavigation from '@/components/profile/TabNavigation';
import OverviewTab from '@/components/profile/OverviewTab';
import MatchesTab from '@/components/profile/MatchesTab';
import AchievementsTab from '@/components/profile/AchievementsTab';
import StatisticsTab from '@/components/profile/StatisticsTab';
import { useState } from 'react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const userData = {
    username: "CodeWarrior",
    elo: 1456,
    rank: 11,
    joinedDate: "March 2024",
    country: "🇺🇸",
    badge: "⚡",
    tier: "Specialist",
    wins: 32,
    losses: 24,
    totalBattles: 56,
    winRate: 57.1,
    currentStreak: 0,
    longestStreak: 7,
    totalProblemsSolved: 127,
    favoriteLanguage: "JavaScript"
  };

  const recentMatches = [
    { id: 1, opponent: "AlgoNinja", result: "Loss", eloChange: -15, date: "2 hours ago", problem: "Binary Tree Traversal" },
    { id: 2, opponent: "CodeMaster", result: "Win", eloChange: +18, date: "1 day ago", problem: "Two Sum Variant" },
    { id: 3, opponent: "ByteWarrior", result: "Win", eloChange: +16, date: "2 days ago", problem: "Maximum Subarray" },
    { id: 4, opponent: "DevGuru", result: "Loss", eloChange: -14, date: "3 days ago", problem: "Longest Palindrome" },
    { id: 5, opponent: "JSWizard", result: "Win", eloChange: +17, date: "4 days ago", problem: "Merge Intervals" }
  ];

  const achievements = [
    { id: 1, title: "First Victory", description: "Win your first battle", icon: "🏆", unlocked: true },
    { id: 2, title: "Speed Demon", description: "Solve a problem in under 5 minutes", icon: "⚡", unlocked: true },
    { id: 3, title: "Streak Master", description: "Win 5 battles in a row", icon: "🔥", unlocked: true },
    { id: 4, title: "Problem Solver", description: "Solve 100 practice problems", icon: "🧩", unlocked: true },
    { id: 5, title: "Giant Slayer", description: "Defeat someone 200+ ELO higher", icon: "⚔️", unlocked: false },
    { id: 6, title: "Perfectionist", description: "Win 10 battles without any wrong submissions", icon: "💎", unlocked: false }
  ];

  const solvingStats = {
    easy: { solved: 45, total: 60, percentage: 75 },
    medium: { solved: 52, total: 80, percentage: 65 },
    hard: { solved: 30, total: 70, percentage: 43 }
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
