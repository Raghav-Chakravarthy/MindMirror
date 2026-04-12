"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-gray-100 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative"
      aria-label="Toggle Theme"
    >
      <div className="relative w-4 h-4">
        {/* Sun Icon */}
        <div 
          className={`absolute inset-0 transition-transform duration-500 ease-out-back ${theme === 'dark' ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}
        >
          <div className="w-4 h-4 rounded-full border-2 border-purple-600 bg-purple-100 shadow-[0_0_10px_rgba(147,51,234,0.3)]" />
        </div>
        
        {/* Moon Icon */}
        <div 
          className={`absolute inset-0 transition-transform duration-500 ease-out-back ${theme === 'light' ? '-translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}
        >
          <div className="w-4 h-4 rounded-full border-2 border-purple-400 bg-purple-900 overflow-hidden">
            <div className="absolute top-[-2px] right-[-2px] w-3 h-3 rounded-full bg-black/40" />
          </div>
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-pink-500/10" />
      </div>
    </button>
  );
}
