import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Sparkles, 
  MapPin, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { GemmaAssistantModal } from '../components/ai/GemmaAssistantModal';
import { useAuth } from '../app/providers';
import { apiClient } from '../lib/api-client';
import { ReportCategory, UrgencyLevel, AIStructureResult } from '../types';

export const CreateReportPage: React.FC = () => {
  const { user, language } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('sanitation');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [locationText, setLocationText] = useState('');
  const [preferredLang, setPreferredLang] = useState<'en' | 'hi' | 'or'>(language);
  const [images, setImages] = useState<string[]>([]);
  const [aiStructured, setAiStructured] = useState(false);
  const [aiTranslations, setAiTranslations] = useState<Record<string, string>>({});
  
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Optional quick sample images for civic demo
  const sampleImages = [
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
  ];

  const handleApplyAiSuggestions = (result: AIStructureResult) => {
    setTitle(result.suggested_title);
    setCategory(result.suggested_category);
    setUrgency(result.suggested_urgency);
    setAiStructured(true);
    setAiTranslations(result.translations || {});
  };

  const handleAddSampleImage = (url: string) => {
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 5) {
      setFormError('Please provide a descriptive title (at least 5 characters).');
      return;
    }
    if (!description.trim() || description.length < 10) {
      setFormError('Please describe the problem in detail (at least 10 characters).');
      return;
    }
    if (!locationText.trim()) {
      setFormError('Please specify the approximate location or street landmark.');
      return;
    }

    if (!user) {
      setFormError('Please sign in or select a demo role from the top navigation to submit a report.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const created = await apiClient.createReport(
        {
          title,
          original_description: description,
          current_description: description,
          category,
          user_confirmed_urgency: urgency,
          approximate_public_location: locationText,
          preferred_language: preferredLang,
          ai_structured: aiStructured,
          translations: aiTranslations,
          images,
          latitude: 20.2961 + (Math.random() - 0.5) * 0.05,
          longitude: 85.8245 + (Math.random() - 0.5) * 0.05,
        },
        user
      );

      navigate(`/reports/${created.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Community Problem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Citizen reports help neighbors, students, and NGOs coordinate local remediation. AI assistance is optional.
        </p>
      </div>

      {/* AI Assistant Callout Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-teal-50/60 to-blue-50 border border-teal-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Optional: Assist with Gemma 4</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md">
            Type your unstructured notes in English, Hindi, or Odia. Gemma 4 will suggest categories, advisory urgency, and draft translations.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setAiModalOpen(true)}
          variant="primary"
          size="sm"
          className="whitespace-nowrap shrink-0 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch AI Assistant</span>
        </Button>
      </div>

      {/* Submission Form */}
      <Card className="p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Report Title <span className="text-rose-500">*</span>
              </label>
              {aiStructured && (
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Gemma 4 Suggested (Editable)
                </span>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Overflowing dumpster near Patia bus shelter"
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed, how long it has been there, and any safety or health impacts..."
              rows={5}
              required
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="sanitation">Sanitation & Garbage</option>
                <option value="roads">Roads & Potholes</option>
                <option value="water">Water Supply & Leaks</option>
                <option value="electricity">Electricity & Streetlights</option>
                <option value="accessibility">Public Accessibility</option>
                <option value="parks">Parks & Public Spaces</option>
                <option value="other">Other Community Issue</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">User-Confirmed Urgency</label>
                <span className="text-[10px] text-slate-400">Advisory</span>
              </div>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="low">Low (Cosmetic / routine)</option>
                <option value="medium">Medium (Moderate disruption)</option>
                <option value="high">High (Traffic or hygiene hazard)</option>
                <option value="critical">Critical (Immediate danger/burst)</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Approximate Public Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="E.g., Near Patia Square Bus Stand, Bhubaneswar"
                required
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              For citizen privacy, exact home addresses are not required. Provide general cross-streets or landmarks.
            </p>
          </div>

          {/* Preferred Language */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Preferred Language for Updates
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreferredLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${preferredLang === 'en' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('hi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${preferredLang === 'hi' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('or')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${preferredLang === 'or' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
              >
                ଓଡ଼ିଆ (Odia)
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700">
              Photos of Problem (Optional)
            </label>
            
            {images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Quick demo photos:</span>
              <button
                type="button"
                onClick={() => handleAddSampleImage(sampleImages[0])}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                + Sanitation
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleImage(sampleImages[1])}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                + Water Leak
              </button>
              <button
                type="button"
                onClick={() => handleAddSampleImage(sampleImages[2])}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
              >
                + Streetlight
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Visible publicly in community feed</span>
            </div>
            <Button type="submit" isLoading={isSubmitting} size="lg">
              <span>Submit Community Report</span>
            </Button>
          </div>

        </form>
      </Card>

      {/* AI Assistant Modal */}
      <GemmaAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApply={handleApplyAiSuggestions}
        initialDescription={description}
        initialLocation={locationText}
      />

    </div>
  );
};

