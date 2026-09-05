import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { ArrowLeft, Shield, Clock, Award, CheckCircle, Smartphone, Building, CreditCard, Copy, Mail, ChevronRight, Check, Phone, Car, MapPin, Users, Calendar, Navigation } from 'lucide-react';
import BookingForm from '@/components/BookingForm';
import { Button } from '@/components/ui/button';
import { trackInitiateCheckout, trackPurchase } from '@/lib/pixel';
import { submitToGoogleSheets } from '@/lib/googleSheets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PackageData {
  id: string;
  title: string;
  price: number;
  duration: string;
  image: string;
  description: string;
  highlights: string[];
}

const steps = [
  { id: 1, name: 'Travel Details', icon: Clock },
  { id: 2, name: 'Payment', icon: CreditCard },
  { id: 3, name: 'Confirmation', icon: CheckCircle },
];

const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState<'details' | 'confirmation'>('details');
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const ENV_UPI_ID = (import.meta.env as any).VITE_UPI_ID || (import.meta.env as any).VITE_SLICE_UPI || 's6116562932@slc';
  const ENV_UPI_QR = (import.meta.env as any).VITE_UPI_QR_IMAGE || '/upi-qr-slice.jpeg';
  const [upiQrSrc, setUpiQrSrc] = useState<string>(ENV_UPI_QR);
  const [isCreditCard, setIsCreditCard] = useState(false);

  const packageId = searchParams.get('package');
  const packageTitle = searchParams.get('title') || searchParams.get('package');
  const packagePrice = searchParams.get('price');
  const packageDuration = searchParams.get('duration');
  const packageDestination = searchParams.get('destination');
  const packageImage = searchParams.get('image');
  const RAZORPAY_API_BASE = (import.meta.env as any).VITE_RAZORPAY_API_BASE || '';
  // Supabase Edge Function base URL — reads VITE_SUPABASE_URL from .env
  const SUPABASE_FUNCTIONS_URL = `${(import.meta.env as any).VITE_SUPABASE_URL}/functions/v1`;

  useEffect(() => {
    // Simulate fetching package data
    const fetchPackageData = async () => {
      setIsLoading(true);

      const hydrateQueryParams = (pkg: any) => {
        const qpTravelDate = searchParams.get('travelDate') || searchParams.get('checkInDate');
        const qpReturnDate = searchParams.get('returnDate') || searchParams.get('checkOutDate');
        const qpCabType = searchParams.get('cabType');
        const qpCabId = searchParams.get('cabId');
        const qpPickup = searchParams.get('pickup');
        const qpDrop = searchParams.get('drop');
        const qpTravelers = searchParams.get('travelers');

        if (qpTravelDate) pkg.travelDate = qpTravelDate;
        if (qpReturnDate) pkg.returnDate = qpReturnDate;
        if (qpCabType) pkg.cabType = qpCabType;
        if (qpCabId) pkg.cabId = qpCabId;
        if (qpPickup) pkg.pickupLocation = qpPickup;
        if (qpDrop) pkg.dropLocation = qpDrop;
        if (qpTravelers) pkg.passengersCount = parseInt(qpTravelers, 10);
        return pkg;
      };

      // Check location state or localStorage payload first
      if (location.state?.packageData) {
         let pkg = { ...location.state.packageData };
         if (pkg.title) pkg.title = pkg.title.replace(/Rann Utsav Kutch/gi, 'Evoke Tent City Package');
         pkg = hydrateQueryParams(pkg);
         setPackageData(pkg);
         trackInitiateCheckout(pkg.title, pkg.id, pkg.price);
         setIsLoading(false);
         return;
      }

      const pendingStr = localStorage.getItem('pending_booking_payload');
      if (pendingStr) {
        try {
          let pkg = JSON.parse(pendingStr);
          if (pkg && (pkg.title || pkg.name)) {
            if (pkg.title) pkg.title = pkg.title.replace(/Rann Utsav Kutch/gi, 'Evoke Tent City Package');
            if (pkg.name) pkg.name = pkg.name.replace(/Rann Utsav Kutch/gi, 'Evoke Tent City Package');
            pkg = hydrateQueryParams(pkg);
            setPackageData(pkg);
            trackInitiateCheckout(pkg.title || pkg.name, pkg.id || 'custom-pkg', pkg.price || 0);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Error reading pending_booking_payload:', e);
        }
      }
      
      // Mock package data - in real app, this would come from API
      const mockPackages: Record<string, PackageData> = {
        'manali-adventure': {
          id: 'manali-adventure',
          title: 'Manali Adventure Package',
          price: 15000,
          duration: '5 Days 4 Nights',
          image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
          description: 'Experience the thrill of Manali with adventure activities, scenic beauty, and comfortable accommodation.',
          highlights: ['River Rafting', 'Paragliding', 'Solang Valley', 'Rohtang Pass', 'Local Cuisine']
        },
        'goa-beach': {
          id: 'goa-beach',
          title: 'Goa Beach Paradise',
          price: 12000,
          duration: '4 Days 3 Nights',
          image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
          description: 'Relax on pristine beaches, enjoy water sports, and experience the vibrant nightlife of Goa.',
          highlights: ['Beach Activities', 'Water Sports', 'Nightlife', 'Portuguese Architecture', 'Seafood Cuisine']
        },
        'kerala-backwaters': {
          id: 'kerala-backwaters',
          title: 'Kerala Backwaters Experience',
          price: 18000,
          duration: '6 Days 5 Nights',
          image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
          description: 'Cruise through serene backwaters, stay in houseboats, and explore the natural beauty of Kerala.',
          highlights: ['Houseboat Stay', 'Backwater Cruise', 'Spice Plantations', 'Ayurvedic Treatments', 'Traditional Cuisine']
        },
        'Rann Utsav Gujarat - White Desert Festival Experience': {
          id: 'rann-utsav',
          title: 'Rann Utsav Gujarat - White Desert Festival Experience',
          price: 18500,
          duration: '4 Days / 3 Nights',
          image: '/Kutch-Rann-Utsav-2023-2024.jpg',
          description: 'Experience the magical White Desert festival with luxury Tent City accommodation, authentic Gujarati culture, and breathtaking desert landscapes.',
          highlights: ['Tent City accommodation', 'White Rann Sunset', 'Cultural performances', 'Camel safari', 'Kala Dungar']
        }
      };

      if (packageId && mockPackages[packageId]) {
        const pkg = mockPackages[packageId];
        setPackageData(pkg);
        trackInitiateCheckout(pkg.title, pkg.id, pkg.price);
      } else if (packageTitle) {
        // Fallback for direct URL access with query params
        const pkg = {
          id: 'custom-package',
          title: decodeURIComponent(packageTitle),
          price: packagePrice ? parseInt(packagePrice) : 0,
          duration: packageDuration ? decodeURIComponent(packageDuration) : 'Custom Duration',
          image: packageImage ? decodeURIComponent(packageImage) : '/placeholder.svg',
          description: `Custom package for ${packageDestination || packageTitle}`,
          highlights: ['Custom Itinerary', 'Flexible Dates', 'Personalized Service']
        };
        setPackageData(pkg);
      }
      
      setIsLoading(false);
    };

    fetchPackageData();
  }, [packageId, packageTitle, packagePrice, packageDuration]);

  const processBookingSubmission = async (bookingData: any) => {
    try {
      const payload = {
        ...bookingData,
        name: `${bookingData.firstName} ${bookingData.lastName}`,
        phone: bookingData.phone.replace(/\D/g, ''),
        package_interest: packageData?.title || '',
        destination: packageDestination || packageData?.title || '',
        type: 'booking'
      };

      await submitToGoogleSheets(payload);
      
      // --- SEND BOOKING CONFIRMATION EMAIL (via PHP Backend) ---
      fetch('/php-backend/quotes/send_confirmation.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bookingData.email,
          name: `${bookingData.firstName} ${bookingData.lastName}`,
          packageTitle: packageData?.title || 'Selected Package',
          type: 'booking',
          bookingId: payload.bookingId
        })
      }).then(r => {
        if (!r.ok) console.warn('Email function not available (status:', r.status, '). Email not sent.');
      }).catch(emailErr => {
        console.warn('Email function unreachable:', emailErr);
      });

      if (packageData) {
        trackPurchase(packageData.title, packageData.id, packageData.price, 'INR', {
          fn: bookingData.firstName,
          ln: bookingData.lastName,
          em: bookingData.email,
          ph: bookingData.phone,
          ct: bookingData.city,
          st: bookingData.state,
          zp: bookingData.pincode,
          country: 'in'
        });
      }

      setConfirmedBooking(bookingData);
      setBookingStep('confirmation');
      
      toast({
        title: "Booking Submitted! 🎉",
        description: "Please complete your payment to confirm your booking.",
      });
      
      window.scrollTo(0, 0);

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookingSubmit = async (bookingData: any) => {
     await processBookingSubmission(bookingData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Details copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="text-center mt-4 text-gray-600 font-medium">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const currentStep = bookingStep === 'details' ? 1 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Sticky Header with Progress */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full hover:bg-white/50 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </Button>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
                Complete Your Booking
              </h1>
            </div>

            {/* Modern Steps Indicator */}
            <div className="flex items-center">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="relative flex flex-col items-center group">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ease-out
                        ${isActive ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg shadow-orange-500/30 scale-110' : 
                          isCompleted ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-gray-100 text-gray-400 border border-gray-200'}
                      `}>
                        {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                      </div>
                      <span className={`
                        absolute -bottom-6 text-xs font-semibold whitespace-nowrap transition-colors duration-300
                        ${isActive ? 'text-indigo-900' : isCompleted ? 'text-green-600' : 'text-gray-400'}
                      `}>
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        w-12 h-0.5 mx-2 rounded-full transition-all duration-500
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {bookingStep === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                  <div className="bg-blue-100 p-3 rounded-xl shrink-0">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg">Secure Booking</h3>
                    <p className="text-blue-700 mt-1">Your details are protected by 256-bit SSL encryption. We never share your data.</p>
                  </div>
                </div>

                <BookingForm 
                  packageData={packageData || undefined}
                  onSubmit={handleBookingSubmit}
                />
              </div>

              {/* Right Column: Summary */}
              <div className="lg:col-span-4">
                <div className="sticky top-28 space-y-6">
                  <Card className="glass-card overflow-hidden border-0 ring-1 ring-white/40">
                    <div className="h-48 relative group">
                      {packageData?.image ? (
                        <OptimizedImage
                          src={packageData.image}
                          alt={packageData.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image Available</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <Badge className="bg-accent/90 backdrop-blur-md hover:bg-accent border-none mb-2 shadow-sm">
                          {packageData?.duration}
                        </Badge>
                        <h3 className="font-bold text-xl leading-tight shadow-sm">{packageData?.title || 'Selected Package'}</h3>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 space-y-6 bg-white/60 backdrop-blur-md">
                      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Price</p>
                          <p className="text-xs text-gray-400">(Inc. of all taxes)</p>
                        </div>
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                          ₹{packageData?.price?.toLocaleString() || 0}
                        </span>
                      </div>

                      {packageData?.highlights && (
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Package Includes</p>
                          <ul className="space-y-3">
                            {packageData.highlights.slice(0, 4).map((highlight, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-3 group">
                                <div className="mt-0.5 p-1 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="leading-snug font-medium">{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="bg-accent/5/80 rounded-xl p-4 border border-accent/20/50">
                        <div className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-accent mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-orange-900 text-sm">Best Price Guarantee*</p>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="text-[10px] font-medium text-accent underline hover:text-accent transition-colors cursor-pointer">
                                    T&C Apply
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-xl">
                                      <Award className="w-5 h-5 text-accent" />
                                      Best Price Guarantee
                                    </DialogTitle>
                                    <DialogDescription>
                                      We ensure you get the best deal. Here are the terms for our price match guarantee:
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 text-sm text-gray-600 mt-2">
                                    <div className="bg-accent/5 p-3 rounded-lg border border-accent/20">
                                      <p className="font-medium text-accent mb-1">Found a lower price?</p>
                                      <p>If you find a lower price for the exact same package, we will match it!</p>
                                    </div>
                                    <div className="space-y-3">
                                      <h4 className="font-semibold text-gray-900">Terms & Conditions:</h4>
                                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                        <li><strong>Identical Package:</strong> The competing offer must be for the same hotel(s), room category, dates, vehicle type, and inclusions.</li>
                                        <li><strong>Verifiable Quote:</strong> You must provide a formal written quote from a registered Indian travel agency (GST registered) on their official letterhead.</li>
                                        <li><strong>Booking Timing:</strong> The claim must be raised before or within 24 hours of your booking confirmation with us.</li>
                                        <li><strong>Exclusions:</strong> Prices involving errors, rebates, coupons, corporate discounts, or flash sales are excluded.</li>
                                        <li><strong>Verification:</strong> Ghumo Firoo Travels reserves the right to verify the authenticity of the competing offer.</li>
                                      </ul>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              </div>
                              <p className="text-xs text-accent mt-1">Found a lower price? We'll match it.</p>
                            </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="glass-card p-5 flex items-center gap-4 bg-white/60">
                    <div className="bg-green-100 p-3 rounded-full ring-4 ring-green-50">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Need help booking?</p>
                      <p className="font-bold text-gray-900 text-lg">+91 99109 87264</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {bookingStep !== 'details' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               <Card className="border-none shadow-2xl overflow-hidden">
                 <div className="bg-green-50 p-8 text-center border-b border-green-100">
                   <div className="bg-white p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
                     <CheckCircle className="w-12 h-12 text-green-500" />
                   </div>
                   <h2 className="text-3xl font-bold text-green-900 mb-2">Booking Request Received!</h2>
                   <p className="text-green-700 font-medium">
                     Reference ID: <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-800">{confirmedBooking?.bookingId || `BK${Date.now()}`}</span>
                   </p>
                   <p className="text-gray-600 mt-6 max-w-lg mx-auto leading-relaxed">
                     We've sent a confirmation email to <strong>{confirmedBooking?.email}</strong>. 
                     To finalize your reservation, please complete the payment using one of the options below.
                   </p>
                 </div>
                 
                 <div className="p-6 sm:p-8 bg-white space-y-6">
                    {/* Official Reservation Voucher Summary */}
                    <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-purple-800/40 relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-800/60 pb-4">
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 inline-block mb-1.5">
                            Official Travel Voucher Summary
                          </span>
                          <h3 className="text-xl font-extrabold text-white">
                            {(packageData?.title || 'Evoke Tent City Package').replace(/Rann Utsav Kutch/gi, 'Evoke Tent City Package')}
                          </h3>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Total Payable (All-Inclusive)</p>
                          <p className="text-2xl font-black text-amber-400">
                            ₹{(confirmedBooking?.totalAmount || packageData?.price || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                            <Calendar className="w-3.5 h-3.5" /> Travel Dates
                          </div>
                          <p className="text-slate-100 font-extrabold text-sm">
                            {confirmedBooking?.travelDate || (packageData as any)?.travelDate || 'Selected Dates'}
                          </p>
                          {(confirmedBooking?.returnDate || (packageData as any)?.returnDate) && (
                            <p className="text-slate-400 text-[11px]">
                              Return: {confirmedBooking?.returnDate || (packageData as any)?.returnDate}
                            </p>
                          )}
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 space-y-1">
                          <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                            <Users className="w-3.5 h-3.5" /> Passengers / Guests
                          </div>
                          <p className="text-slate-100 font-extrabold text-sm">
                            {confirmedBooking?.numberOfTravelers || 2} {Number(confirmedBooking?.numberOfTravelers) === 1 ? 'Guest' : 'Guests'}
                          </p>
                          <p className="text-slate-400 text-[11px] truncate">
                            {confirmedBooking?.firstName} {confirmedBooking?.lastName}
                          </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 space-y-1">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <Car className="w-3.5 h-3.5" /> Transport / Cab
                          </div>
                          <p className="text-slate-100 font-extrabold text-sm truncate">
                            {confirmedBooking?.cabType || (packageData as any)?.cabType || (packageData as any)?.selectedCabName || 'Swift Dzire (4-Seater)'}
                          </p>
                          <p className="text-emerald-300 text-[11px]">Chauffeur & DA Included</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 space-y-1">
                          <div className="flex items-center gap-1.5 text-pink-400 font-bold">
                            <Navigation className="w-3.5 h-3.5" /> Transfer Route
                          </div>
                          <p className="text-slate-100 font-extrabold text-xs leading-snug">
                            {confirmedBooking?.pickupLocation || (packageData as any)?.pickupLocation || 'Bhuj'} 
                            <span className="text-amber-400 mx-1">→</span> 
                            {confirmedBooking?.dropLocation || (packageData as any)?.dropLocation || 'Bhuj'}
                          </p>
                          <p className="text-slate-400 text-[11px]">Direct Doorstep Transfer</p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      Select Payment Method
                    </h3>
                   
                   <Tabs defaultValue="upi" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-gray-100 p-1 rounded-xl h-auto">
                        <TabsTrigger value="upi" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex gap-2">
                           <Smartphone className="w-4 h-4" /> UPI
                        </TabsTrigger>
                        <TabsTrigger value="neft" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex gap-2">
                           <Building className="w-4 h-4" /> Bank Transfer
                        </TabsTrigger>
                        <TabsTrigger value="razorpay" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex gap-2">
                           <CreditCard className="w-4 h-4" /> Razorpay
                        </TabsTrigger>
                         <TabsTrigger value="payu" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-600" /> PayU
                         </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upi" className="space-y-6 focus-visible:outline-none">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200 flex flex-col items-center text-center">
                          <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                           <div className="w-56 h-56 bg-white rounded-lg flex items-center justify-center relative overflow-hidden group shadow-sm border border-gray-100">
                             <img
                               src={upiQrSrc}
                               onError={() => setUpiQrSrc('/placeholder.svg')}
                               alt="Ghumo Firoo UPI Payment QR Code"
                               className="w-full h-full object-contain"
                             />
                           </div>
                           <div className="mt-2">
                             <a href={upiQrSrc} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">
                               Open QR in new tab
                             </a>
                           </div>
                          </div>
                          <h4 className="font-bold text-lg text-gray-900 mb-2">Scan & Pay</h4>
                          <p className="text-gray-500 mb-6 max-w-xs">Use Google Pay, PhonePe, Paytm or any UPI app to complete payment</p>
                          
                          <div className="flex items-center gap-3 bg-white pl-4 pr-2 py-2 rounded-xl border border-gray-200 shadow-sm w-full max-w-sm">
                            <span className="font-mono text-sm sm:text-lg font-bold text-blue-900 flex-1 text-left truncate">{ENV_UPI_ID}</span>
                            <Button variant="secondary" size="sm" onClick={() => copyToClipboard(ENV_UPI_ID)} className="hover:bg-blue-50 hover:text-blue-600 shrink-0">
                              <Copy className="w-4 h-4 mr-1" /> Copy
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="neft" className="space-y-6 focus-visible:outline-none">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                          <div className="grid gap-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4">
                              <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Account Name</span>
                              <span className="font-bold text-lg text-gray-900">Ghumo Firoo Travels</span>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4">
                              <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Bank Name</span>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-purple-600 rounded-sm flex items-center justify-center text-white text-[10px] font-bold">S</div>
                                <span className="font-bold text-lg text-gray-900">Slice Small Finance Bank Limited</span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4">
                              <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Account Number</span>
                              <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <span className="font-mono font-bold text-lg text-gray-900">033311501001651</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => copyToClipboard('033311501001651')}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">IFSC Code</span>
                              <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <span className="font-mono font-bold text-lg text-gray-900">NESF0000333</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => copyToClipboard('NESF0000333')}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                          ⚠️ Please share the transaction screenshot on WhatsApp after payment.
                        </p>
                      </TabsContent>
                      
                      <TabsContent value="razorpay" className="space-y-6 focus-visible:outline-none">
                        <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100 text-center max-w-lg mx-auto">
                          <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-12 mx-auto mb-6" />
                          <h4 className="text-xl font-bold text-gray-900 mb-2">Pay via Razorpay</h4>
                          <p className="text-gray-500 mb-4 max-w-md mx-auto">Supports Credit/Debit cards, Net Banking, and Wallets.</p>
                          
                          <div className="flex items-center space-x-2 bg-muted/40 p-3 rounded-lg border border-border/50 text-left my-4">
                            <Checkbox id="cc-charge-razorpay" checked={isCreditCard} onCheckedChange={(checked) => setIsCreditCard(!!checked)} />
                            <label htmlFor="cc-charge-razorpay" className="text-sm font-medium leading-none cursor-pointer select-none">
                              Paying with Credit Card (Adds 2.36% gateway fee)
                            </label>
                          </div>

                          {isCreditCard && (packageData?.price || 0) > 0 && (
                            <div className="bg-muted/30 p-3 rounded-lg text-left text-sm space-y-1.5 border border-border/40 mb-4">
                              <div className="flex justify-between text-muted-foreground">
                                <span>Base Amount:</span>
                                <span>₹{(packageData?.price || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Convenience Fee (2.36%):</span>
                                <span>₹{((packageData?.price || 0) * 0.0236).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-foreground border-t border-border/30 pt-1.5 mt-1.5">
                                <span>Total Payable:</span>
                                <span>₹{((packageData?.price || 0) * 1.0236).toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          <Button onClick={async () => {
                            try {
                               const basePrice = packageData?.price || 0;
                               const finalPrice = isCreditCard ? basePrice * 1.0236 : basePrice;
                               const amount = Math.round(finalPrice * 100);
                               const res = await fetch('/php-backend/payments/create_order.php', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ amount, currency: 'INR', receipt: `GF-${Date.now()}` })
                                });
                               if (!res.ok) {
                                 const errText = await res.text();
                                 console.error('Razorpay order error:', res.status, errText);
                                 throw new Error(`Payment server returned ${res.status}. Please try UPI or Bank Transfer.`);
                               }
                               const data = await res.json();
                               if (data.error) throw new Error(data.error === 'razorpay_not_configured' ? 'Razorpay is not configured on the server.' : data.error);
                               const { openRazorpayCheckout } = await import('@/lib/razorpay');
                               const result = await openRazorpayCheckout({
                                 order: data,
                                 name: 'Ghumo Firoo Travels',
                                 description: (packageData?.title || 'Booking Payment') + (isCreditCard ? ' (with 2.36% Card Fee)' : ''),
                                 prefill: {
                                   name: `${confirmedBooking?.firstName} ${confirmedBooking?.lastName}`,
                                   email: confirmedBooking?.email,
                                   contact: confirmedBooking?.phone
                                 }
                               });
                                await fetch('/php-backend/payments/verify.php', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    ...result,
                                    lead_id: confirmedBooking?.leadId || '',
                                    amount: finalPrice,
                                    remarks: (packageData?.title || 'Booking Payment') + (isCreditCard ? ' (Credit Card)' : ''),
                                    email: confirmedBooking?.email,
                                    phone: confirmedBooking?.phone
                                  })
                                });
                               navigate('/thank-you');
                            } catch (e: any) {
                               toast({ title: "Payment Error", description: e?.message || "Razorpay initiation failed. Please use UPI or Bank Transfer.", variant: "destructive" });
                            }
                          }} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-6 text-lg shadow-lg">
                            Pay with Razorpay
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="payu" className="space-y-6 focus-visible:outline-none">
                        <div className="bg-gradient-to-br from-emerald-500/5 to-background p-8 rounded-2xl border border-emerald-500/10 text-center max-w-lg mx-auto">
                          <img src="/payu-logo.svg" alt="PayU" className="h-10 mx-auto mb-6 object-contain" />
                          <h4 className="text-xl font-bold text-foreground mb-2">Pay via PayU</h4>
                          <p className="text-gray-500 mb-4 max-w-md mx-auto">Secure payment through PayU's reliable gateway.</p>
                          
                          <div className="flex items-center space-x-2 bg-white p-3.5 rounded-xl border border-emerald-300 text-left my-4 shadow-sm">
                            <Checkbox id="cc-charge-payu" checked={isCreditCard} onCheckedChange={(checked) => setIsCreditCard(!!checked)} />
                            <label htmlFor="cc-charge-payu" className="text-sm font-extrabold text-slate-900 leading-none cursor-pointer select-none">
                              Paying with Credit Card (Adds 2.36% gateway fee)
                            </label>
                          </div>

                          {isCreditCard && (packageData?.price || 0) > 0 && (
                            <div className="bg-muted/30 p-3 rounded-lg text-left text-sm space-y-1.5 border border-border/40 mb-4">
                              <div className="flex justify-between text-muted-foreground">
                                <span>Base Amount:</span>
                                <span>₹{(packageData?.price || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <span>Convenience Fee (2.36%):</span>
                                <span>₹{((packageData?.price || 0) * 0.0236).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-foreground border-t border-border/30 pt-1.5 mt-1.5">
                                <span>Total Payable:</span>
                                <span>₹{((packageData?.price || 0) * 1.0236).toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          <Button onClick={async () => {
                            try {
                              const basePrice = packageData?.price || 0;
                              const finalPrice = isCreditCard ? basePrice * 1.0236 : basePrice;
                              const res = await fetch('/php-backend/payu_generate_hash.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  amount: finalPrice.toFixed(2),
                                  productinfo: (packageData?.title || 'Booking Payment') + (isCreditCard ? ' (with 2.36% Card Fee)' : ''),
                                  firstname: confirmedBooking?.firstName,
                                  email: confirmedBooking?.email,
                                  phone: confirmedBooking?.phone,
                                  lead_id: confirmedBooking?.leadId || '',
                                  purpose: (packageData?.title || 'Booking Payment') + (isCreditCard ? ' (Credit Card)' : '')
                                })
                              });
                              if (!res.ok) {
                                const errText = await res.text();
                                let msg = 'PayU gateway is in setup mode. Please use Razorpay, UPI QR, or Bank Transfer.';
                                try {
                                  const errObj = JSON.parse(errText);
                                  if (errObj.error) msg = errObj.error;
                                } catch (e) {}
                                throw new Error(msg);
                              }
                              const payuData = await res.json();
                              if (payuData.error) throw new Error('PayU hash generation failed on server.');
                              const { initiatePayUPayment } = await import('@/lib/payu');
                              initiatePayUPayment(payuData);
                            } catch (e: any) {
                              toast({ title: "Payment Error", description: e?.message || "PayU initiation failed. Please use UPI or Bank Transfer.", variant: "destructive" });
                            }
                          }} className="bg-green-600 hover:bg-green-700 text-white w-full py-6 text-lg shadow-lg">
                            Pay with PayU
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                   
                   <Separator className="my-8" />
                   
                   <div className="flex justify-center">
                     <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-gray-50">
                       Return to Home
                     </Button>
                   </div>
                 </div>
               </Card>
            </div>
          )}
        </main>

      
    </div>
  );
};

export default Booking;
