
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackgroundAnimation from "../components/BackgroundAnimation";
import { AuthProvider } from "../context/AuthContext";
import ToasterProvider from "../components/ToasterProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeBrawl - Real-Time Multiplayer Coding Duels",
  description: "Challenge developers worldwide in live 1v1 coding battles. Test your skills, climb the leaderboards, and prove you're the ultimate code warrior.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white relative overflow-hidden">
            {/* Background Animation */}
            <BackgroundAnimation />

            {/* Page Content */}
            <div className="relative z-10">
              {children}
            </div>

            {/* Toast Notifications */}
            <ToasterProvider />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
