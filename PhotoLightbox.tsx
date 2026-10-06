import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { AttachedDamagePhoto } from '../types';

interface PhotoLightboxProps {
  photo: AttachedDamagePhoto | null;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ photo, onClose }) => {
  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <span className="font-semibold text-sm text-slate-800 truncate">
              {photo.name}
            </span>
            <span className="text-xs text-slate-500 shrink-0">({photo.size})</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={photo.url}
              download={photo.name}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] flex items-center justify-center p-4 bg-slate-950">
          <img
            src={photo.url}
            alt="Damaged Item Proof"
            className="max-h-[70vh] max-w-full object-contain rounded"
          />
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Attached to Customer Support Ticket (simulated)
          </span>
          <span className="text-slate-500">Damage Photo Evidence</span>
        </div>
      </div>
    </div>
  );
};
