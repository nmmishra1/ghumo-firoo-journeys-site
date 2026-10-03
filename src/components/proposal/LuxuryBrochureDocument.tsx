import React from 'react';
import { 
  MapPin, Calendar, Users, Phone, Mail, CheckCircle2, 
  Bed, Utensils, Info, ShieldCheck, Clock, FileText, IndianRupee, Star
} from 'lucide-react';
import { OFFICIAL_BANK_DETAILS } from '@/constants/bankDetails';

export interface LuxuryBrochureProps {
  lead: any;
  itinerary: any;
  activeOption: any;
  agentProfile?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export function getDestinationPhotos(destination: string = ''): {
  hero: string;
  vertical: string;
  hotelPhotos: string[];
} {
  const d = destination.toLowerCase();
  
  if (d.includes('jodhpur') || d.includes('rajasthan')) {
    return {
      hero: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1600&auto=format&fit=crop', // Mehrangarh Fort / Blue city
      vertical: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop',
      hotelPhotos: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop'
      ]
    };
  }

  if (d.includes('kashmir') || d.includes('srinagar') || d.includes('gulmarg')) {
    return {
      hero: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=1600&auto=format&fit=crop',
      vertical: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800&auto=format&fit=crop',
      hotelPhotos: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop'
      ]
    };
  }

  if (d.includes('kerala') || d.includes('munnar')) {
    return {
      hero: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1600&auto=format&fit=crop',
      vertical: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
      hotelPhotos: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop'
      ]
    };
  }

  return {
    hero: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop',
    vertical: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
    hotelPhotos: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop'
    ]
  };
}

