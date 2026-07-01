'use client';

import React from 'react';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';

interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onSearch }) => {
  const inputId = 'search-input'; // 使用固定 ID 避免 Hydration 错误

  return (
    <div className="w-full max-w-xl mx-auto">
      <LiquidGlassSurface variant="pill" fullWidth className="search-glass">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600/80 dark:text-sky-300/80" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input
            id={inputId}
            name="search"
            type="search"
            className="liquid-input block w-full p-3 sm:p-4 pl-10 sm:pl-12 pr-4 text-sm sm:text-base text-gray-950 placeholder:text-slate-500/80 bg-transparent dark:text-white dark:placeholder:text-slate-300/70 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            placeholder="输入检索词，实时显示结果..."
            value={value}
            onChange={(e) => onSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </LiquidGlassSurface>
    </div>
  );
};

export default SearchBar;
