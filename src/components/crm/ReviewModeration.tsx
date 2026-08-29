import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { reviewService } from '@/services/reviewService';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Check, X, Trash2, Mail, ExternalLink, Calendar, MapPin, Award, AlertCircle, FileVideo, Copy, Search, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  booking_id: string;
  lead_id: string;
  customer_name: string;
  destination: string;
  package_name: string;
  travel_date: string;
  rating: number;
  hotel_rating: number;
  cab_rating: number;
  sightseeing_rating: number;
  trip_planning_rating: number;
  review_text: string;
  photos: string[];
  video_url: string | null;
  verified: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  featured: boolean;
  created_at: string;
}

export default function ReviewModeration() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Action state
  const [sendingEmails, setSendingEmails] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  // Itineraries state (for review link retrieval)
  const [completedItineraries, setCompletedItineraries] = useState<any[]>([]);
  const [itinerariesLoading, setItinerariesLoading] = useState(false);
  const [itinerarySearchTerm, setItinerarySearchTerm] = useState<string>('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/reviews.php`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews((data.reviews || []) as Review[]);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      toast({
        title: "Error fetching reviews",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedItineraries = async () => {
    try {
      setItinerariesLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE}/itineraries_list.php`, { headers });
      if (!res.ok) throw new Error("Failed to fetch itineraries");
      const data = await res.json();
      setCompletedItineraries(data.itineraries || []);
    } catch (err: any) {
      console.error("Error fetching itineraries:", err);
      toast({
        title: "Error loading bookings",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setItinerariesLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchCompletedItineraries();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await reviewService.updateReview(id, { status: newStatus });
      
      setReviews(reviews.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast({
        title: `Review ${newStatus}`,
        description: `Review status has been updated to ${newStatus}.`
      });
    } catch (err: any) {
      console.error("Error updating review status:", err);
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    const nextFeatured = !currentFeatured;
    try {
      await reviewService.updateReview(id, { featured: nextFeatured });
      
      setReviews(reviews.map(r => r.id === id ? { ...r, featured: nextFeatured } : r));
      toast({
        title: nextFeatured ? "Marked as Featured" : "Removed from Featured",
        description: nextFeatured ? "This review will now appear on the homepage." : "This review will no longer be featured on the homepage."
      });
    } catch (err: any) {
      console.error("Error toggling featured:", err);
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    
    try {
      await reviewService.deleteReview(id);
      
      setReviews(reviews.filter(r => r.id !== id));
      toast({
        title: "Review Deleted",
        description: "The review has been deleted permanently."
      });
    } catch (err: any) {
      console.error("Error deleting review:", err);
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const triggerInvitationEmails = async () => {
    setSendingEmails(true);
    try {
      // Supabase Edge Function — stays on Supabase permanently
      // No MySQL/PHP equivalent for serverless email scanning
      const { data, error } = await supabase.functions.invoke('send-review-requests', {
        method: 'POST'
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        toast({
          title: "Invitation Emails Sent",
          description: `Successfully sent ${data.count} review requests out of ${data.total} pending trips.`
        });
        // Refresh itineraries to update sent status
        fetchCompletedItineraries();
      } else {
        throw new Error(data?.error || "Failed to trigger email scanner");
      }
    } catch (err: any) {
      console.error("Error sending review requests:", err);
      toast({
        title: "Failed to send requests",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setSendingEmails(false);
    }
  };

  const copyReviewLink = (code: string | null, id: string) => {
    const ref = code || id;
    const link = `${window.location.origin}/review/${ref}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: `Review link for booking "${ref}" has been copied to your clipboard.`
    });
  };

  const filteredReviews = reviews.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesFeatured = filterFeatured === 'all' || 
      (filterFeatured === 'featured' && r.featured) || 
      (filterFeatured === 'standard' && !r.featured);
    const matchesSearch = r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.review_text && r.review_text.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesStatus && matchesFeatured && matchesSearch;
  });

  const parseDestinationsText = (raw: any): string => {
    if (!raw) return 'Custom Tour';
    let val = raw;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          val = JSON.parse(trimmed);
        } catch {
          return val;
        }
      } else {
        return val;
      }
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return 'Custom Package';
      const items = val.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
          return item.DESTINATION || item.destination || item.city || item.name || item.STATE || item.state || item.COUNTRY || item.country || '';
        }
        return String(item);
      }).filter(Boolean);
      return items.length > 0 ? items.join(', ') : 'Custom Package';
    }

    if (typeof val === 'object' && val !== null) {
      return val.DESTINATION || val.destination || val.city || val.name || val.STATE || val.state || val.COUNTRY || 'Custom Package';
    }

    return String(val);
  };

  const filteredItineraries = completedItineraries.filter(itin => {
    const destinationsList = parseDestinationsText(itin.destinations);
    const q = itinerarySearchTerm.toLowerCase();
    const cName = (itin.customer_name || itin.customerName || itin.client_name || itin.lead_name || '').toLowerCase();
    const cContact = (itin.customer_email || itin.customer_phone || itin.email || itin.phone || itin.contact_number || '').toLowerCase();
    const code = (itin.itinerary_code || String(itin.id)).toLowerCase();

    return cName.includes(q) || cContact.includes(q) || destinationsList.toLowerCase().includes(q) || code.includes(q);
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${
              i < rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'
            }`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left font-poppins pb-12">
      {/* Media Lightbox */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            {selectedMedia.includes('.mp4') || selectedMedia.includes('.webm') ? (
              <video src={selectedMedia} controls autoPlay className="max-w-full max-h-[80vh] object-contain" />
            ) : (
              <img src={selectedMedia} alt="Preview" className="max-w-full max-h-[80vh] object-contain" />
            )}
            <button 
              className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-2 hover:bg-white/40 focus:outline-none"
              onClick={() => setSelectedMedia(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#0B1026] via-[#1E2942] to-[#0B1026] p-6 rounded-2xl border border-white/10 text-white shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Post-Trip Reputation & Review Hub
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-montserrat">
            Traveler Review Moderation & Invites
          </h1>
          <p className="text-xs text-slate-300">
            Moderate traveler ratings, trigger 1-click WhatsApp review links, and feature 5-star testimonials on your homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={triggerInvitationEmails}
            disabled={sendingEmails}
            className="bg-gradient-warm hover:scale-105 text-[#0B1026] font-bold text-xs h-11 px-5 rounded-xl shadow-lg flex items-center gap-2 border-0 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            {sendingEmails ? 'Scanning & Sending...' : 'Trigger Email Review Invites'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="moderation" className="w-full space-y-6">
        <TabsList className="bg-white/5 border border-white/15 p-1 rounded-xl w-fit">
          <TabsTrigger value="moderation" className="rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 shadow-sm">
            Submitted Reviews ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="links" className="rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 shadow-sm">
            WhatsApp & Booking Review Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-6 focus-visible:ring-0 focus-visible:outline-none">
          {/* Moderation Controls Card */}
          <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-2xl rounded-2xl p-5">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Search reviews by traveler name, destination, package, or feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl bg-white/5 border-white/15 text-white placeholder:text-slate-400 py-5 text-xs focus-visible:ring-amber-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {/* Status Filters */}
                <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
                  {['all', 'pending', 'approved', 'rejected'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                        filterStatus === status 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                
                {/* Featured Filters */}
                <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
                  {['all', 'featured', 'standard'].map((feat) => (
                    <button
                      key={feat}
                      onClick={() => setFilterFeatured(feat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                        filterFeatured === feat 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {feat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Reviews list */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 font-bold space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
              <p>Loading traveler reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <Card className="text-center p-12 border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-xl rounded-2xl">
              <CardContent className="space-y-3">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">No reviews found</h3>
                <p className="text-slate-400 text-xs">No traveler reviews matched your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredReviews.map((review) => (
                <Card 
                  key={review.id} 
                  className={`border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${
                    review.status === 'Pending' ? 'border-l-4 border-l-amber-500' :
                    review.status === 'Approved' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-4 gap-6">
                      {/* Left Column: Traveler Info */}
                      <div className="md:col-span-1 space-y-3 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 pr-0 md:pr-4">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-white text-lg flex items-center gap-1.5">
                            {review.customer_name}
                            {review.verified && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                ✓ Verified
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">Created: {new Date(review.created_at).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="space-y-2 text-xs text-slate-300 font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="font-bold text-white">{review.destination}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="font-medium text-slate-200 truncate" title={review.package_name}>{review.package_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-300">
                              {new Date(review.travel_date).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-1.5">
                          <Badge className={
                            review.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                            review.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                            'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }>
                            {review.status}
                          </Badge>
                          {review.featured && (
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 flex items-center gap-1">
                              ★ Featured on Website
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Middle Column: Ratings & Text */}
                      <div className="md:col-span-2 space-y-4">
                        {/* Overall & Sub-Ratings */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center bg-white/5 p-3 rounded-xl border border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-extrabold">Overall Score:</span>
                            {renderStars(review.rating)}
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-slate-300 w-full mt-2 pt-2 border-t border-white/10">
                            <div>Hotels: <span className="font-bold text-amber-400">{review.hotel_rating || 5}★</span></div>
                            <div>Cab/Driver: <span className="font-bold text-amber-400">{review.cab_rating || 5}★</span></div>
                            <div>Sightseeing: <span className="font-bold text-amber-400">{review.sightseeing_rating || 5}★</span></div>
                            <div>Agent Support: <span className="font-bold text-amber-400">{review.trip_planning_rating || 5}★</span></div>
                          </div>
                        </div>

                        {/* Review text */}
                        <p className="text-slate-200 leading-relaxed italic bg-white/5 border border-white/10 p-4 rounded-xl font-serif text-sm">
                          "{review.review_text || 'No review text provided.'}"
                        </p>

                        {/* High Rating Google Business Prompt Callout */}
                        {review.rating >= 4 && (
                          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                            <span className="font-semibold">🌟 High Rating ({review.rating} Stars)! Invite to post on Google Business Profile:</span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                const gUrl = "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID";
                                window.open(gUrl, '_blank');
                              }}
                              className="h-7 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg border border-emerald-500/40"
                            >
                              Google Review Link ↗
                            </Button>
                          </div>
                        )}

                        {/* Image / Video Attachment Gallery */}
                        {((review.photos && review.photos.length > 0) || review.video_url) && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-xs font-semibold text-slate-400 block">Uploaded Photos & Video:</span>
                            <div className="flex flex-wrap gap-2">
                              {review.photos?.map((photo, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => setSelectedMedia(photo)}
                                  className="w-14 h-14 rounded-lg overflow-hidden border border-white/15 bg-white/5 cursor-pointer hover:scale-105 transition-transform"
                                >
                                  <img src={photo} alt={`Attached ${idx}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                              
                              {review.video_url && (
                                <div 
                                  onClick={() => setSelectedMedia(review.video_url)}
                                  className="w-14 h-14 rounded-lg overflow-hidden border border-cyan-500/40 bg-cyan-500/20 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center text-cyan-300"
                                  title="Click to play video"
                                >
                                  <FileVideo className="w-6 h-6" />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Moderation Actions */}
                      <div className="md:col-span-1 flex flex-col justify-between gap-4 md:border-l border-white/10 pl-0 md:pl-4">
                        <div className="space-y-2">
                          <span className="text-xs font-extrabold text-slate-400 block uppercase tracking-wider mb-2">Moderation Actions</span>
                          
                          {review.status !== 'Approved' && (
                            <Button
                              onClick={() => handleUpdateStatus(review.id, 'Approved')}
                              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center justify-center gap-1.5 rounded-xl text-xs py-5 border-0 cursor-pointer"
                            >
                              <Check className="w-4 h-4" /> Approve Review
                            </Button>
                          )}
                          
                          {review.status !== 'Rejected' && (
                            <Button
                              onClick={() => handleUpdateStatus(review.id, 'Rejected')}
                              variant="outline"
                              className="w-full border-rose-500/40 text-rose-300 hover:bg-rose-500/20 font-bold flex items-center justify-center gap-1.5 rounded-xl text-xs py-5 cursor-pointer"
                            >
                              <X className="w-4 h-4" /> Reject Review
                            </Button>
                          )}
                          
                          {review.status === 'Approved' && (
                            <Button
                              onClick={() => handleToggleFeatured(review.id, review.featured)}
                              variant="outline"
                              className={`w-full font-bold flex items-center justify-center gap-1.5 rounded-xl text-xs py-5 cursor-pointer ${
                                review.featured 
                                  ? 'border-purple-500/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
                                  : 'border-white/15 text-slate-300 hover:bg-white/10'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${review.featured ? 'fill-purple-400 text-purple-400' : 'text-slate-400'}`} />
                              {review.featured ? 'Remove Featured' : '★ Feature on Home'}
                            </Button>
                          )}
                        </div>
                        
                        <div className="border-t border-white/10 pt-3">
                          <Button
                            onClick={() => handleDeleteReview(review.id)}
                            variant="ghost"
                            className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 flex items-center justify-center gap-1.5 rounded-xl text-xs cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="links" className="space-y-6 focus-visible:ring-0 focus-visible:outline-none">
          <Card className="border-white/10 bg-[#1A2342]/60 text-white backdrop-blur-xl shadow-2xl rounded-2xl p-6">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="text-xl font-extrabold text-white">Traveler Bookings & Direct Review Invites</CardTitle>
              <CardDescription className="text-xs text-slate-300">
                Search completed or confirmed trips and send direct 1-click review invites to clients via WhatsApp or Email.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex gap-4 items-center mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search bookings by customer name, email, or destination..."
                    value={itinerarySearchTerm}
                    onChange={(e) => setItinerarySearchTerm(e.target.value)}
                    className="pl-10 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-slate-400 py-5 text-xs focus-visible:ring-amber-500"
                  />
                </div>
              </div>

              {itinerariesLoading ? (
                <div className="py-16 text-center text-xs text-slate-400 font-bold space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                  <p>Loading confirmed booking itineraries...</p>
                </div>
              ) : filteredItineraries.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/15 rounded-xl bg-white/5">
                  <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="font-bold text-white">No bookings found</h4>
                  <p className="text-slate-400 text-xs mt-1">No itineraries matched your search criteria.</p>
                </div>
              ) : (
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 shadow-sm">
                  <div className="overflow-x-auto">
                    <div className="min-w-[850px]">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-wider bg-white/5">
                        <div className="col-span-3">Customer & Contact</div>
                        <div className="col-span-3">Destination & Dates</div>
                        <div className="col-span-2">Booking Code</div>
                        <div className="col-span-2">Trip Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>

                      {/* Table Body */}
                      <div className="divide-y divide-white/10">
                        {filteredItineraries.map((itin) => {
                          const today = new Date().toISOString().split('T')[0];
                          const isCompleted = itin.travel_end_date && itin.travel_end_date <= today;
                          const destinationsList = parseDestinationsText(itin.destinations);
                          const custName = itin.customer_name || itin.customerName || itin.client_name || itin.lead_name || 'Valued Traveler';
                          const custContact = itin.customer_email || itin.customer_phone || itin.phone || itin.email || itin.contact_number || 'Direct Booking';

                          const reviewLink = `${window.location.origin}/review/${itin.itinerary_code || itin.id}`;
                          
                          const handleWhatsAppInvite = () => {
                            const msg = `*GHUMO FIROO TRAVELS - TRIP FEEDBACK & REVIEW*%0A%0A` +
                              `Hi ${custName}, hope you had a wonderful trip to ${destinationsList}! 🏔️✨%0A%0A` +
                              `We would love to hear your feedback & photos. Please share your review here:%0A` +
                              `${reviewLink}%0A%0A` +
                              `Thank you for choosing Ghumo Firoo Travels! 🙏`;
                            
                            const cleanPhone = (itin.customer_phone || itin.whatsapp_number || itin.phone || '').replace(/[^0-9]/g, '');
                            const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
                            window.open(waUrl, '_blank');
                          };

                          return (
                            <div key={itin.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors text-xs text-white">
                              {/* Customer info */}
                              <div className="col-span-3">
                                <p className="font-extrabold text-white uppercase tracking-wide">{custName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{custContact}</p>
                              </div>

                              {/* Destination & travel dates */}
                              <div className="col-span-3">
                                <p className="font-bold text-amber-400 uppercase truncate" title={destinationsList}>{destinationsList}</p>
                                <p className="text-[10px] text-slate-300 font-medium">
                                  {itin.travel_start_date ? new Date(itin.travel_start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : ''} - {itin.travel_end_date ? new Date(itin.travel_end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : 'Open'}
                                </p>
                              </div>

                              {/* Booking reference code */}
                              <div className="col-span-2">
                                <Badge className="font-mono bg-white/10 text-amber-300 border-white/15 uppercase tracking-wider text-[10px] py-0.5" variant="outline">
                                  {itin.itinerary_code || String(itin.id).slice(0, 8)}
                                </Badge>
                              </div>

                              {/* Status / Link eligibility */}
                              <div className="col-span-2">
                                {isCompleted ? (
                                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold text-[9px] uppercase flex items-center gap-1 w-fit">
                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                  </Badge>
                                ) : (
                                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold text-[9px] uppercase flex items-center gap-1 w-fit">
                                    <Clock className="w-3 h-3" /> Confirmed
                                  </Badge>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="col-span-2 text-right flex justify-end items-center gap-1.5">
                                <Button 
                                  size="sm" 
                                  onClick={handleWhatsAppInvite}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] h-8 px-2.5 rounded-lg border-0 shadow-xs cursor-pointer flex items-center gap-1"
                                  title="Send WhatsApp Review Request"
                                >
                                  WhatsApp Invite
                                </Button>

                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => copyReviewLink(itin.itinerary_code, itin.id)}
                                  className="bg-white/5 border-white/15 text-slate-200 hover:bg-white/10 font-bold text-[10px] h-8 rounded-lg cursor-pointer"
                                  title="Copy Review Link"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
