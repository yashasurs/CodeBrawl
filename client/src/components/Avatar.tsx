"use client";
import Image from 'next/image';
import { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  username?: string;
  className?: string;
  onClick?: () => void;
  showEdit?: boolean;
  onAvatarChange?: (file: File) => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-24 h-24 text-3xl',
  xl: 'w-32 h-32 text-6xl'
};

export default function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  username, 
  className = '', 
  onClick,
  showEdit = false,
  onAvatarChange
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  const shouldShowImage = src && !imageError;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Avatar Image/Fallback */}
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer transition-opacity duration-200 ${
          onClick ? 'hover:opacity-80' : ''
        } ${
          shouldShowImage 
            ? 'bg-gray-700' 
            : 'bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center font-bold text-white'
        }`}
        onClick={onClick}
      >
        {shouldShowImage ? (
          <Image
            src={src!}
            alt={alt}
            width={sizeClasses[size].includes('w-8') ? 32 : sizeClasses[size].includes('w-12') ? 48 : sizeClasses[size].includes('w-24') ? 96 : 128}
            height={sizeClasses[size].includes('w-8') ? 32 : sizeClasses[size].includes('w-12') ? 48 : sizeClasses[size].includes('w-24') ? 96 : 128}
            className="w-full h-full object-cover rounded-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{getInitials(username || alt)}</span>
        )}
      </div>

      {/* Edit Icon */}
      {showEdit && (
        <div className="absolute -bottom-1 -right-1">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-6 h-6 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center border-2 border-gray-900 transition-colors duration-200">
              <svg 
                className="w-3 h-3 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                />
              </svg>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
