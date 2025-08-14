"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import CurrentUserStats from '@/components/leaderboard/CurrentUserStats';
import LeaderboardFilters from '@/components/leaderboard/LeaderboardFilters';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import RankTiers from '@/components/leaderboard/RankTiers';
import { useState } from 'react';

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState('all');

  const leaderboardData = [
    {
      rank: 1,
      username: "CodeMaster",
      elo: 2156,
      wins: 89,
      losses: 23,
      streak: 8,
      badge: "🏆",
      country: "🇺🇸"
    },
    {
      rank: 2,
      username: "AlgoNinja",
      elo: 2098,
      wins: 76,
      losses: 31,
      streak: 3,
      badge: "🥈",
      country: "🇯🇵"
    },
    {
      rank: 3,
      username: "ByteWarrior",
      elo: 2034,
      wins: 82,
      losses: 38,
      streak: 5,
      badge: "🥉",
      country: "🇩🇪"
    },
    {
      rank: 4,
      username: "StackOverflow",
      elo: 1987,
      wins: 65,
      losses: 29,
      streak: 2,
      badge: "⭐",
      country: "🇮🇳"
    },
    {
      rank: 5,
      username: "DevGuru",
      elo: 1923,
      wins: 71,
      losses: 41,
      streak: 1,
      badge: "⭐",
      country: "🇨🇦"
    },
    {
      rank: 6,
      username: "CodingBeast",
      elo: 1876,
      wins: 58,
      losses: 34,
      streak: 4,
      badge: "💎",
      country: "🇬🇧"
    },
    {
      rank: 7,
      username: "PyDragon",
      elo: 1834,
      wins: 63,
      losses: 37,
      streak: 0,
      badge: "💎",
      country: "🇫🇷"
    },
    {
      rank: 8,
      username: "JavaJedi",
      elo: 1798,
      wins: 54,
      losses: 32,
      streak: 6,
      badge: "💎",
      country: "🇰🇷"
    },
    {
      rank: 9,
      username: "JSWizard",
      elo: 1756,
      wins: 49,
      losses: 28,
      streak: 2,
      badge: "🔥",
      country: "🇧🇷"
    },
    {
      rank: 10,
      username: "CppChampion",
      elo: 1712,
      wins: 47,
      losses: 33,
      streak: 1,
      badge: "🔥",
      country: "🇷🇺"
    },
    {
      rank: 11,
      username: "You",
      elo: 1456,
      wins: 32,
      losses: 24,
      streak: 0,
      badge: "⚡",
      country: "🇺🇸",
      isCurrentUser: true
    }
  ];

  return (
    <>
      <Navbar showAuthButtons={false} />

      <PageHeader
        title="Global Leaderboard"
        description="Compete with the best coders around the world. Climb the ranks and establish your coding supremacy."
      />

      <div className="max-w-6xl mx-auto px-6">
        <CurrentUserStats
          rank={11}
          elo={1456}
          wins={32}
          losses={24}
          badge="⚡"
        />

        <LeaderboardFilters
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
        />

        <LeaderboardTable players={leaderboardData} />

        <RankTiers />
      </div>

      <Footer />
    </>
  );
}
