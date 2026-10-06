/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Header } from './components/Header';
import { SuggestedChips } from './components/SuggestedChips';
import { MessageItem } from './components/MessageItem';
import { PolicyModal } from './components/PolicyModal';
import { PhotoLightbox } from './components/PhotoLightbox';
import { ChatMessage, AttachedDamagePhoto } from './types';

function getFormattedTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome-001',
  sender: 'assistant',
  text: "G'day! Welcome to Cotton On Customer Care. I can answer your questions on order tracking, returns, deliveries, gift cards, and store info. How can I help you today?",
  matched_topic: 'Welcome',
  escalate: false,
  summary_for_agent: '',
  timestamp: getFormattedTime(),
  feedback: null,
  attachedPhoto: null,
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<AttachedDamagePhoto | null>(null);
  const [areChipsManuallyClosed, setAreChipsManuallyClosed] = useState(false);

  // In-memory feedback store across the active session
  const [sessionFeedback, setSessionFeedback] = useState<Record<string, 'helpful' | 'unhelpful'>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust textarea height automatically
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Reset to brand-new chat
  const handleNewChat = () => {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        id: `msg-welcome-${Date.now()}`,
        timestamp: getFormattedTime(),
        feedback: null,
      },
    ]);
    setInputValue('');
    setAreChipsManuallyClosed(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Send a message to backend
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      // Build history for backend context
      const history = messages
        .filter((m) => m.matched_topic !== 'Welcome')
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          content: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.response || "I'm connecting you with a team member.",
        matched_topic: data.matched_topic || 'unmatched',
        escalate: Boolean(data.escalate),
        summary_for_agent: data.summary_for_agent || '',
        timestamp: getFormattedTime(),
        feedback: null,
        attachedPhoto: null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat request error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: "I apologize, our connection experienced a brief hiccup. I am opening a support ticket so our team member can assist you right away.",
        matched_topic: 'unmatched',
        escalate: true,
        summary_for_agent: 'Transient connection error during customer query.',
        timestamp: getFormattedTime(),
        feedback: null,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle helpful/unhelpful feedback
  const handleFeedback = (messageId: string, value: 'helpful' | 'unhelpful') => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, feedback: value } : msg))
    );
    setSessionFeedback((prev) => ({
      ...prev,
      [messageId]: value,
    }));
  };

  // Handle attaching photo to an E1 message
  const handleAttachPhoto = (messageId: string, photo: AttachedDamagePhoto) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, attachedPhoto: photo } : msg))
    );
  };

  // Handle removing photo
  const handleRemovePhoto = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, attachedPhoto: null } : msg))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-[#0f172a] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <Header
        onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Container */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6">
        {/* Messages Stream */}
        <div className="flex-1 py-6 space-y-2 overflow-y-auto">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onFeedback={handleFeedback}
              onAttachPhoto={handleAttachPhoto}
              onRemovePhoto={handleRemovePhoto}
              onViewPhotoFullSize={(photo) => setLightboxPhoto(photo)}
            />
          ))}

          {/* Loading Typing Indicator with 3 animated dots */}
          {isLoading && (
            <div className="flex items-start gap-2.5 my-3 animate-message-in">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-300 shadow-2xs flex items-center justify-center text-[#0f172a] font-black text-xs tracking-tight shrink-0 mt-0.5 select-none">
                CO
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs flex items-center gap-2">
                <div className="flex items-center gap-1.5 py-1 px-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block typing-dot-1"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block typing-dot-2"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block typing-dot-3"></span>
                </div>
                <span className="text-xs font-medium text-slate-500 pl-1">
                  Cotton On assistant is thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock Area */}
        <div className="sticky bottom-0 bg-slate-50/95 backdrop-blur-xs pt-2 pb-4 border-t border-slate-200/80">
          {/* Suggested Queries Chips: hidden if manually closed or while user is typing */}
          <SuggestedChips
            onSelectQuery={(prompt) => handleSendMessage(prompt)}
            disabled={isLoading}
            isVisible={!areChipsManuallyClosed && inputValue.trim().length === 0}
            onClose={() => setAreChipsManuallyClosed(true)}
            onOpen={() => {
              setAreChipsManuallyClosed(false);
              setInputValue('');
            }}
          />

          {/* Text Input Box */}
          <div className="relative mt-1 bg-white border border-slate-300 rounded-xl shadow-xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:shadow-md transition-all">
            <div className="flex items-end px-3 py-2 gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask about orders, returns, delivery, gift cards, or report an issue..."
                disabled={isLoading}
                className="flex-1 max-h-32 resize-none bg-transparent text-sm text-[#0f172a] placeholder-slate-400 focus:outline-hidden leading-relaxed py-1"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-2xs"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Input Footer Note */}
            <div className="px-3 pb-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span className="font-semibold text-blue-700">Powered by Gemini</span>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-medium text-slate-600">
            Cotton On Group Customer Care - Auto-resolution: Topics K1-K11 - Human Handoff & Briefing: Topics E1-E6
          </p>
        </div>
      </footer>

      {/* Policy Rules Modal */}
      <PolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onSelectSampleQuery={(prompt) => handleSendMessage(prompt)}
      />

      {/* Photo Lightbox */}
      <PhotoLightbox
        photo={lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
      />
    </div>
  );
}
