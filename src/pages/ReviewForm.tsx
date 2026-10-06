import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { reviewService } from '@/services/reviewService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Upload, Video, Image as ImageIcon, Trash2, CheckCircle2, ChevronRight, AlertTriangle, ShieldCheck, Clock, ExternalLink, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';

interface BookingDetails {
  id: string;
  lead_id: string;
  customer_name: string;
  itinerary_name: string;
  destinations: string[];
  travel_start_date: string;
  travel_end_date: string;
  package_type: string;
}

interface ExistingReviewDetails {
  id: string;
  customer_name: string;
  rating: number;
  hotel_rating?: number;
  cab_rating?: number;
  sightseeing_rating?: number;
  trip_planning_rating?: number;
  review_text?: string;
  photos?: string[];
  video_url?: string | null;
  status: string;
  created_at: string;
  destination?: string;
  package_name?: string;
  response?: string | null;
}

const StarRatingInput: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  description?: string;
}> = ({ label, value, onChange, description }) => {
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  
  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-semibold text-slate-700">{label}</Label>
        {description && <span className="text-xs text-slate-400 italic">{description}</span>}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverVal(star)}
              onMouseLeave={() => setHoverVal(null)}
              className="p-1 transition-transform active:scale-95 focus:outline-none"
            >
              <Star
                className={`w-7 h-7 transition-all ${
                  star <= (hoverVal ?? value)
                    ? 'text-amber-500 fill-amber-500 scale-110 drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]'
                    : 'text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-sm font-bold text-slate-600 ml-1">
          {value > 0 ? `${value} / 5` : 'Rate'}
        </span>
      </div>
    </div>
  );
};

export default function ReviewForm() {
  const { bookingReference } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [ratings, setRatings] = useState({
    overall: 0,
    hotel: 0,
    cab: 0,
    sightseeing: 0,
    planning: 0
  });
  const [reviewText, setReviewText] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Upload states
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  // Success states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState<ExistingReviewDetails | null>(null);

  // Manual lookup & direct review states when URL has no reference
  const [manualRefInput, setManualRefInput] = useState('');
  const [isDirectReview, setIsDirectReview] = useState(false);
  const [customDestination, setCustomDestination] = useState('');

  const runVerifyBooking = async (ref: string) => {
    const cleanRef = ref?.trim();
    if (!cleanRef) {
      setErrorMsg("Please enter a valid booking reference or trip ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      let verifiedData: any = null;

        // Tier 1: Public PHP MySQL Verification Endpoint
        try {
          const res = await fetch(`/php-backend/verify_review_ref.php?ref=${encodeURIComponent(bookingReference)}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && data.is_valid) {
              verifiedData = data;
              if (data.already_reviewed && data.existing_review) {
                setAlreadyReviewed(true);
                setExistingReview(data.existing_review);
                if (Number(data.existing_review.rating) >= 4) {
                  setShowGooglePrompt(true);
                }
              }
            }
          }
        } catch (phpErr) {
          console.warn("Public PHP verification skipped:", phpErr);
        }

        // Tier 1.5: Supabase RPC Function Verification
        if (!verifiedData) {
          try {
            const { data, error } = await supabase.rpc('verify_itinerary_for_review', {
              booking_ref: bookingReference
            });
            if (!error && data && data.length > 0 && data[0].is_valid) {
              verifiedData = data[0];
            }
          } catch (rpcErr) {
            console.warn("RPC verification skipped:", rpcErr);
          }
        }

        // Tier 2: Direct Supabase Itineraries Table Lookup
        if (!verifiedData) {
          try {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingReference);
            const { data: supaIti } = isUuid
              ? await supabase.from('itineraries').select('*').or(`id.eq.${bookingReference},itinerary_code.eq.${bookingReference}`).maybeSingle()
              : await supabase.from('itineraries').select('*').eq('itinerary_code', bookingReference).maybeSingle();

            if (supaIti) {
              let dests: string[] = [];
              if (Array.isArray(supaIti.destinations)) {
                dests = supaIti.destinations.map((d: any) => typeof d === 'string' ? d : d?.city || d?.name || 'Destination');
              } else if (typeof supaIti.destinations === 'string') {
                try {
                  const parsed = JSON.parse(supaIti.destinations);
                  dests = Array.isArray(parsed) ? parsed.map((d: any) => typeof d === 'string' ? d : d?.city || d?.name || 'Destination') : [supaIti.destinations];
                } catch {
                  dests = [supaIti.destinations];
                }
              }

              verifiedData = {
                id: supaIti.id,
                lead_id: supaIti.lead_id || '',
                customer_name: supaIti.customer_name || supaIti.customerName || 'Valued Traveler',
                itinerary_name: supaIti.title || supaIti.itinerary_code || 'Tour Package',
                destinations: dests.length > 0 ? dests : ['India Tour'],
                travel_start_date: supaIti.travel_start_date || new Date().toISOString().split('T')[0],
                travel_end_date: supaIti.travel_end_date || new Date().toISOString().split('T')[0],
                package_type: 'domestic'
              };
            }
          } catch (supaErr) {
            console.warn("Supabase table lookup error:", supaErr);
          }
        }

        // Tier 3: MySQL API Endpoint Fallback Lookup
        if (!verifiedData) {
          try {
            const res = await fetch(`/php-backend/api.php?table=itineraries`);
            if (res.ok) {
              const cleanSuffix = bookingReference.replace(/[^a-zA-Z0-9]/g, '').replace(/^GFJITN/i, '');
              const found = (list || []).find((i: any) => 
                String(i.id) === String(bookingReference) || 
                String(i.itinerary_code) === String(bookingReference) ||
                String(i.lead_id) === String(bookingReference) ||
                (cleanSuffix.length >= 4 && String(i.id).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().startsWith(cleanSuffix.toLowerCase()))
              );
              if (found) {
                verifiedData = {
                  id: found.id,
                  lead_id: found.lead_id || '',
                  customer_name: found.customer_name || found.customerName || 'Valued Traveler',
                  itinerary_name: found.title || found.itinerary_code || 'Tour Package',
                  destinations: [found.destinations || 'India Tour'],
                  travel_start_date: found.travel_start_date || new Date().toISOString().split('T')[0],
                  travel_end_date: found.travel_end_date || new Date().toISOString().split('T')[0],
                  package_type: 'domestic'
                };
              }
            }
          } catch (mysqlErr) {
            console.warn("MySQL API lookup error:", mysqlErr);
          }
        }

        // Tier 4: Direct Reference Fallback for Active Booking IDs
        if (!verifiedData && bookingReference.length >= 6) {
          verifiedData = {
            id: bookingReference,
            lead_id: bookingReference,
            customer_name: 'Valued Traveler',
            itinerary_name: `Booking Ref #${bookingReference.slice(0, 8).toUpperCase()}`,
            destinations: ['Ghumo Firoo Journey'],
            travel_start_date: new Date().toISOString().split('T')[0],
            travel_end_date: new Date().toISOString().split('T')[0],
            package_type: 'domestic'
          };
        }

        if (verifiedData) {
          // If Tier 1 didn't flag an existing review, check /api/reviews as a secondary check
          if (!verifiedData.already_reviewed) {
            try {
              const chkRes = await fetch('/api/reviews');
              if (chkRes.ok) {
                const chkData = await chkRes.json();
                if (chkData && Array.isArray(chkData.reviews)) {
                  const bId = String(verifiedData.id || bookingReference).toLowerCase();
                  const lId = String(verifiedData.lead_id || '');
                  const cleanRef = bookingReference.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().replace(/^gfjitn/i, '');

                  const found = chkData.reviews.find((r: any) => {
                    const rBId = String(r.booking_id || '').toLowerCase();
                    const rLId = String(r.lead_id || '');
                    return (
                      (rBId && rBId === bId) ||
                      (cleanRef.length >= 4 && rBId.replace(/[^a-zA-Z0-9]/g, '').startsWith(cleanRef)) ||
                      (lId && rLId === lId)
                    );
                  });

                  if (found) {
                    setAlreadyReviewed(true);
                    setExistingReview(found);
                    if (Number(found.rating) >= 4) {
                      setShowGooglePrompt(true);
                    }
                  }
                }
              }
            } catch (eRev) {
              // Ignore background check failure
            }
          }

          const bookingData: BookingDetails = {
            id: verifiedData.id,
            lead_id: verifiedData.lead_id || '',
            customer_name: verifiedData.customer_name || 'Valued Traveler',
            itinerary_name: verifiedData.itinerary_name || 'Ghumo Firoo Tour',
            destinations: Array.isArray(verifiedData.destinations) ? verifiedData.destinations : [verifiedData.destinations || 'India'],
            travel_start_date: verifiedData.travel_start_date,
            travel_end_date: verifiedData.travel_end_date,
            package_type: verifiedData.package_type || 'domestic'
          };
          setBooking(bookingData);
          setCustomerName(bookingData.customer_name);
          setErrorMsg(null);
        } else {
          setErrorMsg("Booking reference not found. Please check your reference number.");
          setBooking(null);
        }
      } catch (err: any) {
        console.error("Error verifying booking:", err);
        setErrorMsg("Failed to verify booking reference due to a connection issue.");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (bookingReference) {
        runVerifyBooking(bookingReference);
      } else {
        setLoading(false);
      }
    }, [bookingReference]);
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingPhotos(true);
    const uploadedUrls: string[] = [...photoUrls];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch('/api/reviews/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${res.status}`);
        }
        
        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      } catch (err: any) {
        console.error("Photo upload error:", err);
        toast({
          title: "Upload failed",
          description: `Failed to upload image "${file.name}": ${err.message}`,
          variant: "destructive"
        });
      }
    }
    
    setPhotoUrls(uploadedUrls);
    setUploadingPhotos(false);
    if (uploadedUrls.length > photoUrls.length) {
      toast({
        title: "Images Uploaded",
        description: `Successfully uploaded ${uploadedUrls.length - photoUrls.length} photos.`
      });
    }
  };
  
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 25MB for safety)
    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "Video file too large",
        description: "Please upload a video file under 25 MB.",
        variant: "destructive"
      });
      return;
    }
    
    setUploadingVideo(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/reviews/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }
      
      const data = await res.json();
      if (data.url) {
        setVideoUrl(data.url);
        toast({
          title: "Video Uploaded",
          description: "Your trip video was uploaded successfully."
        });
      }
    } catch (err: any) {
      console.error("Video upload error:", err);
      toast({
        title: "Video upload failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setUploadingVideo(false);
    }
  };
  
  const removePhoto = (indexToRemove: number) => {
    setPhotoUrls(photoUrls.filter((_, idx) => idx !== indexToRemove));
  };
  
  const removeVideo = () => {
    setVideoUrl(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    
    // Check ratings
    if (ratings.overall === 0) {
      toast({
        title: "Overall Rating required",
        description: "Please specify an overall star rating for your trip.",
        variant: "destructive"
      });
      return;
    }
    if (ratings.hotel === 0 || ratings.cab === 0 || ratings.sightseeing === 0 || ratings.planning === 0) {
      toast({
        title: "Ratings required",
        description: "Please provide ratings for hotels, cabs, sightseeing, and trip planning.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        booking_id: booking.id,
        lead_id: booking.lead_id || null,
        destination: destDisplay,
        package_name: booking.itinerary_name,
        travel_date: booking.travel_end_date,
        rating: ratings.overall,
        hotel_rating: ratings.hotel,
        cab_rating: ratings.cab,
        sightseeing_rating: ratings.sightseeing,
        trip_planning_rating: ratings.planning,
        review_text: reviewText,
        photos: photoUrls,
        video_url: videoUrl,
        status: 'Pending' as 'Pending' | 'Approved' | 'Rejected',
        verified: true,
        featured: false
      };
      
      await reviewService.addReview({
        reviewer_name: customerName || 'Valued Traveler',
        rating: ratings.overall,
        review_text: reviewText,
        location: destDisplay,
        photos: photoUrls,
        verified: true,
        video_url: videoUrl,
        hotel_rating: ratings.hotel,
        cab_rating: ratings.cab,
        sightseeing_rating: ratings.sightseeing,
        trip_planning_rating: ratings.planning,
        booking_id: booking?.id || bookingReference || null,
        lead_id: booking?.lead_id || null,
        package_name: booking?.itinerary_name || 'Custom Package',
        review_date: booking?.travel_end_date || new Date().toISOString()
      });
      
      setIsSubmitted(true);
      
      // Determine if they qualify for Google Review prompting
      if (ratings.overall >= 4) {
        setShowGooglePrompt(true);
      }
      
      toast({
        title: "Review Submitted",
        description: "Thank you! Your review has been submitted for admin approval.",
      });
      
    } catch (err: any) {
      console.error("Error submitting review:", err);
      toast({
        title: "Submission failed",
        description: err.message || "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleReviewRedirect = () => {
    // Save flag to localStorage to prevent bothering them again
    localStorage.setItem(`reviewed_on_google_for_${bookingReference}`, 'true');
    window.open("https://search.google.com/local/writereview?placeid=ChIJmRCMB27iDDkR0UyN2wppQYQ", "_blank");
    navigate('/');
  };
  
  if (loading && !isSubmitted) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
          <div className="glass-card p-8 rounded-2xl shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
            <p className="text-slate-600 font-semibold">Verifying your booking reference...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!bookingReference && !booking && !isDirectReview) {
    return (
      <Layout>
        <SEO title="Submit a Trip Review | Ghumo Firoo Journeys" description="Share your travel review with Ghumo Firoo" />
        <div className="py-16 min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-b from-[#050A18] via-[#0B1026] to-[#0D1536]">
          <Card className="max-w-lg w-full bg-[#151D3B]/95 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-white">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500/20 to-amber-500/40 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/40 shadow-inner">
                <Star className="w-8 h-8 fill-amber-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">Share Your Experience</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2">
                Help fellow travelers by sharing your thoughts on hotel stays, cab services, sightseeing, and tour planning.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualRefInput.trim()) {
                  runVerifyBooking(manualRefInput.trim());
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2 text-left">
                <Label htmlFor="manualRef" className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Have a Booking ID or Trip Ref?
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="manualRef"
                    value={manualRefInput}
                    onChange={(e) => setManualRefInput(e.target.value)}
                    placeholder="e.g. GFJ-..., or Lead ID"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl"
                  />
                  <Button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 rounded-xl whitespace-nowrap"
                  >
                    Verify Trip
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400">Found on your booking confirmation voucher or quote.</p>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#151D3B] px-3 text-slate-400 font-semibold">Or</span></div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  setIsDirectReview(true);
                  setBooking({
                    id: 'traveler-' + Date.now(),
                    lead_id: '',
                    customer_name: '',
                    itinerary_name: 'Custom Tour Experience',
                    destinations: [],
                    travel_start_date: new Date().toISOString().split('T')[0],
                    travel_end_date: new Date().toISOString().split('T')[0],
                    package_type: 'custom'
                  });
                  setCustomerName('');
                }}
                variant="outline"
                className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/10 rounded-xl py-6 font-semibold"
              >
                Write an Open Traveler Review
              </Button>
            </form>
          </Card>
        </div>
      </Layout>
    );
  }

  if (errorMsg) {
    return (
      <Layout>
        <SEO title="Trip Review | Ghumo Firoo" description="Submit your trip review" />
        <div className="min-h-[70vh] flex items-center justify-center px-4 bg-slate-50">
          <Card className="max-w-md w-full border-red-100 shadow-xl bg-white/80 backdrop-blur-md">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">Verification Notice</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-slate-600 leading-relaxed">{errorMsg}</p>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => {
                    setErrorMsg(null);
                    setBooking(null);
                    setIsDirectReview(false);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl"
                >
                  Enter Another Booking ID
                </Button>
                <Button
                  onClick={() => {
                    setErrorMsg(null);
                    setIsDirectReview(true);
                    setBooking({
                      id: 'traveler-' + Date.now(),
                      lead_id: '',
                      customer_name: '',
                      itinerary_name: 'Custom Tour Experience',
                      destinations: [],
                      travel_start_date: new Date().toISOString().split('T')[0],
                      travel_end_date: new Date().toISOString().split('T')[0],
                      package_type: 'custom'
                    });
                  }}
                  variant="outline"
                  className="rounded-xl border-slate-300"
                >
                  Write Open Review Instead
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
              <Button onClick={() => navigate('/')} variant="ghost" className="text-slate-600 text-xs">
                Back to Homepage
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }
  
  if (isSubmitted) {
    return (
      <Layout>
        <SEO title="Thank You for Your Review | Ghumo Firoo" description="Feedback submitted successfully" />
        <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-blue-50/50">
          <Card className="max-w-lg w-full border-accent/20 shadow-2xl bg-white/95 backdrop-blur-lg rounded-2xl p-4 overflow-hidden">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-md animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                Review Submitted!
              </CardTitle>
              <CardDescription className="text-base text-slate-600 mt-2 font-medium">
                Thank you for sharing your experience with Ghumo Firoo Travels.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-accent/5/70 border border-accent/20 rounded-xl p-5 text-center">
                <p className="text-slate-700 font-medium mb-3 leading-relaxed">
                  Your feedback helps us continuously improve our services and design perfect itineraries for future travelers.
                </p>
                <div className="text-slate-500 text-xs italic">
                  Note: Your review will be published on the website once approved by our moderation team.
                </div>
              </div>
              
              {showGooglePrompt && (
                <div className="border border-indigo-100 bg-indigo-50/30 rounded-xl p-5 text-center">
                  <div className="flex justify-center mb-2">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h4 className="font-bold text-indigo-900 text-lg mb-1">Mind sharing on Google too?</h4>
                  <p className="text-indigo-950 text-sm mb-4 leading-relaxed">
                    Since you rated us <strong>{ratings.overall}★</strong>, it would mean the world to us if you could post your review on Google. It helps us grow!
                  </p>
                  <Button 
                    onClick={handleGoogleReviewRedirect}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-95"
                  >
                    Review Us On Google
                  </Button>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-center border-t border-slate-100 pt-6">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl py-6"
              >
                Go to Homepage
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  if (alreadyReviewed && existingReview) {
    const isApproved = String(existingReview.status).toLowerCase() === 'approved';
    const displayPhotos = Array.isArray(existingReview.photos) ? existingReview.photos : [];

    return (
      <Layout>
        <SEO 
          title="Review Status | Ghumo Firoo Journeys" 
          description="View your submitted travel review and current moderation status." 
        />
        <div className="py-12 bg-gradient-to-b from-slate-50 via-orange-50/20 to-slate-50 min-h-[85vh] px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
              {/* Header Status Bar */}
              <div className={`px-6 py-4 flex justify-between items-center text-white ${
                isApproved 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {isApproved ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span>Review Approved & Published</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 text-white animate-pulse" />
                      <span>Review Received — Under Moderation</span>
                    </>
                  )}
                </div>
                <span className="bg-white/20 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                  ✓ Verified Booking
                </span>
              </div>

              <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Booking Reference</span>
                    <h2 className="text-xl font-extrabold text-slate-800">{bookingReference}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Submitted On</span>
                    <p className="text-sm font-semibold text-slate-700">
                      {existingReview.created_at ? new Date(existingReview.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Recent'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-200/80 flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs uppercase font-semibold">Traveler:</span>
                    <strong className="text-slate-900">{existingReview.customer_name || customerName || 'Valued Traveler'}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs uppercase font-semibold">Package:</span>
                    <strong className="text-slate-900">{existingReview.package_name || booking?.itinerary_name || 'Tour Package'}</strong>
                  </div>
                  {existingReview.destination && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs uppercase font-semibold">Destination:</span>
                      <strong className="text-slate-900">{existingReview.destination}</strong>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Moderation message */}
                <div className={`p-4 rounded-xl border ${
                  isApproved
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">
                    {isApproved
                      ? 'Your review has been verified and published! It is now visible to travelers across our website.'
                      : 'You have already submitted your review for this trip. Our team is verifying your feedback, and it will be visible on the website once approved.'}
                  </p>
                </div>

                {/* Star Ratings Display */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Your Trip Rating</h3>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs text-slate-500 font-semibold uppercase">Overall Experience</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-6 h-6 ${
                                  star <= Number(existingReview.rating)
                                    ? 'text-amber-500 fill-amber-500 drop-shadow-sm'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-extrabold text-slate-800 ml-1">
                            {existingReview.rating} / 5
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/80 text-xs">
                      {existingReview.hotel_rating ? (
                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100">
                          <span className="text-slate-600 font-medium">Hotel:</span>
                          <span className="font-bold text-amber-600 flex items-center gap-1">
                            {existingReview.hotel_rating} <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                          </span>
                        </div>
                      ) : null}
                      {existingReview.cab_rating ? (
                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100">
                          <span className="text-slate-600 font-medium">Cab & Transport:</span>
                          <span className="font-bold text-amber-600 flex items-center gap-1">
                            {existingReview.cab_rating} <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                          </span>
                        </div>
                      ) : null}
                      {existingReview.sightseeing_rating ? (
                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100">
                          <span className="text-slate-600 font-medium">Sightseeing:</span>
                          <span className="font-bold text-amber-600 flex items-center gap-1">
                            {existingReview.sightseeing_rating} <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                          </span>
                        </div>
                      ) : null}
                      {existingReview.trip_planning_rating ? (
                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100">
                          <span className="text-slate-600 font-medium">Planning & Support:</span>
                          <span className="font-bold text-amber-600 flex items-center gap-1">
                            {existingReview.trip_planning_rating} <Star className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                {existingReview.review_text && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Your Feedback</h3>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-slate-800 text-sm leading-relaxed italic relative">
                      <span className="text-3xl text-slate-300 font-serif absolute top-2 left-3 leading-none">“</span>
                      <p className="relative pl-4 whitespace-pre-wrap">{existingReview.review_text}</p>
                    </div>
                  </div>
                )}

                {/* Photos if any */}
                {displayPhotos.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Submitted Photos</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {displayPhotos.map((pUrl: string, pIdx: number) => (
                        <div key={pIdx} className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                          <img 
                            src={pUrl} 
                            alt={`Review photo ${pIdx + 1}`} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin response if any */}
                {existingReview.response && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Response from Ghumo Firoo</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{existingReview.response}</p>
                  </div>
                )}

                {/* Google Review Prompt for satisfied travelers (>= 4 stars) */}
                {Number(existingReview.rating) >= 4 && (
                  <div className="border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 rounded-2xl p-6 text-center space-y-3 shadow-sm">
                    <div className="flex justify-center">
                      <span className="text-3xl">✨</span>
                    </div>
                    <h4 className="font-extrabold text-indigo-950 text-lg">Mind sharing on Google too?</h4>
                    <p className="text-indigo-900 text-sm max-w-md mx-auto leading-relaxed">
                      Since you had a memorable {existingReview.rating}★ journey, it would mean the world to our team if you could post your review on our Google Business Profile. It takes just 30 seconds!
                    </p>
                    <Button
                      onClick={handleGoogleReviewRedirect}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mx-auto"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      Review Us On Google
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full sm:w-1/2 border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl py-5"
                >
                  Go to Homepage
                </Button>
                <Button
                  onClick={() => navigate('/packages')}
                  className="w-full sm:w-1/2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-5"
                >
                  Explore More Journeys
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }
  
  const destDisplay = customDestination.trim() || (booking?.destinations && booking.destinations.length > 0 ? booking.destinations.join(', ') : 'Ghumo Firoo Journey');
  
  return (
    <Layout>
      <SEO 
        title={`Review Your Trip to ${destDisplay} | Ghumo Firoo Travels`} 
        description={`Submit review for booking ref ${bookingReference || booking?.id || 'Ghumo Firoo Trip'}`}
      />
      <div className="py-12 bg-gradient-to-b from-slate-50 via-orange-50/20 to-slate-50 min-h-screen px-4">
        <div className="max-w-2xl mx-auto">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Share Your <span className="text-accent">Travel Story</span>
            </h1>
            <p className="text-slate-600 mt-2">
              Help us craft better journeys by reviewing your recent trip details.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
              {/* Top Banner showing verified traveler badge */}
              <div className="bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs uppercase tracking-wider font-extrabold opacity-90">Booking verified</span>
                </div>
                <span className="bg-white/20 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                  ✓ Verified Traveler
                </span>
              </div>
              
              <CardHeader className="space-y-2 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xl font-bold text-slate-800">
                  Trip Reference: {bookingReference || (isDirectReview ? 'Open Traveler Review' : booking?.id)}
                </CardTitle>
                <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">Destination</span>
                    <span className="font-semibold text-slate-700">{destDisplay}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">Package</span>
                    <span className="font-semibold text-slate-700">{booking?.itinerary_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">Travel Date</span>
                    <span className="font-semibold text-slate-700">
                      {booking && new Date(booking.travel_end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">Trip Type</span>
                    <span className="font-semibold text-slate-700 capitalize">{booking?.package_type || 'Custom'}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                {/* Destination Visited (for open review or when not preset) */}
                {(isDirectReview || !booking?.destinations || booking.destinations.length === 0) && (
                  <div className="space-y-2">
                    <Label htmlFor="customDestination" className="font-bold text-slate-900 text-sm">Destination Visited</Label>
                    <Input 
                      id="customDestination" 
                      value={customDestination} 
                      onChange={(e) => setCustomDestination(e.target.value)} 
                      placeholder="e.g. Jodhpur, Rajasthan or Kerala Backwaters"
                      required
                      className="rounded-xl border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:border-amber-500 py-6 text-sm"
                    />
                    <p className="text-xs text-slate-500 font-medium">Where did your journey take place?</p>
                  </div>
                )}

                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="font-bold text-slate-900 text-sm">Your Name (Display Name)</Label>
                  <Input 
                    autoComplete="name" 
                    id="customerName" 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                    placeholder="Enter your display name..."
                    required
                    className="rounded-xl border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:border-amber-500 py-6 text-sm"
                  />
                  <p className="text-xs text-slate-500 font-medium">This name will be displayed alongside your review on our website.</p>
                </div>
                
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2">
                    <span className="text-amber-500 text-xl">★</span> How would you rate your trip?
                  </h3>
                  
                  {/* Rating fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <StarRatingInput 
                        label="Overall Experience" 
                        value={ratings.overall} 
                        onChange={(val) => setRatings({...ratings, overall: val})} 
                        description="Your main rating"
                      />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <StarRatingInput 
                        label="Hotel Accommodations" 
                        value={ratings.hotel} 
                        onChange={(val) => setRatings({...ratings, hotel: val})} 
                        description="Comfort & Services"
                      />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <StarRatingInput 
                        label="Cab & Transport" 
                        value={ratings.cab} 
                        onChange={(val) => setRatings({...ratings, cab: val})} 
                        description="Driver, Vehicle & Timing"
                      />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <StarRatingInput 
                        label="Sightseeing & Activities" 
                        value={ratings.sightseeing} 
                        onChange={(val) => setRatings({...ratings, sightseeing: val})} 
                        description="Guides, Attractions & Pace"
                      />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 md:col-span-2">
                      <StarRatingInput 
                        label="Trip Planning & Support" 
                        value={ratings.planning} 
                        onChange={(val) => setRatings({...ratings, planning: val})} 
                        description="Ghumo Firoo coordination"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Review Text */}
                <div className="space-y-2 border-t border-slate-100 pt-6">
                  <Label htmlFor="reviewText" className="font-bold text-slate-900 text-sm block text-left">Write Your Review</Label>
                  <Textarea 
                    id="reviewText" 
                    value={reviewText} 
                    onChange={(e) => setReviewText(e.target.value)} 
                    placeholder="Tell us about the highlights of your trip, the service quality, local attractions, hotel stays, or driver experience..."
                    required
                    rows={5}
                    className="rounded-xl border-slate-300 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:border-amber-500 focus:ring-amber-500 resize-none leading-relaxed text-sm p-4"
                  />
                  <p className="text-xs text-slate-500 font-medium text-left">Your review text will be displayed publicly on package pages after moderation.</p>
                </div>
                
                {/* Photo Upload */}
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div>
                    <Label className="font-semibold text-slate-700 block mb-1">Add Trip Photos</Label>
                    <span className="text-xs text-slate-400 block mb-3">Upload your favorite scenic views, hotel stays, or group activities (Max 5 photos).</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Thumbnail previews */}
                    {photoUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                        <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 shadow transition-opacity focus:outline-none"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    {photoUrls.length < 5 && (
                      <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-accent/40 hover:bg-accent/10/10 cursor-pointer transition-colors bg-slate-50/50">
                        <div className="flex flex-col items-center text-center p-3">
                          <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-xs font-semibold text-slate-500">Upload Photo</span>
                          {uploadingPhotos && <span className="text-[10px] text-accent mt-1 animate-pulse">Uploading...</span>}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhotos}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                {/* Video Upload */}
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div>
                    <Label className="font-semibold text-slate-700 block mb-1">Add Trip Video (Optional)</Label>
                    <span className="text-xs text-slate-400 block mb-3">Share a short clip of your travel experience (MP4 or WebM, Max 40 MB).</span>
                  </div>
                  
                  {videoUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video max-w-sm">
                      <video src={videoUrl} controls className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 shadow transition-opacity focus:outline-none z-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-accent/40 hover:bg-accent/10/10 cursor-pointer transition-colors bg-slate-50/50 max-w-sm">
                      <div className="flex items-center gap-3">
                        <Video className="w-6 h-6 text-slate-400" />
                        <div className="text-left">
                          <span className="text-sm font-semibold text-slate-600 block">Upload Video Clip</span>
                          <span className="text-xs text-slate-400">Select file...</span>
                        </div>
                        {uploadingVideo && <span className="text-xs text-accent animate-pulse ml-2">Uploading...</span>}
                      </div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        disabled={uploadingVideo}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col gap-4">
                <Button 
                  type="submit" 
                  disabled={loading || uploadingPhotos || uploadingVideo}
                  className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-6 rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting Review...' : 'Submit Feedback'}
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <div className="text-center text-xs text-slate-400">
                  By submitting, you verify that you were a passenger on this itinerary and authorize Ghumo Firoo to display this review on our website.
                </div>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </Layout>
  );
}
