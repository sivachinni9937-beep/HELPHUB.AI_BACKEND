import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UrgencyBadge } from '../ui/Badge';
import { apiClient } from '../../lib/api-client';
import { AIStructureResult, ReportCategory, UrgencyLevel } from '../../types';

interface GemmaAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: AIStructureResult) => void;
  initialDescription?: string;
  initialLocation?: string;
}

export const GemmaAssistantModal: React.FC<GemmaAssistantModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialDescription = '',
  initialLocation = '',
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'or'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIStructureResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!description.trim() || description.length < 10) {
      setError('Please provide at least 10 characters describing the community problem.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const data = await apiClient.structureReport(description, selectedLang, initialLocation);
      setResult(data);
    } catch {
      setError('Failed to contact AI service. Using fallback heuristic generator.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToForm = () => {
    if (result) {
      onApply(result);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gemma 4 Civic Report Assistant" maxWidth="xl">
      <div className="space-y-5">
        
        {/* Banner */}
        <div className="flex items-start gap-3 p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs text-teal-900 leading-relaxed">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Local Gemma 4 Civic NLP:</span> Tell us what's wrong in plain words (in English, Hindi, or Odia). 
            Gemma will categorize the issue, propose advisory urgency, and draft multilingual translations. Your original words are preserved.
          </div>
        </div>

        {/* Input Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Unstructured Problem Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g., The drainage near the college gate has been overflowing with trash for 4 days, causing foul smell and blocking students from entering..."
            rows={4}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Minimum 10 characters</span>
            <div className="flex items-center gap-1.5">
              <span>Language:</span>
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${selectedLang === 'en' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('hi')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${selectedLang === 'hi' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('or')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${selectedLang === 'or' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                ଓଡ଼ିଆ
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-lg text-xs border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleAnalyze} isLoading={isLoading} size="md">
            <Sparkles className="w-4 h-4" />
            <span>Generate Structure & Translations</span>
          </Button>
        </div>

        {/* AI Results Presentation */}
        {result && (
          <div className="pt-4 border-t border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Gemma 4 Structured Proposal
              </h4>
              <span className="text-[11px] text-teal-700 font-mono bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {result.model_identifier}
              </span>
            </div>

            {/* Proposed Title */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Proposed Title:</span>
              <p className="text-sm font-semibold text-slate-900">{result.suggested_title}</p>
            </div>

            {/* Category and Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Suggested Category:</span>
                <p className="text-sm font-semibold text-teal-800 capitalize">{result.suggested_category}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Advisory Urgency:</span>
                <div className="flex items-center gap-2">
                  <UrgencyBadge urgency={result.suggested_urgency} />
                  <span className="text-xs text-slate-600 line-clamp-1">{result.urgency_reasoning}</span>
                </div>
              </div>
            </div>

            {/* Multilingual Translations */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] text-slate-500 font-medium">Multilingual Translations:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">English</span>
                  <p className="text-slate-800 mt-0.5">{result.translations.en || result.suggested_title}</p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">हिन्दी (Hindi)</span>
                  <p className="text-slate-800 mt-0.5">{result.translations.hi || '-'}</p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">ଓଡ଼ିଆ (Odia)</span>
                  <p className="text-slate-800 mt-0.5">{result.translations.or || '-'}</p>
                </div>
              </div>
            </div>

            {/* Recommended Steps */}
            {result.recommended_next_steps.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Recommended Next Steps:</span>
                <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                  {result.recommended_next_steps.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply Action */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>You can edit all fields after applying.</span>
              </div>
              <Button onClick={handleApplyToForm} variant="primary">
                <span>Apply to Report Form</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};

