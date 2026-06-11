/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface WeChatWrapperProps {
  children: React.ReactNode;
  title: string;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

export default function WeChatWrapper({
  children,
  title,
  soundEnabled,
  setSoundEnabled,
  theme,
}: WeChatWrapperProps) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-gray-50'
    }`}>
      
      {/* Background Atmosphere decoration (Visible only on desktop) - styled like an organic dark game lounge */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_45%)] pointer-events-none hidden md:block" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.06),transparent_50%)] pointer-events-none hidden md:block" />

      {/* Main Framework: Clean, sleek responsive web-app card container */}
      <div className={`relative w-full sm:max-w-xl h-screen sm:h-[840px] sm:max-h-[90vh] sm:rounded-3xl sm:border flex flex-col overflow-hidden transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-slate-900 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] sm:border-slate-800'
          : 'bg-white sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] sm:border-gray-200'
      }`}>

        {/* Standard Web App Header Layout (Non-模擬 / Minimalist / Genuine Web Style) */}
        <div className={`w-full h-14 px-5 flex items-center justify-between z-40 border-b shrink-0 select-none transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-slate-950/80 border-slate-800/80 backdrop-blur-sm'
            : 'bg-white border-gray-200/80'
        }`}>
          <div className="flex items-center space-x-2 overflow-hidden font-sans">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-md" />
            <h1 className={`text-[14px] font-extrabold truncate tracking-wide ${theme === 'dark' ? 'text-zinc-100' : 'text-gray-900'}`}>
              {title}
            </h1>
          </div>
 
          {/* Sound enable switch (Standard design button) */}
          <div className="flex items-center">
            <button
              id="btn-sound-toggle"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 active:scale-95 transition-all text-gray-600 cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-slate-900/60 hover:bg-slate-800 text-zinc-300 border-slate-800' 
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-200'
              }`}
              title={soundEnabled ? "音效开启" : "音效静音"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-bold font-sans">音效开</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-medium font-sans">静音中</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className={`flex-1 overflow-hidden relative flex flex-col transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'
        }`}>
          {children}
        </div>

      </div>
    </div>
  );
}
