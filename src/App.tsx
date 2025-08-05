
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import Products from "./pages/Products";
import Career from "./pages/Career";
import Contact from "./pages/Contact";
import CustomTourPackages from "./pages/CustomTourPackages";
import EnquireNow from "./pages/EnquireNow";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import CRM from "./pages/CRM";
import Profile from "./pages/Profile";
import CharDhamYatra from "./pages/packages/CharDhamYatra";
import LehLadakhTour from "./pages/packages/LehLadakhTour";
import GoldenTriangle from "./pages/packages/GoldenTriangle";
import RajasthanRoyal from "./pages/packages/RajasthanRoyal";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={
            <ProtectedRoute requireAuth={true}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/crm" element={
            <ProtectedRoute requireAuth={true}>
              <CRM />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/tour-packages" element={<Products />} />
          <Route path="/products/custom-tour-packages" element={<CustomTourPackages />} />
          <Route path="/packages/char-dham-yatra" element={<CharDhamYatra />} />
          <Route path="/char-dham-yatra-2025" element={<CharDhamYatra />} />
          <Route path="/packages/leh-ladakh-tour" element={<LehLadakhTour />} />
          <Route path="/leh-ladakh-tour" element={<LehLadakhTour />} />
          <Route path="/packages/golden-triangle" element={<GoldenTriangle />} />
          <Route path="/packages/rajasthan-royal" element={<RajasthanRoyal />} />
          <Route path="/enquire-now" element={<EnquireNow />} />
          <Route path="/share-your-travel-dreams" element={<Index />} />
          <Route path="/career" element={<Career />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
