"use client";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';
import { notify } from '@/utils/notifications';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, updateAvatar } = useAuth();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      setIsOpen(false);
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    try {
      await updateAvatar(file);
    } catch (error) {
      console.error('Avatar upload error:', error);
      // Error notification is handled in AuthContext
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <Avatar
        src={user.avatar}
        alt={user.fullName}
        username={user.username}
        size="md"
        className="cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-purple-600/30 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* User Info Section */}
          <div className="p-4 border-b border-purple-600/20">
            <div className="flex items-center space-x-3">
              <Avatar
                src={user.avatar}
                alt={user.fullName}
                username={user.username}
                size="lg"
                showEdit={true}
                onAvatarChange={handleAvatarChange}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user.fullName}</p>
                <p className="text-gray-400 text-sm truncate">@{user.username}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-purple-400 text-sm font-medium">{user.eloRating} ELO</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 text-sm">{user.tier}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/profile');
              }}
              className="w-full px-4 py-3 text-left text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors duration-200 flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>View Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/practice');
              }}
              className="w-full px-4 py-3 text-left text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors duration-200 flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Practice</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/battle');
              }}
              className="w-full px-4 py-3 text-left text-gray-300 hover:bg-purple-600/20 hover:text-white transition-colors duration-200 flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Battle Arena</span>
            </button>

            <div className="border-t border-purple-600/20 mt-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`w-full px-4 py-3 text-left text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors duration-200 flex items-center space-x-3 ${
                  isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
