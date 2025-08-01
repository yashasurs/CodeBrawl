"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <>
      <Navbar showAuthButtons={false} />
      <SignupForm />
    </>
  );
}
