"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SignupForm from '@/components/SignupForm';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to battle if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/battle');
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-purple-300 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is authenticated (redirect will happen)
  if (user) {
    return null;
  }

  return (
    <>
      <Navbar showAuthButtons={false} />
      <SignupForm />
    </>
  );
}
