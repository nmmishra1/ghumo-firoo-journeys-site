/**
 * Chat Service — Powered by Official Google Gemini API, Render Web2API & AI Travel Designer
 */

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
const RENDER_GEMINI_URL = import.meta.env.VITE_GEMINI_WEB2API_URL || 'https://gemini-web2api-sxti.onrender.com/v1';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are Sarah, Lead AI Travel Designer for Ghumo Firoo Journeys — a luxury travel agency specializing in bespoke holiday experiences across India (Char Dham, Kashmir, Goa, Rajasthan, Kerala, Himachal) and internationally (Thailand, Europe, Singapore, Bali, Dubai, Maldives).

YOUR PERSONALITY & RULES:
1. Speak warmly, naturally, and professionally like an expert human travel designer.
2. NEVER use technical labels or treat simple greetings like 'hi' or 'hello' as destination names!
3. If user says 'hi' or 'hello', welcome them warmly and ask which destination they'd like to explore.
4. When a user names a destination (e.g. Singapore, Thailand, Europe, Kashmir, Char Dham, Goa, Bali):
   - Immediately acknowledge THAT EXACT DESTINATION.
   - Detail the route, highlights, stays, and estimated pricing per person.
   - Warmly offer to send the complete day-by-day PDF brochure to their WhatsApp or Email.`;

export const classifyUserIntent = (text: string): 'pricing' | 'booking' | 'dates' | 'discounts' | 'cancellation' | 'agent' | 'general' => {
  const lower = text.toLowerCase();
  if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('how much') || lower.includes('quote')) return 'pricing';
  if (lower.includes('book') || lower.includes('reserve') || lower.includes('pay') || lower.includes('buy')) return 'booking';
  if (lower.includes('date') || lower.includes('month') || lower.includes('when') || lower.includes('season')) return 'dates';
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
  // 1. Try Official Google Gemini API if VITE_GEMINI_API_KEY is configured
  if (GEMINI_API_KEY) {
    try {
      const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      const contents = [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Question: ${userMessage}` }]
        }
      ];

      const gRes = await fetch(googleUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        const reply = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply && reply.trim()) {
          return reply.trim();
        }
      }
    } catch (e) {
      console.warn('Official Gemini API call error, falling back to proxy...', e);
    }
  }

  // 2. Try PHP Proxy endpoint next
  try {
    const res = await fetch(`${API_BASE}/ai_chat.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, history: conversationHistory, context })
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.reply) {
        return data.reply;
      }
    }
  } catch (e) {
    console.warn('PHP AI Chat proxy unavailable, trying direct Render Gemini call...');
  }

  // 3. Direct call to Render Cloud Gemini Web2API (with Bearer Authorization header)
  try {
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      { role: 'user', content: userMessage }
    ];

    const renderRes = await fetch(`${RENDER_GEMINI_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-gemini'
      },
      body: JSON.stringify({
        model: 'gemini-3.6-flash',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 600
      })
    });

    if (renderRes.ok) {
      const renderData = await renderRes.json();
      if (renderData?.choices?.[0]?.message?.content) {
        return renderData.choices[0].message.content.trim();
      }
    }
  } catch (err) {
    console.error('Direct Render Gemini call error:', err);
  }

  // 4. Rich Destination-Specific Human Travel Designer Fallback
  return getRichDestinationReply(userMessage, conversationHistory);
};

