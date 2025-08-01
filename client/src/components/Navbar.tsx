"use client";
import Link from 'next/link';
import Image from 'next/image';

interface NavbarProps {
  showAuthButtons?: boolean;
}

export default function Navbar({ showAuthButtons = true }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center p-6 backdrop-blur-sm bg-black/20 border-b border-purple-800/30">
      <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
        <Image 
          src="/logo.svg" 
          alt="CodeBrawl Logo" 
          width={50} 
          height={50}
          className="drop-shadow-lg"
        />
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-white bg-clip-text text-transparent">
          CodeBrawl
        </span>
      </Link>
      
      {showAuthButtons && (
        <div className="flex space-x-4">
          <Link 
            href="/login" 
            className="px-6 py-2 text-purple-300 hover:text-white transition-colors duration-300 border border-purple-600 rounded-lg hover:bg-purple-600/20"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
