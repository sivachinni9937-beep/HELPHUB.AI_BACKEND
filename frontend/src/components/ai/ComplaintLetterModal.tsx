import React, { useState } from 'react';
import { FileText, Copy, Printer, Check, AlertTriangle, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { apiClient } from '../../lib/api-client';
import { AIComplaintLetter, ReportItem } from '../../types';

interface ComplaintLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportItem;
}

export const ComplaintLetterModal: React.FC<ComplaintLetterModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [recipient, setRecipient] = useState('Municipal Commissioner / Ward Sanitary Officer');
  const [language, setLanguage] = useState<'en' | 'hi' | 'or'>('en');
  const [tone, setTone] = useState<'polite_formal' | 'urgent_official' | 'constructive'>('polite_formal');
  const [senderName, setSenderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [letterResult, setLetterResult] = useState<AIComplaintLetter | null>(null);
  const [copied, setCopied] = useState(false);
  const [editableLetter, setEditableLetter] = useState('');

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.generateComplaintLetter({
        report_title: report.title,
        problem_description: report.current_description,
        location: report.approximate_public_location,
        recipient_authority: recipient,
        language,
        sender_name: senderName || undefined,
      });
      setLetterResult(res);
      setEditableLetter(res.draft_letter);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Civic Complaint Draft - ${report.title}</title>
          <style>
            body { font-family: serif; padding: 40px; line-height: 1.6; color: #111; }
            .watermark { color: #888; font-size: 11px; margin-bottom: 24px; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="watermark">PERSONAL CITIZEN DRAFT - GENERATED VIA HELPHUB AI - NOT AN OFFICIAL FILING</div>
          <pre>${editableLetter}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Formal Civic Complaint Letter" maxWidth="xl">
      <div className="space-y-4">
        
        {/* Notice */}
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Civic Drafting Assistant:</span> This tool formats a respectful, structured letter for your personal review. 
            HelpHub AI does <span className="font-semibold underline">not</span> file complaints on your behalf or pretend to be an official authority.
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Authority / Department</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="E.g., Municipal Corporation / Ward Office"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Your Name / Title (Optional)</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="E.g., Concerned Resident / Student"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Language:</span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded text-xs font-medium ${language === 'en' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded text-xs font-medium ${language === 'hi' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('or')}
              className={`px-2.5 py-1 rounded text-xs font-medium ${language === 'or' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              ଓଡ଼ିଆ
            </button>
          </div>

          <Button onClick={handleGenerate} isLoading={isLoading} size="sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Draft</span>
          </Button>
        </div>

        {/* Draft Area */}
        {letterResult && (
          <div className="pt-3 border-t border-slate-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Editable Complaint Draft
              </span>
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" size="sm">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </Button>
              </div>
            </div>

            <textarea
              value={editableLetter}
              onChange={(e) => setEditableLetter(e.target.value)}
              rows={12}
              className="w-full p-4 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 leading-relaxed text-slate-800"
            />

            <p className="text-[11px] text-slate-500 italic">
              {letterResult.filing_disclaimer}
            </p>
          </div>
        )}

      </div>
    </Modal>
  );
};

