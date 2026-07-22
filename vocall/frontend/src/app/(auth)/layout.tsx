import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header Logo */}
      <div className="mb-8 flex items-center gap-2 z-10">
        <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-[#7C3AED]/30">
          V
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">VoCall</span>
      </div>

      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
