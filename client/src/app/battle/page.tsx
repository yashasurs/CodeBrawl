"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QueueSection from '@/components/battle/QueueSection';
import LiveBattles from '@/components/battle/LiveBattles';
import RecentResults from '@/components/battle/RecentResults';
import { useState, useEffect } from 'react';

export default function BattlePage() {
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [activeMatches, setActiveMatches] = useState([
    { id: 1, player1: "CodeMaster", player2: "AlgoNinja", rating1: 1547, rating2: 1523, timeLeft: "08:45" },
    { id: 2, player1: "ByteWarrior", player2: "StackOverflow", rating1: 1823, rating2: 1798, timeLeft: "12:20" },
    { id: 3, player1: "DevGuru", player2: "CodingBeast", rating1: 1234, rating2: 1289, timeLeft: "05:15" },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInQueue) {
      interval = setInterval(() => {
        setQueueTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInQueue]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleJoinQueue = () => {
    setIsInQueue(true);
    setQueueTime(0);
  };

  const handleLeaveQueue = () => {
    setIsInQueue(false);
    setQueueTime(0);
  };

  return (
    <>
      <Navbar showAuthButtons={false} />

      <QueueSection
        isInQueue={isInQueue}
        queueTime={queueTime}
        onJoinQueue={handleJoinQueue}
        onLeaveQueue={handleLeaveQueue}
        formatTime={formatTime}
      />

      <LiveBattles matches={activeMatches} />

      <RecentResults />

      {/* Practice Mode CTA */}
      <div className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
            Want to Practice First?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Sharpen your skills in practice mode before jumping into competitive battles
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/practice" 
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Practice Mode
            </Link>
            <Link 
              href="/leaderboard" 
              className="px-10 py-4 border-2 border-purple-600 text-purple-300 hover:bg-purple-600/20 hover:text-white rounded-lg font-bold text-xl transition-all duration-300"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}