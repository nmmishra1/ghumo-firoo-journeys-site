import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { Cookie, ShieldCheck, Settings, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COOKIE_CONSENT_KEY, COOKIE_CONSENT_DATE_KEY } from '@/components/common/CookieConsentBanner';

const CookiePolicy: React.FC = () => {
  const [currentConsent, setCurrentConsent] = useState<string | null>(null);
  const [consentDate, setConsentDate] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentConsent(localStorage.getItem(COOKIE_CONSENT_KEY));
      setConsentDate(localStorage.getItem(COOKIE_CONSENT_DATE_KEY));
    }
  }, []);

  const handleUpdateConsent = (choice: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, choice);
      const now = new Date().toISOString();
      localStorage.setItem(COOKIE_CONSENT_DATE_KEY, now);
      setCurrentConsent(choice);
      setConsentDate(now);
      window.dispatchEvent(new Event('gf_cookie_consent_reset'));
    } catch (e) {}
  };

  const handleResetConsent = () => {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      localStorage.removeItem(COOKIE_CONSENT_DATE_KEY);
      setCurrentConsent(null);
      setConsentDate(null);
      window.dispatchEvent(new Event('gf_cookie_consent_reset'));
    } catch (e) {}
  };

  return (
    <Layout>
      <SEO 
        title="Cookie Policy | Ghumo Firoo Journeys"
        description="Learn about the cookies and tracking technologies used by Ghumo Firoo Travels, their purpose, and how you can manage your preferences."
        canonicalUrl="/cookie-policy"
      />

      <div className="bg-slate-50 min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200/80 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A25A]/15 border border-[#C9A25A]/30 text-[#A67C2E] text-xs font-semibold uppercase tracking-wider mb-4">
              <Cookie className="w-3.5 h-3.5" /> Transparency & Privacy
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight mb-3">
              Cookie Policy
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Last Updated: March 2026 &bull; Effective Date: January 1, 2024
            </p>
          </div>

          {/* Interactive Consent Status Manager Box */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0A1128] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-[#C9A25A]/30 mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-[#E5C378] tracking-widest uppercase flex items-center gap-1.5 mb-1">
                  <Settings className="w-3.5 h-3.5" /> Your Current Cookie Settings
                </span>
                <h3 className="text-lg font-bold text-white font-serif">
                  Manage Your Ghumo Firoo Journey Preferences
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {currentConsent === 'accepted' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" /> All Cookies Accepted
                  </span>
                ) : currentConsent === 'declined' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <AlertCircle className="w-4 h-4" /> Essential Cookies Only
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
                    Not Yet Configured
                  </span>
                )}
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                {consentDate 
                  ? `Your preferences were recorded on ${new Date(consentDate).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}. You can update or reset your consent choices anytime below.`
                  : 'You can select your preferred cookie level below. Your selection is immediately saved to your browser.'}
              </p>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button
                  onClick={() => handleUpdateConsent('declined')}
                  variant="outline"
                  size="sm"
                  className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold h-9 rounded-xl flex-1 sm:flex-none"
                >
                  Essential Only
                </Button>
                <Button
                  onClick={() => handleUpdateConsent('accepted')}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs h-9 px-4 rounded-xl shadow-md shadow-amber-500/20 flex-1 sm:flex-none"
                >
                  Accept All
                </Button>
                {currentConsent && (
                  <Button
                    onClick={handleResetConsent}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white text-xs h-9 px-2 rounded-xl"
                    title="Reset choice to prompt banner again"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed">
            
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
                <span className="text-[#C9A25A]">1.</span> Introduction
              </h2>
              <p>
                This Cookie Policy explains how Ghumo Firoo Travels (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) uses cookies and similar tracking technologies when you visit our website at <a href="https://ghumofiroo.com" className="text-[#A67C2E] font-medium hover:underline">ghumofiroo.com</a>. It explains what these technologies are, why we use them, and your legal rights to control our use of them under applicable data protection laws, including the Indian Digital Personal Data Protection (DPDP) Act 2023 and the General Data Protection Regulation (GDPR).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
                <span className="text-[#C9A25A]">2.</span> What Are Cookies?
              </h2>
              <p>
                Cookies are small text files that are placed on your computer, smartphone, or tablet when you visit a website. They are widely used by online businesses to make websites function properly, deliver faster and more secure experiences, remember your preferences (such as selected departure dates or search queries), and provide analytical reporting.
              </p>
              <p>
                Cookies created directly by our domain are called <strong>first-party cookies</strong>. Cookies set by parties other than the website owner are called <strong>third-party cookies</strong> (e.g. analytics providers, secure payment gateways, embedded tour videos).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
                <span className="text-[#C9A25A]">3.</span> Categories of Cookies We Use
              </h2>

              <div className="space-y-6 mt-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    A. Strictly Necessary / Essential Cookies (Always Active)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    These cookies are strictly required for our website to operate securely and efficiently. They enable essential functions such as session authentication, secure proposal generation, booking forms, CSRF token validation, and load balancing. You cannot disable these cookies without disrupting core site functions.
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Examples: <code>sb-auth-token</code>, <code>gf_cookie_consent</code>, session security tokens.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#A67C2E]" />
                    B. Performance & Analytics Cookies (Optional)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    These cookies help us understand how travellers interact with our website by collecting aggregated, anonymous data on pages visited, average time on luxury itinerary pages, and potential technical errors. This allows us to constantly refine page speeds and destination content.
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Examples: Google Analytics (<code>_ga</code>, <code>_gid</code>), Core Web Vitals telemetry.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-amber-600" />
                    C. Functionality & Personalization Cookies (Optional)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    These cookies remember your preferences—such as your selected travel departure city, currency display preference, and recently viewed holiday circuits—to provide a streamlined and tailored journey-planning experience.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-600 font-bold flex items-center justify-center text-[10px]">M</span>
                    D. Marketing & Campaign Attribution Cookies (Optional)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    Used with your explicit consent to measure the effectiveness of our holiday promotions and seasonal travel campaigns (e.g. Char Dham Yatra, Rann Utsav, Singapore Luxury Combos). They ensure you receive relevant travel offers rather than repetitive advertisements.
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Examples: Meta Pixel (<code>_fbp</code>), Google Ads conversion tags.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
                <span className="text-[#C9A25A]">4.</span> How Can You Control Cookies?
              </h2>
              <p>
                You have the full right to decide whether to accept or decline non-essential cookies. You can exercise your preferences at any time:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>Via Our On-Site Consent Tool:</strong> Use the interactive Cookie Settings box located at the top of this page or the floating consent banner displayed upon your first visit.
                </li>
                <li>
                  <strong>Via Browser Controls:</strong> You can configure or modify your web browser controls to accept or refuse cookies. If you choose to reject strictly necessary cookies, you may still browse our destination packages, but certain features (like live quote checkout or account login) may not function as intended.
                </li>
              </ul>

              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                <strong>Browser Instructions:</strong> For detailed guides on how to manage cookies on popular browsers, visit:
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-medium">
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="hover:underline text-amber-800">Google Chrome &rarr;</a>
                  <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="hover:underline text-amber-800">Apple Safari &rarr;</a>
                  <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="hover:underline text-amber-800">Mozilla Firefox &rarr;</a>
                  <a href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" target="_blank" rel="noopener noreferrer" className="hover:underline text-amber-800">Microsoft Edge &rarr;</a>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
                <span className="text-[#C9A25A]">5.</span> Compliance with Indian DPDP Act 2023 & GDPR
              </h2>
              <p>
                Ghumo Firoo Travels operates in full accordance with the Digital Personal Data Protection (DPDP) Act of India, 2023, and international privacy standards. We do not sell your personal browsing information, IP addresses, or enquiry histories to data brokers. All customer enquiry data is transmitted via high-grade 256-bit SSL encryption.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
                <span className="text-[#C9A25A]">6.</span> Contact Us
              </h2>
              <p>
                If you have questions about our use of cookies or privacy practices, our team is always here to assist:
              </p>
              <div className="mt-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <p className="font-bold text-slate-900 text-sm">Ghumo Firoo Travels</p>
                <p>
                  <strong>Email:</strong>{' '}
                  <a href="mailto:booking@ghumofiroo.com" className="text-[#A67C2E] hover:underline font-semibold">booking@ghumofiroo.com</a> &bull;{' '}
                  <a href="mailto:info@ghumofiroo.com" className="text-[#A67C2E] hover:underline font-semibold">info@ghumofiroo.com</a>
                </p>
                <p>
                  <strong>Helpline:</strong>{' '}
                  <a href="tel:+919910987264" className="text-slate-900 font-semibold hover:text-[#A67C2E]">+91 99109 87264</a> &bull;{' '}
                  <a href="tel:+919870229792" className="text-slate-900 font-semibold hover:text-[#A67C2E]">+91 98702 29792</a> (Mon &ndash; Sat, 9:30 AM &ndash; 7:30 PM IST)
                </p>
                <p>
                  <strong>Registered Office:</strong> Shop No. 210, 2nd Floor, Pratap Complex, Metro Gate Number 3, near Munirka, Baba Gangnath Market, Munirka, New Delhi, Delhi 110067, India
                </p>
              </div>
            </section>

          </div>

        </div>
      </div>
    </Layout>
  );
};

export default CookiePolicy;
