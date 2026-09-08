import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cookie, X, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const COOKIE_CONSENT_KEY = 'gf_cookie_consent';
export const COOKIE_CONSENT_DATE_KEY = 'gf_cookie_consent_date';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const checkConsent = () => {
    if (typeof window === 'undefined') return;
    // Do not display cookie banner on internal CRM or Auth portals
    if (location.pathname.startsWith('/crm') || location.pathname.startsWith('/auth')) {
      setIsVisible(false);
      return;
    }
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!saved) {
      // Delay entrance slightly for natural page load feel
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    checkConsent();
    const handleConsentChange = () => checkConsent();
    window.addEventListener('gf_cookie_consent_reset', handleConsentChange);
    return () => window.removeEventListener('gf_cookie_consent_reset', handleConsentChange);
  }, [location.pathname]);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
    } catch (e) {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
      localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md lg:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-500"
      role="region"
      aria-label="Cookie Consent Banner"
    >
      <div className="bg-[#0B1120]/95 backdrop-blur-md border border-[#C9A25A]/35 rounded-2xl p-5 shadow-2xl shadow-black/80 text-white">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C9A25A]/15 border border-[#C9A25A]/30 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4 text-[#C9A25A]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-serif tracking-wide flex items-center gap-1.5">
                Cookie & Privacy Choices
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#C9A25A]/20 text-[#E5C378] border border-[#C9A25A]/30">
                  <Shield className="w-2.5 h-2.5" /> GDPR & DPDP
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-light">
                Ghumo Firoo Journeys
              </p>
            </div>
          </div>
          <button 
            onClick={handleDecline}
            className="text-slate-400 hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/5"
            aria-label="Close cookie consent dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-normal mb-4">
          We use essential cookies to keep our platform secure and functional. With your consent, we also use analytics and preference cookies to enhance your luxury journey planning and tailor travel recommendations.
        </p>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
          <Link 
            to="/cookie-policy" 
            className="text-[#C9A25A] hover:text-[#E5C378] transition-colors underline font-medium text-[11px] shrink-0"
          >
            Read Cookie Policy
          </Link>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleDecline}
              variant="outline"
              size="sm"
              className="bg-slate-900/80 border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white h-8 text-xs font-semibold px-3 rounded-lg"
            >
              Essential Only
            </Button>
            <Button
              onClick={handleAccept}
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold h-8 text-xs px-3.5 rounded-lg shadow-md shadow-amber-500/20 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