function getRichDestinationReply(msg: string, history: ChatMessage[]): string {
  const query = msg.toLowerCase().trim();

  // GREETINGS FILTER (Fixes "Hi is a fantastic destination" bug)
  const greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'hola', 'start', 'help', 'menu', 'hi there', 'hello there'];
  if (greetings.includes(query)) {
    return "Hello! 👋 I'm **Sarah**, Senior AI Travel Designer at Ghumo Firoo Journeys.\n\nWhich dream destination are you looking to explore next (Char Dham Yatra, Kashmir, Europe, Singapore, Thailand, Bali, Goa, or Dubai)? Tell me a bit about your travel plans!";
  }

  const dest = getTargetDestinationKey(query, history);
  const hasDetails = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|2026|dates|month|people|person|pax|family|couple|wife|husband|honeymoon|road|heli)\b/i.test(query);

  // SINGAPORE
  if (dest === 'singapore') {
    if (hasDetails) {
      return "Fantastic! Here is a curated Singapore getaway 🇸🇬✨:\n• **Duration**: 5 Days / 4 Nights\n• **Highlights**: Universal Studios VIP Pass, Sentosa Cable Car, Gardens by the Bay, Marina Bay Sands SkyPark Ticket\n• **Stays**: 4-Star Luxury City Hotel with Breakfast\n• **Estimated Rate**: ₹48,999 / person including transfers\n\nShould I send the full itinerary brochure to your WhatsApp?";
    }
    return "Singapore is an incredible, futuristic paradise! 🇸🇬✨ From Gardens by the Bay light shows to Sentosa island luxury villas, it's perfect for both couples and families.\n\nWhat travel dates do you have in mind, and how many guests will be traveling?";
  }

  // THAILAND
  if (dest === 'thailand') {
    if (hasDetails) {
      return "Thailand for a romantic couple's getaway is pure perfection! 🇹🇭🌴\n\n✨ **Thailand Romantic Island & City Escape (6 Days / 5 Nights)**:\n• **Route**: Phuket (3 Nights) ➔ Krabi & Phi Phi Islands (2 Nights)\n• **Highlights**: Phi Phi Islands Speedboat Day Tour, James Bond Island Sunset Cruise, Private Beachfront Resort & Romantic Candlelight Dinner on the Beach\n• **Stays**: 4-Star Luxury Beach Resort with Daily Breakfast\n• **Estimated Investment**: ₹34,999 / person (excluding international flights)\n\nWould you like me to send the complete day-by-day PDF brochure to your WhatsApp or Email so you can review it together?";
    }
    return "Thailand is an incredible destination! 🇹🇭✨ From private beachfront resorts in Phuket & Krabi to floating market tours in Bangkok, it's a dream holiday.\n\nWhen are you planning to travel, and how many guests will be joining you?";
  }

  // EUROPE
  if (dest === 'europe') {
    if (hasDetails) {
      return "That sounds like a wonderful Europe trip! 🇪🇺✨\n\n✨ **Bespoke Swiss & Paris Highlights (8 Days / 7 Nights)**:\n• **Route**: Paris (3 Nights) ➔ Lucerne & Interlaken (4 Nights)\n• **Highlights**: Eiffel Tower Sunset Cruise, Jungfraujoch Top of Europe Scenic Train & 1st Class Swiss Travel Pass\n• **Stays**: Boutique 4-Star Luxury Hotels with Daily Breakfast\n• **Estimated Rate**: ₹1,85,000 / person\n\nWould you like me to send the complete day-by-day PDF brochure directly to your phone?";
    }
    return "Europe is absolute magic! 🇪🇺✨ Whether it's taking the Glacier Express through the Swiss Alps, strolling along romantic Paris streets, or exploring the Amalfi Coast, we can curate an extraordinary journey for you.\n\nWhen are you thinking of traveling, and will this be a romantic getaway, family vacation, or a trip with friends?";
  }

  // KASHMIR
  if (dest === 'kashmir') {
    if (hasDetails) {
      return "That sounds like a wonderful Kashmir trip! 🏔️❄️\n\n✨ **Kashmir Paradise Experience (6 Days / 5 Nights)**:\n• **Route**: Srinagar (2N) ➔ Gulmarg (1N) ➔ Pahalgam (2N)\n• **Highlights**: Deluxe Houseboat Stay on Dal Lake, Sunset Shikara Ride & Gulmarg Gondola Cable Car Ride\n• **Stays**: Luxury Resorts & Houseboat with Breakfast & Dinner included\n• **Estimated Investment**: ₹19,500 – ₹24,000 / person\n\nWould you like me to send the complete itinerary PDF brochure to your WhatsApp?";
    }
    return "Kashmir is true paradise on Earth! 🏔️❄️ From waking up on a luxury Dal Lake houseboat to taking the Gulmarg Gondola high into the snow, it's unforgettable.\n\nWhen are you planning to visit, and are you looking for a honeymoon or family trip?";
  }

  // CHAR DHAM
  if (dest === 'chardham') {
    if (hasDetails) {
      return "Thank you for sharing those details! 🙏\n\n🚩 **Bespoke Char Dham Yatra Plan (10 Days / 9 Nights)**:\n• **Route**: Haridwar ➔ Yamunotri ➔ Gangotri ➔ Kedarnath ➔ Badrinath\n• **Highlights**: Premium Hotel Stays, Daily Meals, Private Vehicle (Innova/Tempo), VIP Darshan Token Support\n• **Estimated Investment**: ₹28,500 – ₹38,000 / person (Chauffeured Road) | ₹1,85,000 / person (VIP Helicopter)\n\nWould you like me to prepare a custom quote and send the PDF itinerary to your phone?";
    }
    return "Char Dham Yatra is a deeply sacred and life-changing pilgrimage. 🚩\n\nWe offer both chauffeured luxury road journeys and exclusive VIP Helicopter shuttles. When are you looking to embark on the Yatra, and how many family members will be joining you?";
  }

  // BALI
  if (dest === 'bali') {
    if (hasDetails) {
      return "Bali is absolute tropical bliss! 🌴🌺\n\n✨ **Bali Luxury Island Escape (6 Days / 5 Nights)**:\n• **Route**: Ubud (3N) ➔ Seminyak (2N)\n• **Highlights**: Private Pool Villa Stay in Ubud, Nusa Penida Island Speedboat Tour & Seminyak Clifftop Sunset Beach Club\n• **Stays**: 4-Star Luxury Pool Villa & Beach Resort\n• **Estimated Investment**: ₹39,500 / person\n\nWould you like me to send the complete itinerary brochure to your WhatsApp?";
    }
    return "Bali is absolute tropical bliss! 🌴🌺 From private pool villas tucked away in Ubud to clifftop ocean view beach clubs in Seminyak, it's a dream holiday.\n\nWhat travel dates do you have in mind, and are you planning a honeymoon or a family vacation?";
  }

  // DUBAI
  if (dest === 'dubai') {
    if (hasDetails) {
      return "Dubai is pure luxury and adventure! 🏙️✨\n\n✨ **Dubai Luxury & Desert Safari (5 Days / 4 Nights)**:\n• **Highlights**: Burj Khalifa 124th Floor Ticket, Desert Safari with BBQ Dinner & Dune Bashing, Dubai Marina Sunset Yacht Cruise\n• **Stays**: 4-Star Luxury Hotel with Breakfast\n• **Estimated Investment**: ₹44,500 / person\n\nWould you like me to send the complete itinerary brochure to your WhatsApp?";
    }
    return "Dubai is pure luxury and futuristic adventure! 🏙️✨ From Burj Khalifa skyline views to luxury desert safaris and private yacht cruises, we can craft an unforgettable experience.\n\nWhen are you planning to visit, and how many guests will be traveling?";
  }

  // GOA
  if (dest === 'goa') {
    if (hasDetails) {
      return "Goa is coastal luxury at its best! 🏖️🍹\n\n✨ **Goa Beachfront Getaway (4 Days / 3 Nights)**:\n• **Highlights**: South Goa Beachfront Resort Stay, Private Mandovi River Sunset Cruise & Water Sports Pass\n• **Stays**: 4-Star Luxury Beach Resort with Breakfast\n• **Estimated Investment**: ₹14,500 / person\n\nWould you like me to send the complete itinerary brochure to your WhatsApp?";
    }
    return "Goa is pure sunshine, golden beaches, and vibrant coastal luxury! 🏖️🍹 Whether you want a tranquil beachfront resort in South Goa or vibrant party spots in North Goa, we can design the perfect getaway.\n\nWhen are you planning to visit, and will this be a trip with friends, a romantic holiday, or a family vacation?";
  }

  // RAJASTHAN
  if (dest === 'rajasthan') {
    if (hasDetails) {
      return "Rajasthan is royal heritage at its finest! 🏰👑\n\n✨ **Royal Rajasthan Heritage Circuit (6 Days / 5 Nights)**:\n• **Route**: Jaipur (2N) ➔ Udaipur (2N) ➔ Jaisalmer (1N)\n• **Highlights**: Amber Fort Jeep Safari, Lake Pichola Boat Cruise & Jaisalmer Luxury Desert Glamping\n• **Stays**: Heritage Palace Hotels with Breakfast\n• **Estimated Investment**: ₹24,500 / person\n\nWould you like me to send the complete itinerary brochure to your WhatsApp?";
    }
    return "Rajasthan is royal heritage at its finest! 🏰👑 From sunset boat rides on Lake Pichola in Udaipur to luxury desert glamping under the stars in Jaisalmer, it's an extraordinary journey.\n\nWhen are you thinking of traveling, and how many guests will be in your group?";
  }

  const destName = query.charAt(0).toUpperCase() + query.slice(1);
  return `${destName} is a fantastic destination choice! ✈️✨ We can curate a completely personalized holiday package with luxury stays, private transfers, and handpicked experiences.\n\nWhen are you planning to travel, and how many guests will be joining you?`;
}

