import Image from 'next/image';

export default function Footer() {
  return (
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
  );
}
