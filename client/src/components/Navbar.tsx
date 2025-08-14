"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  showAuthButtons?: boolean;
}

export default function Navbar({ showAuthButtons = true }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex justify-between items-center px-8 py-4 backdrop-blur-sm bg-black/60 border-b border-purple-600/30">
      
      {/* Logo Section */}
      <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
        <Image 
          src="/logo.svg" 
          alt="CodeBrawl Logo" 
          width={50} 
          height={50}
        />
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            CodeBrawl
          </span>
          <span className="text-xs text-purple-400 font-medium">Competitive Coding</span>
        </div>
      </Link>
      
      {/* Navigation Routes */}
      {!showAuthButtons && (
        <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-xl p-1 border border-purple-600/30">
          {[
            { href: '/battle', label: 'Battle' },
            { href: '/practice', label: 'Practice' },
            { href: '/leaderboard', label: 'Leaderboard' },
            { href: '/profile', label: 'Profile' }
          ].map((route) => (
            <Link 
              key={route.href}
              href={route.href} 
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isActive(route.href)
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white hover:bg-purple-600/30'
              }`}
            >
              {route.label}
            </Link>
          ))}
        </div>
      )}
      
      {/* Authentication Buttons */}
      {showAuthButtons && (
        <div className="flex space-x-3">
          <Link 
            href="/login" 
            className="px-6 py-2 text-purple-300 hover:text-white transition-colors duration-200 border border-purple-600/70 rounded-lg hover:bg-purple-600/20 font-medium"
          >
            Login
          </Link>
          
          <Link 
            href="/signup" 
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-medium transition-colors duration-200 text-white"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
