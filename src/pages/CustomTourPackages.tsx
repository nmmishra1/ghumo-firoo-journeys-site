import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { 
  Calendar, MapPin, Users, Heart, Star, Phone, Mail, Clock, CheckCircle,
  ShieldCheck, Award, Send, ArrowRight, ArrowLeft
} from 'lucide-react';
import { leadService } from '@/services/leadService';
import { pushEvent } from '@/lib/analytics';
import { trackLead } from '@/lib/pixel';
import SEO from '@/components/SEO';
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from '@/components/seo/JsonLd';
import FAQSection from '@/components/sections/FAQSection';
import { cn } from '@/lib/utils';
import { sanitizePhone } from '@/lib/validation';
import { config } from '@/config';

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

const CustomTourPackages = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [customDest, setCustomDest] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    city: '',
    departureCity: '',
    travelMonth: '',
    travelDates: '',
    adultCount: '1',
    childCount: '0',
    passengers: '1',
    budget: '',
    travelType: '',
    accommodation: '',
    hotelCategory: '',
    activities: '',
    preferences: '',
    specialRequests: '',
    destinations: ''
  });

  const totalSteps = 3;

  const destinationOptions = [
    'Char Dham Yatra (Kedarnath, Badrinath, Gangotri, Yamunotri)',
    'Rann Utsav Gujarat (White Desert Festival Experience)',
    'Grand Europe Tour (Paris, Rome, Switzerland, Amsterdam, London)',
    'Switzerland & Croatia Discovery (Swiss Alps to Adriatic Coast)',
    'Rajasthan Heritage (Jaipur, Udaipur, Jodhpur, Jaisalmer)',
    'Kashmir Paradise (Srinagar, Gulmarg, Pahalgam, Sonamarg)',
    'Kerala Backwaters (Alleppey, Munnar, Kochi, Thekkady)',
    'Goa Beach Holiday',
    'Himachal Adventure (Manali, Shimla, Dharamshala)',
    'Golden Triangle (Delhi, Agra, Jaipur)',
    'South India Temple Tour',
    'Northeast India (Assam, Meghalaya, Arunachal Pradesh)',
    'Custom Destination (Please specify)'
  ];

  const budgetRanges = [
    '₹25,000 - ₹50,000 per person',
    '₹50,000 - ₹1,00,000 per person',
    '₹1,00,000 - ₹2,00,000 per person',
    '₹2,00,000 - ₹3,00,000 per person',
    '₹3,00,000+ per person'
  ];

  const travelTypes = [
    'Family Vacation',
    'Honeymoon Trip',
    'Adventure Travel',
    'Spiritual Journey',
    'Business Travel',
    'Solo Travel',
    'Group Tour',
    'Luxury Travel'
  ];

  // Resolve theme dynamically
  const activeDest = formData.destinations === 'Custom Destination (Please specify)' ? customDest : formData.destinations;
  const theme = getDestinationTheme(activeDest);

  // Keep passenger count in sync
  useEffect(() => {
    const adults = parseInt(formData.adultCount || '1') || 1;
    const children = parseInt(formData.childCount || '0') || 0;
    const total = adults + children;
    setFormData(prev => ({
      ...prev,
      passengers: String(total),
      preferences: `Adults: ${adults}, Children: ${children}`
    }));
  }, [formData.adultCount, formData.childCount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAccommodationSelect = (val: string) => {
    setFormData(prev => ({
      ...prev,
      accommodation: val,
      hotelCategory: val
    }));
    if (errors.hotelCategory) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.hotelCategory;
        return next;
      });
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Name must be at least 2 characters';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }

      const phoneDigits = formData.mobile.replace(/\D/g, '');
      if (!formData.mobile.trim()) {
        newErrors.mobile = 'WhatsApp number is required';
      } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
        newErrors.mobile = 'Please enter a valid 10-digit Indian phone number';
      }
    } else if (step === 2) {
      if (!formData.destinations) {
        newErrors.destinations = 'Please choose a destination';
      }
      if (!formData.travelDates.trim()) {
        newErrors.travelDates = 'Please enter preferred travel dates';
      }
      if (!formData.travelMonth) {
        newErrors.travelMonth = 'Please select a travel month';
      }
      if (!formData.travelType) {
        newErrors.travelType = 'Please select a travel type';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        scrollToForm();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToForm();
    }
  };

  const submitToWhatsApp = () => {
    const finalDest = formData.destinations === 'Custom Destination (Please specify)' ? (customDest || 'Custom') : formData.destinations;
    const whatsappMessage = `🌟 *CUSTOM TRIP INQUIRY* 🌟

👤 *Personal Details:*
Name: ${formData.fullName}
Email: ${formData.email}
Mobile: ${formData.mobile}
City: ${formData.city || 'N/A'}
Departure City: ${formData.departureCity || 'N/A'}

🗓️ *Trip Details:*
Destination: ${finalDest}
Travel Month: ${formData.travelMonth}
Travel Dates: ${formData.travelDates}
Passengers: ${formData.passengers} (Adults: ${formData.adultCount}, Children: ${formData.childCount})
Budget: ${formData.budget}
Travel Type: ${formData.travelType}

🏨 *Preferences:*
Accommodation Class: ${formData.hotelCategory || 'Not specified'}
Activities: ${formData.activities || 'None'}
Special Requests: ${formData.specialRequests || 'None'}
Other Preferences: ${formData.preferences || 'None'}

Please help me plan this amazing journey! 🎒✈️`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/919910987264?text=${encodedMessage}`;
    try { pushEvent('whatsapp_click', { source: 'custom_tour_form', destination: finalDest, travel_dates: formData.travelDates }); } catch {}
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Step 3
    const newErrors: Record<string, string> = {};
    if (!formData.budget) {
      newErrors.budget = 'Please select a budget range';
    }
    if (!formData.hotelCategory) {
      newErrors.hotelCategory = 'Please select an accommodation class';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const finalDest = formData.destinations === 'Custom Destination (Please specify)' ? (customDest || 'Custom') : formData.destinations;
      const parsedPrice = parseInt((formData.budget || '').replace(/[^0-9]/g, '')) || 0;
      
      const notes = `Departure City: ${formData.departureCity || 'N/A'} | Travel Type: ${formData.travelType || 'N/A'} | Activities: ${formData.activities || 'N/A'} | Special: ${formData.specialRequests || 'None'} | Pref: ${formData.preferences || 'None'}`;
      
      trackLead('Custom Tour Enquiry', {
        em: formData.email,
        ph: formData.mobile,
        fn: formData.fullName.split(' ')[0],
        ln: formData.fullName.split(' ').slice(1).join(' ') || undefined
      }, {
        source: 'custom_tour_packages_page',
        destination: finalDest,
        travel_dates: formData.travelDates,
        budget: formData.budget
      });

      await leadService.createLead({
        packageName: `Custom Tour - ${finalDest}`,
        packagePrice: parsedPrice,
        duration: formData.travelDates || 'N/A',
        destinations: finalDest,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.mobile,
        source: 'Custom Tour Packages Page',
        status: 'New Lead',
        city: formData.city,
        travelMonth: formData.travelMonth,
        numberOfTravelers: parseInt(formData.passengers) || undefined,
        adultCount: parseInt(formData.adultCount) || undefined,
        childCount: parseInt(formData.childCount) || undefined,
        budget: formData.budget,
        hotelCategory: formData.hotelCategory,
        notes
      });

      submitToWhatsApp();

      toast({
        title: "🎉 Request Submitted Successfully!",
        description: `Your custom trip request has been saved to our CRM system. We'll contact you shortly to discuss your requirements.`,
      });

      setFormData({
        fullName: '',
        mobile: '',
        email: '',
        city: '',
        departureCity: '',
        travelMonth: '',
        travelDates: '',
        adultCount: '1',
        childCount: '0',
        passengers: '1',
        budget: '',
        travelType: '',
        accommodation: '',
        hotelCategory: '',
        activities: '',
        preferences: '',
        specialRequests: '',
        destinations: ''
      });
      setCustomDest('');
      setCurrentStep(1);

    } catch (error) {
      console.error('Error submitting form:', error);
      try {
        submitToWhatsApp();
        toast({
          title: "⚠️ Partial Success",
          description: "Your request was sent via WhatsApp, but couldn't be saved to our CRM. We'll still process your request manually.",
        });
      } catch (whatsappError) {
        toast({
          title: "❌ Submission Failed",
          description: "There was an error submitting your request. Please try calling us directly or try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
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

  const scrollToForm = () => {
    const el = document.getElementById('custom-consultation-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getWhatsappUrl = () => {
    const finalDest = formData.destinations === 'Custom Destination (Please specify)' ? (customDest || 'Custom') : formData.destinations;
    const parts = [
      'Hi Ghumo Firoo Travels 👋',
      formData.fullName?.trim() ? `My name is ${formData.fullName.trim()}.` : null,
      finalDest ? `I want to plan a custom trip to ${finalDest}.` : `I want to consult about a custom tour.`,
      formData.travelDates ? `Dates: ${formData.travelDates}` : null,
      formData.travelMonth ? `Month: ${formData.travelMonth}` : null,
      formData.passengers ? `Travelers: ${formData.passengers}` : null,
      formData.budget ? `Budget: ${formData.budget}` : null,
      'Please help me plan my dream journey!'
    ].filter(Boolean) as string[];
    return `https://wa.me/919910987264?text=${encodeURIComponent(parts.join('\n'))}`;
  };

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Custom Tour Packages", item: "/custom-tour-packages" }
  ]);

  const faqSchema = buildFaqJsonLd(theme.faqs);

  return (
    <Layout>
      <SEO 
        title="Custom Tour Packages 2026 | Customized Travel Designer"
        description="Plan your bespoke dream vacation with GhumoFiroo Travels. Customize itineraries, hotel tiers, private transfers, and flight options for Europe, Char Dham, Rann Utsav & Singapore."
        keywords="custom tour packages, customized travel designer, tailored holiday packages India, bespoke travel planner Delhi, custom Europe itinerary, custom Char Dham yatra"
        canonicalUrl={config.baseUrl + "/custom-tour-packages"}
        structuredData={[breadcrumbSchema, faqSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* SECTION 1: SMART DYNAMIC HERO */}
        <section 
          className="relative min-h-[560px] md:min-h-[620px] py-20 pb-28 bg-cover bg-center bg-no-repeat flex items-center justify-center transition-all duration-700"
          style={{
            backgroundImage: `linear-gradient(rgba(7, 12, 30, 0.75), rgba(7, 12, 30, 0.9)), url('${theme.heroImage}')`
          }}
        >
          <div className="relative z-10 text-center text-white max-w-3xl mx-auto px-4 space-y-5 pt-4">
            <span className="inline-block px-4 py-1.5 text-[11px] font-bold tracking-widest text-[#E5C378] uppercase bg-black/50 border border-[#C9A25A]/40 rounded-full mb-1 backdrop-blur-md">
              Bespoke Luxury Planning
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-normal text-white mb-3 tracking-tight leading-tight drop-shadow-2xl">
              Plan Your Dream Trip To {theme.title === "Boutique Custom Journey" ? (customDest || "Your Destination") : theme.title}
            </h1>
            <p className="text-sm md:text-lg text-slate-300 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Get a customized itinerary, best hotel options, private transfers and expert concierge guidance.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-5">
              <Button 
                onClick={scrollToForm}
                className="bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold px-8 py-5 rounded-full shadow-xl hover:brightness-110 transition-all text-xs uppercase tracking-wider"
              >
                Get Free Consultation
              </Button>
              <a href={getWhatsappUrl()} target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline"
                  className="border-white/30 bg-black/40 hover:bg-white/10 text-white font-semibold px-8 py-5 rounded-full transition-all text-xs uppercase tracking-wider backdrop-blur-md"
                >
                  Talk To Expert
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 2: PACKAGE SUMMARY CARD */}
        <section className="relative z-20 -mt-16 px-4 max-w-4xl mx-auto">
          <div className="bg-[#0B1226]/95 border border-[#C9A25A]/30 rounded-2xl p-6 shadow-2xl text-white flex flex-col md:flex-row items-center gap-6 backdrop-blur-xl">
            <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
              <img src={theme.heroImage} alt={theme.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-left space-y-2 w-full">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-[#E5C378] uppercase bg-[#C9A25A]/15 border border-[#C9A25A]/30 px-2.5 py-0.5 rounded-full">Custom Crafting</span>
                <span className="text-xs text-slate-300 font-semibold">{theme.travelStyle}</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-white leading-tight">
                {activeDest ? `Bespoke ${activeDest.split('(')[0].trim()} Itinerary` : "Custom Bespoke Itinerary Plan"}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs text-slate-300 font-light">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Duration</span>
                  <span className="font-semibold text-white">{theme.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Starting Price</span>
                  <span className="font-bold text-[#E5C378]">₹{theme.startingPrice}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Best Season</span>
                  <span className="font-semibold text-white">{theme.faqs[0]?.answer.includes('November') ? 'Nov - Feb' : 'October - March'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Accommodation</span>
                  <span className="font-semibold text-white truncate block">{theme.hotelCategory}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: WHY GHUMO FIROO */}
        <section className="py-16 bg-[#0B1026] text-white">
          <div className="max-w-6xl mx-auto px-4 text-center space-y-8">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
                Why Choose Our Custom Planning?
              </h2>
              <p className="text-slate-300 text-xs md:text-sm font-light">
                We orchestrate memorable, bespoke travel experiences with absolute precision.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: "🌟", title: "5,000+ Happy Guests", desc: "Highly rated custom travel planner" },
                { icon: "🏨", title: "Verified Stays", desc: "Pre-vetted boutique & 5-star properties" },
                { icon: "🗺️", title: "Custom Itineraries", desc: "Designed day-by-day to your speed" },
                { icon: "📞", title: "24/7 Concierge", desc: "Constant support during your trip" },
                { icon: "💰", title: "Best Price Promise", desc: "Transparent luxury with no hidden fees" },
                { icon: "🤝", title: "Dedicated Planner", desc: "One travel expert from start to finish" }
              ].map((fact, idx) => (
                <div key={idx} className="bg-[#0B1226]/80 border border-white/10 rounded-2xl p-4 text-center space-y-2 hover:border-[#C9A25A]/40 transition-all">
                  <div className="text-2xl">{fact.icon}</div>
                  <h4 className="font-bold text-xs text-white">{fact.title}</h4>
                  <p className="text-[10px] text-slate-300 font-light leading-relaxed">{fact.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: PREMIUM LEAD FORM SECTION */}
        <section id="custom-consultation-section" className="py-16 bg-[#050A18] border-y border-[#C9A25A]/15 text-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Main 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* COLUMN 1: LEFT SIDE (lg:col-span-3) */}
              <div className="lg:col-span-3 space-y-6 text-left">
                <div className="bg-[#0B1226]/90 border border-white/10 rounded-2xl p-5 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#E5C378] border-b border-white/10 pb-2">
                    Destination Insights
                  </h3>
                  <div className="rounded-xl overflow-hidden h-36 border border-white/10">
                    <img src={theme.heroImage} alt={theme.title} className="w-full h-full object-cover hover:scale-105 transition-all duration-500" />
                  </div>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {theme.desc}
                  </p>
                </div>
                
                <div className="bg-[#0B1226]/90 border border-white/10 rounded-2xl p-5 space-y-3.5">
                  <h3 className="font-serif text-lg font-bold text-[#E5C378] border-b border-white/10 pb-2">
                    Highlights Included
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300 font-light">
                    {theme.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#C9A25A] mt-0.5">✦</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* COLUMN 2: MIDDLE FORM (lg:col-span-6) */}
              <div className="lg:col-span-6 bg-[#0B1226]/95 border border-[#C9A25A]/25 p-6 md:p-8 rounded-3xl shadow-2xl relative">
                
                {/* Progress Indicator */}
                <div className="mb-8">
                  <div className="flex justify-center items-center space-x-3">
                    {[1, 2, 3].map((step) => (
                      <React.Fragment key={step}>
                        <div className="flex items-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border",
                            currentStep === step 
                              ? 'border-[#C9A25A] bg-[#C9A25A]/20 text-[#E5C378]' 
                              : currentStep > step 
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' 
                                : 'border-white/20 bg-white/5 text-white/50'
                          )}>
                            {currentStep > step ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : step}
                          </div>
                        </div>
                        {step < 3 && (
                          <div className={cn(
                            "w-12 h-[1px] transition-all",
                            currentStep > step ? 'bg-emerald-500' : 'bg-white/10'
                          )} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex justify-center mt-3 gap-8 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className={cn(currentStep >= 1 ? 'text-[#E5C378]' : '')}>Profile</span>
                    <span className={cn(currentStep >= 2 ? 'text-[#E5C378]' : '')}>Journey Details</span>
                    <span className={cn(currentStep >= 3 ? 'text-[#E5C378]' : '')}>Preferences</span>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="font-serif text-xl md:text-2xl font-bold tracking-tight text-white mb-1.5">
                    Share Your Dream Journey
                  </h2>
                  <p className="text-slate-300 text-xs font-light">
                    Step {currentStep} of {totalSteps}: {currentStep === 1 ? 'Personal details' : currentStep === 2 ? 'Destinations & Dates' : 'Accommodations & Notes'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <div className="space-y-4 text-left">
                      <div className="text-center mb-6">
                        <Users className="w-10 h-10 mx-auto text-[#C9A25A] mb-2" />
                        <h3 className="text-base font-serif font-bold text-white">Let's Get to Know You</h3>
                        <p className="text-slate-300 text-xs font-light">We need your contact details to begin designing your itinerary</p>
                      </div>

                      {/* Full Name */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                          <Users className="w-4 h-4" />
                        </div>
                        <input 
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder=" "
                          autoComplete="name"
                          className={cn(
                            "peer w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#C9A25A] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0",
                            errors.fullName ? "border-red-500/80 focus:border-red-500" : "border-white/15"
                          )}
                        />
                        <label className={cn(
                          "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#E5C378] text-xs font-medium",
                          formData.fullName ? "top-1 text-[9px] text-[#E5C378]" : "top-3.5 text-xs text-slate-300"
                        )}>
                          Full Name *
                        </label>
                        {errors.fullName && <p className="text-[9px] text-red-400 mt-1 pl-2">{errors.fullName}</p>}
                      </div>

                      {/* WhatsApp Mobile */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input 
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={(e) => {
                            const val = sanitizePhone(e.target.value);
                            setFormData(prev => ({ ...prev, mobile: val }));
                          }}
                          placeholder=" "
                          autoComplete="tel"
                          className={cn(
                            "peer w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#C9A25A] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0",
                            errors.mobile ? "border-red-500/80 focus:border-red-500" : "border-white/15"
                          )}
                        />
                        <label className={cn(
                          "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#E5C378] text-xs font-medium",
                          formData.mobile ? "top-1 text-[9px] text-[#E5C378]" : "top-3.5 text-xs text-slate-300"
                        )}>
                          WhatsApp Number *
                        </label>
                        {errors.mobile && <p className="text-[9px] text-red-400 mt-1 pl-2">{errors.mobile}</p>}
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input 
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder=" "
                          autoComplete="email"
                          className={cn(
                            "peer w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#C9A25A] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0",
                            errors.email ? "border-red-500/80 focus:border-red-500" : "border-white/15"
                          )}
                        />
                        <label className={cn(
                          "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#E5C378] text-xs font-medium",
                          formData.email ? "top-1 text-[9px] text-[#E5C378]" : "top-3.5 text-xs text-slate-300"
                        )}>
                          Email Address *
                        </label>
                        {errors.email && <p className="text-[9px] text-red-400 mt-1 pl-2">{errors.email}</p>}
                      </div>

                      {/* City & Departure City */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Current City */}
                        <div className="relative">
                          <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <input 
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder=" "
                            className="peer w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border border-white/15 rounded-xl focus:border-[#C9A25A] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0"
                          />
                          <label className={cn(
                            "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#E5C378] text-xs font-medium",
                            formData.city ? "top-1 text-[9px] text-[#E5C378]" : "top-3.5 text-xs text-slate-300"
                          )}>
                            Your Current City
                          </label>
                        </div>

                        {/* Departure City */}
                        <div className="relative">
                          <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <input 
                            type="text"
                            name="departureCity"
                            value={formData.departureCity}
                            onChange={handleInputChange}
                            placeholder=" "
                            className="peer w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border border-white/15 rounded-xl focus:border-[#C9A25A] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0"
                          />
                          <label className={cn(
                            "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#E5C378] text-xs font-medium",
                            formData.departureCity ? "top-1 text-[9px] text-[#E5C378]" : "top-3.5 text-xs text-slate-300"
                          )}>
                            Departure City
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button 
                          type="button" 
                          onClick={nextStep}
                          className="bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold px-8 py-2.5 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 text-xs uppercase tracking-wider"
                        >
                          Next Step <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Trip Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4 text-left">
                      <div className="text-center mb-6">
                        <MapPin className="w-10 h-10 mx-auto text-[#C9A25A] mb-2" />
                        <h3 className="text-base font-serif font-bold text-white">Plan Your Journey</h3>
                        <p className="text-slate-300 text-xs font-light">Tell us about your dream destination and travel plans</p>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white block mb-2">Choose Your Destination *</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1 border border-white/15 rounded-xl p-3 bg-white/5">
                          {destinationOptions.map((destination) => (
                            <button
                              key={destination}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, destinations: destination }));
                                if (destination !== 'Custom Destination (Please specify)') {
                                  setCustomDest('');
                                }
                              }}
                              className={cn(
                                "p-3 text-left rounded-xl border text-[11px] transition-all duration-300",
                                formData.destinations === destination
                                  ? 'border-[#C9A25A] bg-[#C9A25A]/15 text-[#E5C378] font-bold'
                                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10'
                              )}
                            >
                              <div className="font-bold text-white">{destination.split('(')[0].trim()}</div>
                              {destination.includes('(') && (
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  {destination.split('(')[1]?.replace(')', '')}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        {errors.destinations && <p className="text-[9px] text-red-400 mt-1 pl-2">{errors.destinations}</p>}

                        {formData.destinations === 'Custom Destination (Please specify)' && (
                          <div className="mt-3 relative">
                            <input
                              type="text"
                              placeholder="Enter your custom destination"
                              value={customDest}
                              onChange={(e) => {
                                setCustomDest(e.target.value);
                              }}
                              className="w-full h-10 px-3 bg-white/5 border border-[#C9A25A]/40 text-white rounded-xl focus:border-[#C9A25A] text-xs focus:ring-0 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* Travel Dates & Travel Month */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Travel Dates */}
                        <div className="relative">
                          <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <input 
                            type="text"
                            name="travelDates"
                            value={formData.travelDates}
                            onChange={handleInputChange}
                            placeholder=" "
                            className={cn(
                              "peer w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#C9A25A] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0",
                              errors.travelDates ? "border-red-500/80 focus:border-red-500" : "border-white/15"
                            )}
                          />
                          <label className={cn(
                            "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#E5C378] text-xs font-medium",
                            formData.travelDates ? "top-1 text-[9px] text-[#E5C378]" : "top-3.5 text-xs text-slate-300"
                          )}>
                            Preferred Travel Date *
                          </label>
                          {errors.travelDates && <p className="text-[9px] text-red-400 mt-1 pl-2">{errors.travelDates}</p>}
                        </div>

                        {/* Travel Month Select */}
                        <div className="relative">
                          <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none z-10">
                            <Clock className="w-4 h-4" />
                          </div>
                          <select
                            name="travelMonth"
                            value={formData.travelMonth}
                            onChange={(e) => handleSelectChange('travelMonth', e.target.value)}
                            className={cn(
                              "peer block w-full pl-9 pr-8 pt-5 pb-1.5 text-xs text-white bg-[#0B1026] border rounded-xl focus:border-[#C9A25A] focus:outline-none transition-all appearance-none cursor-pointer border-white/15",
                              errors.travelMonth ? "border-red-500/80 focus:border-red-500" : ""
                            )}
                          >
                            <option value="" disabled hidden></option>
                            {getNext12Months().map((m, idx) => (
                              <option key={idx} value={m} className="bg-[#0B1026] text-white">{m}</option>
                            ))}
                          </select>
                          <label className={cn(
                            "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#E5C378] text-xs font-medium z-10",
                            formData.travelMonth ? "top-1 text-[9px] text-[#E5C378]" : "top-3.5 text-xs text-slate-300"
                          )}>
                            Travel Month *
                          </label>
                          <div className="absolute right-3 top-3.5 text-slate-400 pointer-events-none z-10">
                            <span className="text-[8px]">▼</span>
                          </div>
                          {errors.travelMonth && <p className="text-[9px] text-red-400 mt-1 pl-2">{errors.travelMonth}</p>}
                        </div>
                      </div>

                      {/* Adults & Children select */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Adults Count */}
                        <div className="relative">
                          <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none z-10">
                            <Users className="w-4 h-4" />
                          </div>
                          <select
                            name="adultCount"
                            value={formData.adultCount}
                            onChange={(e) => handleSelectChange('adultCount', e.target.value)}
                            className="peer block w-full pl-9 pr-8 pt-5 pb-1.5 text-xs text-white bg-[#0B1026] border border-white/15 rounded-xl focus:border-[#C9A25A] focus:outline-none transition-all appearance-none cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={String(num)} className="bg-[#0B1026] text-white">{num} Adult{num > 1 ? 's' : ''}</option>
                            ))}
                          </select>
                          <label className="absolute left-9 transition-all duration-200 pointer-events-none origin-[0] text-[#E5C378] text-[9px] top-1 z-10 font-bold">
                            Adults (12y+)
                          </label>
                          <div className="absolute right-3 top-3.5 text-slate-400 pointer-events-none z-10">
                            <span className="text-[8px]">▼</span>
                          </div>
                        </div>

                        {/* Children Count */}
                        <div className="relative">
                          <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none z-10">
                            <Users className="w-4 h-4" />
                          </div>
                          <select
                            name="childCount"
                            value={formData.childCount}
                            onChange={(e) => handleSelectChange('childCount', e.target.value)}
                            className="peer block w-full pl-9 pr-8 pt-5 pb-1.5 text-xs text-white bg-[#0B1026] border border-white/15 rounded-xl focus:border-[#C9A25A] focus:outline-none transition-all appearance-none cursor-pointer"
                          >
                            {[0, 1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={String(num)} className="bg-[#0B1026] text-white">{num} Child{num !== 1 ? 'ren' : ''} (2-12y)</option>
                            ))}
                          </select>
                          <label className="absolute left-9 transition-all duration-200 pointer-events-none origin-[0] text-[#E5C378] text-[9px] top-1 z-10 font-bold">
                            Children (2-12y)
                          </label>
                          <div className="absolute right-3 top-3.5 text-slate-400 pointer-events-none z-10">
                            <span className="text-[8px]">▼</span>
                          </div>
                        </div>
                      </div>

                      {/* Travel Type selection */}
                      <div>
                        <label className="text-xs font-bold text-white block mb-2">Travel Type *</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {travelTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => handleSelectChange('travelType', type)}
                              className={cn(
                                "p-2.5 text-center rounded-xl border text-[11px] transition-all duration-300",
                                formData.travelType === type
                                  ? 'border-[#C9A25A] bg-[#C9A25A]/15 text-[#E5C378] font-bold'
                                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        {errors.travelType && <p className="text-[9px] text-red-400 mt-1 pl-2">{errors.travelType}</p>}
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button 
                          type="button" 
                          onClick={prevStep}
                          variant="outline"
                          className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs uppercase"
                        >
                          <ArrowLeft className="w-4 h-4" /> Previous
                        </Button>
                        <Button 
                          type="button" 
                          onClick={nextStep}
                          className="bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold px-8 py-2.5 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 text-xs uppercase tracking-wider"
                        >
                          Next Step <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Preferences */}
                  {currentStep === 3 && (
                    <div className="space-y-4 text-left">
                      <div className="text-center mb-6">
                        <Star className="w-10 h-10 mx-auto text-[#C9A25A] mb-2" />
                        <h3 className="text-base font-serif font-bold text-white">Customize Your Experience</h3>
                        <p className="text-slate-300 text-xs font-light">Help us personalize your trip to absolute perfection</p>
                      </div>

                      {/* Budget Ranges Grid */}
                      <div>
                        <label className="text-xs font-bold text-white block mb-2">Budget Range (Per Person) *</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {budgetRanges.map((budget) => (
                            <button
                              key={budget}
                              type="button"
                              onClick={() => handleSelectChange('budget', budget)}
                              className={cn(
                                "p-3 text-center rounded-xl border text-[11px] transition-all duration-300",
                                formData.budget === budget
                                  ? 'border-[#C9A25A] bg-[#C9A25A]/15 text-[#E5C378] font-bold'
                                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                              )}
                            >
                              {budget}
                            </button>
                          ))}
                        </div>
                        {errors.budget && <p className="text-[9px] text-red-400 mt-1 pl-2">{errors.budget}</p>}
                      </div>

                      {/* Hotel Category Choice */}
                      <div>
                        <label className="text-xs font-bold text-white block mb-2">Preferred Accommodation Class *</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            { value: '3 Star', label: '3 Star Standard' },
                            { value: '4 Star', label: '4 Star Premium' },
                            { value: '5 Star', label: '5 Star Luxury' },
                            { value: 'Luxury', label: 'Elite Stays' }
                          ].map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => handleAccommodationSelect(item.value)}
                              className={cn(
                                "p-3 text-center rounded-xl border text-[11px] transition-all duration-300",
                                formData.hotelCategory === item.value
                                  ? 'border-[#C9A25A] bg-[#C9A25A]/15 text-[#E5C378] font-bold'
                                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                        {errors.hotelCategory && <p className="text-[9px] text-red-400 mt-1 pl-2">{errors.hotelCategory}</p>}
                      </div>

                      {/* Preferred Activities */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                          <Send className="w-4 h-4" />
                        </div>
                        <textarea
                          name="activities"
                          value={formData.activities}
                          onChange={handleInputChange}
                          placeholder=" "
                          rows={2}
                          className="peer w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border border-white/15 rounded-xl focus:border-[#C9A25A] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0 min-h-[60px]"
                        />
                        <label className={cn(
                          "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#E5C378] text-xs font-medium",
                          formData.activities ? "top-1 text-[9px] text-[#E5C378]" : "top-3.5 text-xs text-slate-300"
                        )}>
                          Preferred Activities (e.g. Scuba, Heritage walks)
                        </label>
                      </div>

                      {/* Special Requests */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                          <Heart className="w-4 h-4" />
                        </div>
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleInputChange}
                          placeholder=" "
                          rows={2}
                          className="peer w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border border-white/15 rounded-xl focus:border-[#C9A25A] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0 min-h-[60px]"
                        />
                        <label className={cn(
                          "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#E5C378] text-xs font-medium",
                          formData.specialRequests ? "top-1 text-[9px] text-[#E5C378]" : "top-3.5 text-xs text-slate-300"
                        )}>
                          Special Requests (e.g. Dietary, Anniversary)
                        </label>
                      </div>

                      {/* Additional Preferences */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-slate-400 pointer-events-none">
                          <Users className="w-4 h-4" />
                        </div>
                        <textarea
                          name="preferences"
                          value={formData.preferences}
                          onChange={handleInputChange}
                          placeholder=" "
                          rows={2}
                          className="peer w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border border-white/15 rounded-xl focus:border-[#C9A25A] focus:ring-0 focus:outline-none transition-all placeholder:opacity-0 min-h-[60px]"
                        />
                        <label className={cn(
                          "absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#E5C378] text-xs font-medium",
                          formData.preferences ? "top-1 text-[9px] text-[#E5C378]" : "top-3.5 text-xs text-slate-300"
                        )}>
                          Other Tour Details or Notes
                        </label>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button 
                          type="button" 
                          onClick={prevStep}
                          variant="outline"
                          className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs uppercase"
                        >
                          <ArrowLeft className="w-4 h-4" /> Previous
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold px-8 py-2.5 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 text-xs uppercase tracking-wider"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#070C1E] mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>Submit Journey Request 🚀</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* COLUMN 3: STICKY CONSULTANT CARD (lg:col-span-3) */}
              <div className="lg:col-span-3 sticky top-24 space-y-6 text-left">
                <div className="bg-[#0B1226]/90 border border-white/10 rounded-2xl p-5 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full mx-auto overflow-hidden bg-[#C9A25A]/15 border border-[#C9A25A]/30 flex items-center justify-center text-3xl">
                    🤵
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-white">Mr. Suresh Bhatt</h4>
                    <p className="text-[10px] text-[#E5C378] tracking-wider uppercase font-bold">Senior Destination Advisor</p>
                  </div>
                  <div className="w-full h-[1px] bg-white/10" />
                  <div className="space-y-3 text-xs text-left">
                    <a href="tel:+919910987264" className="flex items-center gap-3.5 text-white/80 hover:text-white transition-all p-2 rounded-xl bg-white/5 border border-white/5">
                      <Phone className="w-4 h-4 text-[#C9A25A] shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">Call Line</p>
                        <p className="font-bold text-white">+91 99109 87264</p>
                      </div>
                    </a>
                    <a href="mailto:booking@ghumofiroo.com" className="flex items-center gap-3.5 text-white/80 hover:text-white transition-all p-2 rounded-xl bg-white/5 border border-white/5">
                      <Mail className="w-4 h-4 text-[#C9A25A] shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">Email Us</p>
                        <p className="font-bold text-white truncate">booking@ghumofiroo.com</p>
                      </div>
                    </a>
                    <div className="flex items-center gap-3.5 text-white/80 p-2 rounded-xl bg-white/5 border border-white/5">
                      <Clock className="w-4 h-4 text-[#C9A25A] shrink-0" />
                      <div>
                        <p className="text-[9px] text-slate-400 font-semibold uppercase">Response Time</p>
                        <p className="font-bold text-emerald-400">&lt; 15 Mins Response</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Trust badge */}
                <div className="bg-[#C9A25A]/10 border border-[#C9A25A]/25 rounded-2xl p-5 text-center">
                  <p className="text-xs font-serif text-[#E5C378] font-bold italic">"Where dreams become itineraries."</p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 5: DESTINATION HIGHLIGHTS */}
        <section className="py-16 bg-[#0B1026] text-white border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
                Highlights of {theme.title === "Boutique Custom Journey" ? "Bespoke Travels" : theme.title}
              </h2>
              <p className="text-slate-300 text-xs md:text-sm font-light">
                Handpicked experiences to make your private consultation journey extraordinary.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Attractions */}
              <div className="bg-[#0B1226]/80 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#C9A25A]/40 transition-all text-left">
                <div className="text-2xl text-[#C9A25A]">🏛️</div>
                <h3 className="font-serif text-lg font-bold text-white">Top Attractions</h3>
                <ul className="space-y-2 text-xs text-slate-300 font-light">
                  {theme.attractions.map((a, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C9A25A]" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Activities */}
              <div className="bg-[#0B1226]/80 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#C9A25A]/40 transition-all text-left">
                <div className="text-2xl text-[#C9A25A]">🏄</div>
                <h3 className="font-serif text-lg font-bold text-white">Top Activities</h3>
                <ul className="space-y-2 text-xs text-slate-300 font-light">
                  {theme.activities.map((a, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C9A25A]" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best Experiences */}
              <div className="bg-[#0B1226]/80 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-[#C9A25A]/40 transition-all text-left">
                <div className="text-2xl text-[#C9A25A]">✨</div>
                <h3 className="font-serif text-lg font-bold text-white">Best Experiences</h3>
                <ul className="space-y-2 text-xs text-slate-300 font-light">
                  {theme.experiences.map((e, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C9A25A]" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: TRAVELER REVIEWS */}
        <section className="py-16 bg-[#050A18] text-white border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 space-y-12">
            <div className="text-center space-y-2">
              <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
                What Our Travelers Say
              </h2>
              <p className="text-slate-300 text-xs md:text-sm font-light">
                Real stories from families, couples, and adventurers who planned with us.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { name: "Aditya & Priya Sharma", dest: "Thailand Tropical Escape", rating: 5, text: "Fabulous arrangements! From private speedboats to boutique hotels, Mr. Bhatt tailored the trip perfectly. Highly recommend their Thai planning.", photo: "👨‍👩‍👦" },
                { name: "Rajesh K. Mehta", dest: "Rann Utsav family tour", rating: 5, text: "The White Desert under full moon was spellbinding. Stays at the premium tents were superb, and permits were sorted instantly. Top service!", photo: "👴" },
                { name: "Dr. Sandeep Rawat", dest: "Char Dham Yatra by heli", rating: 5, text: "Extremely seamless pilgrim tour for my parents. Helicopter shuttle tickets, VIP entries at Kedarnath, and warm stays were perfectly executed.", photo: "👨‍⚕️" }
              ].map((rev, idx) => (
                <div key={idx} className="bg-[#0B1226]/80 border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-[#C9A25A]/40 transition-all">
                  <div className="space-y-2.5">
                    <div className="flex gap-0.5 text-[#C9A25A]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-300 font-light italic leading-relaxed">
                      "{rev.text}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                      {rev.photo}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-white">{rev.name}</h4>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-semibold">Verified Guest</span>
                      </div>
                      <p className="text-[9px] text-[#E5C378] uppercase font-bold">{rev.dest}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7: WHY BOOK NOW */}
        <section className="py-12 bg-[#0B1026] text-white border-t border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
            <div className="inline-block px-3.5 py-1 rounded-full bg-[#C9A25A]/15 border border-[#C9A25A]/30 text-[#E5C378] text-[10px] font-bold tracking-widest uppercase">
              Limited Availability Offer
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
              Secure Your Seasonal Journey Today
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto font-light leading-relaxed">
              Highly popular travel periods book out months in advance. Secure the best hotels, flights, and seasonal rates by placing your custom enquiry today.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold text-slate-300 pt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[#C9A25A]">✦</span> Best seasonal rates locked in
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#C9A25A]">✦</span> Premium hotel rooms guaranteed
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#C9A25A]">✦</span> Flexible rescheduling options
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: FAQ */}
        <section className="py-16 bg-[#050A18] text-white">
          <div className="max-w-4xl mx-auto px-4">
            <FAQSection 
              faqs={theme.faqs}
              title={`${theme.title === "Boutique Custom Journey" ? "Custom Planning" : theme.title} FAQs`}
              subtitle="Common questions about planning your dream vacation with us."
              className="py-0 bg-transparent text-white animate-fade-in"
              dark={true}
            />
          </div>
        </section>

        {/* MOBILE STICKY BOTTOM BAR */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070C1E]/95 backdrop-blur-md border-t border-white/10 p-3.5 flex gap-3 shadow-[0_-10px_35px_rgba(0,0,0,0.5)]">
          <a href="tel:+919910987264" className="w-1/2 block">
            <Button 
              variant="outline"
              className="w-full h-11 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#C9A25A]" /> Call Expert
            </Button>
          </a>
          <Button 
            onClick={scrollToForm}
            className="w-1/2 h-11 bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
          >
            <span>🚀</span> Plan Journey
          </Button>
        </div>

      </div>
    </Layout>
  );
};

export default CustomTourPackages;