export function formatBrochureDate(dateStr?: string): string {
  if (!dateStr || dateStr.startsWith('0000')) return 'Date TBD';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatDayHeaderDate(dateStr?: string): string {
  if (!dateStr || dateStr.startsWith('0000')) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function LuxuryBrochureDocument({
  lead,
  itinerary,
  activeOption,
  agentProfile
}: LuxuryBrochureProps) {
  const customerName = lead?.customer_name || 'Valued Guest';
  const customerFirstName = customerName.split(' ')[0] || customerName;
  const leadId = lead?.id || 28;
  const refNumber = lead?.enquiry_number || `885${leadId.toString().padStart(4, '0')}`;
  
  const rawDest = lead?.destination || lead?.destinations || itinerary?.itinerary_name || 'Jodhpur';
  const destinationClean = typeof rawDest === 'string'
    ? rawDest.split('·')[0].split('(')[0].trim()
    : Array.isArray(rawDest) && rawDest.length > 0
    ? String(rawDest[0]).split('·')[0].split('(')[0].trim()
    : 'Jodhpur';
  
  const nights = itinerary?.total_nights || (itinerary?.days?.length ? itinerary.days.length - 1 : 1);
  const daysCount = nights + 1;
  const adultCount = lead?.adult_count || itinerary?.adult_count || 2;
  const roomCount = Math.ceil(adultCount / 2) || 1;
  
  const startDate = lead?.trip_start_date || itinerary?.travel_start_date || '2026-10-02';
  const endDate = lead?.trip_end_date || itinerary?.travel_end_date || '2026-10-03';
  
  const photos = getDestinationPhotos(destinationClean);
  
  const agentName = agentProfile?.name || lead?.agent_name || 'SANGITA KUMARI';
  const agentPhone = agentProfile?.phone || OFFICIAL_BANK_DETAILS.phone;
  const agentEmail = agentProfile?.email || OFFICIAL_BANK_DETAILS.email;
  
  const totalPrice = Number(activeOption?.total_price || itinerary?.final_cost || 21262);
  const pricePerAdult = activeOption?.price_per_person || Math.round(totalPrice / adultCount);
  
  // Extract hotel info from day 1 or hotels list or metadata blocks
  const days = itinerary?.days || [];
  let hotelFound: any = null;
  for (const d of days) {
    if (d?.hotels && d.hotels.length > 0) {
      hotelFound = {
        hotel_name: d.hotels[0].hotel_name || d.hotels[0].name,
        room_category: d.hotels[0].room_category || d.hotels[0].room_type,
        meal_plan: d.hotels[0].meal_plan,
        address: d.hotels[0].address || d.hotels[0].hotel_address,
        star_category: d.hotels[0].star_category || 4
      };
      break;
    }
    const blockHotel = d?.metadata?.blocks?.find((b: any) => b.type === 'hotel');
    if (blockHotel) {
      hotelFound = {
        hotel_name: blockHotel.properties?.hotel_name || blockHotel.title,
        room_category: blockHotel.properties?.room_category || blockHotel.properties?.room_type,
        meal_plan: blockHotel.properties?.meal_plan,
        address: blockHotel.properties?.hotel_address || blockHotel.properties?.address,
        star_category: blockHotel.properties?.stars || 4
      };
      break;
    }
  }

  const firstHotel = hotelFound || {
    hotel_name: 'WelcomHeritage Bal Samand Lake Palace',
    room_category: 'Garden Room',
    meal_plan: 'Breakfast (CP)',
    address: 'BSF STC, Mandore Rd, Mandore, Jodhpur',
    star_category: 4
  };

  const hotelName = firstHotel.hotel_name || 'WelcomHeritage Bal Samand Lake Palace';
  const hotelAddress = firstHotel.address || 'BSF STC, Mandore Rd, Mandore, Jodhpur, Rajasthan';
  const roomCategory = firstHotel.room_category || 'Garden Room';
  const mealPlanName = firstHotel.meal_plan || 'Breakfast included';

  return (
    <div className="luxury-brochure-root bg-white text-slate-900 font-sans antialiased text-left selection:bg-[#0A2540] selection:text-white">
      
      {/* ============================================================== */}
      {/* PAGE 1: FULL BLEED COVER PAGE                                  */}
      {/* ============================================================== */}
      <div className="luxury-brochure-page relative w-[210mm] h-[297mm] mx-auto overflow-hidden bg-[#0A2540] flex flex-col justify-end p-12 text-white">
        {/* Full Bleed Destination Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={photos.hero} 
            alt={destinationClean} 
            className="w-full h-full object-cover filter brightness-[0.88]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Cover Content */}
        <div className="relative z-10 space-y-4 pb-8 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-white leading-tight drop-shadow-md">
            {customerFirstName}'s Trip to {destinationClean}
          </h1>
          
          <div className="text-sm font-semibold tracking-wide text-slate-200">
            Reference Number: <span className="font-mono font-bold text-white">{refNumber}</span>
          </div>

          <div className="w-full h-[1.5px] bg-white/40 my-3" />

          {/* Quick Meta Bullets */}
          <div className="space-y-2 pt-1 text-sm font-semibold text-white drop-shadow">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{destinationClean} {nights}N</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{formatBrochureDate(startDate)} - {nights} nights/{daysCount} days</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{roomCount} room, {adultCount} adults</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/20 text-xs font-bold uppercase tracking-wider text-slate-300">
          Specially prepared by <span className="text-white font-black">{agentName}</span> at <span className="text-amber-300 font-black">GHUMO FIROO TRAVELS</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PAGE 2: WELCOME & "SPECIALLY PREPARED FOR & BY"               */}
      {/* ============================================================== */}
      <div className="luxury-brochure-page relative w-[210mm] h-[297mm] mx-auto overflow-hidden bg-white flex text-slate-800">
        {/* Left 32%: Vertical Slice Image */}
        <div className="w-[32%] h-full relative overflow-hidden bg-slate-100 border-r border-slate-200">
          <img 
            src={photos.vertical} 
            alt={destinationClean} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Right 68%: Prepared For / By Details */}
        <div className="w-[68%] h-full p-12 flex flex-col justify-between">
          <div className="space-y-10 pt-4">
            {/* Prepared For */}
            <div className="space-y-2 text-left">
              <h3 className="text-2xl font-serif font-black text-[#0A2540]">
                Specially prepared for
              </h3>
              <p className="text-xl font-bold text-slate-900">
                {customerName}
              </p>
            </div>

            {/* Prepared By */}
            <div className="space-y-3 text-left pt-4">
              <h3 className="text-2xl font-serif font-black text-[#0A2540]">
                Specially prepared by
              </h3>
              
              <div className="pt-2">
                <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" className="h-10 w-auto object-contain" />
              </div>

              <div className="pt-2">
                <div className="text-base font-black uppercase text-slate-900 tracking-wide">
                  {agentName}
                </div>
                <div className="text-xs font-bold text-[#0A2540] uppercase tracking-wider underline">
                  at GHUMO FIROO TRAVELS
                </div>
              </div>

              <div className="pt-3 space-y-1.5 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#0A2540]" />
                  <span>{agentPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#0A2540]" />
                  <span>{agentEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Conditions & Disclaimers */}
          <div className="text-[10px] leading-relaxed text-slate-500 space-y-2 pt-8 border-t border-slate-200 text-left">
            <p className="font-semibold text-slate-600">
              This itinerary is a preliminary proposal. Please review it carefully and inform us of any changes or discrepancies.
            </p>
            <p>
              Currently, no services are being held and all services and prices are subject to availability and potential currency fluctuations. A deposit for a booking constitutes Customer's acceptance of these Terms & Conditions. Please review land deposit and air payment conditions. Please note that paying the deposit does not guarantee confirmation. Services remain On Request at the time of booking, and if the original services are unavailable, alternatives may be offered with potential price adjustments.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PAGE 3: ITINERARY OVERVIEW TABLE                              */}
      {/* ============================================================== */}
      <div className="luxury-brochure-page relative w-[210mm] h-[297mm] mx-auto overflow-hidden bg-white flex flex-col p-12 text-slate-900">
        <h2 className="text-3xl font-serif font-black text-[#0A2540] mb-8 pb-4 border-b border-slate-200 text-left">
          Itinerary
        </h2>

        {/* Table Header Banner */}
        <div className="bg-[#0A2540] text-white px-5 py-3 rounded-t-lg font-bold text-xs uppercase tracking-wider grid grid-cols-12 gap-4">
          <div className="col-span-3">Date</div>
          <div className="col-span-4">Product</div>
          <div className="col-span-5">Description</div>
        </div>

        {/* Table Rows */}
        <div className="border border-t-0 border-slate-200 divide-y divide-slate-200 text-xs rounded-b-lg">
          {/* Transport Row */}
          <div className="p-5 grid grid-cols-12 gap-4 items-start">
            <div className="col-span-3 font-semibold text-slate-700">
              {formatBrochureDate(startDate)}
            </div>
            <div className="col-span-4 space-y-0.5">
              <div className="font-black text-slate-900">Road Transport</div>
              <div className="text-[11px] text-slate-600">AC Sedan / Dzire from {destinationClean} - Drop at {destinationClean}</div>
            </div>
            <div className="col-span-5 text-slate-600">
              Covering {destinationClean} as per Itinerary with private chauffeur & fuel included
            </div>
          </div>

          {/* Hotel Row */}
          <div className="p-5 grid grid-cols-12 gap-4 items-start bg-slate-50/50">
            <div className="col-span-3 font-semibold text-slate-700">
              {formatBrochureDate(startDate)}
            </div>
            <div className="col-span-4 space-y-0.5">
              <div className="font-black text-slate-900">Hotel</div>
              <div className="text-[11px] text-[#0A2540] font-bold">{hotelName}</div>
              <div className="text-[10px] text-slate-500">{nights} night stay</div>
            </div>
            <div className="col-span-5 text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">1 x {roomCategory}</div>
              <div>{mealPlanName} for {adultCount} Guests, 1 King Bed</div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 text-[11px] text-slate-400 flex justify-between border-t border-slate-100">
          <span>{formatBrochureDate(startDate)}</span>
          <span>Ref: {refNumber}</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PAGE 4: HOTEL SHOWCASE FEATURE PAGE                           */}
      {/* ============================================================== */}
      <div className="luxury-brochure-page relative w-[210mm] h-[297mm] mx-auto overflow-hidden bg-white flex flex-col p-12 text-slate-900">
        {/* Navy Header Strip */}
        <div className="bg-[#0A2540] text-white px-6 py-3 rounded-xl flex justify-between items-center mb-6">
          <span className="text-xl font-serif font-black">{destinationClean}</span>
          <span className="text-xs font-semibold tracking-wide text-slate-200">
            {nights} night / {formatBrochureDate(startDate)} - {formatBrochureDate(endDate)}
          </span>
        </div>

        {/* Hotel Title & Address */}
        <div className="space-y-1 mb-5 text-left">
          <div className="flex items-center gap-1 text-amber-500 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <Star className="w-3.5 h-3.5 fill-amber-500" />
          </div>
          <h2 className="text-2xl font-serif font-black text-slate-900">
            {hotelName}
          </h2>
          <p className="text-xs text-slate-500">
            {hotelAddress}
          </p>
        </div>

        {/* Check-in / Check-out Timing Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs mb-6">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Check-in</span>
            <span className="font-bold text-slate-900">02:00 PM, {formatBrochureDate(startDate)}</span>
          </div>
          <div className="h-6 w-px bg-slate-300 mx-2" />
          <div className="text-center font-black text-[#0A2540] text-[11px] uppercase tracking-wider px-3 py-1 bg-amber-500/15 rounded-lg border border-amber-500/30">
            {nights} night
          </div>
          <div className="h-6 w-px bg-slate-300 mx-2" />
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Check-out</span>
            <span className="font-bold text-slate-900">11:00 AM, {formatBrochureDate(endDate)}</span>
          </div>
        </div>

        {/* Two-Column Showcase: Photos Left + Highlights Right */}
        <div className="grid grid-cols-12 gap-6 items-start flex-1">
          {/* Left Column: 4 Hotel Photos Collage */}
          <div className="col-span-5 grid grid-cols-2 gap-2">
            {photos.hotelPhotos.map((src, i) => (
              <img 
                key={i} 
                src={src} 
                alt="Hotel Photo" 
                className="w-full h-32 object-cover rounded-lg border border-slate-200 shadow-xs"
              />
            ))}
          </div>

          {/* Right Column: "What to know about this hotel" Highlights */}
          <div className="col-span-7 space-y-4 text-left">
            <h4 className="text-sm font-black text-[#0A2540] uppercase tracking-wide border-b border-slate-200 pb-1">
              What to know about this hotel
            </h4>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] leading-relaxed text-slate-700">
              <div><strong className="text-slate-900">LakeView:</strong> Stunning lake views and serene private palace lawns</div>
              <div><strong className="text-slate-900">LobbyAmbience:</strong> Grand, elegant lobby with royal Rajasthani architecture</div>
              <div><strong className="text-slate-900">HeritageFeel:</strong> Rich royal history, antique artifacts, and palace courtyards</div>
              <div><strong className="text-slate-900">SpaciousRooms:</strong> Large regal suites (avg 400+ sq ft) with modern comforts</div>
              <div><strong className="text-slate-900">DiningOptions:</strong> Fine dining restaurant serving authentic Marwari & world cuisine</div>
              <div><strong className="text-slate-900">LocalTouch:</strong> Traditional folk music evenings and peacock gardens</div>
              <div><strong className="text-slate-900">Connectivity:</strong> High-speed Wi-Fi accessible in suites & public areas</div>
              <div><strong className="text-slate-900">ChauffeurSupport:</strong> Valet parking and dedicated private driver resting quarters</div>
            </div>

            {/* Room Specifications Box */}
            <div className="bg-[#0A2540]/5 border border-[#0A2540]/15 rounded-xl p-4 space-y-1.5 text-xs">
              <div className="font-black text-[#0A2540] text-sm">1 x {roomCategory}</div>
              <div className="text-slate-700 font-semibold">{mealPlanName} for {adultCount} Adults, 1 King Bed</div>
              <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Hotel Confirmation • Flexible Amendments Available
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 text-[11px] text-slate-400 flex justify-between border-t border-slate-100">
          <span>{formatBrochureDate(startDate)}</span>
          <span>Ref: {refNumber}</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PAGES 5 & 6: DAY-BY-DAY JOURNEY                                */}
      {/* ============================================================== */}
      {days.map((day: any, idx: number) => {
        const dayNumber = day.day_number || idx + 1;
        const dayTitle = day.title || `Day ${dayNumber}: Exploration of ${day.city || destinationClean}`;
        const dayDate = day.date || (idx === 0 ? startDate : endDate);
        const dayDescription = day.description || 'Enjoy a curated private sightseeing tour exploring iconic monuments, local markets, and cultural landmarks.';
        
        return (
          <div key={idx} className="luxury-brochure-page relative w-[210mm] h-[297mm] mx-auto overflow-hidden bg-white flex flex-col p-12 text-slate-900">
            {/* Day Header Banner */}
            <div className="bg-[#0A2540] text-white px-6 py-3 rounded-xl flex justify-between items-center mb-6">
              <span className="text-lg font-serif font-black">
                Day {dayNumber} - {formatDayHeaderDate(dayDate) || formatBrochureDate(dayDate)}
              </span>
            </div>

            {/* Day Title & Narrative */}
            <div className="space-y-4 text-left flex-1">
              <h3 className="text-2xl font-serif font-black text-slate-900 leading-snug">
                {dayTitle}
              </h3>

              <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-line space-y-3 font-medium">
                {dayDescription}
              </div>

              {/* Covered Attractions Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 mt-4">
                <div className="text-xs font-black uppercase text-[#0A2540] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#0A2540]" />
                  Key Sightseeing & Points of Interest
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  Mehrangarh Fort, Jaswant Thada, Umaid Bhawan Palace, Mandore Garden, Ghantaghar Market & local handicraft bazaars.
                </div>
              </div>

              {/* Important Notes Box */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-800" />
                  Notes & Timings
                </div>
                <ul className="text-[11px] text-amber-950 space-y-1 list-disc pl-4 font-medium">
                  <li>Last entry to Umaid Bhawan Museum & Mehrangarh Fort closes at 16:00 PM.</li>
                  <li>Comfortable walking footwear and modest attire recommended for temple visits.</li>
                  <li>Dedicated private air-conditioned vehicle is on standby for your group throughout.</li>
                </ul>
              </div>

              {/* Overnight Stay Badge */}
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-800">
                <Bed className="w-4 h-4 text-[#0A2540]" />
                <span>Overnight stay at <strong className="text-[#0A2540]">{hotelName}</strong></span>
              </div>

              {/* Meal Plan Bar */}
              <div className="flex gap-4 pt-3 text-xs">
                <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  Breakfast: {idx > 0 ? 'Included at Hotel' : 'Not Included (Arrival Day)'}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-medium">
                  Lunch: Not Included
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-medium">
                  Dinner: Not Included
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 text-[11px] text-slate-400 flex justify-between border-t border-slate-100">
              <span>{formatBrochureDate(dayDate)}</span>
              <span>Ref: {refNumber}</span>
            </div>
          </div>
        );
      })}

      {/* ============================================================== */}
      {/* PAGE 7: COMMERCIAL PRICING SUMMARY                             */}
      {/* ============================================================== */}
      <div className="luxury-brochure-page relative w-[210mm] h-[297mm] mx-auto overflow-hidden bg-white flex text-slate-900">
        {/* Left 32%: Elegant Royal Navy Brand Texture */}
        <div className="w-[32%] h-full bg-[#0A2540] relative overflow-hidden flex flex-col justify-between p-8 text-white">
          <div className="space-y-4">
            <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" className="h-10 w-auto object-contain brightness-0 invert" />
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Official Proposal</div>
          </div>

          <div className="space-y-2 text-[10px] text-slate-300 leading-relaxed">
            <p className="font-bold text-white uppercase tracking-wider">Private Chauffeur & Stays</p>
            <p>All-inclusive private itinerary tailored exclusively for your group with zero hidden charges.</p>
          </div>
        </div>

        {/* Right 68%: Commercial Pricing Breakdown */}
        <div className="w-[68%] h-full p-14 flex flex-col justify-between text-left">
          <div className="space-y-10 pt-4">
            <h2 className="text-3xl font-serif font-black text-[#0A2540] border-b border-slate-200 pb-4">
              Pricing Summary
            </h2>

            <div className="space-y-6">
              <div className="flex justify-between items-baseline pb-4 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-600">Price per adult</span>
                <span className="text-xl font-bold font-mono text-slate-900">₹ {pricePerAdult.toLocaleString('en-IN')}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-black text-[#0A2540] uppercase tracking-wide">Total Price</span>
                  <span className="text-3xl font-black font-mono text-[#0A2540]">₹ {totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  INCLUDING ALL TAXES
                </div>
              </div>

              <div className="inline-block bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg border border-slate-200">
                5% GST Included
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-12 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 space-y-1">
              <p>Total price calculated for <strong>{adultCount} Adults ({roomCount} Room)</strong>.</p>
              <p>Quotation is subject to hotel room and transport availability at the time of final confirmation.</p>
            </div>

            <div className="pt-4 text-[10px] text-slate-400 flex justify-between">
              <span>{formatBrochureDate(startDate)}</span>
              <span>Ref: {refNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PAGES 8 & 9: TERMS AND CONDITIONS & OFFICIAL BANK DETAILS      */}
      {/* ============================================================== */}
      <div className="luxury-brochure-page relative w-[210mm] h-[297mm] mx-auto overflow-hidden bg-white flex flex-col p-12 text-slate-900 text-left">
        <h2 className="text-2xl font-serif font-black text-[#0A2540] border-b border-slate-200 pb-3 mb-6">
          Terms and Conditions
        </h2>

        {/* 2-Column Magazine Grid */}
        <div className="grid grid-cols-2 gap-8 text-[10px] leading-relaxed text-slate-600 flex-1">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <h4 className="font-black text-slate-900 uppercase text-xs mb-1">Exclusions</h4>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Optional enhancements like room or flight upgrades, or local camera or video fees.</li>
                <li>Additional sightseeing, activities and experiences outside of the confirmed itinerary.</li>
                <li>Early check-in or late check-out from hotels (unless explicitly confirmed).</li>
                <li>Lunches, dinners, and drinks (alcoholic & non-alcoholic) unless specified in inclusions.</li>
                <li>Tips, portage, laundry, and personal incidentals.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-slate-900 uppercase text-xs mb-1">Important Information & Guidelines</h4>
              <p className="font-bold text-slate-800">Tours and Transfers</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Vehicle as mentioned in the booking will be provided with commercial tourist permit.</li>
                <li>Extra charges apply if additional vehicle is required due to travellers carrying extra luggage.</li>
                <li>Vehicle is available for use daily till 8:00 PM (as per itinerary). Late night hours subject to driver overtime.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-slate-900 uppercase text-xs mb-1">Our Scope of Services</h4>
              <p>
                We act solely as holiday organizers. We inspect and select the services provided to you. You are required to follow terms and rules of each hotel and transport provider. Any consequences arising from non-compliance will be at your own risk.
              </p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div>
              <h4 className="font-black text-slate-900 uppercase text-xs mb-1">Hotel and Land Cancellation Policy</h4>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Cancellations are subject to respective hotel policy. Non-refundable bookings are not eligible for refunds.</li>
                <li>No refunds for unused nights, early check-outs, or missed sightseeing due to personal schedule changes.</li>
                <li>Activities and monument passes are non-refundable once booked and ticketed.</li>
              </ul>
            </div>

            {/* Official Bank Account Information */}
            <div className="bg-[#0A2540]/5 border border-[#0A2540]/20 rounded-xl p-3.5 space-y-2">
              <h4 className="font-black text-[#0A2540] uppercase text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official Bank Account Details
              </h4>
              <div className="text-[10px] space-y-0.5 text-slate-800 font-mono">
                <div><strong>Account Name:</strong> {OFFICIAL_BANK_DETAILS.accountName}</div>
                <div><strong>Bank Name:</strong> {OFFICIAL_BANK_DETAILS.bankName}</div>
                <div><strong>Account No:</strong> <span className="text-[#0A2540] font-black">{OFFICIAL_BANK_DETAILS.accountNumber}</span></div>
                <div><strong>IFSC Code:</strong> <span className="text-[#0A2540] font-black">{OFFICIAL_BANK_DETAILS.ifscCode}</span></div>
                <div><strong>Branch:</strong> {OFFICIAL_BANK_DETAILS.branch}</div>
              </div>
              <p className="text-[9px] text-slate-500 pt-1 border-t border-slate-200">
                🔒 For your security, always make payments to this official company account. Never transfer funds to personal staff accounts.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900 uppercase text-xs mb-1">Amendment of Booking by Guest</h4>
              <p>
                If you wish to amend or modify your booking, submit your request in writing to your travel advisor. All amendments are subject to supplier availability and fare differences.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 text-[11px] text-slate-400 flex justify-between border-t border-slate-100">
          <span>Official Client Proposal — Ghumo Firoo Travels</span>
          <span>Ref: {refNumber}</span>
        </div>
      </div>

    </div>
  );
}
