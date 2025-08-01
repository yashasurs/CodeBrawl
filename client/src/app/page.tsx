"use client";
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="mb-8">
          <Image 
            src="/logo.svg" 
            alt="CodeBrawl Logo" 
            width={120} 
            height={120}
            className="mx-auto drop-shadow-2xl animate-pulse"
          />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-white to-purple-400 bg-clip-text text-transparent">
          CodeBrawl
        </h1>
        
        <p className="text-xl md:text-2xl text-purple-200 mb-4 max-w-3xl">
          Real-Time Multiplayer Coding Duels
        </p>
        
        <p className="text-lg text-gray-300 mb-12 max-w-2xl">
          Challenge developers worldwide in live 1v1 coding battles. Test your skills, climb the leaderboards, and prove you're the ultimate code warrior.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link 
            href="/signup" 
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            Start Dueling Now
          </Link>
          <Link 
            href="/login" 
            className="px-8 py-4 border-2 border-purple-600 text-purple-300 hover:bg-purple-600/20 hover:text-white rounded-lg font-bold text-lg transition-all duration-300"
          >
            Join Existing Battle
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 hover:bg-purple-900/20 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-3 text-purple-300">Real-Time Battles</h3>
            <p className="text-gray-400">
              Live 1v1 coding duels with instant synchronization. Watch your opponent code in real-time using WebSocket technology.
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 hover:bg-purple-900/20 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-3 text-purple-300">Competitive Rankings</h3>
            <p className="text-gray-400">
              Climb the global leaderboards, track your wins/losses, and establish your reputation as a coding champion.
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6 hover:bg-purple-900/20 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-bold mb-3 text-purple-300">Professional Tools</h3>
            <p className="text-gray-400">
              Code with Monaco Editor (VS Code engine) and get instant feedback through Judge0 API for multiple programming languages.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
            Battle Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 rounded-full p-3 flex-shrink-0">
                  <span className="text-xl">💻</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-300 mb-2">Monaco Code Editor</h3>
                  <p className="text-gray-400">Professional coding environment with syntax highlighting, auto-completion, and error detection.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 rounded-full p-3 flex-shrink-0">
                  <span className="text-xl">⚖️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-300 mb-2">Judge0 Integration</h3>
                  <p className="text-gray-400">Instant code evaluation and testing with support for 60+ programming languages.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 rounded-full p-3 flex-shrink-0">
                  <span className="text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-300 mb-2">Secure Authentication</h3>
                  <p className="text-gray-400">JWT-based authentication with protected routes and secure user sessions.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-600 rounded-full p-3 flex-shrink-0">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-300 mb-2">Performance Analytics</h3>
                  <p className="text-gray-400">Track your coding speed, accuracy, and improvement over time with detailed statistics.</p>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-purple-300 mb-6 text-center">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</span>
                  <span className="text-gray-300">Create account or sign in</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</span>
                  <span className="text-gray-300">Join matchmaking queue</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</span>
                  <span className="text-gray-300">Get matched with opponent</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">4</span>
                  <span className="text-gray-300">Solve coding challenges</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">5</span>
                  <span className="text-gray-300">Win and climb rankings!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
            Ready to Prove Your Skills?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers in the ultimate coding competition platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Start Your Journey
            </Link>
            <Link 
              href="/login" 
              className="px-10 py-4 border-2 border-purple-600 text-purple-300 hover:bg-purple-600/20 hover:text-white rounded-lg font-bold text-xl transition-all duration-300"
            >
              Login to Battle
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-purple-800/30 backdrop-blur-sm bg-black/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Image 
              src="/logo.svg" 
              alt="CodeBrawl Logo" 
              width={32} 
              height={32}
            />
            <span className="text-xl font-bold text-purple-300">CodeBrawl</span>
          </div>
          <div className="text-gray-400">
            <p>&copy; 2024 CodeBrawl. Built for competitive programmers, by competitive programmers.</p>
          </div>
        </div>
      </footer>
    </>
  );
}