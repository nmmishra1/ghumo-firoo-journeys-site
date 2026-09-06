import React, { Suspense, memo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import GAListener from '@/components/GAListener';
import MetaPixel from '@/components/analytics/MetaPixel';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import WhatsAppFloat from '@/components/common/WhatsAppFloat';
import { LiveChatWidget } from '@/components/LiveChatWidget';

// Luxury branded loading component with zero flash
const PageLoader = memo(() => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#050814] text-white">
    <div className="flex flex-col items-center space-y-4">
      <img 
        src="/ghumo-firoo-logo.png" 
        alt="Ghumo Firoo" 
        className="h-10 w-auto brightness-0 invert opacity-90 mb-1" 
      />
      <div className="w-8 h-8 border-2 border-[#C9A25A]/20 border-t-[#C9A25A] rounded-full animate-spin"></div>
      <p className="text-[11px] font-bold tracking-[0.15em] text-[#C9A25A] uppercase">Loading Portal...</p>
    </div>
  </div>
));

PageLoader.displayName = 'PageLoader';

// Error boundary component for lazy loaded routes with auto-reload on version deployment
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
    const msg = String(error?.message || '').toLowerCase();
    if (
      msg.includes('failed to fetch dynamically imported module') ||
      msg.includes('loading chunk') ||
      msg.includes('mime type') ||
      error.name === 'ChunkLoadError'
    ) {
      const storageKey = 'gf_chunk_reload_ts';
      const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
      const now = Date.now();
      if (now - lastReload > 10000) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
          <div className="glass-card p-8 rounded-2xl shadow-glass-lg text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">New Version Available</h2>
            <p className="text-gray-600 mb-4">A fresh update has been deployed. Click below to refresh.</p>
            <button 
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              Refresh & Continue
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Auto-retrying lazy import helper for smooth zero-downtime updates
function lazyRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T } | { default: { default: T } }>
) {
  return React.lazy(async () => {
    try {
      return await factory() as any;
    } catch (error: any) {
      const msg = String(error?.message || '').toLowerCase();
      const isChunkError = 
        error?.name === 'ChunkLoadError' ||
        msg.includes('failed to fetch dynamically imported module') ||
        msg.includes('loading chunk') ||
        msg.includes('mime type');

      const storageKey = 'gf_chunk_reload_ts';
      const lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
      const now = Date.now();

      if (isChunkError && (now - lastReload > 10000)) {
        sessionStorage.setItem(storageKey, String(now));
        window.location.reload();
        return new Promise(() => {}); // pause execution until page reloads
      }
      throw error;
    }
  });
}

