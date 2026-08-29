import { useState, useEffect, useMemo } from 'react';
import { config } from '@/config';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import JsonLd from '@/components/seo/JsonLd';
import { pushEvent } from '@/lib/analytics';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { 
  ChevronsUpDown, Check, X, User, Phone, Mail, MapPin, Calendar, 
  Users, Star, ShieldCheck, Clock, Send, Heart, Award, CheckCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { trackLead } from '@/lib/pixel';
import { leadService } from '@/services/leadService';
import { INDIAN_PHONE_REGEX, sanitizePhone, PHONE_ERROR_MSG } from '@/lib/validation';
import FAQSection from '@/components/sections/FAQSection';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().refine((val) => INDIAN_PHONE_REGEX.test(val.replace(/\D/g, '')), PHONE_ERROR_MSG),
  packageType: z.string().min(1, 'Please select a package type'),
  destination: z.array(z.string().min(1)).min(1, 'Please specify at least one destination'),
  travelDates: z.string().min(1, 'Please provide preferred travel dates'),
  numberOfTravelers: z.string().min(1, 'Please specify number of travelers'),
  budget: z.string().optional(),
  specialRequests: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  consent: z.boolean().refine(val => val === true, 'Please accept consent to proceed'),
  company: z.string().optional(), // honeypot
  departureCity: z.string().optional(),
  adultCount: z.string().optional(),
  childCount: z.string().optional(),
  hotelCategory: z.string().optional(),
  travelMonth: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

// Package and destination options
const packageOptions = [
  // Domestic
  { value: 'char_dham', label: 'Char Dham Yatra', destinations: ['Char Dham', 'Kedarnath', 'Badrinath'] },
  { value: 'rann_utsav', label: 'Rann Utsav Gujarat', destinations: ['Kutch', 'White Desert', 'Bhuj'] },
  { value: 'kashmir_paradise', label: 'Kashmir Paradise', destinations: ['Srinagar', 'Gulmarg', 'Pahalgam'] },
  { value: 'leh_ladakh_adventure', label: 'Leh Ladakh Adventure', destinations: ['Leh', 'Ladakh', 'Nubra Valley', 'Pangong Lake'] },
  { value: 'golden_triangle', label: 'Golden Triangle', destinations: ['Delhi', 'Agra', 'Jaipur'] },
  { value: 'rajasthan_royal', label: 'Rajasthan Royal', destinations: ['Jaipur', 'Udaipur', 'Jaisalmer'] },
  { value: 'kerala_backwaters', label: 'Kerala Backwaters', destinations: ['Alleppey', 'Munnar', 'Kochi'] },
  { value: 'goa_beach_holiday', label: 'Goa Beach Holiday', destinations: ['North Goa', 'South Goa'] },
  { value: 'himachal_hill_stations', label: 'Himachal Hill Stations', destinations: ['Shimla', 'Manali', 'Dharamshala'] },

  // International
  { value: 'turkey_adventure', label: 'Turkey Adventure', destinations: ['Istanbul', 'Cappadocia', 'Antalya'] },
  { value: 'dubai_delights', label: 'Dubai Delights', destinations: ['Dubai', 'Abu Dhabi'] },
  { value: 'thailand_tropical', label: 'Thailand Tropical', destinations: ['Bangkok', 'Phuket', 'Krabi'] },
  { value: 'singapore_malaysia', label: 'Singapore Malaysia', destinations: ['Singapore', 'Kuala Lumpur'] },
  { value: 'bali_paradise', label: 'Bali Paradise', destinations: ['Bali', 'Ubud', 'Seminyak'] },
  { value: 'mauritius_bliss', label: 'Mauritius Bliss', destinations: ['Mauritius', 'Ile aux Cerfs'] },
  { value: 'seychelles_escape', label: 'Seychelles Escape', destinations: ['Mahe', 'Praslin', 'La Digue'] },
  { value: 'grand_europe_tour', label: 'Grand Europe Tour', destinations: ['Paris', 'Rome', 'Swiss Alps', 'Amsterdam', 'London'] },
  { value: 'switzerland_croatia_discovery', label: 'Switzerland & Croatia Discovery', destinations: ['Zurich', 'Interlaken', 'Plitvice Lakes', 'Dubrovnik'] },
  { value: 'japan_cherry_blossom', label: 'Japan Cherry Blossom', destinations: ['Tokyo', 'Kyoto', 'Osaka', 'Mount Fuji'] },

  // Generic options
  { value: 'custom', label: 'Custom Package', destinations: [] },
  { value: 'other', label: 'Other', destinations: [] }
] as const;

const allDestinations = Array.from(new Set(packageOptions.flatMap(p => p.destinations))).sort();

// Destination visual themes for luxury consultancy
const DESTINATION_THEMES = {
  kutch: {
    heroImage: "/kutchsunriseimage.jpg",
    title: "Kutch & Rann Utsav",
    desc: "Experience the magic of the White Desert, vibrant Kutchi culture, folk dances, and handcrafted wonders under the full moon.",
    highlights: ["White Rann of Kutch", "Kalo Dungar (Black Hill)", "Bhuj Heritage & Palaces", "Traditional Tent City stays"],
    hotelCategory: "Luxury Camps & Resorts",
    travelStyle: "Cultural Experience",
    duration: "4 Days / 3 Nights",
    startingPrice: "12,999",
    attractions: ["White Rann Salt Flats", "Vijay Vilas Palace Mandvi", "Aina Mahal Bhuj"],
    activities: ["Sunset Camel Ride", "Cultural Folk Music Tours", "Handicraft Excursions"],
    experiences: ["Full Moon Desert Walk", "Traditional Kutchi Dinner", "Parasailing over Salt Flats"],
    faqs: [
      { question: "When is the best time to visit Rann Utsav?", answer: "The festival runs from November to February. Full moon nights are the most popular time for viewing the glowing salt desert." },
      { question: "Is a permit required?", answer: "Yes, a border permit is required due to proximity to the international border, which we arrange for you." },
      { question: "What is the difference between staying in the Tent City vs. outside resorts?", answer: "The official Tent City (Dhordo) offers premium hospitality, cultural programs, and closer proximity to the main salt desert. Outside resorts/homestays are more budget-friendly and offer a rustic local village experience." },
      { question: "How do I reach the White Rann?", answer: "Bhuj is the nearest transport hub (80 km away), which is well-connected by train and flight to Mumbai and Ahmedabad. We provide private AC transfers from Bhuj station/airport directly to your resort." },
      { question: "What should I pack for the Kutch trip?", answer: "Pack heavy woolens/jackets as desert nights can get extremely cold (under 10°C), comfortable walking shoes for the salt flats, sunglasses, and sunscreen for the bright daytime heat." }
    ]
  },
  chardham: {
    heroImage: "/Kedarnath.png",
    title: "Char Dham Yatra",
    desc: "Embark on a sacred pilgrimage to the four holy Himalayan shrines of Yamunotri, Gangotri, Kedarnath, and Badrinath.",
    highlights: ["Kedarnath Mandir Darshan", "Badrinath Temple Aarti", "Heli services available", "Experienced local guides"],
    hotelCategory: "Premium Cottages & Lodges",
    travelStyle: "Spiritual Pilgrimage",
    duration: "10 Days / 9 Nights",
    startingPrice: "28,500",
    attractions: ["Kedarnath Temple", "Badrinath Temple", "Gangotri Glacier", "Yamunotri Hot Springs"],
    activities: ["Heli-Shuttle Darshan", "Evening Temple Aarti", "Spiritual Satsang Lectures"],
    experiences: ["Darshan in Kedarnath", "Bath in Tapt Kund Badrinath", "Pony & Palki Trek Assistance"],
    faqs: [
      { question: "Is biometric registration required?", answer: "Yes, biometric registration is mandatory for all pilgrims and we handle it end-to-end for our guests." },
      { question: "Can we book helicopter services?", answer: "Yes, we arrange premium helicopter tickets from Phata, Sersi, or Guptkashi for Kedarnath." },
      { question: "What is the fitness level required for Char Dham Yatra?", answer: "There is no official age limit, but basic physical fitness is highly recommended as the trekking can be strenuous at high altitudes. Consult a doctor beforehand if you have cardiac or respiratory issues." },
      { question: "Which route is better: by Road or by Helicopter?", answer: "By Road takes 10 to 12 days and is a highly scenic, spiritual journey. Helicopter packages (from Dehradun) take only 5 to 6 days and are ideal for seniors or travelers with limited time." },
      { question: "What type of accommodation is available during the yatra?", answer: "Accommodations range from basic guest houses to premium cottages. We pre-book the best available heated premium rooms with running hot water in each location." }
    ]
  },
  europe: {
    heroImage: "/Europe Image New.png",
    title: "Grand Europe Discovery",
    desc: "Indulge in a curated European vacation featuring Swiss Alpine peaks, Parisian romance, Italian history, and scenic drives.",
    highlights: ["Mount Titlis & Swiss Alps", "Eiffel Tower in Paris", "Venice Gondola ride", "Private wine tasting in Florence"],
    hotelCategory: "4 & 5 Star Boutique Stays",
    travelStyle: "Luxury Sightseeing",
    duration: "9 Days / 8 Nights",
    startingPrice: "1,85,000",
    attractions: ["Jungfraujoch (Swiss Alps)", "Louvre Museum Paris", "Colosseum Rome"],
    activities: ["Scenic Train Rides", "River Cruises", "Private City Walking Tours"],
    experiences: ["Top of Europe Train Journey", "Private Wine Tasting in Tuscany", "Gondola Ride in Venice"],
    faqs: [
      { question: "Do you assist with Schengen Visa?", answer: "Yes, we provide end-to-end visa assistance including appointment booking, document preparation, and cover letter drafting." },
      { question: "What is included in the Europe package?", answer: "Our packages typically include 4-star hotels, daily breakfast, visa assistance, guided city tours, and premium intercity transport." },
      { question: "How far in advance should I book my Europe tour?", answer: "We recommend booking at least 3 to 4 months in advance. This ensures plenty of time for visa slot appointments, document processing, and securing the best group airfares." },
      { question: "Can I customize the destinations or extend my stay in Europe?", answer: "Absolutely! We offer fully customizable private itineraries. You can add extra days in Paris, choose specific rail journeys, or plan extensions to countries like Spain, Switzerland, or Italy." },
      { question: "Is travel insurance included in the package?", answer: "Yes, comprehensive overseas travel insurance with medical coverage (which is mandatory for the Schengen visa application) is included in all our international packages." }
    ]
  },
  thailand: {
    heroImage: "https://images.unsplash.com/photo-1549921296-3a74f2b1d7d5?w=1200&fit=crop",
    title: "Thailand Tropical Escape",
    desc: "Relax on pristine white-sand beaches, explore ornate Buddhist temples, and experience vibrant local street food markets.",
    highlights: ["Phi Phi Islands cruise", "Bangkok Grand Palace", "Coral Island water sports", "Private airport transfers"],
    hotelCategory: "4 Star Beachfront Resorts",
    travelStyle: "Leisure & Adventure",
    duration: "6 Days / 5 Nights",
    startingPrice: "24,999",
    attractions: ["Phi Phi Islands", "Wat Pho Temple Bangkok", "Phuket Old Town"],
    activities: ["Scuba Diving & Snorkeling", "Thai Cooking Class", "Night Market Food Excursion"],
    experiences: ["Maya Bay Sunset Cruise", "Traditional Thai Massage", "Private Speedboat Tour"],
    faqs: [
      { question: "Is a visa required for Indians to visit Thailand?", answer: "Thailand frequently extends visa-free entry or visa-on-arrival for Indian passport holders. We will verify and guide you based on current guidelines." },
      { question: "What is the best time to visit Phuket?", answer: "The best weather is from November to April, which is perfect for beach activities and calmer seas." },
      { question: "What is the currency of Thailand, and can I use international credit cards?", answer: "The currency is Thai Baht (THB). While credit cards are widely accepted in hotels, malls, and high-end restaurants, carrying cash is necessary for local street markets, street food stalls, and taxi rides." },
      { question: "Is Thailand suitable for a family vacation?", answer: "Yes, Thailand is exceptionally family-friendly. It offers theme parks, water sports, wildlife sanctuaries, and beautiful beach resorts that cater to children and adults alike." },
      { question: "What type of clothing is recommended when visiting Thai temples?", answer: "When visiting temples, shoulders and knees must be fully covered. Avoid sleeveless shirts, shorts, or short skirts. Carrying a light scarf or sarong is highly recommended." }
    ]
  },
  default: {
    heroImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&fit=crop",
    title: "Boutique Custom Journey",
    desc: "Collaborate with our dedicated luxury travel consultants to design a bespoke itinerary that matches your unique tastes.",
    highlights: ["Bespoke Itinerary Planning", "Hand-selected Hotels", "Private Chauffeured Cars", "24/7 Concierge Support"],
    hotelCategory: "Luxury & Heritage Stays",
    travelStyle: "Custom Private Tour",
    duration: "Fully Customizable",
    startingPrice: "On Request",
    attractions: ["Curated Local Sights", "Scenic Hidden Gems", "Historical Landmark Visits"],
    activities: ["Private Cooking Class", "Exclusive Guided Walks", "Bespoke Cultural Activities"],
    experiences: ["Private Guided Tour", "VIP Lounge Access", "Gourmet Dinner Experiences"],
    faqs: [
      { question: "Can I choose my own hotels and flights?", answer: "Yes, you have complete flexibility to select your preferred flights, hotel tiers, room views, and transport options." },
      { question: "How long does it take to get a custom quote?", answer: "Our team typically delivers a detailed itinerary draft and price quote within 4 to 12 working hours after your initial consultation." },
      { question: "Do you provide 24/7 support during my trip?", answer: "Yes, all our travelers get access to a dedicated 24/7 WhatsApp concierge group. This connects you directly to our operational staff and on-ground coordinators for real-time support." },
      { question: "What is your cancellation and rescheduling policy?", answer: "Our cancellation policy is flexible and varies by package. Rescheduling options are available, subject to hotel and flight booking terms. Our team will explain the specific terms for your quote." },
      { question: "Do you offer group discounts for corporate or family tours?", answer: "Yes! We specialize in custom group packages for corporate retreats, destination weddings, and large family reunions, offering special volume rates and customized activities." }
    ]
  }
};

const getDestinationTheme = (destString: string) => {
  if (!destString) return DESTINATION_THEMES.default;
  const d = destString.toLowerCase();
  if (d.includes('rann') || d.includes('kutch') || d.includes('gujarat')) {
    return DESTINATION_THEMES.kutch;
  }
  if (d.includes('char dham') || d.includes('chardham') || d.includes('kedarnath') || d.includes('badrinath')) {
    return DESTINATION_THEMES.chardham;
  }
  if (d.includes('europe') || d.includes('switzerland') || d.includes('croatia')) {
    return DESTINATION_THEMES.europe;
  }
  if (d.includes('thailand') || d.includes('bangkok') || d.includes('phuket')) {
    return DESTINATION_THEMES.thailand;
  }
  return DESTINATION_THEMES.default;
};

const EnquireNow = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customDest, setCustomDest] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [dbPrices, setDbPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchDbPrices = async () => {
      try {
        const res = await fetch('/php-backend/packages.php');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            const priceMap: Record<string, number> = {};
            data.forEach((pkg: any) => {
              if (pkg.slug && pkg.is_active) {
                priceMap[pkg.slug] = Number(pkg.price);
              }
            });
            setDbPrices(priceMap);
          }
        }
      } catch (err) {
        console.error('Error fetching database prices:', err);
      }
    };
    fetchDbPrices();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      packageType: '',
      destination: [],
      travelDates: '',
      numberOfTravelers: '',
      budget: '',
      specialRequests: '',
      message: '',
      consent: false,
      company: '',
      departureCity: '',
      adultCount: '1',
      childCount: '0',
      hotelCategory: '',
      travelMonth: ''
    },
  });

  // Watch fields for reactivity
  const watchedName = form.watch("fullName");
  const watchedPhone = form.watch("phone");
  const watchedEmail = form.watch("email");
  const watchedCity = form.watch("message"); // placeholder for message or city if exists (will watch all)
  const watchedConsent = form.watch("consent");
  const watchedDepartureCity = form.watch("departureCity");
  const watchedTravelDates = form.watch("travelDates");
  const watchedSpecialRequests = form.watch("specialRequests");
  const watchedMessage = form.watch("message");
  
  const watchedPackageType = form.watch("packageType");
  const watchedDestination = form.watch("destination");
  const watchedAdultCount = form.watch("adultCount");
  const watchedChildCount = form.watch("childCount");
  const watchedBudget = form.watch("budget");
  const watchedHotelCategory = form.watch("hotelCategory");
  const watchedTravelMonth = form.watch("travelMonth");

  // Automatically update numberOfTravelers based on adults + children
  useEffect(() => {
    const adults = parseInt(watchedAdultCount || '1') || 1;
    const children = parseInt(watchedChildCount || '0') || 0;
    form.setValue('numberOfTravelers', `${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}`);
  }, [watchedAdultCount, watchedChildCount]);

  // Dynamic destination theme resolution
  const selectedPackage = packageOptions.find(p => p.label === watchedPackageType || p.value === watchedPackageType);
  const derivedDest = selectedPackage ? selectedPackage.destinations[0] || selectedPackage.label : '';
  const destString = Array.isArray(watchedDestination) ? watchedDestination.join(', ') : (watchedDestination || '');
  const activeDest = destString || derivedDest || '';
  const theme = getDestinationTheme(activeDest);

  const resolvedStartingPrice = useMemo(() => {
    const activeDestLower = activeDest.toLowerCase();
    if (activeDestLower.includes('rann') || activeDestLower.includes('kutch') || activeDestLower.includes('gujarat')) {
      const price = dbPrices['rann-utsav-deluxe-swiss-tents'] || dbPrices['rann-utsav'] || 9999;
      return price.toLocaleString('en-IN');
    }
    if (activeDestLower.includes('char dham') || activeDestLower.includes('chardham') || activeDestLower.includes('kedarnath') || activeDestLower.includes('badrinath')) {
      const price = dbPrices['char-dham-yatra-from-haridwar'] || dbPrices['char-dham-yatra'] || 28500;
      return price.toLocaleString('en-IN');
    }
    if (activeDestLower.includes('europe') || activeDestLower.includes('switzerland') || activeDestLower.includes('croatia')) {
      const price = dbPrices['europe-swiss-croatia'] || dbPrices['europe-tour'] || 135000;
      return price.toLocaleString('en-IN');
    }
    if (activeDestLower.includes('thailand') || activeDestLower.includes('bangkok') || activeDestLower.includes('phuket')) {
      const price = dbPrices['thailand-tropical'] || 24999;
      return price.toLocaleString('en-IN');
    }
    return theme.startingPrice;
  }, [activeDest, dbPrices, theme.startingPrice]);

  // Prefill from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pkg = params.get('package');
    const dest = params.get('destination');
    const travelDate = params.get('travelDate') || params.get('checkInDate');
    const returnDate = params.get('returnDate') || params.get('checkOutDate');

    if (pkg) form.setValue('packageType', pkg);
    if (dest) form.setValue('destination', dest.split(',').map(d => d.trim()).filter(Boolean));
    if (travelDate) {
      form.setValue('travelDates', returnDate ? `${travelDate} to ${returnDate}` : travelDate);
      form.setValue('travelMonth', travelDate);
    }
  }, [location.search]);

  // Persist form on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('enquiry_form', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Load reCAPTCHA v3
  useEffect(() => {
    const siteKey = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY as string | undefined;
    if (!siteKey || /your_recaptcha_site_key_here/i.test(siteKey)) return;
    if (document.getElementById('recaptcha-v3')) return;
    const s = document.createElement('script');
    s.id = 'recaptcha-v3';
    s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    s.async = true;
    document.head.appendChild(s);
  }, []);

  const getCaptchaToken = async () => {
    const siteKey = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY as string | undefined;
    if (!siteKey || /your_recaptcha_site_key_here/i.test(siteKey) || !(window as any).grecaptcha) return undefined;
    return new Promise<string>((resolve) => {
      (window as any).grecaptcha.ready(() => {
        (window as any).grecaptcha.execute(siteKey, { action: 'enquiry_submit' }).then((token: string) => resolve(token));
      });
    });
  };

  const processSubmission = async (data: FormData) => {
    setIsSubmitting(true);

    const destinationStr = Array.isArray(data.destination) ? data.destination.join(', ') : data.destination;
    const subject = encodeURIComponent(`Tour Package Enquiry - ${data.packageType}`);
    const body = encodeURIComponent(`
Dear Ghumo Firoo Travels Team,

I would like to enquire about your tour packages. Please find my details below:

Full Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Package Type: ${data.packageType}
Destination: ${destinationStr}
Preferred Travel Dates: ${data.travelDates}
Number of Travelers: ${data.numberOfTravelers}
Budget Range: ${data.budget || 'Not specified'}
Preferred Hotel: ${data.hotelCategory || 'Not specified'}
Departure City: ${data.departureCity || 'Not specified'}
Special Requests: ${data.specialRequests || 'None'}

Message:
${data.message}

Please get back to me with package details and pricing.

Best regards,
${data.fullName}
    `);

    const mailtoLink = `mailto:booking@ghumofiroo.com?subject=${subject}&body=${body}`;

    try {
      // 1. Track Lead in Meta Pixel
      const nameParts = data.fullName.trim().split(' ');
      const fn = nameParts[0];
      const ln = nameParts.slice(1).join(' ') || '';
      
      trackLead(data.packageType, {
        em: data.email,
        ph: data.phone,
        fn: fn,
        ln: ln,
      }, {
        destination: destinationStr,
        travel_date: data.travelDates,
        source: 'enquire_now_page'
      });

      // Prepare payload for CRM and Google Sheets
      const leadPayload = {
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone.replace(/\D/g, ''),
        packageName: data.packageType,
        packagePrice: 0,
        duration: data.travelDates || '',
        destinations: destinationStr,
        source: 'enquire_now_page',
        status: 'New Inquiry',
        leadDestination: Array.isArray(data.destination) ? data.destination : [data.destination],
        tripStartDate: data.travelDates,
        numberOfTravelers: data.numberOfTravelers ? parseInt(data.numberOfTravelers) || undefined : undefined,
        adultCount: data.adultCount ? parseInt(data.adultCount) || undefined : undefined,
        childCount: data.childCount ? parseInt(data.childCount) || undefined : undefined,
        hotelCategory: data.hotelCategory,
        notes: (data.message || '') + 
               (data.specialRequests ? `\nSpecial Requests: ${data.specialRequests}` : '') + 
               (data.budget ? `\nBudget: ${data.budget}` : '') + 
               (data.departureCity ? `\nDeparture City: ${data.departureCity}` : ''),
      };

      // Submit to CRM
      await leadService.createLead(leadPayload);

      // Legacy function
      let functionUrl = (import.meta as any).env?.VITE_ENQUIRY_FUNCTION_URL as string | undefined;
      if (!functionUrl && (import.meta.env as any).VITE_SUPABASE_URL) {
        functionUrl = `${(import.meta.env as any).VITE_SUPABASE_URL}/functions/v1/send-travel-enquiry`;
      }
      if (functionUrl) {
        const captchaToken = await getCaptchaToken();
        const payload = {
          customerData: {
            name: data.fullName,
            email: data.email,
            phone: data.phone,
            destination: destinationStr,
            budget: data.budget,
            travelDates: data.travelDates,
            groupSize: data.numberOfTravelers,
            message: data.message,
          },
          type: 'enquiry' as const,
          captchaToken,
        };

        await fetch(functionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      // Track Events and Reset
      pushEvent('enquiry_submit', {
        source: 'enquire_now_page',
        package_type: data.packageType,
        destination: destinationStr,
      });

      localStorage.removeItem('enquiry_form');
      form.reset();
      setIsSubmitting(false);

      const params = new URLSearchParams({
        type: 'enquiry',
        name: data.fullName,
        email: data.email
      });
      navigate(`/thank-you?${params.toString()}`);
      return;
      
    } catch (error) {
      console.error("Enquiry submission failed", error);
      window.location.href = mailtoLink;
      pushEvent('enquiry_submit_fallback', { source: 'enquire_now_page', package_type: data.packageType });
      toast({
        title: 'Fallback to email',
        description: 'We could not reach our server. Please send your enquiry via email.',
      });
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (data.company && data.company.trim().length > 0) {
      return;
    }
    await processSubmission(data);
  };

  const getLabelForPackageValue = (val?: string) => packageOptions.find(p => p.label === val || p.value === val)?.label || '';

  const getWhatsappUrl = () => {
    const v = form.getValues();
    const phoneDigits = '919910987264';
    const destStr = Array.isArray(v.destination) ? v.destination.join(', ') : (v.destination || '');
    const parts = [
      'Hi Ghumo Firoo Travels 👋',
      v.fullName?.trim() ? `My name is ${v.fullName.trim()}.` : null,
      destStr ? `I'm interested in ${destStr}.` : null,
      v.packageType ? `Package: ${v.packageType}` : null,
      v.travelDates ? `Travel Dates: ${v.travelDates}` : null,
      v.numberOfTravelers ? `Travelers: ${v.numberOfTravelers}` : null,
      v.budget ? `Budget: ${v.budget}` : null,
      v.phone ? `Phone: ${v.phone}` : null,
      v.email ? `Email: ${v.email}` : null,
      v.message ? `Message: ${v.message}` : null,
      'Please help me plan this trip.'
    ].filter(Boolean) as string[];
    const text = parts.join('\n');
    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`;
  };

  // SEO
  const baseUrl = config.baseUrl;
  const canonicalUrl = `${baseUrl}/enquire-now`;
  const contactPageJson = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Enquire Now - Ghumo Firoo Travels",
    url: canonicalUrl
  };

  const scrollToForm = () => {
    const el = document.getElementById('consultation-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Enquire Now | Plan Your Trip | Ghumo Firoo Travels</title>
        <meta name="description" content="Share your travel preferences and receive a customized itinerary within 24 hours. Expert-planned domestic and international packages with transparent pricing and responsive support." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Enquire Now | Plan Your Trip | Ghumo Firoo Travels" />
        <meta property="og:description" content="Share your travel preferences and receive a customized itinerary within 24 hours. Expert-planned packages with transparent pricing and responsive support." />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>
      <JsonLd json={contactPageJson} />

      {/* SECTION 1: SMART DYNAMIC HERO */}
      <section 
        className="relative h-[45vh] md:h-[50vh] bg-cover bg-center bg-no-repeat flex items-center justify-center transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 17, 40, 0.65), rgba(10, 17, 40, 0.8)), url('${theme.heroImage}')`
        }}
      >
        <div className="relative z-10 text-center text-white max-w-3xl mx-auto px-4 space-y-4">
          <span className="inline-block px-3.5 py-1 text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full mb-2">
            Luxury Travel Consultation
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold mb-4 tracking-tight leading-tight">
            Plan Your Dream Trip To {theme.title === "Boutique Custom Journey" ? (destString || "Your Destination") : theme.title}
          </h1>
          <p className="text-sm md:text-lg text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
            Get a customized itinerary, best hotel options and expert guidance.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              onClick={scrollToForm}
              className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#0a1128] font-bold px-8 py-5 rounded-xl shadow-lg transition-all hover:scale-105 hover:opacity-95"
            >
              Get Free Consultation
            </Button>
            <a href={getWhatsappUrl()} target="_blank" rel="noopener noreferrer">
              <Button 
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-5 rounded-xl transition-all"
              >
                Talk To Expert
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 2: PACKAGE SUMMARY CARD */}
      <section className="relative z-20 -mt-10 px-4 max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-[0_15px_35px_rgba(0,0,0,0.3)] text-white flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-32 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
            <img src={theme.heroImage} alt={theme.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-left space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-2 py-0.5 rounded">Selected Journey</span>
              <span className="text-xs text-white/60 font-semibold">{theme.travelStyle}</span>
            </div>
            <h3 className="font-display text-lg font-bold text-white leading-tight">
              {watchedPackageType || "Custom Bespoke Itinerary Plan"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1.5 text-xs text-white/80">
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">Duration</span>
                <span className="font-semibold">{theme.duration}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">Starting Price</span>
                <span className="font-bold text-[#D4AF37]">₹{resolvedStartingPrice}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">Best Time</span>
                <span className="font-semibold">{theme.faqs[0]?.answer.includes('November') ? 'Nov - Feb' : 'October - March'}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase tracking-wider">Accommodation</span>
                <span className="font-semibold truncate block">{theme.hotelCategory}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHY GHUMO FIROO */}
      <section className="py-12 bg-[#0a1128] text-white">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
              Why Consult With Ghumo Firoo Travels?
            </h2>
            <p className="text-white/60 text-xs md:text-sm">
              We orchestrate memorable, bespoke travel experiences with absolute precision.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: "🌟", title: "5000+ Happy Guests", desc: "Highly rated custom travel planner" },
              { icon: "🏨", title: "Verified Stays", desc: "Pre-vetted boutique & 5-star properties" },
              { icon: "🗺️", title: "Custom Itineraries", desc: "Designed day-by-day to your speed" },
              { icon: "📞", title: "24/7 Concierge", desc: "Constant support during your trip" },
              { icon: "💰", title: "Best Price Promise", desc: "Transparent luxury with no hidden fees" },
              { icon: "🤝", title: "Dedicated Planner", desc: "One travel expert from start to finish" }
            ].map((fact, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center space-y-2 hover:border-[#D4AF37]/40 transition-all">
                <div className="text-2xl">{fact.icon}</div>
                <h4 className="font-semibold text-xs text-white">{fact.title}</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">{fact.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PREMIUM LEAD FORM SECTION */}
      <section id="consultation-form-section" className="py-16 bg-gradient-to-b from-[#0a1128] to-[#1c2541] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: LEFT SIDE (25% width - lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-6 text-left">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="font-display text-lg font-bold text-[#D4AF37] border-b border-white/10 pb-2">
                  Destination Insights
                </h3>
                <div className="rounded-xl overflow-hidden h-36">
                  <img src={theme.heroImage} alt={theme.title} className="w-full h-full object-cover hover:scale-105 transition-all duration-500" />
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  {theme.desc}
                </p>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3.5">
                <h3 className="font-display text-lg font-bold text-[#D4AF37] border-b border-white/10 pb-2">
                  Itinerary Highlights
                </h3>
                <ul className="space-y-2 text-xs text-white/80">
                  {theme.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#D4AF37] mt-0.5">✦</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* COLUMN 2: MIDDLE FORM (50% width - lg:col-span-6) */}
            <div className="lg:col-span-6 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative">
              <div className="text-center mb-6">
                <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-white mb-2">
                  Begin Your Consultation
                </h2>
                <p className="text-white/60 text-xs">
                  Fill in your details below and we will customize your journey to perfection.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Honeypot */}
                  <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...form.register('company')} />

                  {/* Row 1: Full Name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="relative space-y-0">
                        <div className="relative">
                          <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                            <User className="w-4 h-4" />
                          </div>
                          <FormControl>
                            <Input
                              placeholder=" "
                              autoComplete="name"
                              className={cn(
                                "peer pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0",
                                form.formState.errors.fullName ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <label
                            className={cn(
                              "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                              watchedName ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                            )}
                          >
                            Full Name *
                          </label>
                        </div>
                        <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                      </FormItem>
                    )}
                  />

                  {/* Row 2: Phone & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="relative space-y-0">
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                              <Phone className="w-4 h-4" />
                            </div>
                            <FormControl>
                              <Input
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder=" "
                                autoComplete="tel"
                                className={cn(
                                  "peer pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0",
                                  form.formState.errors.phone ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                                )}
                                {...field}
                                onChange={(e) => field.onChange(sanitizePhone(e.target.value))}
                              />
                            </FormControl>
                            <label
                              className={cn(
                                "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                                watchedPhone ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                              )}
                            >
                              Phone Number *
                            </label>
                          </div>
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="relative space-y-0">
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                              <Mail className="w-4 h-4" />
                            </div>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder=" "
                                autoComplete="email"
                                className={cn(
                                  "peer pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0",
                                  form.formState.errors.email ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                                )}
                                {...field}
                              />
                            </FormControl>
                            <label
                              className={cn(
                                "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                                watchedEmail ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                              )}
                            >
                              Email Address *
                            </label>
                          </div>
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 3: Current City & Departure City */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Departure City */}
                    <FormField
                      control={form.control}
                      name="departureCity"
                      render={({ field }) => (
                        <FormItem className="relative space-y-0">
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <FormControl>
                              <Input
                                placeholder=" "
                                className={cn(
                                  "peer pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0 border-white/10"
                                )}
                                {...field}
                              />
                            </FormControl>
                            <label
                              className={cn(
                                "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                                watchedDepartureCity ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                              )}
                            >
                              Departure City
                            </label>
                          </div>
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      )}
                    />

                    {/* Package Selection Popover */}
                    <FormField
                      control={form.control}
                      name="packageType"
                      render={({ field }) => (
                        <FormItem className="relative flex flex-col space-y-0">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between text-left px-9 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:ring-0 focus:outline-none transition-all h-[46px]",
                                  !field.value && "text-white/40",
                                  form.formState.errors.packageType ? "border-red-500/80" : "border-white/10"
                                )}
                              >
                                <span className="truncate">
                                  {field.value ? getLabelForPackageValue(field.value) || field.value : " "}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 bg-[#0a1128] border border-white/10 rounded-xl w-[--radix-popover-trigger-width] z-50">
                              <Command className="bg-transparent text-white">
                                <CommandInput placeholder="Search package..." className="text-white placeholder:text-white/40 border-0 border-b border-white/10 focus:ring-0" />
                                <CommandList className="bg-transparent max-h-60 overflow-y-auto">
                                  <CommandEmpty className="text-white/60 text-xs p-3">No package found.</CommandEmpty>
                                  <CommandGroup>
                                    {packageOptions.map((pkg) => (
                                      <CommandItem
                                        key={pkg.value}
                                        value={pkg.label}
                                        className="text-white hover:bg-white/10 cursor-pointer text-xs p-2.5 flex items-center gap-2"
                                        onSelect={() => {
                                          field.onChange(pkg.label);
                                          const current = form.getValues().destination as any;
                                          if (pkg.destinations.length) {
                                            const curArr = Array.isArray(current) ? current : (current ? [current] : []);
                                            const filtered = curArr.filter((d: string) => (pkg.destinations as readonly string[]).includes(d));
                                            form.setValue('destination', filtered);
                                          }
                                        }}
                                      >
                                        <Check className={cn("h-3.5 w-3.5 text-[#D4AF37]", getLabelForPackageValue(field.value) === pkg.label ? "opacity-100" : "opacity-0")} />
                                        {pkg.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <label
                            className={cn(
                              "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] text-white/40 text-xs",
                              field.value ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                            )}
                          >
                            Package Type *
                          </label>
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Destination Selection Popover */}
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => {
                      const pkg = packageOptions.find(p => p.label === form.getValues().packageType) || null;
                      const destinationChoices = pkg && pkg.destinations.length ? pkg.destinations : allDestinations;
                      const selected: string[] = Array.isArray(field.value) ? field.value : (field.value ? [field.value] : []);
                      const toggle = (d: string) => {
                        const exists = selected.includes(d);
                        const next = exists ? selected.filter(x => x !== d) : [...selected, d];
                        field.onChange(next);
                      };
                      const addCustom = (d: string) => {
                        const val = d.trim();
                        if (!val) return;
                        if (!selected.includes(val)) field.onChange([...selected, val]);
                        setCustomDest('');
                      };
                      return (
                        <FormItem className="relative flex flex-col space-y-0 text-left">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "justify-between text-left px-9 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:ring-0 focus:outline-none transition-all h-[46px]",
                                  selected.length === 0 && "text-white/40",
                                  form.formState.errors.destination ? "border-red-500/80" : "border-white/10"
                                )}
                              >
                                <span className="truncate">
                                  {selected.length > 0 ? `${selected.length} selected` : " "}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 bg-[#0a1128] border border-white/10 rounded-xl w-[--radix-popover-trigger-width] z-50">
                              <Command className="bg-transparent text-white">
                                <CommandInput placeholder="Search destinations..." className="text-white placeholder:text-white/40 border-0 border-b border-white/10 focus:ring-0" />
                                <CommandList className="bg-transparent max-h-60 overflow-y-auto">
                                  <CommandEmpty className="text-white/60 text-xs p-3">No destination found.</CommandEmpty>
                                  <CommandGroup>
                                    {destinationChoices.map((d) => (
                                      <CommandItem
                                        key={d}
                                        value={d}
                                        className="text-white hover:bg-white/10 cursor-pointer text-xs p-2.5 flex items-center gap-2"
                                        onSelect={() => toggle(d)}
                                      >
                                        <Check className={cn("h-3.5 w-3.5 text-[#D4AF37]", selected.includes(d) ? "opacity-100" : "opacity-0")} />
                                        {d}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <label
                            className={cn(
                              "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] text-white/40 text-xs",
                              selected.length > 0 ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                            )}
                          >
                            Destination(s) *
                          </label>
                          
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {selected.map((d) => (
                              <Badge key={d} className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-0.5 text-[10px] rounded-lg flex items-center gap-1">
                                {d}
                                <button type="button" className="hover:text-white" onClick={() => toggle(d)} aria-label={`Remove ${d}`}>
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          
                          <input
                            className="mt-2 text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:border-[#D4AF37] focus:outline-none transition-all"
                            placeholder="Add custom destination and press Enter"
                            value={customDest}
                            onChange={(e) => setCustomDest(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustom(customDest);
                              }
                            }}
                          />
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Row 4: Travel Month & Travel Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Travel Month */}
                    <FormField
                      control={form.control}
                      name="travelDates"
                      render={({ field }) => (
                        <FormItem className="relative space-y-0">
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <FormControl>
                              <Input
                                placeholder=" "
                                className={cn(
                                  "peer pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0",
                                  form.formState.errors.travelDates ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                                )}
                                {...field}
                              />
                            </FormControl>
                            <label
                              className={cn(
                                "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                                watchedTravelDates ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                              )}
                            >
                              Preferred Travel Date *
                            </label>
                          </div>
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      )}
                    />

                    {/* Travel Month select */}
                    <FormField
                      control={form.control}
                      name="travelMonth"
                      render={({ field }) => (
                        <FormItem className="relative space-y-0">
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                              <Clock className="w-4 h-4" />
                            </div>
                            <select
                              id="travelMonth"
                              className={cn(
                                "peer block w-full pl-9 pr-8 pt-5 pb-1.5 text-xs text-white bg-[#0a1128] border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all appearance-none cursor-pointer border-white/10"
                              )}
                              {...field}
                            >
                              <option value="" disabled hidden></option>
                              {getNext12Months().map((m, idx) => (
                                <option key={idx} value={m} className="bg-[#0a1128] text-white">{m}</option>
                              ))}
                            </select>
                            <label
                              className={cn(
                                "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                                watchedTravelMonth ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                              )}
                            >
                              Travel Month
                            </label>
                            <div className="absolute right-3 top-3.5 text-white/40 pointer-events-none">
                              <span className="text-[8px]">▼</span>
                            </div>
                          </div>
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 5: Adults & Children */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Adults Count */}
                    <FormField
                      control={form.control}
                      name="adultCount"
                      render={({ field }) => (
                        <FormItem className="relative space-y-0">
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                              <Users className="w-4 h-4" />
                            </div>
                            <select
                              id="adultCount"
                              className={cn(
                                "peer block w-full pl-9 pr-8 pt-5 pb-1.5 text-xs text-white bg-[#0a1128] border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all appearance-none cursor-pointer border-white/10"
                              )}
                              {...field}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <option key={num} value={String(num)} className="bg-[#0a1128] text-white">{num} Adult{num > 1 ? 's' : ''}</option>
                              ))}
                            </select>
                            <label
                              className={cn(
                                "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-[#D4AF37] text-[9px] top-1"
                              )}
                            >
                              Adults (12y+)
                            </label>
                            <div className="absolute right-3 top-3.5 text-white/40 pointer-events-none">
                              <span className="text-[8px]">▼</span>
                            </div>
                          </div>
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      )}
                    />

                    {/* Children Count */}
                    <FormField
                      control={form.control}
                      name="childCount"
                      render={({ field }) => (
                        <FormItem className="relative space-y-0">
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                              <Users className="w-4 h-4" />
                            </div>
                            <select
                              id="childCount"
                              className={cn(
                                "peer block w-full pl-9 pr-8 pt-5 pb-1.5 text-xs text-white bg-[#0a1128] border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all appearance-none cursor-pointer border-white/10"
                              )}
                              {...field}
                            >
                              {[0, 1, 2, 3, 4, 5].map((num) => (
                                <option key={num} value={String(num)} className="bg-[#0a1128] text-white">{num} Child{num !== 1 ? 'ren' : ''} (2-12y)</option>
                              ))}
                            </select>
                            <label
                              className={cn(
                                "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                                watchedChildCount ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                              )}
                            >
                              Children
                            </label>
                            <div className="absolute right-3 top-3.5 text-white/40 pointer-events-none">
                              <span className="text-[8px]">▼</span>
                            </div>
                          </div>
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 6: Budget Range & Hotel Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Budget Range */}
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem className="relative space-y-0">
                          <div className="relative">
                            <div className="absolute left-3.5 top-3.5 text-white/40 font-bold text-xs pointer-events-none">
                              ₹
                            </div>
                            <select
                              id="budget"
                              className={cn(
                                "peer block w-full pl-9 pr-8 pt-5 pb-1.5 text-xs text-white bg-[#0a1128] border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all appearance-none cursor-pointer border-white/10"
                              )}
                              {...field}
                            >
                              <option value="" disabled hidden></option>
                              <option value="₹25,000–50,000" className="bg-[#0a1128] text-white">₹25,000–50,000 per person</option>
                              <option value="₹50,000–1 Lakh" className="bg-[#0a1128] text-white">₹50,000–1 Lakh per person</option>
                              <option value="₹1–2 Lakh" className="bg-[#0a1128] text-white">₹1–2 Lakh per person</option>
                              <option value="₹2 Lakh+" className="bg-[#0a1128] text-white">₹2 Lakh+ per person</option>
                            </select>
                            <label
                              className={cn(
                                "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                                watchedBudget ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                              )}
                            >
                              Budget Range
                            </label>
                            <div className="absolute right-3 top-3.5 text-white/40 pointer-events-none">
                              <span className="text-[8px]">▼</span>
                            </div>
                          </div>
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      )}
                    />

                    {/* Hotel Category */}
                    <FormField
                      control={form.control}
                      name="hotelCategory"
                      render={({ field }) => (
                        <FormItem className="relative space-y-0">
                          <div className="relative">
                            <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                              <Star className="w-4 h-4" />
                            </div>
                            <select
                              id="hotelCategory"
                              className={cn(
                                "peer block w-full pl-9 pr-8 pt-5 pb-1.5 text-xs text-white bg-[#0a1128] border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all appearance-none cursor-pointer border-white/10"
                              )}
                              {...field}
                            >
                              <option value="" disabled hidden></option>
                              <option value="3 Star" className="bg-[#0a1128] text-white">3 Star Standard Accommodations</option>
                              <option value="4 Star" className="bg-[#0a1128] text-white">4 Star Premium Hotels</option>
                              <option value="5 Star" className="bg-[#0a1128] text-white">5 Star Luxury Resorts</option>
                              <option value="Luxury" className="bg-[#0a1128] text-white">Elite Signature stays</option>
                            </select>
                            <label
                              className={cn(
                                "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                                watchedHotelCategory ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                              )}
                            >
                              Hotel Class
                            </label>
                            <div className="absolute right-3 top-3.5 text-white/40 pointer-events-none">
                              <span className="text-[8px]">▼</span>
                            </div>
                          </div>
                          <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 7: Special Requests */}
                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem className="relative space-y-0">
                        <div className="relative">
                          <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                            <Heart className="w-4 h-4" />
                          </div>
                          <FormControl>
                            <Input
                              placeholder=" "
                              className={cn(
                                "peer pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0 border-white/10"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <label
                            className={cn(
                              "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                              watchedSpecialRequests ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                            )}
                          >
                            Special Requests (e.g. Diet, Honeymoon decor)
                          </label>
                        </div>
                        <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                      </FormItem>
                    )}
                  />

                  {/* Row 8: Message */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="relative space-y-0">
                        <div className="relative">
                          <div className="absolute left-3 top-3 text-white/40 pointer-events-none">
                            <Send className="w-4 h-4" />
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder=" "
                              className={cn(
                                "peer pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0 border-white/10 min-h-[90px]"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <label
                            className={cn(
                              "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] text-white/40 text-xs",
                              watchedMessage ? "top-1 text-[9px] text-[#D4AF37]" : "top-3 text-xs text-white/40"
                            )}
                          >
                            Trip notes & Preferences (at least 10 chars) *
                          </label>
                        </div>
                        <FormMessage className="text-[9px] text-red-400 mt-0.5 pl-2" />
                      </FormItem>
                    )}
                  />

                  {/* Consent checkbox */}
                  <div className="flex items-start gap-2.5 pt-1 text-left">
                    <input 
                      type="checkbox" 
                      id="consent" 
                      {...form.register('consent')} 
                      className="mt-1 h-3.5 w-3.5 rounded bg-white/5 border border-white/20 text-[#D4AF37] focus:ring-0 cursor-pointer" 
                    />
                    <label htmlFor="consent" className="text-[11px] text-white/70 leading-relaxed cursor-pointer select-none">
                      I agree to be contacted by Ghumo Firoo Travels via phone, email, or WhatsApp about my enquiry.
                    </label>
                  </div>
                  {form.formState.errors.consent && (
                    <p className="text-[9px] text-red-400 text-left pl-6">{String(form.formState.errors.consent.message)}</p>
                  )}

                  {/* Submit Button Grid */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <Button 
                      type="submit" 
                      className="w-full sm:w-1/2 h-11 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#0a1128] font-bold text-xs shadow-lg transition-all hover:scale-[1.015]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Custom Enquiry'}
                    </Button>
                    <a
                      href={getWhatsappUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-1/2 block"
                    >
                      <Button 
                        type="button"
                        variant="outline" 
                        className="w-full h-11 rounded-xl border border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-[#D4AF37] font-semibold text-xs transition-all flex items-center justify-center gap-2"
                        onClick={() => { try { pushEvent('whatsapp_click', { source: 'enquire_now_page', package_type: watchedPackageType, destination: activeDest }); } catch {} }}
                      >
                        <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> WhatsApp Us Directly
                      </Button>
                    </a>
                  </div>
                </form>
              </Form>
            </div>

            {/* COLUMN 3: STICKY CONSULTANT CARD (25% width - lg:col-span-3) */}
            <div className="lg:col-span-3 sticky top-24 space-y-6 text-left">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center space-y-4">
                <div className="w-20 h-20 rounded-full mx-auto overflow-hidden bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-3xl">
                  🤵
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-white">Mr. Suresh Bhatt</h4>
                  <p className="text-[10px] text-[#D4AF37] tracking-wider uppercase font-semibold">Senior Destination Advisor</p>
                </div>
                <div className="w-full h-[1px] bg-white/10" />
                <div className="space-y-3 text-xs text-left">
                  <a href="tel:+919910987264" className="flex items-center gap-3.5 text-white/80 hover:text-white transition-all p-2 rounded-xl bg-white/5 border border-white/5">
                    <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <div>
                      <p className="text-[9px] text-white/40 font-semibold uppercase">Call Line</p>
                      <p className="font-semibold">+91 99109 87264</p>
                    </div>
                  </a>
                  <a href="mailto:booking@ghumofiroo.com" className="flex items-center gap-3.5 text-white/80 hover:text-white transition-all p-2 rounded-xl bg-white/5 border border-white/5">
                    <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <div>
                      <p className="text-[9px] text-white/40 font-semibold uppercase">Email Us</p>
                      <p className="font-semibold truncate">booking@ghumofiroo.com</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3.5 text-white/80 p-2 rounded-xl bg-white/5 border border-white/5">
                    <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <div>
                      <p className="text-[9px] text-white/40 font-semibold uppercase">Response Time</p>
                      <p className="font-bold text-emerald-400 font-semibold">&lt; 15 Mins Response</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Trust badges */}
              <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-5 text-center">
                <p className="text-xs font-display text-[#D4AF37] font-semibold italic">"Where dreams become itineraries."</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: DESTINATION HIGHLIGHTS */}
      <section className="py-16 bg-[#0a1128] text-white border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              Highlights of {theme.title === "Boutique Custom Journey" ? "Bespoke Travels" : theme.title}
            </h2>
            <p className="text-white/60 text-xs md:text-sm">
              Handpicked experiences to make your private consultation journey extraordinary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Attractions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#D4AF37]/30 transition-all text-left">
              <div className="text-2xl text-[#D4AF37]">🏛️</div>
              <h3 className="font-display text-lg font-bold text-white">Top Attractions</h3>
              <ul className="space-y-2 text-xs text-white/80">
                {theme.attractions.map((a, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Activities */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#D4AF37]/30 transition-all text-left">
              <div className="text-2xl text-[#D4AF37]">🏄</div>
              <h3 className="font-display text-lg font-bold text-white">Top Activities</h3>
              <ul className="space-y-2 text-xs text-white/80">
                {theme.activities.map((a, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Experiences */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#D4AF37]/30 transition-all text-left">
              <div className="text-2xl text-[#D4AF37]">✨</div>
              <h3 className="font-display text-lg font-bold text-white">Best Experiences</h3>
              <ul className="space-y-2 text-xs text-white/80">
                {theme.experiences.map((e, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: TRAVELER REVIEWS */}
      <section className="py-16 bg-gradient-to-b from-[#0a1128] to-[#1c2541] text-white border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
              What Our Travelers Say
            </h2>
            <p className="text-white/60 text-xs md:text-sm">
              Real stories from families, couples, and adventurers who planned with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { name: "Aditya & Priya Sharma", dest: "Thailand Tropical escape", rating: 5, text: "Fabulous arrangements! From private speedboats to boutique hotels, Mr. Bhatt tailored the trip perfectly. Highly recommend their Thai planning.", photo: "👨‍👩‍👦" },
              { name: "Rajesh K. Mehta", dest: "Rann Utsav family tour", rating: 5, text: "The White Desert under full moon was spellbinding. Stays at the premium tents were superb, and permits were sorted instantly. Top service!", photo: "👴" },
              { name: "Dr. Sandeep Rawat", dest: "Char Dham Yatra by heli", rating: 5, text: "Extremely seamless pilgrim tour for my parents. Helicopter shuttle tickets, VIP entries at Kedarnath, and warm stays were perfectly executed.", photo: "👨‍⚕️" }
            ].map((rev, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-all">
                <div className="space-y-2.5">
                  <div className="flex gap-0.5 text-[#D4AF37]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-white/70 italic leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                    {rev.photo}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-white">{rev.name}</h4>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-semibold">Verified Guest</span>
                    </div>
                    <p className="text-[9px] text-[#D4AF37] uppercase font-semibold">{rev.dest}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: WHY BOOK NOW */}
      <section className="py-12 bg-[#0B1026] bg-gradient-to-r from-[#D4AF37]/10 via-[#F3E5AB]/5 to-[#AA7C11]/10 text-white border-t border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-block px-3 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase">
            Limited Availability Offer
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
            Secure Your Seasonal Journey Today
          </h2>
          <p className="text-white/70 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
            Highly popular travel periods book out months in advance. Secure the best hotels, flights, and seasonal rates by placing your custom enquiry today.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold text-white/80 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[#D4AF37]">✦</span> Best seasonal rates locked in
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#D4AF37]">✦</span> Premium hotel rooms guaranteed
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#D4AF37]">✦</span> Flexible rescheduling options
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FAQ */}
      <section className="py-16 bg-[#0a1128] text-white">
        <div className="max-w-4xl mx-auto px-4">
          <FAQSection 
            faqs={theme.faqs}
            title={`${theme.title === "Boutique Custom Journey" ? "Custom Planning" : theme.title} FAQs`}
            subtitle="Common questions about planning your dream vacation with us."
            className="py-0 bg-transparent text-white"
            dark={true}
          />
        </div>
      </section>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a1128]/95 backdrop-blur-md border-t border-white/10 p-3.5 flex gap-3 shadow-[0_-10px_35px_rgba(0,0,0,0.5)]">
        <a href="tel:+919910987264" className="w-1/2 block">
          <Button 
            variant="outline"
            className="w-full h-11 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> Call Expert
          </Button>
        </a>
        <Button 
          onClick={scrollToForm}
          className="w-1/2 h-11 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#0a1128] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
        >
          <span>🚀</span> Quick Enquiry
        </Button>
      </div>

    </Layout>
  );
};

const getNext12Months = () => {
  const months = [];
  const date = new Date();
  for (let i = 0; i < 12; i++) {
    const m = date.toLocaleString('default', { month: 'long' });
    const y = date.getFullYear();
    months.push(`${m} ${y}`);
    date.setMonth(date.getMonth() + 1);
  }
  return months;
};

export default EnquireNow;
