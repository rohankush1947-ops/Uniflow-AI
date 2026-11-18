import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, className = '' }) => {
  const iconSizeClass = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const subtextClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${iconSizeClass} rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center text-white shrink-0`}>
        <div className="w-full h-full bg-slate-950/20 rounded-[10px] flex items-center justify-center backdrop-blur-sm">
          <Layers className="w-1/2 h-1/2 text-cyan-200 stroke-[2.5]" />
        </div>
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-white flex items-center justify-center shadow-xs">
          <Sparkles className="w-2 h-2 text-blue-950" />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-slate-900 ${textClass}`}>
            UniFlow<span className="text-blue-600">.</span><span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AI</span>
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
            Campus ERP
          </span>
        </div>
        {showTagline && (
          <span className={`text-slate-500 font-medium tracking-normal mt-0.5 ${subtextClass}`}>
            Smart University. Seamless Administration.
          </span>
        )}
      </div>
    </div>
  );
};
