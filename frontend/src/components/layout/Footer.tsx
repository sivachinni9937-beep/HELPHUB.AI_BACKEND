import React from 'react';
import { Heart, Github, Shield, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../../app/providers';
import { getTranslation } from '../../lib/i18n';

export const Footer: React.FC = () => {
  const { language, isDemoMode } = useAuth();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">HelpHub AI</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-teal-100 text-teal-800 rounded">Open Source</span>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              {getTranslation(language, 'tagline')}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Powered by local Gemma models for privacy-preserving civic NLP. AI assistance is advisory and assists human community collaboration. It never pretends to be a government authority.
            </p>
            {isDemoMode && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-800 text-xs border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demonstration Mode Active: Seeded community dataset and responsive simulated AI workflows.</span>
              </div>
            )}
          </div>

          {/* Civic Tech Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/reports" className="hover:text-teal-600">Problem Feed</a></li>
              <li><a href="/volunteers" className="hover:text-teal-600">Volunteer Drives</a></li>
              <li><a href="/create-report" className="hover:text-teal-600">Submit a Report</a></li>
              <li><a href="/admin" className="hover:text-teal-600">Civic Analytics</a></li>
            </ul>
          </div>

          {/* Open Source & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Open Source</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 hover:text-teal-600"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 hover:text-teal-600">
                  <Shield className="w-4 h-4" />
                  <span>MIT Permissive License</span>
                </span>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 hover:text-teal-600">
                  <FileText className="w-4 h-4" />
                  <span>Code of Conduct</span>
                </span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HelpHub AI Civic Tech Initiative. Built for social impact and citizen collaboration.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for communities everywhere</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

