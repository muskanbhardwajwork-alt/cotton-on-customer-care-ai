import React from 'react';
import { Sparkles, X } from 'lucide-react';

export interface SuggestedChipItem {
  text: string;
  tag: string;
  tagType: 'auto' | 'escalation';
}

interface SuggestedChipsProps {
  onSelectQuery: (prompt: string) => void;
  disabled?: boolean;
  isVisible: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const CHIPS: SuggestedChipItem[] = [
  {
    text: 'How long do refunds take?',
    tag: 'K6',
    tagType: 'auto',
  },
  {
    text: 'My order arrived damaged',
    tag: 'E1',
    tagType: 'escalation',
  },
  {
    text: 'Is stock in medium',
    tag: 'K10',
    tagType: 'auto',
  },
];

export const SuggestedChips: React.FC<SuggestedChipsProps> = ({
  onSelectQuery,
  disabled,
  isVisible,
  onClose,
  onOpen,
}) => {
  if (!isVisible) {
    return (
      <div className="py-1.5 flex justify-end">
        <button
          type="button"
          onClick={onOpen}
          className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Show suggestions</span>
        </button>
      </div>
    );
  }

  return (
    <div className="py-2.5 animate-message-in">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Try a demo scenario</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded transition-colors cursor-pointer"
          title="Hide suggestions"
          aria-label="Hide suggestions"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip, index) => {
          const isAuto = chip.tagType === 'auto';
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onSelectQuery(chip.text)}
              className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-150 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5 hover:shadow-xs ${
                isAuto
                  ? 'bg-white text-slate-800 border border-slate-200 hover:bg-blue-50/60 hover:border-blue-300 hover:text-blue-900'
                  : 'bg-amber-50/90 text-amber-950 border border-amber-200 hover:bg-amber-100/90 hover:border-amber-300'
              }`}
            >
              <span>{chip.text}</span>
              <span
                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
                  isAuto
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-200/90 text-amber-900 border border-amber-400'
                }`}
              >
                {chip.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
