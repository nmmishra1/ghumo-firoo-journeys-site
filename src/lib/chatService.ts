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
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const CANDIDATE_GEMINI_MODELS = [
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest'
];

const SYSTEM_PROMPT = `You are Sarah, Lead Travel Designer & Concierge at Ghumo Firoo Journeys — India's premier luxury travel company (Ministry of Tourism Registered Partner, Official Evoke Partner).

YOUR CHAT PERSONALITY & RULES:
1. Speak warmly, naturally, and concisely like a real luxury travel designer chatting on WhatsApp/LiveChat. Avoid stiff essays or robotically long lectures.
2. Maintain sharp context across all turns. Remember destinations, dates, guest counts, and travel themes (e.g. Honeymoon, Family, Adventure, Pilgrimage, Luxury).
3. When the user asks for a honeymoon or vacation recommendation:
   - If they specify "domestic" or "India": Immediately suggest India's top 3 romantic destinations (e.g., Kashmir's snow peaks & Dal Lake houseboat, Kerala's private pool villas & Alleppey backwaters, or Udaipur's royal lake palaces).
   - If they specify "international": Suggest Switzerland & Paris, Bali private pool villas, or Thailand luxury island resorts.
   - Keep suggestions focused with 2-3 sentence highlights, realistic pricing, and an engaging question.
4. When the user gives dates (e.g. "30 oct") or guest count (e.g. "one couple" / "2 people"):
   - Acknowledge their exact dates and destination. Confirm seasonal highlights and weather.
   - Present a crisp, day-wise plan with verified 4★/5★ boutique stays and private chauffeured transfers.
   - Offer to share the complete day-by-day PDF brochure directly on WhatsApp or Email.
5. If the user asks to talk to a human expert, call, or contact on WhatsApp:
   - Warmly share our direct 24/7 concierge number (+91 9910987264) and offer to connect immediately on WhatsApp.
6. Format your messages cleanly with bullet points, bold key landmarks, and emojis for a modern, sleek reading experience.`;

export const classifyUserIntent = (text: string): 'pricing' | 'booking' | 'dates' | 'discounts' | 'cancellation' | 'agent' | 'general' => {
  const lower = text.toLowerCase();
  if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('how much') || lower.includes('quote')) return 'pricing';
  if (lower.includes('book') || lower.includes('reserve') || lower.includes('pay') || lower.includes('buy')) return 'booking';
  if (lower.includes('date') || lower.includes('month') || lower.includes('when') || lower.includes('season') || lower.includes('oct') || lower.includes('nov') || lower.includes('dec')) return 'dates';
  if (lower.includes('discount') || lower.includes('offer') || lower.includes('group') || lower.includes('deal')) return 'discounts';
  if (lower.includes('cancel') || lower.includes('refund') || lower.includes('policy')) return 'cancellation';
  if (lower.includes('agent') || lower.includes('speak') || lower.includes('call') || lower.includes('contact') || lower.includes('human') || lower.includes('expert') || lower.includes('whatsapp')) return 'agent';
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
        parts: [{ text: `${SYSTEM_PROMPT}\n\n[ROLE PLAY INSTRUCTION]: You are Sarah. Respond directly, warmly, and naturally to the client in live chat format.` }]
      },
      {
        role: 'model',
        parts: [{ text: "Hello! I'm Sarah, Lead Travel Designer at Ghumo Firoo Journeys. How can I help you design your dream holiday?" }]
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
        // Try next model
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
    // Fall through
  }

  // 3. Smart Multi-Turn Local Fallback Designer
  return getRichDestinationReply(userMessage, conversationHistory, context);
};

interface ExtractedEntities {
  destination: string;
  duration: string;
  dates: string;
  pax: string;
  isGreeting: boolean;
  isContactInfo: boolean;
  isHumanRequest: boolean;
  isHoneymoon: boolean;
  isDomestic: boolean;
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

  // Human request
  const isHumanRequest = /\b(human|agent|expert|speak|talk|call|phone|consultant)\b/i.test(q);

