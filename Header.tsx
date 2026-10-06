import React from 'react';
import { BookOpen, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onOpenPolicyModal: () => void;
  onNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPolicyModal, onNewChat }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-300 shadow-2xs flex items-center justify-center text-[#0f172a] font-black text-xs tracking-tight select-none shrink-0">
              CO
            </div>
            <div className="flex items-center tracking-tight">
              <span className="text-2xl font-black text-[#0f172a] tracking-tight">
                COTTON<span className="text-red-600">:</span>ON
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-300 rounded">
            CUSTOMER CARE
          </span>
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-xs shadow-emerald-500/50"></span>
            </span>
            <span className="text-xs font-medium text-slate-600">
              Virtual Assistant Online - Ready to help
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPolicyModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs hover:border-slate-400"
            title="View Cotton On K1-K11 & E1-E6 policy rules"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Transparency: Policy Rules (K1-K11 / E1-E6)</span>
          </button>

          <button
            type="button"
            onClick={onNewChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs hover:border-slate-400"
            title="Reset and start a fresh chat session"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>New Chat</span>
          </button>
        </div>
      </div>
      
      {/* Mobile subheader status line */}
      <div className="sm:hidden px-4 pb-2 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-medium text-slate-500">
          Virtual Assistant Online - Ready to help
        </span>
      </div>
    </header>
  );
};
