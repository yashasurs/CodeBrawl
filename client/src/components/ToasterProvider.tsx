"use client";

import { Toaster } from 'sonner';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgb(17 24 39)', // gray-900
          border: '1px solid rgb(147 51 234)', // purple-600
          color: 'rgb(243 244 246)', // gray-100
        },
        className: 'sonner-toast',
      }}
      theme="dark"
      richColors
    />
  );
}