  // Honeymoon check
  const isHoneymoon = /\b(honeymoon|wedding|marriage|couple|romantic)\b/i.test(allText);

  // Domestic check
  const isDomestic = /\b(domestic|india|in india|indian)\b/i.test(q) || /\b(domestic|india)\b/i.test(allText);

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
                   allText.match(/\b(couple|one couple|family of \d+|solo|2 adults)\b/i);
  if (paxMatch) {
    pax = paxMatch[0];
  } else if (allText.includes('2 people') || allText.includes('for 2') || allText.includes('2 pax') || allText.includes('one couple')) {
    pax = '2 guests (Couple)';
  }

  // Extract Duration
  let duration = '';
  const durationMatch = allText.match(/(\d+\s*(?:night|day|n|d)[s\s\d/]*(?:night|day|n|d)?)/i);
  if (durationMatch) {
    duration = durationMatch[0];
  }

  // Extract Destination
  let destination = context?.destination || '';
  
  const knownPlaces = [
    { key: 'ooty', names: ['ooty', 'nilgiri', 'coonoor'] },
    { key: 'coorg', names: ['coorg', 'corrong', 'kodagu', 'madikeri', 'kushalnagar'] },
    { key: 'kashmir', names: ['kashmir', 'srinagar', 'gulmarg', 'pahalgam', 'sonamarg'] },
    { key: 'rann of kutch', names: ['rann', 'kutch', 'utsav', 'dhordo', 'tent city'] },
    { key: 'char dham', names: ['char dham', 'chardham', 'kedarnath', 'badrinath', 'gangotri', 'yamunotri'] },
    { key: 'kerala', names: ['kerala', 'munnar', 'alleppey', 'kochi', 'thekkady', 'kumarakom'] },
    { key: 'goa', names: ['goa', 'calangute', 'panaji', 'baga', 'candolim'] },
    { key: 'manali', names: ['manali', 'solang', 'rohtang', 'kasol', 'kullu'] },
    { key: 'shimla', names: ['shimla', 'kufri', 'chail'] },
    { key: 'rajasthan', names: ['rajasthan', 'jaipur', 'udaipur', 'jodhpur', 'jaisalmer'] },
    { key: 'andaman', names: ['andaman', 'havelock', 'port blair', 'neil island'] },
    { key: 'thailand', names: ['thailand', 'phuket', 'krabi', 'bangkok', 'pattaya'] },
    { key: 'singapore', names: ['singapore', 'sentosa', 'universal studios'] },
    { key: 'bali', names: ['bali', 'ubud', 'seminyak', 'nusa penida', 'kuta'] },
    { key: 'dubai', names: ['dubai', 'abu dhabi', 'burj khalifa'] },
    { key: 'europe', names: ['europe', 'switzerland', 'paris', 'france', 'italy', 'alps'] },
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

  // If not found in query, scan MASTER_DESTINATIONS
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

  return { destination, duration, dates, pax, isGreeting, isContactInfo, isHumanRequest, isHoneymoon, isDomestic };
}

function getRichDestinationReply(msg: string, history: ChatMessage[], context?: ChatContext): string {
  const query = msg.toLowerCase().trim();
  const entities = extractEntities(query, history, context);

  // 1. TALK TO HUMAN EXPERT
  if (entities.isHumanRequest) {
    return "I’d love to connect you directly with one of our Senior Travel Consultants! 📞✨\n\n• **Direct Call**: +91-9910987264 (24/7 Concierge)\n• **WhatsApp Direct**: You can tap below to chat with our team on WhatsApp immediately.\n\nAlternatively, please share your preferred phone number and travel dates here, and I'll have our specialist prepare your custom itinerary and call you right back!";
  }

  // 2. GREETINGS
  if (entities.isGreeting && !entities.destination) {
    return "Hello! 👋 I'm **Sarah**, Senior Travel Designer at Ghumo Firoo Journeys (Official Evoke Partner).\n\nWhich dream destination are you looking to explore next (Rann Utsav Kutch, Kashmir, Kerala, Ooty, Char Dham Yatra, Europe, Thailand, Bali, or Dubai)? Tell me a bit about your travel plans!";
  }

  // 3. CONTACT INFO CAPTURED
  if (entities.isContactInfo) {
    const destName = entities.destination || 'your dream holiday';
    return `Thank you! ✈️✨ I've registered your request for **${destName}**. Our senior destination designer is preparing your bespoke day-by-day PDF proposal with handpicked boutique stays and private chauffeured transfers. We will send it directly to your WhatsApp shortly!`;
  }

  // 4. DOMESTIC HONEYMOON INTENT
  if (entities.isHoneymoon && (entities.isDomestic || !entities.destination)) {
    return "Congratulations on your upcoming honeymoon! 💍✨ India has some truly breathtaking romantic getaways:\n\n" +
      "1. 🏔️ **Kashmir (The Fairytale Romance)**: Luxury Dal Lake private houseboat, sunset Shikara ride, and Gulmarg snow gondola. *₹45,000 – ₹75,000/couple*\n" +
      "2. 🌴 **Kerala (Backwaters & Hills)**: Private pool villa in Munnar tea hills + luxury private houseboat cruise in Alleppey. *₹38,000 – ₹60,000/couple*\n" +
      "3. 🏰 **Udaipur (Royal Palace Romance)**: Heritage lakeview palace stays on Lake Pichola with candlelit dinners. *₹35,000 – ₹55,000/couple*\n" +
      "4. 🏖️ **Andaman (Exotic Beaches)**: Havelock Island Radhanagar beach & private beachside candlelit dinners. *₹42,000 – ₹70,000/couple*\n\n" +
      "Which of these vibes appeals to you both the most—snowy mountains, serene backwaters, royal palaces, or tropical beaches?";
  }

  // 5. DESTINATION MATCHED WITH MULTI-TURN CONTEXT
  const destLower = (entities.destination || '').toLowerCase();
  const hasUserGivenDatesOrPax = entities.dates || entities.pax;

  // OOTY / NILGIRI HILLS
  if (destLower.includes('ooty') || destLower.includes('nilgiri')) {
    if (hasUserGivenDatesOrPax) {
      return `Wonderful! 🌿☕ Here is your **3D/2N Ooty & Nilgiri Hills Heritage Escape** (${entities.dates || 'Upcoming Dates'} for ${entities.pax || 'Couple'}):\n\n` +
        `• **Day 1**: Private transfer to Ooty ➔ Check-in at Colonial Heritage Bungalow / Luxury Resort ➔ Botanical Gardens walk & High Tea\n` +
        `• **Day 2**: Panoramic views from Doddabetta Peak ➔ Private Tea Factory & Glenmorgan Estate Trail ➔ Evening fireplace & bonfire\n` +
        `• **Day 3**: Ooty Lake boating & local homemade chocolate trails ➔ Assisted return transfer\n` +
        `• **Stays & Inclusions**: 4-Star Heritage Stay, Daily Breakfast, AC Sedan at disposal, and Sightseeing Passes\n` +
        `• **Investment**: ₹22,000 – ₹35,000 / couple\n\n` +
        `Would you like me to send the complete day-by-day PDF proposal with boutique stay photos to your WhatsApp?`;
    }
    return `Ooty (The Queen of Hill Stations) is pure tranquility with eucalyptus air and rolling tea estates! 🌿☕\n\n✨ **Recommended 3D/2N Plan**: Doddabetta Peak, private tea plantation tour, and colonial heritage bungalow stays.\n\nWhen are you planning to travel, and how many guests will be joining?`;
  }

  // COORG
  if (destLower.includes('coorg') || destLower.includes('corrong') || destLower.includes('kodagu')) {
    if (hasUserGivenDatesOrPax) {
      return `Wonderful! 🌿☕ Here is your tailored **3D/2N Coorg Coffee Estate & Nature Getaway** (${entities.dates || 'Upcoming Dates'} for ${entities.pax || 'Couple'}):\n\n` +
        `• **Day 1**: Private pickup ➔ Check into 4★ Coffee Estate Resort ➔ Sunset at Raja's Seat & Madikeri Fort\n` +
        `• **Day 2**: Misty Abbey Falls ➔ 4x4 Jeep Safari up Mandalpatti Peak ➔ Guided coffee tasting trail\n` +
        `• **Day 3**: Dubare Elephant Camp ➔ Bylakuppe Golden Temple (Tibetan Monastery) ➔ Return transfer\n` +
        `• **Investment**: ₹14,500 – ₹18,500 / person (Private vehicle & 4★ stay included)\n\n` +
        `Shall I send the full PDF brochure with resort options to your WhatsApp?`;
    }
    return `Coorg (Kodagu) is coffee country heaven! ☕🌿 From private coffee estate villas and Abbey Falls to 4x4 Jeep safaris up Mandalpatti, it's a refreshing escape.\n\nWhen are you planning to travel, and how many guests will be joining?`;
  }

  // KASHMIR
  if (destLower.includes('kashmir') || destLower.includes('srinagar') || destLower.includes('gulmarg')) {
    return `Kashmir is pure magic! 🏔️❄️ Here is your **Kashmir Paradise Experience (5D/4N)** (${entities.dates || 'Late October/Autumn'}):\n\n` +
      `• **Route**: Srinagar Houseboat (2N) ➔ Gulmarg Mountain Resort (2N)\n` +
      `• **Highlights**: Sunset Shikara on Dal Lake, Mughal Gardens, Phase 2 Gondola Fast-Track Tickets, and Wazwan Dinner\n` +
      `• **Stays**: 4★ Luxury Resorts & Deluxe Houseboat with Breakfast & Dinner included\n` +
      `• **Estimated Rate**: ₹55,000 – ₹85,000 per couple (Private Chauffeured Cab included)\n\n` +
      `Would you like me to send the complete day-by-day PDF brochure to your WhatsApp?`;
  }

  // RANN OF KUTCH
  if (destLower.includes('rann') || destLower.includes('kutch') || destLower.includes('utsav')) {
    return `Rann Utsav 2026-27 is an extraordinary cultural spectacle on the gleaming white salt desert! 🎪✨ As Official Booking Partner for **Evoke Tent City Dhordo**, we offer verified AC Swiss Tents, all meals, and desert transfers from ₹12,500/person.\n\nWhen are you planning to visit?`;
  }

  // EUROPE
  if (destLower.includes('europe') || destLower.includes('switzerland') || destLower.includes('paris')) {
    return `Europe is absolute romance! 🇪🇺✨ Whether taking the Glacier Express through the Swiss Alps or strolling along romantic Paris streets, we curate unforgettable luxury journeys starting from ₹1,85,000/person.\n\nWhat travel dates do you have in mind?`;
  }

  // MASTER DESTINATIONS GENERAL FALLBACK
  if (entities.destination) {
    const matchedDest = MASTER_DESTINATIONS.find(d => d.city.toLowerCase() === destLower || destLower.includes(d.city.toLowerCase()));
    const attractions = matchedDest?.popular_attractions?.slice(0, 4).join(', ') || 'cultural landmarks and scenic viewpoints';
    const bestTime = matchedDest?.best_time_to_visit || 'October to March';

    return `**${entities.destination}** is a wonderful holiday choice! ✈️✨\n\n` +
      `• **Key Highlights**: ${attractions}\n` +
      `• **Best Season**: ${bestTime}\n` +
      `• **Inclusions**: 4-Star verified boutique hotel, daily breakfast, private chauffeur vehicle, and dedicated 24/7 on-trip concierge\n\n` +
      `When are you planning to travel, and how many guests will be joining?`;
  }

  return "I'd love to help craft your perfect holiday! ✈️✨ Which dream destination are you planning next (Rann Utsav Kutch, Kashmir, Kerala, Ooty, Rajasthan, Europe, Thailand, Bali, or Dubai)?";
}
