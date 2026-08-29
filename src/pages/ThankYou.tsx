import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home, ArrowRight, Share2, Mail, ClipboardCheck, Download, Phone, MessageCircle, CheckCircle2, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Helmet } from 'react-helmet-async';

const getActionCopy = (type: string) => {
  switch (type) {
    case 'enquiry':
      return {
        headline: "We've received your enquiry!",
        message: 'Our travel experts are reviewing your details and will craft a personalized itinerary. Expect a call within 24 hours.',
        steps: ['Review your details', 'Craft your itinerary', 'We contact you'],
        stepIcons: ['📋', '✈️', '📞'],
        nextCta: { to: '/products', label: 'Explore Packages' },
        secondaryCta: { to: '/custom-tour-packages', label: 'Plan Another Trip' },
        color: 'orange',
      };
    case 'booking':
      return {
        headline: 'Booking confirmed! 🎉',
        message: 'Your booking is confirmed. A confirmation email with all details and vouchers will arrive shortly.',
        steps: ['Payment confirmed', 'Vouchers issued', 'Bon voyage!'],
        stepIcons: ['💳', '🎫', '🌍'],
        nextCta: { to: '/profile', label: 'View Bookings' },
        secondaryCta: { to: '/products', label: 'Explore More' },
        color: 'green',
      };
    case 'newsletter':
      return {
        headline: "You're on the list! 📬",
        message: 'We\'ll send hand-picked travel stories, exclusive deals, and destination guides. You can unsubscribe anytime.',
        steps: ['Verify your email', 'Personalize topics', 'Receive updates'],
        stepIcons: ['📧', '⚙️', '🎁'],
        nextCta: { to: '/blog', label: 'Read Our Blog' },
        secondaryCta: { to: '/products', label: 'Browse Packages' },
        color: 'blue',
      };
    case 'brochure':
      return {
        headline: 'Your brochure is ready! 📄',
        message: 'The brochure has been sent to your email. You can also download it directly below. Our team may reach out to help you plan your trip!',
        steps: ['Brochure prepared', 'Sent to your email', 'Plan your trip'],
        stepIcons: ['📄', '📨', '🗺️'],
        nextCta: { to: '/enquire-now', label: 'Enquire Now' },
        secondaryCta: { to: '/products', label: 'View All Packages' },
        color: 'purple',
      };
    case 'purchase':
      return {
        headline: 'Purchase complete! 🎊',
        message: 'Payment received successfully. Your receipt and trip details are on the way to your email.',
        steps: ['Payment verified', 'Order processed', 'Receipt emailed'],
        stepIcons: ['✅', '📦', '📩'],
        nextCta: { to: '/profile', label: 'Go to Dashboard' },
        secondaryCta: { to: '/products', label: 'Browse More' },
        color: 'emerald',
      };
    case 'contact':
      return {
        headline: 'Message received! 💬',
        message: 'Thank you for reaching out. Our team will respond to your message within 24 hours.',
        steps: ['Message received', 'Team assigned', 'Response sent'],
        stepIcons: ['💬', '👥', '📞'],
        nextCta: { to: '/', label: 'Back to Home' },
        secondaryCta: { to: '/faq', label: 'Check FAQs' },
        color: 'sky',
      };
    default:
      return {
        headline: 'Success! ✨',
        message: 'Your request has been received successfully. We will follow up shortly.',
        steps: ['Request processed', 'Response prepared', 'We reach out'],
        stepIcons: ['📝', '⚡', '🤝'],
        nextCta: { to: '/', label: 'Back to Home' },
        secondaryCta: { to: '/products', label: 'Explore Packages' },
        color: 'orange',
      };
  }
};

