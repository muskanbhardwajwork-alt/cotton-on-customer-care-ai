import React, { useRef } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Check,
  User,
  ShieldAlert,
  Headphones,
} from 'lucide-react';
import { ChatMessage, AttachedDamagePhoto } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  onFeedback: (messageId: string, value: 'helpful' | 'unhelpful') => void;
  onAttachPhoto: (messageId: string, photo: AttachedDamagePhoto) => void;
  onRemovePhoto: (messageId: string) => void;
  onViewPhotoFullSize: (photo: AttachedDamagePhoto) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onFeedback,
  onAttachPhoto,
  onRemovePhoto,
  onViewPhotoFullSize,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUser = message.sender === 'user';
  const isEscalation = Boolean(message.escalate);
  const isE1Topic = message.matched_topic === 'E1';
  const isK1Topic = message.matched_topic === 'K1';

  // Handle local image file upload for damage evidence
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const sizeKb = Math.round(file.size / 1024);
      const sizeText = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      onAttachPhoto(message.id, {
        name: file.name,
        url,
        size: sizeText,
      });
    };
    reader.readAsDataURL(file);
    // Reset file input so re-selecting same file triggers change
    e.target.value = '';
  };

  // If user message
  if (isUser) {
    return (
      <div className="flex justify-end my-3 animate-message-in">
        <div className="max-w-[85%] sm:max-w-[70%] flex flex-col items-end">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>You</span>
            <User className="w-3 h-3 text-slate-400" />
          </div>
          <div className="bg-[#002B49] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-xs text-sm leading-relaxed whitespace-pre-wrap">
            {message.text}
          </div>
          <span className="text-[10px] text-slate-600 mt-1 mr-1">
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  }

  // Assistant Message: Escalation vs Normal Answer
  return (
    <div className="flex items-start gap-2.5 my-3.5 animate-message-in">
      {/* 1. LOGO AVATAR: Round white badge with bold "CO" + amber headset badge on escalation */}
      <div className="relative shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-full bg-white border border-slate-300 shadow-2xs flex items-center justify-center text-[#0f172a] font-black text-xs tracking-tight select-none">
          CO
        </div>
        {isEscalation && (
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center ring-2 ring-white shadow-2xs"
            title="Escalated to human support agent"
          >
            <Headphones className="w-2.5 h-2.5" />
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl">
        {isEscalation ? (
          /* Escalation Card (Warm amber/cream card with amber border) */
          <div className="bg-[#fffbeb] border border-amber-300 rounded-xl p-4 sm:p-5 shadow-xs transition-all">
            {/* Top Bar with Badge & Amber Topic Tag */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-200/90 text-amber-900 border border-amber-300 shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  Connecting you to a team member
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded border border-amber-300">
                Topic: {message.matched_topic || 'Escalation'} (Escalation Rule)
              </span>
            </div>

            {/* Response Body */}
            <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal">
              {message.text}
            </div>

            {/* Ticket status line */}
            <div className="mt-3.5 pt-3 border-t border-amber-200/70 flex items-center gap-2 text-xs font-medium text-amber-900">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Support ticket opened (simulated for this demo)</span>
            </div>

            {/* Photo upload for E1 topic only */}
            {isE1Topic && (
              <div className="mt-4 p-3.5 bg-white/95 border border-amber-200 rounded-lg shadow-2xs">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {!message.attachedPhoto ? (
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>Attach photo of damage</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Supports JPG, PNG, WebP
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Providing a clear photo helps our assessment team process your claim faster.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md shadow-2xs transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Attach a photo
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Attached Photo for Review
                      </span>
                      <div className="flex items-center gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-700 hover:underline font-medium cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemovePhoto(message.id)}
                          className="text-red-600 hover:underline font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-md">
                      <img
                        src={message.attachedPhoto.url}
                        alt="Damage Preview"
                        className="w-14 h-14 object-cover rounded border border-slate-200 shrink-0 cursor-pointer"
                        onClick={() => onViewPhotoFullSize(message.attachedPhoto!)}
                      />
                      <div className="overflow-hidden flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {message.attachedPhoto.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {message.attachedPhoto.size} - Attached to ticket as supporting evidence for human agent
                        </p>
                        <button
                          type="button"
                          onClick={() => onViewPhotoFullSize(message.attachedPhoto!)}
                          className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:underline font-medium mt-0.5 cursor-pointer"
                        >
                          <span>View photo full size</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Darker amber "Internal context for human agent" box */}
            <div className="mt-4 pt-3.5 border-t border-amber-200">
              <div className="p-3.5 bg-[#fef3c7] border border-amber-400 rounded-lg text-xs shadow-2xs">
                <div className="flex items-center justify-between gap-2 mb-1.5 text-amber-950 font-bold tracking-wider uppercase text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-800" />
                    INTERNAL CONTEXT FOR HUMAN AGENT
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-amber-200/90 rounded border border-amber-400 text-amber-950 font-mono">
                    visible to agent console
                  </span>
                </div>
                <div className="font-mono text-slate-900 leading-relaxed text-[11px] bg-white/80 p-2.5 rounded border border-amber-300">
                  {message.summary_for_agent ||
                    'Customer inquiry escalated for team member review.'}
                  {message.attachedPhoto && (
                    <span className="block mt-1 font-semibold text-amber-950">
                      Customer has attached a photo of the damaged item for review.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Answers Card (White card) */
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
            {/* Header info with blue monospace Knowledge Base tag */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                Cotton On Virtual Assistant
              </span>
              <span className="font-mono text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                Knowledge Base: {message.matched_topic || 'Welcome'}
              </span>
            </div>

            {/* Response body */}
            <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {message.text}
            </div>

            {/* K1 specific Tracking Button */}
            {isK1Topic && (
              <div className="mt-3.5 pt-2">
                <a
                  href="https://help.cottonon.com/hc/en-us/categories/200194640-Delivery-Tracking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all hover:-translate-y-0.5 cursor-pointer shadow-2xs"
                >
                  <span>Delivery & Tracking help</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Verified Policy Green Line */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Answered automatically via verified Cotton On policy</span>
            </div>
          </div>
        )}

        {/* Footer controls: Timestamp and Helpful? Thumbs Up / Down with green/red states */}
        <div className="flex items-center justify-between px-1 mt-1.5 text-xs text-slate-500">
          <span className="text-[11px] text-slate-600">{message.timestamp}</span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500">Helpful?</span>
            {message.feedback === 'helpful' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded shadow-2xs">
                <ThumbsUp className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                Helpful
              </span>
            ) : message.feedback === 'unhelpful' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold text-red-700 bg-red-50 border border-red-300 rounded shadow-2xs">
                <ThumbsDown className="w-3 h-3 fill-red-600 text-red-600" />
                Unhelpful
              </span>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onFeedback(message.id, 'helpful')}
                  className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all hover:scale-110 cursor-pointer"
                  title="Mark as helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onFeedback(message.id, 'unhelpful')}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all hover:scale-110 cursor-pointer"
                  title="Mark as unhelpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
