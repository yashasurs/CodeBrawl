"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatsOverview from '@/components/practice/StatsOverview';
import ProblemFilters from '@/components/practice/ProblemFilters';
import ProblemsTable from '@/components/practice/ProblemsTable';
import QuickPractice from '@/components/practice/QuickPractice';
import { useState } from 'react';

export default function PracticePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const problems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      topic: "Arrays",
      solved: true,
      acceptance: "49.2%",
      likes: 1247
    },
    {
      id: 2,
      title: "Binary Tree Inorder Traversal",
      difficulty: "Easy",
      topic: "Trees",
      solved: false,
      acceptance: "74.1%",
      likes: 892
    },
    {
      id: 3,
      title: "Maximum Subarray",
      difficulty: "Medium",
      topic: "Dynamic Programming",
      solved: true,
      acceptance: "53.8%",
      likes: 2156
    },
    {
      id: 4,
      title: "Merge Two Sorted Lists",
      difficulty: "Easy",
      topic: "Linked Lists",
      solved: false,
      acceptance: "62.4%",
      likes: 756
    },
    {
      id: 5,
      title: "Longest Palindromic Substring",
      difficulty: "Medium",
      topic: "Strings",
      solved: false,
      acceptance: "32.7%",
      likes: 1834
    },
    {
      id: 6,
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      topic: "Binary Search",
      solved: false,
      acceptance: "36.9%",
      likes: 3421
    }
  ];

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = selectedDifficulty === 'all' || problem.difficulty.toLowerCase() === selectedDifficulty;
    const topicMatch = selectedTopic === 'all' || problem.topic === selectedTopic;
    const searchMatch = searchQuery === '' || problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    return difficultyMatch && topicMatch && searchMatch;
  });

  const stats = {
    totalSolved: problems.filter(p => p.solved).length,
    totalProblems: problems.length,
    easySolved: problems.filter(p => p.solved && p.difficulty === 'Easy').length,
    mediumSolved: problems.filter(p => p.solved && p.difficulty === 'Medium').length,
    hardSolved: problems.filter(p => p.solved && p.difficulty === 'Hard').length
  };

  return (
    <>
      <Navbar showAuthButtons={false} />

      <div className="max-w-6xl mx-auto px-6 pt-8">
        <StatsOverview
          totalSolved={stats.totalSolved}
          easySolved={stats.easySolved}
          mediumSolved={stats.mediumSolved}
          hardSolved={stats.hardSolved}
        />

        <ProblemFilters
          selectedDifficulty={selectedDifficulty}
          selectedTopic={selectedTopic}
          searchQuery={searchQuery}
          onDifficultyChange={setSelectedDifficulty}
          onTopicChange={setSelectedTopic}
          onSearchChange={setSearchQuery}
          resultCount={filteredProblems.length}
          totalCount={problems.length}
        />

        <ProblemsTable problems={filteredProblems} />
      </div>

      <QuickPractice />

      <Footer />
    </>
  );
}
