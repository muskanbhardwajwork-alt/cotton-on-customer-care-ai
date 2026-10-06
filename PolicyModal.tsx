import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { POLICY_RULES } from '../data/knowledgeBase';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSampleQuery: (prompt: string) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  onSelectSampleQuery,
}) => {
  const [filter, setFilter] = useState<'all' | 'auto' | 'escalation'>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredRules = POLICY_RULES.filter((rule) => {
    const matchesFilter = filter === 'all' || rule.category === filter;
    const matchesSearch =
      rule.id.toLowerCase().includes(search.toLowerCase()) ||
      rule.title.toLowerCase().includes(search.toLowerCase()) ||
      rule.summary.toLowerCase().includes(search.toLowerCase()) ||
      rule.fullRule.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const autoCount = POLICY_RULES.filter((r) => r.category === 'auto').length;
  const escCount = POLICY_RULES.filter((r) => r.category === 'escalation').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                KNOWLEDGE BASE
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Customer Support Policy Rules
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Structured rules powering Gemini classification: K1-K11 auto-resolved, E1-E6 human escalation.
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2.5 py-1 mt-2 font-medium">
              Demo view: shows the policy topics the assistant is grounded on. In production, customers would not see internal topic codes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Topics ({POLICY_RULES.length})
            </button>
            <button
              onClick={() => setFilter('auto')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'auto'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Auto-Answerable ({autoCount})
            </button>
            <button
              onClick={() => setFilter('escalation')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'escalation'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Human Escalation ({escCount})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topic or keywords..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Rules List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-slate-50/50">
          {filteredRules.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No matching policy topics found for "{search}".
            </div>
          ) : (
            filteredRules.map((rule) => {
              const isAuto = rule.category === 'auto';
              return (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border bg-white shadow-2xs transition-all hover:shadow-xs ${
                    isAuto ? 'border-slate-200' : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          isAuto
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {rule.id}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">
                        {rule.title}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isAuto
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {isAuto ? 'Auto-Answerable' : 'Escalation-Only'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectSampleQuery(rule.samplePrompt);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors cursor-pointer"
                    >
                      <span>Test this topic</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mb-2">
                    {rule.summary}
                  </p>

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono leading-relaxed">
                    {rule.fullRule}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Cotton On Knowledge Base v2026.1 - Sydney, AU</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
