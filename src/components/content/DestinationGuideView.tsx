import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/ui/LazyImage';
import type { DestinationGuide } from '@/types/content';
import { Star, Quote, Users, Clock, FileVideo, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { reviewService, type GoogleReview } from '@/services/reviewService';
import JsonLd from '@/components/seo/JsonLd';
import ReactMarkdown from 'react-markdown';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { pushEvent } from '@/lib/analytics';
import { leadService } from '@/services/leadService';
import { trackLead } from '@/lib/pixel';
import { useNavigate } from 'react-router-dom';

// Helper to strip markdown frontmatter
const cleanMarkdownContent = (content: string) => {
  if (!content) return '';
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
};

// Sticky Sidebar Lead Magnet Form
const BlogSidebarForm: React.FC<{ destinationName: string; slug: string; title: string }> = ({ destinationName, slug, title }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast({
        title: "Validation Error",
        description: "Please enter your name and phone number.",
        variant: "destructive"
      });
      return;
    }
    if (phone.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const leadPayload = {
        packageName: `Blog Custom Quote - ${destinationName}`,
        packagePrice: 0,
        duration: 'Custom',
        destinations: destinationName,
        customerName: name,
        customerEmail: 'not-provided@example.com',
        customerPhone: phone,
        source: `Blog Guide - ${slug}`,
        status: 'New Inquiry',
        leadDestination: [destinationName],
        notes: `Inquiry from blog guide: "${title}". Customer requested free custom itinerary.`,
      };

      const createdLead = await leadService.createLead(leadPayload);
      if (createdLead) {
        pushEvent('generate_lead', {
          currency: 'INR',
          value: 0,
          lead_type: 'blog_guide_enquiry'
        });
        trackLead();

        const params = new URLSearchParams({
          type: 'enquiry',
          name: name,
          email: 'not-provided@example.com'
        });
        navigate(`/thank-you?${params.toString()}`);

        toast({
          title: "Request Received!",
          description: "Our travel expert will contact you shortly.",
          className: "bg-green-600 text-white border-none",
        });

        setName('');
        setPhone('');
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTopic = () => {
    const t = destinationName.toLowerCase();
    if (t.includes('rann') || t.includes('kutch')) return 'Rann Utsav';
    if (t.includes('europe') || t.includes('swiss') || t.includes('paris')) return 'Europe';
    if (t.includes('char') || t.includes('dham') || t.includes('kedar')) return 'Char Dham';
    return destinationName;
  };

  return (
    <div className="bg-gradient-to-b from-[#1A2342] to-[#0B1026] text-white border border-white/10 rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="relative z-10 space-y-4">
        <h3 className="font-extrabold text-xl leading-tight">
          Planning {getTopic()}?
        </h3>
        <p className="text-slate-300 text-sm font-semibold">
          Get Free Custom Itinerary
        </p>
        <ul className="space-y-2.5 text-slate-300 text-xs font-medium">
          <li className="flex items-center gap-2"><span className="text-accent font-bold">✓</span> Hotel Options</li>
          <li className="flex items-center gap-2"><span className="text-accent font-bold">✓</span> Cab Cost</li>
          <li className="flex items-center gap-2"><span className="text-accent font-bold">✓</span> Day Wise Plan</li>
          <li className="flex items-center gap-2"><span className="text-accent font-bold">✓</span> Expert Advice</li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-accent focus:bg-white/10 focus:border-accent transition-all rounded-xl"
          />
          <Input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit Mobile Number"
            className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-accent focus:bg-white/10 focus:border-accent transition-all rounded-xl"
            maxLength={10}
          />
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-warm hover:scale-[1.02] active:scale-95 text-[#0b1026] font-bold rounded-xl border-0 shadow-lg transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Get Free Quote'}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Inline Lead Magnet Form (Centered inside post)
const BlogInlineLeadMagnet: React.FC<{ destinationName: string; slug: string; title: string }> = ({ destinationName, slug, title }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast({
        title: "Validation Error",
        description: "Please enter your name and phone number.",
        variant: "destructive"
      });
      return;
    }
    if (phone.length < 10) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const leadPayload = {
        packageName: `Blog Custom Quote - ${destinationName}`,
        packagePrice: 0,
        duration: 'Custom',
        destinations: destinationName,
        customerName: name,
        customerEmail: 'not-provided@example.com',
        customerPhone: phone,
        source: `Blog Guide Inline - ${slug}`,
        status: 'New Inquiry',
        leadDestination: [destinationName],
        notes: `Inquiry from blog guide inline: "${title}". Customer requested free custom itinerary.`,
      };

      const createdLead = await leadService.createLead(leadPayload);
      if (createdLead) {
        pushEvent('generate_lead', {
          currency: 'INR',
          value: 0,
          lead_type: 'blog_guide_enquiry'
        });
        trackLead();

        const params = new URLSearchParams({
          type: 'enquiry',
          name: name,
          email: 'not-provided@example.com'
        });
        navigate(`/thank-you?${params.toString()}`);

        toast({
          title: "Request Received!",
          description: "Our travel expert will contact you shortly.",
          className: "bg-green-600 text-white border-none",
        });

        setName('');
        setPhone('');
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTopic = () => {
    const t = destinationName.toLowerCase();
    if (t.includes('rann') || t.includes('kutch')) return 'Rann Utsav';
    if (t.includes('europe') || t.includes('swiss') || t.includes('paris')) return 'Europe';
    if (t.includes('char') || t.includes('dham') || t.includes('kedar')) return 'Char Dham';
    return destinationName;
  };

  return (
    <div className="bg-gradient-to-b from-[#1A2342]/65 to-[#0B1026]/45 backdrop-blur-md border border-accent/20 rounded-[24px] p-6 sm:p-8 mt-12 mb-8 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="space-y-2 text-center md:text-left">
          <Badge className="bg-accent text-[#0b1026] border-0 font-extrabold text-xs uppercase tracking-wider mb-1">
            Free Consultation
          </Badge>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            Planning {getTopic()}?
          </h3>
          <p className="text-slate-300 text-sm max-w-sm">
            Get a free custom itinerary featuring hotel options, cab costs, and expert advice.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-accent focus:bg-white/10 focus:border-accent transition-all rounded-xl sm:w-40"
          />
          <Input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit Mobile"
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-accent focus:bg-white/10 focus:border-accent transition-all rounded-xl sm:w-44"
            maxLength={10}
          />
          <Button
            type="submit"
            className="h-12 bg-gradient-warm hover:scale-[1.02] active:scale-95 text-[#0b1026] font-extrabold px-6 rounded-xl border-0 shadow-lg shadow-accent/10 whitespace-nowrap transition-transform"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Get Free Quote'}
          </Button>
        </form>
      </div>
    </div>
  );
};

interface Props {
  guide: DestinationGuide;
}

const DestinationGuideView: React.FC<Props> = ({ guide }) => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const destQuery = guide.title.split(' ')[0];
        const data = await reviewService.getReviewsByDestination(destQuery);
        setReviews(data);
      } catch (err) {
        console.error("Error loading reviews for guide:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [guide]);

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5.0;
  
  const destinationSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": guide.title,
    "description": guide.summary,
    "aggregateRating": reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toFixed(1),
      "reviewCount": reviews.length
    } : undefined,
    "review": reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": r.reviewer_name },
      "reviewBody": r.review_text,
      "reviewRating": { "@type": "Rating", "ratingValue": r.rating, "bestRating": 5, "worstRating": 1 },
      "datePublished": r.review_date
    }))
  };

  const sectionLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'best-time', label: 'Best Time' },
    { id: 'top-attractions', label: 'Attractions' },
    { id: 'getting-around', label: 'Getting Around' },
    { id: 'where-to-stay', label: 'Where to Stay' },
    { id: 'sample-itinerary', label: 'Itinerary' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faqs', label: 'FAQs' }
  ];

  if (guide.content) {
    return (
      <div className="space-y-8">
        <JsonLd json={destinationSchema} />
        {/* Banner */}
        <div className="relative rounded-[24px] overflow-hidden shadow-2xl aspect-video md:aspect-[21/9] bg-slate-900 border border-white/5">
          {guide.heroImage ? (
            <LazyImage src={guide.heroImage} alt={guide.title} className="w-full h-full object-cover opacity-50" priority />
          ) : (
            <div className="w-full h-full bg-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white z-10 text-left">
            <Badge className="bg-accent text-[#0b1026] border-0 mb-3 px-3 py-1 font-extrabold text-xs uppercase tracking-wider">
              {guide.region}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {guide.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-slate-300 text-xs font-semibold">
              <span>✍️ Travel Expert</span>
              <span>•</span>
              <span>📅 June 2026</span>
              <span>•</span>
              <span>⏱️ 10 min read</span>
            </div>
          </div>
        </div>

        {/* Two column grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start text-left">
          {/* Main article body */}
          <div className="lg:col-span-8 space-y-8 bg-[#1A2342]/40 backdrop-blur-md border border-white/5 rounded-[24px] p-6 sm:p-10 shadow-2xl text-slate-100">
            <div className="prose prose-invert prose-amber max-w-none text-left">
              <ReactMarkdown>{cleanMarkdownContent(guide.content)}</ReactMarkdown>
            </div>
          </div>

          {/* Sidebar Lead Magnet Form */}
          <div className="lg:col-span-4 sticky top-24">
            <BlogSidebarForm destinationName={guide.region} slug={guide.slug} title={guide.title} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <JsonLd json={destinationSchema} />
      
      {/* Banner */}
      <div className="relative rounded-[24px] overflow-hidden shadow-2xl border border-white/5">
        {guide.heroImage && (
          <LazyImage src={guide.heroImage} alt={guide.title} className="w-full h-72 md:h-96 object-cover opacity-50" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white text-left">
          <Badge className="bg-accent text-[#0b1026] border-0 mb-2 font-extrabold text-xs tracking-wider uppercase">
            {guide.region}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{guide.title}</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 justify-start">
        {sectionLinks.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className="rounded-full border border-white/10 bg-[#1A2342]/60 px-4 py-2 text-sm text-slate-300 shadow-sm transition hover:border-accent hover:bg-accent/15 hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </div>

      <Card id="overview" className="border border-white/5 bg-[#1A2342]/40 backdrop-blur-md rounded-[24px] shadow-2xl text-slate-100">
        <CardHeader>
          <CardTitle className="text-accent font-bold">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{guide.summary}</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {Object.entries(guide.quickFacts).map(([k, v]) => (
              <div key={k} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">{k}</div>
                <div className="font-bold text-white">{v}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card id="best-time" className="border border-white/5 bg-[#1A2342]/40 backdrop-blur-md rounded-[24px] shadow-2xl text-slate-100">
        <CardHeader><CardTitle className="text-accent font-bold">Best Time to Visit</CardTitle></CardHeader>
        <CardContent><p className="text-slate-300 text-sm sm:text-base leading-relaxed">{guide.bestTime}</p></CardContent>
      </Card>

      <Card id="top-attractions" className="border border-white/5 bg-[#1A2342]/40 backdrop-blur-md rounded-[24px] shadow-2xl text-slate-100">
        <CardHeader><CardTitle className="text-accent font-bold">Top Attractions</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {guide.attractions.map((a) => (
              <li key={a.name} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <div className="font-bold text-white text-base sm:text-lg mb-1">{a.name}</div>
                <div className="text-slate-300 text-sm leading-relaxed">{a.summary}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card id="getting-around" className="border border-white/5 bg-[#1A2342]/40 backdrop-blur-md rounded-[24px] shadow-2xl text-slate-100">
        <CardHeader><CardTitle className="text-accent font-bold">Getting Around</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 text-slate-300 space-y-2 text-sm sm:text-base">
            {guide.gettingAround.map((t, i) => <li key={i} className="pl-1">{t}</li>)}
          </ul>
        </CardContent>
      </Card>

      <Card id="where-to-stay" className="border border-white/5 bg-[#1A2342]/40 backdrop-blur-md rounded-[24px] shadow-2xl text-slate-100">
        <CardHeader><CardTitle className="text-accent font-bold">Where to Stay</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {guide.whereToStay.map((s) => (
              <div key={s.area} className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                <div className="font-bold text-white mb-2 text-base">{s.area}</div>
                <div className="text-slate-300 text-sm font-medium">Best for: {s.bestFor.join(', ')}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card id="sample-itinerary" className="border border-white/5 bg-[#1A2342]/40 backdrop-blur-md rounded-[24px] shadow-2xl text-slate-100">
        <CardHeader><CardTitle className="text-accent font-bold">Sample Itinerary</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guide.itineraries.map((d) => (
              <div key={d.day} className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                <div className="font-bold text-white text-base sm:text-lg mb-2">Day {d.day}: {d.title}</div>
                <ul className="list-disc ml-6 text-sm text-slate-300 space-y-1.5">{d.activities.map((x, i) => <li key={i} className="pl-1">{x}</li>)}</ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plan Your Trip Banner */}
      <Card className="border-0 bg-gradient-warm text-[#0b1026] rounded-[24px] shadow-xl p-4 sm:p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Plan Your Trip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#0b1026]/90 font-medium leading-relaxed max-w-3xl">
            Need help turning this guide into a tailored itinerary? Our travel experts can build a seamless package for your destination of choice.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center rounded-full bg-[#0b1026] px-6 py-3.5 text-sm font-bold text-amber-400 hover:text-amber-500 shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            Contact our travel team
          </a>
        </CardContent>
      </Card>

      <Card id="sustainability" className="border border-white/5 bg-[#1A2342]/40 backdrop-blur-md rounded-[24px] shadow-2xl text-slate-100">
        <CardHeader><CardTitle className="text-accent font-bold">Sustainable Options</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc ml-6 text-slate-300 space-y-2 text-sm sm:text-base">
            {guide.sustainability.map((s, i) => <li key={i} className="pl-1">{s}</li>)}
          </ul>
        </CardContent>
      </Card>

      {/* Destination Reviews Section */}
      <Card id="reviews" className="border border-white/5 bg-[#1A2342]/40 backdrop-blur-md rounded-[24px] shadow-2xl text-slate-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="text-amber-500">★</span> Traveler Reviews for {guide.title.split(' ')[0]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="py-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <p>No traveler reviews submitted for this destination yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Ratings Summary Banner */}
              <div className="bg-gradient-to-r from-[#1A2342] to-[#0B1026] rounded-xl p-5 border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-4xl font-extrabold text-white">{averageRating.toFixed(1)} <span className="text-xl text-amber-500">★</span></div>
                  <div className="text-sm text-slate-300 font-semibold mt-1">Destination Rating</div>
                  <div className="text-xs text-slate-400 mt-0.5">Based on {reviews.length} reviews</div>
                </div>
                
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-6 h-6 ${
                        i < Math.round(averageRating) ? 'text-amber-500 fill-amber-500' : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Photo Gallery */}
              {reviews.some(r => r.photos && r.photos.length > 0) && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-300 text-sm flex items-center gap-1.5">
                    <span>📸</span> Traveler Photo Gallery
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {reviews.flatMap(r => r.photos || []).slice(0, 10).map((photo, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedMedia(photo)}
                        className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-slate-900 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <img src={photo} alt="Traveler upload" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="border border-white/5 shadow-md bg-[#1A2342]/65 hover:bg-[#1A2342]/85 transition-colors text-white">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {review.reviewer_name}
                            {review.verified && (
                              <span className="text-[10px] text-green-400 bg-green-950/60 px-1.5 py-0.5 rounded-full font-extrabold border border-green-500/20">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">
                            {review.location} • {new Date(review.review_date).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-slate-300 text-sm leading-relaxed italic">
                        "{review.review_text}"
                      </p>

                      {((review.photos && review.photos.length > 0) || review.video_url) && (
                        <div className="flex gap-1.5 pt-1">
                          {review.photos?.map((photo, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedMedia(photo)}
                              className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-slate-900 cursor-pointer"
                            >
                              <img src={photo} alt="Attached" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {review.video_url && (
                            <div 
                              onClick={() => setSelectedMedia(review.video_url)}
                              className="w-8 h-8 rounded-lg border border-accent/20 bg-accent/5 flex items-center justify-center text-accent cursor-pointer"
                              title="Play Video"
                            >
                              <FileVideo className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
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

      <Card id="faqs" className="border border-white/5 bg-[#1A2342]/40 backdrop-blur-md rounded-[24px] shadow-2xl text-slate-100">
        <CardHeader><CardTitle className="text-accent font-bold">FAQs</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guide.faqs.map(({ q, a }, i) => (
              <div key={i} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                <div className="font-bold text-white text-base mb-1">{q}</div>
                <div className="text-slate-300 text-sm leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DestinationGuideView;