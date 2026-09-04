/**
 * Chat Service — Powered by Official Google Gemini API & AI Travel Designer
 */

import { MASTER_DESTINATIONS } from '@/data/masterDestinations';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  destination?: string;
  travelDate?: string;
  passengers?: number;
  budget?: string;
  interests?: string[];
}

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AQ.Ab8RN6JfZ1MKggR2v9cGl1HX_5SCX-_AZdYQp8Ocv6LN4kHRJw';
const CANDIDATE_GEMINI_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest'
];

const SYSTEM_PROMPT = `You are Sarah, Senior AI Travel Designer for Ghumo Firoo Journeys — India's premier luxury travel company (Ministry of Tourism Registered Partner, Official Evoke Partner).

YOUR EXPERTISE & BEHAVIOR:
1. Speak warmly, engagingly, and professionally like an elite human luxury travel specialist.
2. ALWAYS maintain conversational context across multiple turns. Never forget the destination, dates, or passenger count the user previously shared.
3. When the user asks for a destination plan (e.g. Coorg, Rann Utsav, Char Dham, Kashmir, Manali, Kerala, Rajasthan, Goa, Europe, Thailand, Singapore, Bali, Dubai):
   - Provide a vibrant, structured day-by-day itinerary with real sightseeing, scenic drives, and local culinary tips.
   - Provide realistic pricing estimates (e.g. ₹12,000 - ₹25,000/person for domestic; ₹35,000 - ₹1,80,000 for international) with private transfers and 4-star boutique stays.
   - Warmly ask for their tentative travel dates and passenger count if not yet provided.
4. When the user gives dates (e.g. "oct 31") or guests (e.g. "2 people"), acknowledge their destination AND dates warmly, confirm seasonal weather recommendations, and offer to send the day-by-day PDF brochure with custom quotation to their WhatsApp or Email.
5. NEVER repeat generic templates like "X is a fantastic destination choice" when the user is answering date or passenger questions.`;

export const classifyUserIntent = (text: string): 'pricing' | 'booking' | 'dates' | 'discounts' | 'cancellation' | 'agent' | 'general' => {
  const lower = text.toLowerCase();
  if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('how much') || lower.includes('quote')) return 'pricing';
  if (lower.includes('book') || lower.includes('reserve') || lower.includes('pay') || lower.includes('buy')) return 'booking';
  if (lower.includes('date') || lower.includes('month') || lower.includes('when') || lower.includes('season') || lower.includes('oct') || lower.includes('nov') || lower.includes('dec')) return 'dates';
  if (lower.includes('discount') || lower.includes('offer') || lower.includes('group') || lower.includes('deal')) return 'discounts';
  if (lower.includes('cancel') || lower.includes('refund') || lower.includes('policy')) return 'cancellation';
  if (lower.includes('agent') || lower.includes('speak') || lower.includes('call') || lower.includes('contact') || lower.includes('human')) return 'agent';
  return 'general';
};