function getTargetDestinationKey(q: string, history: ChatMessage[]): string {
  if (q.includes('singapore')) return 'singapore';
  if (q.includes('thailand') || q.includes('phuket') || q.includes('krabi') || q.includes('bangkok')) return 'thailand';
  if (q.includes('europe') || q.includes('switzerland') || q.includes('paris')) return 'europe';
  if (q.includes('kashmir') || q.includes('srinagar') || q.includes('gulmarg')) return 'kashmir';
  if (q.includes('chardham') || q.includes('char dham') || q.includes('kedarnath')) return 'chardham';
  if (q.includes('bali') || q.includes('ubud')) return 'bali';
  if (q.includes('dubai')) return 'dubai';
  if (q.includes('goa')) return 'goa';
  if (q.includes('rajasthan') || q.includes('jaipur') || q.includes('udaipur')) return 'rajasthan';

  // Scan history backwards
  for (let i = history.length - 1; i >= 0; i--) {
    const hText = (history[i].content || '').toLowerCase();
    if (hText.includes('singapore')) return 'singapore';
    if (hText.includes('thailand') || hText.includes('phuket') || hText.includes('krabi')) return 'thailand';
    if (hText.includes('europe') || hText.includes('switzerland')) return 'europe';
    if (hText.includes('kashmir') || hText.includes('srinagar')) return 'kashmir';
    if (hText.includes('chardham') || hText.includes('char dham')) return 'chardham';
    if (hText.includes('bali') || hText.includes('ubud')) return 'bali';
    if (hText.includes('dubai')) return 'dubai';
    if (hText.includes('goa')) return 'goa';
    if (hText.includes('rajasthan')) return 'rajasthan';
  }

  return '';
}