// Lazy load main pages with better chunking and retry resilience
const Index = lazyRetry(() => import('@/pages/Index'));
const About = lazyRetry(() => import('@/pages/About'));
const Contact = lazyRetry(() => import('@/pages/Contact'));
const Blog = lazyRetry(() => import('@/pages/Blog'));
const FAQ = lazyRetry(() => import('@/pages/FAQ'));
const Career = lazyRetry(() => import('@/pages/Career'));
const Products = lazyRetry(() => import('@/pages/Products'));
const Profile = lazyRetry(() => import('@/pages/Profile'));
const NotFound = lazyRetry(() => import('@/pages/NotFound'));
const Booking = lazyRetry(() => import('@/pages/Booking'));
const CRM = lazyRetry(() => import('@/pages/CRM'));
const Auth = lazyRetry(() => import('@/pages/Auth'));
const SignUp = lazyRetry(() => import('@/pages/SignUp'));
const ForgotPassword = lazyRetry(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazyRetry(() => import('@/pages/ResetPassword'));
const ReviewForm = lazyRetry(() => import('@/pages/ReviewForm'));

// Lazy load policy pages (grouped for better caching)
const PrivacyPolicy = lazyRetry(() => import('@/pages/PrivacyPolicy'));
const TermsConditions = lazyRetry(() => import('@/pages/TermsConditions'));
const TermsOfService = lazyRetry(() => import('@/pages/TermsOfService'));
const RefundPolicy = lazyRetry(() => import('@/pages/RefundPolicy'));

// Lazy load service pages
const CustomTourPackages = lazyRetry(() => import('@/pages/CustomTourPackages'));
const Packages = lazyRetry(() => import('@/pages/Packages'));
const EnquireNow = lazyRetry(() => import('@/pages/EnquireNow'));
const EnquireSuccess = lazyRetry(() => import('@/pages/EnquireSuccess'));
const ThankYou = lazyRetry(() => import('@/pages/ThankYou'));
const QuickPayment = lazyRetry(() => import('@/pages/QuickPayment'));
const QuoteView = lazyRetry(() => import('@/pages/QuoteView'));
const PublicIndiaExplorer = lazyRetry(() => import('@/pages/public/PublicIndiaExplorer'));
const PublicDestinationDetail = lazyRetry(() => import('@/pages/public/PublicDestinationDetail'));

// Lazy load package pages with route-based code splitting
const CharDham = lazyRetry(() => import('@/pages/packages/CharDham'));
const DoDham = lazyRetry(() => import('@/pages/packages/DoDham'));
const KedarnathBadrinath = lazyRetry(() => import('@/pages/packages/KedarnathBadrinath'));
const GangotriYamunotri = lazyRetry(() => import('@/pages/packages/GangotriYamunotri'));
const Kedarnath = lazyRetry(() => import('@/pages/packages/Kedarnath'));
const Badrinath = lazyRetry(() => import('@/pages/packages/Badrinath'));
const Gangotri = lazyRetry(() => import('@/pages/packages/Gangotri'));
const Yamunotri = lazyRetry(() => import('@/pages/packages/Yamunotri'));
const CharDhamYatra = lazyRetry(() => import('@/pages/packages/CharDhamYatra').then(module => ({ default: module.default })));
const Europe = lazyRetry(() => import('@/pages/packages/Europe'));
const Switzerland = lazyRetry(() => import('@/pages/packages/Switzerland'));
const France = lazyRetry(() => import('@/pages/packages/France'));
const Italy = lazyRetry(() => import('@/pages/packages/Italy'));
const Germany = lazyRetry(() => import('@/pages/packages/Germany'));
const Austria = lazyRetry(() => import('@/pages/packages/Austria'));
const Netherlands = lazyRetry(() => import('@/pages/packages/Netherlands'));
const Belgium = lazyRetry(() => import('@/pages/packages/Belgium'));
const CzechRepublic = lazyRetry(() => import('@/pages/packages/CzechRepublic'));
const EuropeTour = lazyRetry(() => import('@/pages/packages/EuropeTour').then(module => ({ default: module.default })));
const EuropeSwitzerlandParis = lazyRetry(() => import('@/pages/packages/EuropeSwitzerlandParis'));
const EuropeSwitzerlandItaly = lazyRetry(() => import('@/pages/packages/EuropeSwitzerlandItaly'));
const EuropeFranceSwitzerland = lazyRetry(() => import('@/pages/packages/EuropeFranceSwitzerland'));
const EuropeHighlights = lazyRetry(() => import('@/pages/packages/EuropeHighlights'));
const EuropeSwissItalyFrance = lazyRetry(() => import('@/pages/packages/EuropeSwissItalyFrance'));
const EuropeGrandTour = lazyRetry(() => import('@/pages/packages/EuropeGrandTour'));
const RajasthanRoyal = lazyRetry(() => import('@/pages/packages/RajasthanRoyal').then(module => ({ default: module.default })));
const KashmirParadise = lazyRetry(() => import('@/pages/packages/KashmirParadise').then(module => ({ default: module.default })));
const KeralaBackwaters = lazyRetry(() => import('@/pages/packages/KeralaBackwaters').then(module => ({ default: module.default })));
const GoaBeachHoliday = lazyRetry(() => import('@/pages/packages/GoaBeachHoliday').then(module => ({ default: module.default })));
const HimachalHillStations = lazyRetry(() => import('@/pages/packages/HimachalHillStations').then(module => ({ default: module.default })));
const GoldenTriangle = lazyRetry(() => import('@/pages/packages/GoldenTriangle').then(module => ({ default: module.default })));
const LehLadakhTour = lazyRetry(() => import('@/pages/packages/LehLadakhTour').then(module => ({ default: module.default })));
const DubaiDelights = lazyRetry(() => import('@/pages/packages/DubaiDelights').then(module => ({ default: module.default })));
const ThailandTropical = lazyRetry(() => import('@/pages/packages/ThailandTropical'));
const Singapore = lazyRetry(() => import('@/pages/packages/Singapore'));
const Singapore4D3N = lazyRetry(() => import('@/pages/packages/Singapore4D3N'));
const Singapore5D4N = lazyRetry(() => import('@/pages/packages/Singapore5D4N'));
const SingaporeSentosa = lazyRetry(() => import('@/pages/packages/SingaporeSentosa'));
const SingaporeCruise = lazyRetry(() => import('@/pages/packages/SingaporeCruise'));
const SingaporeMalaysia = lazyRetry(() => import('@/pages/packages/SingaporeMalaysia'));
const SingaporeMalaysiaCombo = lazyRetry(() => import('@/pages/packages/SingaporeMalaysiaCombo'));
const SingaporeFamily = lazyRetry(() => import('@/pages/packages/SingaporeFamily'));
const SingaporeHoneymoon = lazyRetry(() => import('@/pages/packages/SingaporeHoneymoon'));
const SingaporeLuxury = lazyRetry(() => import('@/pages/packages/SingaporeLuxury'));
const BaliParadise = lazyRetry(() => import('@/pages/packages/BaliParadise'));
const JapanCherryBlossom = lazyRetry(() => import('@/pages/packages/JapanCherryBlossom'));
const Maldives = lazyRetry(() => import('@/pages/packages/Maldives'));
const TurkeyAdventure = lazyRetry(() => import('@/pages/packages/TurkeyAdventure'));
const MauritiusBliss = lazyRetry(() => import('@/pages/packages/MauritiusBliss'));
const SeychellesEscape = lazyRetry(() => import('@/pages/packages/SeychellesEscape'));
const SingaporeCityDelight = lazyRetry(() => import('@/pages/packages/SingaporeCityDelight'));
const RannUtsav = lazyRetry(() => import('@/pages/packages/RannUtsav'));
const RannUtsavMockupPage = lazyRetry(() => import('@/pages/packages/RannUtsavMockupPage'));
const JaisalmerTour = lazyRetry(() => import('@/pages/packages/JaisalmerTour'));
const GeorgiaAdventure = lazyRetry(() => import('@/pages/packages/GeorgiaAdventure'));
const CharDhamHeli = lazyRetry(() => import('@/pages/landing/CharDhamHeli'));
const CharDhamRoad = lazyRetry(() => import('@/pages/landing/CharDhamRoad'));
const CharDhamYatraFromDelhi = lazyRetry(() => import('@/pages/packages/CharDhamYatraFromDelhi'));
const CharDhamYatraFromHaridwar = lazyRetry(() => import('@/pages/packages/CharDhamYatraFromHaridwar'));
const CharDhamYatraFromDehradun = lazyRetry(() => import('@/pages/packages/CharDhamYatraFromDehradun'));
const DynamicPackageDetail = lazyRetry(() => import('@/pages/packages/DynamicPackageDetail'));

// Guides
const GuidesIndex = lazyRetry(() => import('@/pages/guides/GuidesIndex'));
const GuidePage = lazyRetry(() => import('@/pages/guides/Guide'));

// Sightseeing & Activities
const SightseeingIndex = lazyRetry(() => import('@/pages/sightseeing/SightseeingIndex'));
const SightseeingDetail = lazyRetry(() => import('@/pages/sightseeing/SightseeingDetail'));

function App() {

  return (
    <PerformanceProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <GAListener />
        <MetaPixel />
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}> 
           <LazyErrorBoundary>
             <Routes>
               {/* Main pages */}
               <Route path="/" element={<Index />} />
               <Route path="/about" element={<About />} />
               <Route path="/contact" element={<Contact />} />
               <Route path="/blog" element={<Blog />} />
               <Route path="/blog/:slug" element={<Blog />} />
               <Route path="/faq" element={<FAQ />} />
               <Route path="/career" element={<Career />} />
               <Route path="/products" element={<Products />} />
               <Route path="/profile" element={<Profile />} />
               <Route path="/booking" element={<Booking />} />
               <Route path="/crm" element={<CRM />} />
               <Route path="/crm/user-dashboard" element={<CRM />} />
               <Route path="/crm/leads" element={<CRM />} />
               <Route path="/crm/leads/new" element={<CRM />} />
               <Route path="/crm/leads/:leadId" element={<CRM />} />
               <Route path="/crm/leads/:leadId/edit" element={<CRM />} />
               <Route path="/crm/leads/:leadId/followups" element={<CRM />} />
               <Route path="/crm/leads/:leadId/itinerary" element={<CRM />} />
               <Route path="/crm/leads/:leadId/proposals" element={<CRM />} />
               <Route path="/crm/leads/:leadId/brochure" element={<CRM />} />
               <Route path="/crm/leads/:leadId/voucher" element={<CRM />} />
               <Route path="/crm/leads/:leadId/invoice" element={<CRM />} />
               <Route path="/crm/opportunities" element={<CRM />} />
               <Route path="/crm/quotes" element={<CRM />} />
               <Route path="/crm/customers" element={<CRM />} />
               <Route path="/crm/settings/destinations" element={<CRM />} />
               <Route path="/crm/settings/destinations/*" element={<CRM />} />
               <Route path="/crm/itineraries" element={<CRM />} />
               <Route path="/crm/packages" element={<CRM />} />
               <Route path="/crm/packages/*" element={<CRM />} />
               <Route path="/crm/blogs" element={<CRM />} />
               <Route path="/crm/blogs/*" element={<CRM />} />
               <Route path="/crm/hotels" element={<CRM />} />
               <Route path="/crm/hotels/*" element={<CRM />} />
               <Route path="/crm/cabs" element={<CRM />} />
               <Route path="/crm/cabs/*" element={<CRM />} />
               <Route path="/crm/suppliers" element={<CRM />} />
               <Route path="/crm/suppliers/*" element={<CRM />} />
               <Route path="/crm/activities" element={<CRM />} />
               <Route path="/crm/activities/*" element={<CRM />} />
               <Route path="/crm/sightseeings" element={<CRM />} />
               <Route path="/crm/sightseeings/*" element={<CRM />} />
               <Route path="/crm/visas" element={<CRM />} />
               <Route path="/crm/visas/*" element={<CRM />} />
               <Route path="/crm/india-explorer" element={<CRM />} />
               <Route path="/crm/india-explorer/*" element={<CRM />} />
               <Route path="/crm/payments" element={<CRM />} />
               <Route path="/crm/reports" element={<CRM />} />
               <Route path="/crm/reports/*" element={<CRM />} />
               <Route path="/crm/reviews" element={<CRM />} />
               <Route path="/crm/reviews/*" element={<CRM />} />
               <Route path="/crm/email-marketing" element={<CRM />} />
               <Route path="/crm/email-marketing/*" element={<CRM />} />
               <Route path="/crm/audit-logs" element={<CRM />} />
               <Route path="/crm/audit-logs/*" element={<CRM />} />
               <Route path="/crm/audit-log" element={<CRM />} />
               <Route path="/crm/audit-log/*" element={<CRM />} />
               <Route path="/crm/bulk-upload" element={<CRM />} />
               <Route path="/crm/bulk-upload/*" element={<CRM />} />
               <Route path="/crm/hotel/bulk-upload" element={<CRM />} />
               <Route path="/crm/hotel/bulk-upload/*" element={<CRM />} />
               <Route path="/crm/cab/bulk-upload" element={<CRM />} />
               <Route path="/crm/cab/bulk-upload/*" element={<CRM />} />
               <Route path="/crm/sightseeing/bulk-upload" element={<CRM />} />
               <Route path="/crm/sightseeing/bulk-upload/*" element={<CRM />} />
               <Route path="/crm/activity/bulk-upload" element={<CRM />} />
               <Route path="/crm/activity/bulk-upload/*" element={<CRM />} />
               <Route path="/crm/package/bulk-upload" element={<CRM />} />
               <Route path="/crm/package/bulk-upload/*" element={<CRM />} />
               <Route path="/crm/role-management" element={<CRM />} />
               <Route path="/crm/role-management/*" element={<CRM />} />
               <Route path="/crm/users" element={<CRM />} />
               <Route path="/crm/user-management" element={<CRM />} />
               <Route path="/crrm/*" element={<CRM />} />
               <Route path="/crrm" element={<CRM />} />
               <Route path="/auth" element={<Auth />} />
               <Route path="/signup" element={<SignUp />} />
               <Route path="/forgot-password" element={<ForgotPassword />} />
               <Route path="/reset-password" element={<ResetPassword />} />
               <Route path="/review/:bookingReference" element={<ReviewForm />} />
               <Route path="/quote/:token" element={<QuoteView />} />
               
               {/* Policy pages */}
               <Route path="/privacy-policy" element={<PrivacyPolicy />} />
               <Route path="/terms-conditions" element={<TermsConditions />} />
               <Route path="/terms-of-service" element={<TermsOfService />} />
               <Route path="/refund-policy" element={<RefundPolicy />} />
               
               {/* Service pages */}
                <Route path="/custom-tour-packages" element={<CustomTourPackages />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/destinations" element={<Packages />} />
                <Route path="/destinations/:slug" element={<Packages />} />
                <Route path="/enquire-now" element={<EnquireNow />} />
                <Route path="/enquire-success" element={<EnquireSuccess />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/payment" element={<QuickPayment />} />
                <Route path="/payment/:leadId" element={<QuickPayment />} />
                <Route path="/pay" element={<QuickPayment />} />
                <Route path="/pay/:leadId" element={<QuickPayment />} />
               
               {/* Guides */}
               <Route path="/guides" element={<GuidesIndex />} />
               <Route path="/guides/:slug" element={<GuidePage />} />
               <Route path="/guide/:slug" element={<GuidePage />} />
                
                {/* Public India Destination Explorer Search Engine & Detailed Guides */}
                 <Route path="/explore-india" element={<PublicIndiaExplorer />} />
                 <Route path="/explore-india/:slug" element={<PublicDestinationDetail />} />
                 <Route path="/explore-india/:slug/*" element={<PublicDestinationDetail />} />
                 <Route path="/india-explorer" element={<PublicIndiaExplorer />} />
                 <Route path="/india-explorer/:slug" element={<PublicDestinationDetail />} />
                 <Route path="/india-explorer/:slug/*" element={<PublicDestinationDetail />} />
                
                {/* Sightseeing & Activities */}
                <Route path="/sightseeing" element={<SightseeingIndex />} />
                <Route path="/sightseeing/:slug" element={<SightseeingDetail />} />
                <Route path="/activities" element={<SightseeingIndex />} />
                <Route path="/activities/:slug" element={<SightseeingDetail />} />
               
               {/* Package pages */}
                 <Route path="/package/:slug" element={<DynamicPackageDetail />} />
                 <Route path="/packages/char-dham" element={<CharDham />} />
                 <Route path="/packages/do-dham-yatra" element={<DynamicPackageDetail fallback={<DoDham />} />} />
                 <Route path="/packages/kedarnath-badrinath-tour" element={<DynamicPackageDetail fallback={<KedarnathBadrinath />} />} />
                 <Route path="/packages/gangotri-yamunotri-tour" element={<DynamicPackageDetail fallback={<GangotriYamunotri />} />} />
                 <Route path="/packages/kedarnath-yatra" element={<DynamicPackageDetail fallback={<Kedarnath />} />} />
                 <Route path="/packages/badrinath-yatra" element={<DynamicPackageDetail fallback={<Badrinath />} />} />
                 <Route path="/packages/gangotri-yatra" element={<DynamicPackageDetail fallback={<Gangotri />} />} />
                 <Route path="/packages/yamunotri-yatra" element={<DynamicPackageDetail fallback={<Yamunotri />} />} />
                 <Route path="/packages/char-dham-yatra" element={<CharDhamYatra />} />
                 <Route path="/packages/europe" element={<Europe />} />
                 <Route path="/packages/europe-switzerland" element={<DynamicPackageDetail fallback={<Switzerland />} />} />
                 <Route path="/packages/europe-france" element={<DynamicPackageDetail fallback={<France />} />} />
                 <Route path="/packages/europe-italy" element={<DynamicPackageDetail fallback={<Italy />} />} />
                 <Route path="/packages/europe-germany" element={<DynamicPackageDetail fallback={<Germany />} />} />
                 <Route path="/packages/europe-austria" element={<DynamicPackageDetail fallback={<Austria />} />} />
                 <Route path="/packages/europe-netherlands" element={<DynamicPackageDetail fallback={<Netherlands />} />} />
                 <Route path="/packages/europe-belgium" element={<DynamicPackageDetail fallback={<Belgium />} />} />
                 <Route path="/packages/europe-czech-republic" element={<DynamicPackageDetail fallback={<CzechRepublic />} />} />
                  <Route path="/packages/europe-switzerland-paris" element={<DynamicPackageDetail fallback={<EuropeSwitzerlandParis />} />} />
                  <Route path="/packages/europe-switzerland-italy" element={<DynamicPackageDetail fallback={<EuropeSwitzerlandItaly />} />} />
                  <Route path="/packages/europe-france-switzerland" element={<DynamicPackageDetail fallback={<EuropeFranceSwitzerland />} />} />
                  <Route path="/packages/europe-highlights" element={<DynamicPackageDetail fallback={<EuropeHighlights />} />} />
                  <Route path="/packages/europe-swiss-italy-france" element={<DynamicPackageDetail fallback={<EuropeSwissItalyFrance />} />} />
                  <Route path="/packages/europe-grand-tour" element={<DynamicPackageDetail fallback={<EuropeGrandTour />} />} />
                  <Route path="/packages/europe-swiss-croatia" element={<EuropeTour />} />
                 <Route path="/packages/rajasthan-royal" element={<RajasthanRoyal />} />
                  <Route path="/packages/kashmir-paradise" element={<KashmirParadise />} />
                  <Route path="/packages/kashmir-5d-4n" element={<DynamicPackageDetail slug="classic-kashmir-5n6d" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/kashmir-6d-5n" element={<DynamicPackageDetail slug="classic-kashmir-5n6d" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/kashmir-7d-6n" element={<DynamicPackageDetail slug="grand-kashmir-7n8d" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/classic-kashmir-5n6d" element={<DynamicPackageDetail slug="classic-kashmir-5n6d" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/grand-kashmir-7n8d" element={<DynamicPackageDetail slug="grand-kashmir-7n8d" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/kashmir-honeymoon-6n7d" element={<DynamicPackageDetail slug="kashmir-honeymoon-6n7d" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/kashmir-winter-snow" element={<DynamicPackageDetail slug="kashmir-winter-snow" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/kashmir-family-fun" element={<DynamicPackageDetail slug="kashmir-family-fun" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/kashmir-gurez-offbeat" element={<DynamicPackageDetail slug="kashmir-gurez-offbeat" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/kashmir" element={<DynamicPackageDetail slug="classic-kashmir-5n6d" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/kashmir-ultra-luxury" element={<DynamicPackageDetail slug="kashmir-ultra-luxury" fallback={<KashmirParadise />} />} />
                  <Route path="/packages/kerala" element={<KeralaBackwaters />} />
                  <Route path="/packages/kerala-backwaters" element={<KeralaBackwaters />} />
                  <Route path="/packages/kerala-3d2n-munnar-hills" element={<DynamicPackageDetail slug="kerala-3d2n-munnar-hills" />} />
                  <Route path="/packages/kerala-4d3n-munnar-alleppey" element={<DynamicPackageDetail slug="kerala-4d3n-munnar-alleppey" />} />
                  <Route path="/packages/kerala-5d4n-tea-wildlife-backwaters" element={<DynamicPackageDetail slug="kerala-5d4n-tea-wildlife-backwaters" />} />
                  <Route path="/packages/kerala-5d4n-varkala-cliff-beach" element={<DynamicPackageDetail slug="kerala-5d4n-varkala-cliff-beach" />} />
                  <Route path="/packages/kerala-6d5n-hills-backwaters-kovalam" element={<DynamicPackageDetail slug="kerala-6d5n-hills-backwaters-kovalam" />} />
                  <Route path="/packages/kerala-7d6n-grand-kerala-kanyakumari" element={<DynamicPackageDetail slug="kerala-7d6n-grand-kerala-kanyakumari" />} />
                  <Route path="/packages/kerala-8d7n-heritage-backwaters-cape" element={<DynamicPackageDetail slug="kerala-8d7n-heritage-backwaters-cape" />} />
                  <Route path="/packages/kerala-10d9n-south-india-temple-circuit" element={<DynamicPackageDetail slug="kerala-10d9n-south-india-temple-circuit" />} />
                  <Route path="/packages/goa" element={<GoaBeachHoliday />} />
                  <Route path="/packages/goa-beach-holiday" element={<GoaBeachHoliday />} />
                  <Route path="/packages/himachal" element={<HimachalHillStations />} />
                  <Route path="/packages/himachal-hill-stations" element={<HimachalHillStations />} />
                  <Route path="/packages/golden-triangle" element={<GoldenTriangle />} />
                  <Route path="/packages/ladakh" element={<LehLadakhTour />} />
                  <Route path="/packages/leh-ladakh-tour" element={<LehLadakhTour />} />
                  <Route path="/packages/dubai" element={<DubaiDelights />} />
                  <Route path="/packages/dubai-delights" element={<DubaiDelights />} />
                  <Route path="/packages/thailand" element={<ThailandTropical />} />
                  <Route path="/packages/thailand-tropical" element={<ThailandTropical />} />
                  <Route path="/packages/maldives" element={<Maldives />} />
                  <Route path="/packages/maldives-paradise" element={<Maldives />} />
                  <Route path="/packages/singapore" element={<Singapore />} />
                  <Route path="/packages/singapore-4d-3n" element={<DynamicPackageDetail slug="singapore-4d3n" fallback={<Singapore4D3N />} />} />
                  <Route path="/packages/singapore-5d-4n" element={<DynamicPackageDetail slug="singapore-5d4n" fallback={<Singapore5D4N />} />} />
                  <Route path="/packages/singapore-sentosa" element={<DynamicPackageDetail slug="singapore-sentosa" fallback={<SingaporeSentosa />} />} />
                  <Route path="/packages/singapore-cruise" element={<DynamicPackageDetail slug="singapore-cruise" fallback={<SingaporeCruise />} />} />
                  <Route path="/packages/singapore-malaysia" element={<DynamicPackageDetail slug="singapore-malaysia" fallback={<SingaporeMalaysia />} />} />
                  <Route path="/packages/singapore-malaysia-combo" element={<DynamicPackageDetail slug="singapore-malaysia-combo" fallback={<SingaporeMalaysiaCombo />} />} />
                  <Route path="/packages/singapore-family" element={<DynamicPackageDetail slug="singapore-family" fallback={<SingaporeFamily />} />} />
                  <Route path="/packages/singapore-honeymoon" element={<DynamicPackageDetail slug="singapore-honeymoon" fallback={<SingaporeHoneymoon />} />} />
                  <Route path="/packages/singapore-luxury" element={<DynamicPackageDetail slug="singapore-luxury" fallback={<SingaporeLuxury />} />} />
                  <Route path="/packages/singapore-city-delight" element={<DynamicPackageDetail slug="singapore-city-delight" fallback={<SingaporeCityDelight />} />} />
                  <Route path="/packages/bali" element={<BaliParadise />} />
                  <Route path="/packages/bali-paradise" element={<BaliParadise />} />
                  <Route path="/packages/japan" element={<JapanCherryBlossom />} />
                  <Route path="/packages/japan-cherry-blossom" element={<JapanCherryBlossom />} />
                  <Route path="/packages/turkey" element={<TurkeyAdventure />} />
                  <Route path="/packages/turkey-adventure" element={<TurkeyAdventure />} />
                  <Route path="/packages/mauritius" element={<MauritiusBliss />} />
                  <Route path="/packages/mauritius-bliss" element={<MauritiusBliss />} />
                  <Route path="/packages/seychelles" element={<SeychellesEscape />} />
                  <Route path="/packages/seychelles-escape" element={<SeychellesEscape />} />
                  <Route path="/packages/georgia" element={<DynamicPackageDetail slug="georgia-adventure" />} />
                  <Route path="/packages/rajasthan" element={<RajasthanRoyal />} />
                  <Route path="/packages/kutch-rann-utsav" element={<RannUtsav />} />
                  <Route path="/packages/kutch-rann-utsav/*" element={<RannUtsav />} />
                  <Route path="/packages/rann-utsav" element={<RannUtsav />} />
                  <Route path="/packages/rann-utsav-tent" element={<RannUtsavMockupPage />} />
                  <Route path="/packages/rann-utsav-tent-city" element={<RannUtsavMockupPage />} />
                     <Route path="/packages/rann-utsav-booking" element={<RannUtsavMockupPage />} />
                    <Route path="/packages/rann-utsav-2d1n" element={<DynamicPackageDetail slug="rann-utsav-2d1n" fallback={<RannUtsav />} />} />
                    <Route path="/packages/rann-utsav-3d2n" element={<DynamicPackageDetail slug="rann-utsav-3d2n" fallback={<RannUtsav />} />} />
                    <Route path="/packages/rann-utsav-3d-2n" element={<DynamicPackageDetail slug="rann-utsav-3d2n" fallback={<RannUtsav />} />} />
                    <Route path="/packages/rann-utsav-4d3n" element={<DynamicPackageDetail slug="rann-utsav-4d3n" fallback={<RannUtsav />} />} />
                    <Route path="/packages/rann-utsav-4d-3n" element={<DynamicPackageDetail slug="rann-utsav-4d3n" fallback={<RannUtsav />} />} />
                    <Route path="/packages/rann-utsav-5d4n" element={<DynamicPackageDetail slug="rann-utsav-5d4n" fallback={<RannUtsav />} />} />
                  <Route path="/packages/rann-utsav-flagship" element={<RannUtsav />} />
                  <Route path="/packages/rann-utsav-customizer" element={<RannUtsavMockupPage />} />
                   <Route path="/packages/rann-utsav-mockup" element={<RannUtsavMockupPage />} />
                <Route path="/packages/jaisalmer-tour" element={<DynamicPackageDetail fallback={<JaisalmerTour />} />} />
               <Route path="/packages/georgia-adventure" element={<GeorgiaAdventure />} />
               <Route path="/packages/char-dham-yatra-from-delhi" element={<DynamicPackageDetail fallback={<CharDhamYatraFromDelhi />} />} />
               <Route path="/packages/char-dham-yatra-from-haridwar" element={<DynamicPackageDetail fallback={<CharDhamYatraFromHaridwar />} />} />
               <Route path="/packages/char-dham-yatra-from-dehradun" element={<DynamicPackageDetail fallback={<CharDhamYatraFromDehradun />} />} />
               <Route path="/packages/:slug" element={<DynamicPackageDetail />} />
               
               {/* Landing Pages for Ads - Lazy loaded */}
               <Route path="/landing/char-dham-helicopter" element={<CharDhamHeli />} />
               <Route path="/landing/char-dham-road" element={<CharDhamRoad />} />
               
               {/* 404 page */}
               <Route path="*" element={<NotFound />} />
             </Routes>
           </LazyErrorBoundary>
        </Suspense>
          <Toaster />
          <WhatsAppFloat />
          <LiveChatWidget />
        </Router>
    </PerformanceProvider>
  );
}

export default App;