const colorMap: Record<string, { gradient: string; accent: string; ring: string; bg: string; badge: string }> = {
  orange: {
    gradient: 'from-[#0a1128]/5 via-[#1c2541]/5 to-background',
    accent: 'text-accent',
    ring: 'ring-accent/20',
    bg: 'bg-accent/5',
    badge: 'bg-accent/10 text-accent',
  },
  green: {
    gradient: 'from-green-50 via-emerald-50 to-teal-50',
    accent: 'text-green-600',
    ring: 'ring-green-200',
    bg: 'bg-green-50',
    badge: 'bg-green-100 text-green-700',
  },
  blue: {
    gradient: 'from-blue-50 via-indigo-50 to-sky-50',
    accent: 'text-blue-600',
    ring: 'ring-blue-200',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  purple: {
    gradient: 'from-purple-50 via-violet-50 to-fuchsia-50',
    accent: 'text-purple-600',
    ring: 'ring-purple-200',
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
  },
  emerald: {
    gradient: 'from-emerald-50 via-green-50 to-teal-50',
    accent: 'text-emerald-600',
    ring: 'ring-emerald-200',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  sky: {
    gradient: 'from-sky-50 via-cyan-50 to-blue-50',
    accent: 'text-sky-600',
    ring: 'ring-sky-200',
    bg: 'bg-sky-50',
    badge: 'bg-sky-100 text-sky-700',
  },
};

const AnimatedCheck = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 120 120"
    role="img"
    aria-label="Success checkmark"
    className="drop-shadow-md"
  >
    <defs>
      <linearGradient id="check-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#ea580c" />
      </linearGradient>
    </defs>
    <circle
      cx="60"
      cy="60"
      r="54"
      fill="none"
      stroke="url(#check-gradient)"
      strokeWidth="6"
      className="success-ring"
    />
    <path
      d="M40 62 L55 75 L82 45"
      fill="none"
      stroke="#f97316"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="success-tick"
    />
  </svg>
);

const ThankYou = () => {
  const [search] = useSearchParams();
  const type = (search.get('type') || 'enquiry').toLowerCase();
  const name = search.get('name') || '';
  const email = search.get('email') || '';
  const orderId = search.get('orderId') || search.get('ref') || '';
  const packageName = search.get('package') || search.get('pkg') || '';
  const copy = useMemo(() => getActionCopy(type), [type]);
  const colors = colorMap[copy.color] || colorMap.orange;

  const [showBelowFold, setShowBelowFold] = useState(false);
  const belowFoldRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  // Step animation
  useEffect(() => {
    const timers = copy.steps.map((_, idx) =>
      setTimeout(() => setActiveStep(idx), 600 + idx * 800)
    );
    return () => timers.forEach(clearTimeout);
  }, [copy.steps]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShowBelowFold(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );
    if (belowFoldRef.current) io.observe(belowFoldRef.current);
    return () => io.disconnect();
  }, []);

  if (type === 'brochure') {
    return (
      <Layout>
        <Helmet>
          <title>Thank You | Ghumo Firoo Travels</title>
          <meta name="robots" content="noindex, nofollow" />
          <style>{`
            .success-ring {
              stroke-dasharray: 339;
              stroke-dashoffset: 339;
              animation: ring 1.2s ease forwards;
            }
            .success-tick {
              stroke-dasharray: 120;
              stroke-dashoffset: 120;
              animation: tick 0.6s 0.6s ease forwards;
            }
            @keyframes ring { to { stroke-dashoffset: 0; } }
            @keyframes tick { to { stroke-dashoffset: 0; } }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
            .float-animation { animation: float 3s ease-in-out infinite; }
          `}</style>
        </Helmet>
        
        <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-[#0a1128]/5 via-white to-accent/5 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />
          
          <div className="max-w-2xl w-full space-y-8 text-center relative z-10 bg-white/60 backdrop-blur-md border border-accent/20 p-8 sm:p-12 rounded-3xl shadow-xl">
            {/* Animated Check */}
            <div className="mx-auto w-24 h-24 rounded-full bg-white border-2 border-accent/20 shadow-lg flex items-center justify-center float-animation animate-[bounce_1s_ease-out_0.2s]">
              <AnimatedCheck />
            </div>

            {/* Headline and Message */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                🎉 Thank You For Your Interest
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-accent">
                Your travel brochure has been sent to your email address.
              </p>
              {packageName && (
                <p className="text-sm text-gray-500 font-medium">
                  Package: <span className="text-gray-800 font-semibold">{packageName}</span>
                </p>
              )}
            </div>

            {/* Instructions box */}
            <div className="bg-accent/5/50 border border-accent/20 rounded-2xl p-6 text-left max-w-md mx-auto space-y-4 shadow-sm">
              <p className="font-semibold text-gray-800 flex items-center gap-2 text-center justify-center">
                <span>Please check your email:</span>
              </p>
              <ul className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm font-medium">
                <li className="bg-white border border-accent/20 py-3 px-1 sm:px-2 rounded-xl text-gray-700 flex flex-col items-center gap-1 shadow-sm">
                  <span className="text-xl">📩</span>
                  <span>Inbox</span>
                </li>
                <li className="bg-white border border-accent/20 py-3 px-1 sm:px-2 rounded-xl text-gray-700 flex flex-col items-center gap-1 shadow-sm">
                  <span className="text-xl">📩</span>
                  <span>Promotions</span>
                </li>
                <li className="bg-white border border-accent/20 py-3 px-1 sm:px-2 rounded-xl text-gray-700 flex flex-col items-center gap-1 shadow-sm">
                  <span className="text-xl">📩</span>
                  <span>Spam Folder</span>
                </li>
              </ul>
              <div className="border-t border-accent/20/80 pt-3 text-center">
                <p className="text-sm text-gray-600 font-medium">
                  One of our travel experts will also contact you shortly.
                </p>
              </div>
            </div>

            {/* Premium Brand Separator */}
            <div className="py-2 space-y-2">
              <p className="text-accent font-semibold tracking-wider text-sm select-none">
                ════════════ ✦ Ghumo Firoo Travels ✦ ════════════
              </p>
              <p className="font-display italic text-gray-600 text-base font-semibold">
                Where Dreams Become Itineraries
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link to="/packages" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold h-12 px-8 transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/30 rounded-xl"
                >
                  Explore Packages
                </Button>
              </Link>
              <Link to="/" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 font-semibold h-12 px-8 transition-all duration-300 rounded-xl"
                >
                  Continue Browsing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }



  const titlePersonalized = name ? `Thank you, ${name.split(' ')[0]}!` : 'Thank You!';

  const share = async () => {
    const shareData = {
      title: 'Ghumo Firoo Travels',
      text: copy.headline,
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `${shareData.text} — ${shareData.url}`
          )}`,
          '_blank',
          'noopener,noreferrer'
        );
      }
    } catch {}
  };

  const onCopy = async () => {
    try {
      if (email) {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {}
  };

  const whatsappUrl = type === 'booking'
    ? `https://wa.me/919910987264?text=Hi!+My+booking+ref+is+${orderId}+for+${encodeURIComponent(packageName)}`
    : `https://wa.me/919910987264?text=${encodeURIComponent(
        `Hi Ghumo Firoo Travels! ${name ? `I'm ${name}. ` : ''}I just submitted ${type === 'brochure' ? 'a brochure request' : type === 'enquiry' ? 'an enquiry' : 'a request'} on your website. Please help me plan my trip.`
      )}`;

  return (
    <Layout>
      <Helmet>
        <title>Thank You | Ghumo Firoo Travels</title>
        <meta name="robots" content="noindex, nofollow" />
        <style>{`
          html { scroll-behavior: smooth; }
          .success-ring {
            stroke-dasharray: 339;
            stroke-dashoffset: 339;
            animation: ring 1.2s ease forwards;
          }
          .success-tick {
            stroke-dasharray: 120;
            stroke-dashoffset: 120;
            animation: tick 0.6s 0.6s ease forwards;
          }
          @media (prefers-reduced-motion: reduce) {
            .success-ring, .success-tick { animation: none !important; stroke-dashoffset: 0; }
            .step-card { animation: none !important; opacity: 1 !important; transform: none !important; }
          }
          @keyframes ring { to { stroke-dashoffset: 0; } }
          @keyframes tick { to { stroke-dashoffset: 0; } }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          .float-animation { animation: float 3s ease-in-out infinite; }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .slide-up { animation: slideUp 0.6s ease-out forwards; }
          .slide-up-delay-1 { animation-delay: 0.2s; opacity: 0; }
          .slide-up-delay-2 { animation-delay: 0.4s; opacity: 0; }
          .slide-up-delay-3 { animation-delay: 0.6s; opacity: 0; }
        `}</style>
      </Helmet>
      
      <div 
        className={`min-h-[85vh] flex items-center justify-center bg-gradient-to-br ${colors.gradient} py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}
        role="main"
        aria-labelledby="thankyou-title"
      >
        {/* Decorative background elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10/10 rounded-full blur-3xl" />

        <div className="max-w-3xl w-full space-y-8 text-center relative z-10">
          {/* Animated Check */}
          <div className="mx-auto w-28 h-28 rounded-full bg-white/80 backdrop-blur-sm border-2 border-white shadow-xl flex items-center justify-center float-animation slide-up">
            <AnimatedCheck />
          </div>

          {/* Headline and Message */}
          <div className="space-y-4 slide-up slide-up-delay-1">
            <h1 id="thankyou-title" className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              {titlePersonalized}
            </h1>
            <h2 className={`text-xl sm:text-2xl font-semibold ${colors.accent}`}>
              {copy.headline}
            </h2>
            <p className="max-w-xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed">
              {copy.message}
            </p>
            {orderId && (
              <p className="text-sm text-gray-500" aria-live="polite">
                Reference ID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{orderId}</span>
              </p>
            )}
            {packageName && (
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Package: <span className="font-semibold text-gray-700">{packageName}</span>
              </p>
            )}
          </div>

          {/* Progress Steps */}
          <div
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100/80 slide-up slide-up-delay-2"
            aria-label="Progress status"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {copy.steps.map((label, idx) => (
                <div 
                  key={idx} 
                  className={`relative p-4 rounded-xl transition-all duration-500 ${
                    idx <= activeStep 
                      ? `${colors.bg} border-2 ${colors.ring} shadow-sm` 
                      : 'bg-gray-50 border-2 border-gray-100'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl" aria-hidden="true">
                      {copy.stepIcons[idx]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {idx <= activeStep && (
                        <CheckCircle2 className={`w-4 h-4 ${colors.accent} flex-shrink-0`} />
                      )}
                      <span className={`text-sm font-medium ${idx <= activeStep ? 'text-gray-900' : 'text-gray-400'}`}>
                        {label}
                      </span>
                    </div>
                  </div>
                  {/* Connector line */}
                  {idx < copy.steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 slide-up slide-up-delay-3">
            <Link to={copy.nextCta.to} aria-label={copy.nextCta.label}>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white gap-2 h-12 px-8 transition-all duration-300 shadow-lg shadow-accent/15 hover:shadow-xl hover:shadow-accent/20 active:scale-95 rounded-xl"
              >
                <Sparkles className="w-4 h-4" />
                {copy.nextCta.label}
              </Button>
            </Link>
            <Link to={copy.secondaryCta.to} aria-label={copy.secondaryCta.label}>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-gray-300 hover:bg-gray-50 gap-2 h-12 px-8 transition-all duration-300 active:scale-95 rounded-xl"
              >
                {copy.secondaryCta.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/" aria-label="Back to Home">
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto gap-2 h-12 px-6 transition-all duration-300 active:scale-95 rounded-xl text-gray-500 hover:text-gray-700"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
          </div>

          {/* Quick Actions Cards */}
          <div ref={belowFoldRef} />
          {showBelowFold && (
            <section aria-label="Quick actions" className="space-y-6 pt-4">
              <div className="mx-auto max-w-2xl grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">Chat on WhatsApp</span>
                  <span className="text-xs text-gray-400">Instant response</span>
                </a>

                {/* Call */}
                <a
                  href="tel:+919910987264"
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
                  aria-label="Call us"
                >
                  <Phone className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">Call Us</span>
                  <span className="text-xs text-gray-400">+91 99109 87264</span>
                </a>

                {/* Share */}
                <button
                  onClick={share}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
                  aria-label="Share your success"
                >
                  <Share2 className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">Share</span>
                  <span className="text-xs text-gray-400">Tell your friends</span>
                </button>
              </div>

              {/* Email Confirmation Row */}
              {email && (
                <div className="mx-auto max-w-lg">
                  <div className="flex items-stretch rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-4 border-r border-gray-200 bg-gray-50" aria-hidden="true">
                      <Mail className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      aria-label="Confirmation email"
                      readOnly
                      value={email}
                      className="flex-1 px-4 py-3 focus:outline-none text-sm text-gray-700 bg-transparent"
                    />
                    <button
                      onClick={onCopy}
                      className="px-4 hover:bg-gray-50 transition border-l border-gray-200"
                      aria-live="polite"
                      aria-label="Copy email to clipboard"
                    >
                      <ClipboardCheck className={`w-4 h-4 transition-colors ${copied ? 'text-green-500' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center" aria-live="polite">
                    {copied ? '✓ Email copied to clipboard' : 'Confirmation will be sent to this email'}
                  </p>
                </div>
              )}

              {/* Brochure-specific download reminder */}
              {type === 'brochure' && (
                <div className="mx-auto max-w-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Download className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-purple-900">Brochure sent to your email</p>
                      <p className="text-xs text-purple-600 mt-0.5">Check your inbox (and spam folder) for the download link</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ThankYou;