export const generateChatResponse = async (
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  context?: ChatContext
): Promise<string> => {
  // 1. Try Official Google Gemini API with multi-model fallback
  if (GEMINI_API_KEY) {
    const contents: any[] = [
      {
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\n[ROLE PLAY INSTRUCTION]: You are Sarah, Senior Travel Designer at Ghumo Firoo. Respond directly to the user.` }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood! I'm Sarah, Senior AI Travel Designer at Ghumo Firoo Journeys. I will provide personalized, accurate, luxury holiday itineraries and maintain context across all turns." }]
      }
    ];

    for (const msg of conversationHistory) {
      if (msg && msg.content) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    for (const model of CANDIDATE_GEMINI_MODELS) {
      try {
        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const gRes = await fetch(googleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (gRes.ok) {
          const gData = await gRes.json();
          const reply = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply && reply.trim()) {
            return reply.trim();
          }
        }
      } catch (e) {
        // Try next candidate model
      }
    }
  }

  // 2. Try PHP Backend AI Proxy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${API_BASE}/ai_chat.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, history: conversationHistory, context }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.reply) {
        return data.reply;
      }
    }
  } catch (e) {
    // Fall through to smart offline conversational designer
  }

  // 3. Smart Multi-Turn Conversational Fallback Designer
  return getRichDestinationReply(userMessage, conversationHistory, context);
};

interface ExtractedEntities {
  destination: string;
  duration: string;
  dates: string;
  pax: string;
  isGreeting: boolean;
  isContactInfo: boolean;
}

function extractEntities(query: string, history: ChatMessage[], context?: ChatContext): ExtractedEntities {
  const q = query.toLowerCase();
  const allText = [
    ...history.map(h => (h.content || '').toLowerCase()),
    q
  ].join(' ');

  // Greetings check
  const greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'start', 'help', 'menu', 'hi there'];
  const isGreeting = greetings.includes(q.trim());

  // Phone / Contact check
  const isContactInfo = /(\+?\d{10,12}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(query);

  // Extract Dates / Months
  let dates = '';
  const dateMatch = allText.match(/\b(\d{1,2}(?:st|nd|rd|th)?\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{1,2}|diwali|christmas|new year|next month|next week|this weekend)\b/i);
  if (dateMatch) {
    dates = dateMatch[0];
  }

  // Extract Pax / Guest Count
  let pax = '';
  const paxMatch = allText.match(/(\d+)\s*(?:people|person|pax|guests|adults|travelers|members)/i) || 
                   allText.match(/\b(couple|family of \d+|solo|honeymoon)\b/i);
  if (paxMatch) {
    pax = paxMatch[0];
  } else if (allText.includes('2 people') || allText.includes('for 2') || allText.includes('2 pax')) {
    pax = '2 guests';
  }

  // Extract Duration
  let duration = '';
  const durationMatch = allText.match(/(\d+\s*(?:night|day|n|d)[s\s\d/]*(?:night|day|n|d)?)/i);
  if (durationMatch) {
    duration = durationMatch[0];
  }

  // Extract Destination
  let destination = context?.destination || '';
  
  // 1. Direct search against Master Destinations & common spellings
  const knownPlaces = [
    { key: 'coorg', names: ['coorg', 'corrong', 'kodagu', 'madikeri', 'kushalnagar'] },
    { key: 'rann of kutch', names: ['rann', 'kutch', 'utsav', 'dhordo', 'tent city'] },
    { key: 'kashmir', names: ['kashmir', 'srinagar', 'gulmarg', 'pahalgam', 'sonamarg'] },
    { key: 'char dham', names: ['char dham', 'chardham', 'kedarnath', 'badrinath', 'gangotri', 'yamunotri'] },
    { key: 'goa', names: ['goa', 'calangute', 'panaji', 'baga', 'candolim'] },
    { key: 'manali', names: ['manali', 'solang', 'rohtang', 'kasol', 'kullu'] },
    { key: 'shimla', names: ['shimla', 'kufri', 'chail'] },
    { key: 'kerala', names: ['kerala', 'munnar', 'alleppey', 'kochi', 'thekkady', 'kumarakom'] },
    { key: 'rajasthan', names: ['rajasthan', 'jaipur', 'udaipur', 'jodhpur', 'jaisalmer'] },
    { key: 'andaman', names: ['andaman', 'havelock', 'port blair', 'neil island'] },
    { key: 'thailand', names: ['thailand', 'phuket', 'krabi', 'bangkok', 'pattaya'] },
    { key: 'singapore', names: ['singapore', 'sentosa', 'universal studios'] },
    { key: 'bali', names: ['bali', 'ubud', 'seminyak', 'nusa penida', 'kuta'] },
    { key: 'dubai', names: ['dubai', 'abu dhabi', 'burj khalifa'] },
    { key: 'europe', names: ['europe', 'switzerland', 'paris', 'france', 'italy', 'alps'] },
    { key: 'ooty', names: ['ooty', 'coonoor'] },
    { key: 'wayanad', names: ['wayanad'] },
    { key: 'hampi', names: ['hampi'] },
    { key: 'mysore', names: ['mysore', 'mysuru'] },
    { key: 'varanasi', names: ['varanasi', 'kashi'] },
    { key: 'ujjain', names: ['ujjain', 'mahakal', 'omkareshwar'] },
    { key: 'khajuraho', names: ['khajuraho', 'orchha'] }
  ];

  // Scan current query first
  for (const place of knownPlaces) {
    if (place.names.some(n => q.includes(n))) {
      destination = place.key.charAt(0).toUpperCase() + place.key.slice(1);
      break;
    }
  }

  // If not found in query, scan MASTER_DESTINATIONS in query
  if (!destination) {
    const mdMatch = MASTER_DESTINATIONS.find(d => q.includes(d.city.toLowerCase()) || q.includes(d.state.toLowerCase()));
    if (mdMatch) {
      destination = mdMatch.city;
    }
  }

  // If still not found, scan backwards in conversation history
  if (!destination) {
    for (let i = history.length - 1; i >= 0; i--) {
      const hText = (history[i].content || '').toLowerCase();
      for (const place of knownPlaces) {
        if (place.names.some(n => hText.includes(n))) {
          destination = place.key.charAt(0).toUpperCase() + place.key.slice(1);
          break;
        }
      }
      if (destination) break;

      const mdMatch = MASTER_DESTINATIONS.find(d => hText.includes(d.city.toLowerCase()));
      if (mdMatch) {
        destination = mdMatch.city;
        break;
      }
    }
  }

  return { destination, duration, dates, pax, isGreeting, isContactInfo };
}

function getRichDestinationReply(msg: string, history: ChatMessage[], context?: ChatContext): string {
  const query = msg.toLowerCase().trim();
  const entities = extractEntities(query, history, context);

  // 1. GREETINGS
  if (entities.isGreeting && !entities.destination) {
    return "Hello! 👋 I'm **Sarah**, Senior AI Travel Designer at Ghumo Firoo Journeys (Official Evoke Partner).\n\nWhich dream destination are you looking to explore next (Rann Utsav Kutch, Coorg, Char Dham Yatra, Kashmir, Kerala, Rajasthan, Europe, Thailand, Bali, or Dubai)? Tell me a bit about your travel plans!";
  }

  // 2. CONTACT INFO CAPTURED
  if (entities.isContactInfo) {
    const destName = entities.destination || 'your dream holiday';
    return `Thank you! ✈️✨ I've noted down your contact details for **${destName}**. Our destination specialist is preparing your bespoke day-wise PDF proposal with verified 4-star boutique stays and private chauffeured transfers. We will reach out to you shortly on WhatsApp!`;
  }

  // 3. DESTINATION MATCHED WITH MULTI-TURN CONTEXT
  const destLower = (entities.destination || '').toLowerCase();

  // If user provided dates or pax for an active destination
  const hasUserGivenDatesOrPax = entities.dates || entities.pax;

  // COORG / KODAGU
  if (destLower.includes('coorg') || destLower.includes('corrong') || destLower.includes('kodagu')) {
    if (hasUserGivenDatesOrPax) {
      const paxText = entities.pax ? `for **${entities.pax}**` : '';
      const dateText = entities.dates ? `traveling around **${entities.dates}**` : '';
      return `Wonderful! 🌿☕ Here is your tailored **Coorg Coffee Estate & Nature Getaway** ${paxText} ${dateText}:\n\n` +
        `• **Duration**: 3 Days / 2 Nights\n` +
        `• **Day 1**: Private pickup from Bangalore/Mysore/Mangalore ➔ Check into Luxury Coffee Plantation Resort ➔ Sunset at Raja's Seat & Madikeri Fort\n` +
        `• **Day 2**: Morning misty visit to Abbey Falls ➔ 4x4 Jeep Safari to Mandalpatti Peak ➔ Coffee tasting & plantation walking trail\n` +
        `• **Day 3**: Dubare Elephant Camp (Elephant bathing & interaction) ➔ Bylakuppe Golden Temple (Tibetan Monastery) ➔ Return transfer\n` +
        `• **Stays**: 4-Star Coffee Estate Boutique Resort with Daily Breakfast\n` +
        `• **Estimated Investment**: ₹14,500 – ₹18,500 / person (all private transfers included)\n\n` +
        `Would you like me to send the complete day-by-day PDF brochure with photos and resort options directly to your WhatsApp or Email?`;
    }
    return `Coorg (Kodagu) is pure mountain magic and coffee heaven! ☕🌿 From private coffee estate villas and Abbey Falls to thrilling 4x4 Jeep safaris up Mandalpatti peak, it's ideal for both couples and families.\n\n` +
      `✨ **Recommended 3D/2N Plan**: Madikeri Heritage ➔ Abbey Falls & Mandalpatti ➔ Dubare Elephant Camp & Golden Temple.\n\n` +
      `When are you planning to travel, and how many guests will be joining you?`;
  }

  // RANN OF KUTCH / RANN UTSAV
  if (destLower.includes('rann') || destLower.includes('kutch') || destLower.includes('utsav')) {
    if (hasUserGivenDatesOrPax) {
      return `Awesome! 🎪✨ As the Official Booking Partner for **Evoke Tent City Dhordo**, here is your **Rann Utsav White Desert Experience** (${entities.dates || 'Season 2026-27'}):\n\n` +
        `• **Duration**: 3 Days / 2 Nights\n` +
        `• **Day 1**: AC Chauffeur pickup from Bhuj Airport/Station ➔ Check-in at Premium AC Swiss Tent / Darbari Suite ➔ High Tea & White Rann Sunset Walk ➔ Cultural folk dance\n` +
        `• **Day 2**: Sunrise over the White Salt Desert ➔ Excursion to UNESCO Harappan city Dholavira & Road to Heaven ➔ Evening Desert Carnival & Star Gazing\n` +
        `• **Day 3**: Kala Dungar (Highest Point in Kutch) ➔ Gandhi Nu Gam artisan village ➔ Bhuj Aina Mahal & return transfer\n` +
        `• **Inclusions**: Luxury AC Tent Stay, All Meals (Breakfast, Lunch, High Tea, Dinner), Sightseeing transfers, and White Rann permits\n` +
        `• **Starting Price**: ₹12,500 – ₹18,000 / person\n\n` +
        `Should I send the official Evoke Tent City room tariff & availability chart to your WhatsApp?`;
    }
    return `Rann Utsav 2026-27 is an extraordinary cultural spectacle on the gleaming white salt desert! 🎪✨ As the Official Booking Partner for **Evoke Tent City Dhordo**, we offer verified luxury AC Swiss Tents, all meals, and transfers.\n\nWhen are you planning to visit, and how many guests will be traveling with you?`;
  }

  // KASHMIR
  if (destLower.includes('kashmir') || destLower.includes('srinagar') || destLower.includes('gulmarg')) {
    if (hasUserGivenDatesOrPax) {
      return `Kashmir is heaven on Earth! 🏔️❄️ Here is your bespoke **Kashmir Paradise Plan** (${entities.dates || 'Upcoming Season'}):\n\n` +
        `• **Duration**: 6 Days / 5 Nights (Srinagar 2N ➔ Gulmarg 1N ➔ Pahalgam 2N)\n` +
        `• **Highlights**: Luxury Dal Lake Houseboat stay, Sunset Shikara ride, Gulmarg Gondola Cable Car Ride, Betaab Valley & Aru Valley excursion\n` +
        `• **Stays**: 4-Star Premium Resorts & Deluxe Heritage Houseboat with Breakfast & Dinner included\n` +
        `• **Estimated Rate**: ₹19,500 – ₹24,000 / person (Private Chauffeured Cab included)\n\n` +
        `Shall I share the full itinerary PDF on your WhatsApp?`;
    }
    return `Kashmir is true paradise on Earth! 🏔️❄️ From waking up on a luxury Dal Lake houseboat to taking the Gulmarg Gondola high into snow-capped peaks, it's unforgettable.\n\nWhen are you planning to visit, and are you looking for a romantic honeymoon or a family holiday?`;
  }

  // CHAR DHAM
  if (destLower.includes('char dham') || destLower.includes('chardham') || destLower.includes('kedarnath')) {
    return `Namaste! 🙏 Char Dham Yatra (Yamunotri, Gangotri, Kedarnath, Badrinath) is a sacred journey. We offer:\n\n` +
      `1. **Chauffeured Road Yatra (10 Days / 9 Nights)**: ₹28,500 – ₹38,000 / person (Premium hotels, AC Innova, VIP Darshan tokens)\n` +
      `2. **VIP Helicopter Yatra (6 Days / 5 Nights)**: ₹1,85,000 / person (Dehradun to all 4 Dhams)\n\n` +
      `When are you planning to embark, and how many pilgrims will be joining?`;
  }

  // THAILAND
  if (destLower.includes('thailand') || destLower.includes('phuket') || destLower.includes('krabi')) {
    if (hasUserGivenDatesOrPax) {
      return `Thailand is pure tropical bliss! 🇹🇭🌴 Here is your **Thailand Island & City Escape (6 Days / 5 Nights)**:\n\n` +
        `• **Route**: Phuket (3N) ➔ Krabi & Phi Phi Islands (2N)\n` +
        `• **Highlights**: Phi Phi Islands Speedboat Day Tour, James Bond Island Sunset Cruise, 4-Star Beachfront Resort Stay\n` +
        `• **Estimated Rate**: ₹34,999 / person (Private transfers included)\n\n` +
        `Would you like me to send the complete day-by-day PDF brochure to your WhatsApp or Email?`;
    }
    return `Thailand is an incredible destination! 🇹🇭✨ From private beachfront resorts in Phuket & Krabi to island hopping speedboats, it's a dream holiday.\n\nWhen are you planning to travel, and how many guests will be joining?`;
  }

  // BALI
  if (destLower.includes('bali') || destLower.includes('ubud')) {
    return `Bali is absolute paradise! 🌴🌺\n\n✨ **Bali Luxury Island Escape (6 Days / 5 Nights)**:\n` +
      `• **Route**: Ubud Private Pool Villa (3N) ➔ Seminyak Clifftop Beach Resort (2N)\n` +
      `• **Highlights**: Nusa Penida Island Speedboat Tour, Kintamani Volcano, Uluwatu Clifftop Sunset & Beach Clubs\n` +
      `• **Estimated Rate**: ₹39,500 / person\n\n` +
      `When are you planning to travel, and are you planning a honeymoon or family trip?`;
  }

  // DUBAI
  if (destLower.includes('dubai')) {
    return `Dubai is pure luxury and futuristic adventure! 🏙️✨\n\n` +
      `✨ **Dubai Luxury & Desert Safari (5 Days / 4 Nights)**:\n` +
      `• **Highlights**: Burj Khalifa 124th Floor, Desert Safari with BBQ Dinner & Dune Bashing, Marina Sunset Yacht Cruise\n` +
      `• **Estimated Rate**: ₹44,500 / person\n\n` +
      `What travel dates do you have in mind?`;
  }

  // EUROPE
  if (destLower.includes('europe') || destLower.includes('switzerland') || destLower.includes('paris')) {
    return `Europe is absolute magic! 🇪🇺✨ Whether taking the Glacier Express through the Swiss Alps or strolling along romantic Paris boulevards, we craft extraordinary journeys.\n\n` +
      `✨ **Swiss & Paris Highlights (8 Days / 7 Nights)** starting at ₹1,85,000 / person.\n\n` +
      `When are you thinking of traveling, and how many guests will be in your party?`;
  }

  // GOA
  if (destLower.includes('goa')) {
    return `Goa is coastal luxury at its finest! 🏖️🍹\n\n` +
      `✨ **Goa Beachfront Escape (4 Days / 3 Nights)**:\n` +
      `• **Highlights**: 4-Star Beachfront Resort in South Goa, Private Mandovi Sunset Cruise & Water Sports\n` +
      `• **Estimated Rate**: ₹14,500 / person\n\n` +
      `When are you planning to visit?`;
  }

  // RAJASTHAN
  if (destLower.includes('rajasthan') || destLower.includes('jaipur') || destLower.includes('udaipur')) {
    return `Rajasthan is royal heritage at its finest! 🏰👑\n\n` +
      `✨ **Royal Rajasthan Circuit (6 Days / 5 Nights)**:\n` +
      `• **Route**: Jaipur (2N) ➔ Udaipur (2N) ➔ Jaisalmer Desert Glamping (1N)\n` +
      `• **Estimated Rate**: ₹24,500 / person\n\n` +
      `When are you planning to travel?`;
  }

  // CHECK MASTER DESTINATIONS FOR OTHER CITIES (e.g. Ooty, Wayanad, Pachmarhi, Hampi, Indore, Agra, etc.)
  if (entities.destination) {
    const matchedDest = MASTER_DESTINATIONS.find(d => d.city.toLowerCase() === destLower || destLower.includes(d.city.toLowerCase()));
    const attractions = matchedDest?.popular_attractions?.slice(0, 4).join(', ') || 'cultural landmarks and scenic viewpoints';
    const bestTime = matchedDest?.best_time_to_visit || 'October to March';
    const idealDays = matchedDest?.destination_group?.includes('Wildlife') ? '3 Days / 2 Nights' : '3-4 Days';

    if (hasUserGivenDatesOrPax) {
      return `Wonderful! ✈️✨ For your customized trip to **${entities.destination}** (${entities.pax || 'your party'} around ${entities.dates || 'your chosen dates'}):\n\n` +
        `• **Suggested Duration**: ${idealDays}\n` +
        `• **Must-Visit Highlights**: ${attractions}\n` +
        `• **Best Season**: ${bestTime}\n` +
        `• **Inclusions**: 4-Star verified boutique hotel, daily breakfast, private chauffeur vehicle, and dedicated 24/7 on-trip concierge\n` +
        `• **Estimated Investment**: ₹12,500 – ₹18,000 / person\n\n` +
        `Please share your WhatsApp number or Email, and I'll send the detailed day-by-day PDF proposal right over!`;
    }

    return `**${entities.destination}** is a wonderful holiday choice! ✈️✨\n\n` +
      `• **Ideal Duration**: ${idealDays}\n` +
      `• **Key Attractions**: ${attractions}\n` +
      `• **Best Time to Visit**: ${bestTime}\n\n` +
      `When are you planning to travel, and how many guests will be joining you?`;
  }

  // 4. SMART GENERAL INTENT HANDLING (When user talks without an explicit destination)
  if (hasUserGivenDatesOrPax) {
    return `Got it! I have noted your dates (${entities.dates || 'your dates'}) and party size (${entities.pax || 'your guests'}). ✈️✨\n\nWhich destination are you thinking of exploring (e.g. Rann Utsav Kutch, Coorg, Kashmir, Char Dham Yatra, Kerala, Europe, Thailand, Bali, or Dubai)?`;
  }

  return "I'd love to help craft your perfect holiday! ✈️✨ Which dream destination are you planning next (Rann Utsav Kutch, Coorg, Char Dham Yatra, Kashmir, Kerala, Rajasthan, Europe, Thailand, Bali, or Dubai)? Tell me where you'd like to go!";
}
