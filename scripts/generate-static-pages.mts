import fs from 'fs/promises';
import path from 'path';
import { blogPosts } from '../src/data/blogData.tsx';

const siteUrl = 'https://ghumofiroo.com';
const distDir = path.resolve(process.cwd(), 'dist');
const templatePath = path.join(distDir, 'index.html');

const formatCanonical = (route: string) => {
  if (route === '/') return `${siteUrl}/`;
  return `${siteUrl}${route.endsWith('/') ? route : route + '/'}`;
};


interface RouteMeta {
  route: string;
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  h1?: string;
  h2?: string;
  bodyHtml?: string;
}

const staticRoutesMeta: Record<string, { title: string; description: string; h1: string; h2?: string; bodyHtml: string }> = {
  '/': {
    title: 'Char Dham, Kashmir & Europe Tours | Ghumo Firoo',
    description: 'Discover bespoke luxury holidays, private tour packages, and sacred spiritual escapes with Ghumo Firoo. Book curated Char Dham Yatra, Rann Utsav tents, Kashmir, and Europe tours today.',
    h1: 'Char Dham, Kashmir & Europe Luxury Tour Packages',
    h2: 'Bespoke Journeys Crafted With Intention by Ghumo Firoo Travels',
    bodyHtml: `
      <section>
        <h2>Welcome to Ghumo Firoo Travels — Delhi's Premier Tour Curator</h2>
        <p>Ghumo Firoo Travels is an official Ministry of Tourism and NIDHI registered travel agency headquartered in Munirka, South Delhi. Founded and directed by Sangita Kumari, a seasoned travel veteran with over a decade of leadership across MakeMyTrip, Goibibo, ixigo, and Amadeus, we specialize in high-touch, customized holiday itineraries, private luxury road trips, VIP helicopter pilgrimages, and bespoke international holidays.</p>
        <p>Whether you are planning the sacred Char Dham Yatra to Kedarnath and Badrinath, seeking the serene white salt desert during Gujarat's Rann Utsav at Tent City Dhordo, yearning for snow-capped peaks in Kashmir and Himachal Pradesh, or embarking on a grand vacation across Switzerland, Paris, and Italy, our dedicated team of destination specialists provides end-to-end concierge support 24 hours a day, 7 days a week.</p>
      </section>

      <section>
        <h2>Signature Travel Collections & Featured Tour Circuits</h2>
        <p>Explore our most sought-after handcrafted holiday circuits, thoughtfully designed for families, honeymooners, spiritual seekers, and luxury connoisseurs:</p>
        <ul>
          <li><strong>Char Dham Yatra & Do Dham Pilgrimages:</strong> Complete 9N/10D road yatras from Haridwar and Delhi, as well as same-day and 5N/6D VIP helicopter charters from Sahastradhara Dehradun with guaranteed VIP Darshan passes at Kedarnath, Badrinath, Gangotri, and Yamunotri.</li>
          <li><strong>Official Evoke Rann Utsav Tent City Dhordo:</strong> Premium AC Swiss Cottages, Darbari Suites, White Desert sunset camel safaris, Kalo Dungar hill excursions, UNESCO World Heritage site Dholavira, and traditional Kutchi cultural performances.</li>
          <li><strong>Kashmir Paradise & Gulmarg Gondola:</strong> Luxury Dal Lake private houseboats, Shikara sunset rides, Phase 1 & Phase 2 Gulmarg Gondola snow tickets, Betaab Valley in Pahalgam, and Sonamarg glacier day trips.</li>
          <li><strong>Grand Europe & Swiss Alps:</strong> Customized multi-country European tours covering Mount Titlis, Jungfraujoch, Paris Eiffel Tower illuminations, Rome Colosseum private tours, Venice gondola rides, and complete Schengen visa assistance.</li>
          <li><strong>Royal Rajasthan Heritage:</strong> Amber Fort in Jaipur, Mehrangarh Fort in Jodhpur, Lake Pichola private boat cruises in Udaipur, and Sam Sand Dunes luxury tent camps in Jaisalmer.</li>
          <li><strong>Kerala Backwaters & Hill Stations:</strong> Private traditional houseboats in Alleppey, rolling tea estates in Munnar, Periyar wildlife sanctuary in Thekkady, and serene beaches in Kovalam.</li>
        </ul>
      </section>

      <section>
        <h2>Why Discerning Travelers Choose Ghumo Firoo</h2>
        <p>Over 10,000 delighted guests and 500+ five-star verified reviews trust Ghumo Firoo Travels for seamless, hassle-free holiday experiences. Here is what sets us apart:</p>
        <ul>
          <li><strong>100% Customized Itineraries:</strong> Every single tour is crafted around your personal travel dates, family preferences, hotel budget, and pace.</li>
          <li><strong>Dedicated 24x7 Trip Concierge:</strong> A dedicated holiday manager is assigned to your booking from the moment you enquire until you safely return home.</li>
          <li><strong>Verified Hotel Partners & Private Fleet:</strong> We inspect every boutique resort and maintain a modern private fleet with background-verified professional chauffeurs.</li>
          <li><strong>Transparent Pricing & Flexible Terms:</strong> Zero hidden charges, clear itemized inclusions, and transparent cancellation and amendment policies.</li>
        </ul>
      </section>

      <section>
        <h2>Frequently Asked Questions About Booking With Ghumo Firoo</h2>
        <p><strong>How do I book a customized tour package?</strong> You can submit an enquiry through our website, call our travel desk at +91 9910987264, or message us on WhatsApp. Our destination consultant will prepare a tailored proposal within 15 to 30 minutes.</p>
        <p><strong>Are Char Dham biometric registrations included?</strong> Yes, our operations team handles the mandatory Uttarakhand government biometric yatra registrations and helicopter slot confirmations for all guests.</p>
        <p><strong>What payment methods are supported?</strong> We accept secure online payments via UPI, Google Pay, PhonePe, Debit/Credit Cards, Net Banking, and Bank Wire transfers with instant digital receipts.</p>
      </section>
    `
  },
  '/about': {
    title: 'About Us | Ghumo Firoo Travels - Trusted Delhi Travel Agency',
    description: 'Learn about Ghumo Firoo Travels, founded by Sangita Kumari with 10+ years travel industry experience across MakeMyTrip, Goibibo, ixigo, and Amadeus.',
    h1: 'About Ghumo Firoo Travels — Our Story & Heritage',
    h2: 'Crafting Unforgettable Journeys with Decades of Tourism Expertise',
    bodyHtml: `
      <section>
        <h2>Founder's Vision: Transforming Travel Into Meaningful Memories</h2>
        <p>Ghumo Firoo Travels was founded by <strong>Sangita Kumari</strong>, an industry leader with over a decade of hands-on expertise spanning India's most prominent online travel giants, including MakeMyTrip, Goibibo, ixigo, and Amadeus Global Distribution System. Driven by a passion to eliminate impersonal call centers and rigid standardized tour packages, Sangita established Ghumo Firoo Travels to offer travelers genuinely tailored, high-touch holiday consulting.</p>
        <p>Headquartered in Munirka, South Delhi, Ghumo Firoo Travels operates with a client-first philosophy: every journey is thoughtfully curated with direct human attention, verified luxury accommodations, dependable private transportation, and round-the-clock on-ground operational support.</p>
      </section>

      <section>
        <h2>Our Core Values & Guiding Principles</h2>
        <ul>
          <li><strong>Authentic Local Immersion:</strong> We connect our guests with genuine cultural experiences, local cuisine, and hidden scenic gems beyond crowded tourist traps.</li>
          <li><strong>Uncompromising Safety & Comfort:</strong> From sanitized private vehicles to medically prepared mountain drivers and women-friendly accommodations, guest safety is our primary metric.</li>
          <li><strong>Transparent Integrity:</strong> No deceptive bait-and-switch hotel tiers or hidden fees. What you see in our detailed proposal voucher is precisely what is delivered.</li>
          <li><strong>24x7 Real-Time Assistance:</strong> Unforeseen weather changes or flight delays? Our operations desk resolves ground logistics in real time.</li>
        </ul>
      </section>

      <section>
        <h2>Official Accreditations & Tourism Registrations</h2>
        <p>Ghumo Firoo Travels is an officially recognized tour operator registered under the National Integrated Database of Hospitality Industry (NIDHI) and the Ministry of Tourism, Government of India. Furthermore, we are official authorized booking partners for prestigious tourism enterprises including <strong>Evoke Experiences (Tent City Dhordo, Rann Utsav)</strong>, certified helicopter charter operators in Uttarakhand, and premium hotel chains across India, Southeast Asia, and Europe.</p>
      </section>

      <section>
        <h2>Visit Our Delhi Travel Lounge</h2>
        <p>Guests are always welcome to meet our destination specialists in person to plan their upcoming holidays over tea. Our physical office is located at Shop No. 210, 2nd Floor, Pratap Complex, near Munirka Metro Station Gate No. 3, Baba Gangnath Market, New Delhi 110067. You can also reach our desk at +91 9910987264 or info@ghumofiroo.com.</p>
      </section>
    `
  },
  '/contact': {
    title: 'Contact Us | Ghumo Firoo Travels - 24x7 Holiday Support Desk',
    description: 'Get in touch with Ghumo Firoo Travels. Reach our Delhi travel desk via phone, WhatsApp (+91 9910987264), or email (info@ghumofiroo.com) for travel enquiries.',
    h1: 'Contact Ghumo Firoo Travels — 24x7 Holiday Support Desk',
    h2: 'Connect With Our Travel Specialists in New Delhi',
    bodyHtml: `
      <section>
        <h2>We Are Here to Help You Plan Your Dream Holiday</h2>
        <p>Whether you need advice on the best season to visit Kedarnath, assistance with booking luxury Swiss cottages at Rann Utsav Tent City, customized quotes for a family holiday in Kashmir, or guidance on European Schengen visa applications, our team of dedicated travel specialists is available round the clock.</p>
      </section>

      <section>
        <h2>Direct Contact Coordinates</h2>
        <ul>
          <li><strong>Central Reservation Hotline:</strong> +91 99109 87264 / +91 98702 29792</li>
          <li><strong>WhatsApp Instant Desk:</strong> +91 99109 87264 (24x7 Quick Assistance & Proposal PDF dispatch)</li>
          <li><strong>General Enquiries & Feedback:</strong> info@ghumofiroo.com</li>
          <li><strong>B2B Partnerships & Corporate MICE:</strong> partnerships@ghumofiroo.com</li>
          <li><strong>Emergency Guest Support (On-Trip):</strong> Available 24 hours daily for all active travelers</li>
        </ul>
      </section>

      <section>
        <h2>Office Location & Consultation Hours</h2>
        <p><strong>Registered Address:</strong> Shop No. 210, 2nd Floor, Pratap Complex, Near Metro Gate Number 3, Baba Gangnath Market, Munirka, New Delhi, Delhi 110067, India.</p>
        <p><strong>Operating Hours:</strong> Monday through Saturday from 09:00 AM to 07:00 PM IST. Sunday by prior appointment from 10:00 AM to 04:00 PM IST.</p>
      </section>

      <section>
        <h2>What Happens When You Submit an Enquiry?</h2>
        <p>Once you reach out via our contact form or WhatsApp, an expert destination manager specializing in your chosen region will review your travel requirements, check live hotel and transport availability, and share a customized itinerary proposal with itemized transparent pricing within 15 to 30 minutes.</p>
      </section>
    `
  },
  '/packages': {
    title: 'All Tour Packages & Holiday Itineraries | Ghumo Firoo Travels',
    description: 'Explore all customized tour packages: Rann Utsav Kutch, Char Dham Yatra, Kashmir Paradise, Europe, Rajasthan Heritage, Kerala Backwaters, Dubai, and Singapore.',
    h1: 'All Tour Packages & Handcrafted Holiday Itineraries',
    h2: 'Curated Domestic & International Vacation Circuits',
    bodyHtml: `
      <section>
        <h2>Handcrafted Travel Packages Tailored to Your Dreams</h2>
        <p>At Ghumo Firoo Travels, we believe that no two travelers are alike. That is why every single package listed in our collection serves as a flexible blueprint that can be customized to match your exact dates, group size, preferred airline, and hotel category. From sacred spiritual pilgrimages in the Himalayas to exotic tropical island retreats in Southeast Asia and opulent European grand tours, explore our verified holiday circuits below.</p>
      </section>

      <section>
        <h2>Popular Domestic Holiday Destinations</h2>
        <ul>
          <li><strong>Char Dham Yatra & Kedarnath (Uttarakhand):</strong> 9N/10D road packages from Haridwar, 11N/12D Delhi departures, and same-day/5N6D VIP helicopter packages covering Yamunotri, Gangotri, Kedarnath, and Badrinath.</li>
          <li><strong>Rann Utsav & Kutch White Desert (Gujarat):</strong> 1N/2D, 2N/3D, 3N/4D, and 4N/5D all-inclusive packages at Evoke Tent City Dhordo with luxury AC Swiss cottages, cultural music, and full moon desert excursions.</li>
          <li><strong>Kashmir Valley & Ladakh (North India):</strong> Srinagar Dal Lake houseboats, Gulmarg Gondola snow adventures, Pahalgam Betaab Valley, Leh Ladakh bike expeditions, Pangong Lake camps, and Nubra Valley camel safaris.</li>
          <li><strong>Rajasthan Heritage & Desert Royal (West India):</strong> Jaipur Amer Fort, Udaipur Lake Pichola palaces, Jodhpur blue city, and Jaisalmer desert dunes.</li>
          <li><strong>Kerala Backwaters & Hills (South India):</strong> Munnar tea gardens, Alleppey private houseboats, Thekkady wildlife safaris, and Kovalam beaches.</li>
          <li><strong>Himachal Pradesh & Hill Stations:</strong> Shimla Kufri, Manali Solang Valley snow adventures, Atal Tunnel, and Dharamshala Dalai Lama Temple.</li>
          <li><strong>Goa Coastal Holidays:</strong> Baga, Calangute, and Candolim in North Goa; pristine private beach resorts and sunset river cruises in South Goa.</li>
        </ul>
      </section>

      <section>
        <h2>Popular International Tour Packages</h2>
        <ul>
          <li><strong>Europe & Switzerland:</strong> Zurich, Lucerne, Interlaken, Mount Titlis, Jungfraujoch, Paris, Venice, and Rome with Schengen visa guidance.</li>
          <li><strong>Singapore & Malaysia Combos:</strong> Marina Bay Sands, Sentosa Island, Universal Studios, Kuala Lumpur Petronas Towers, and Genting Highlands.</li>
          <li><strong>Dubai & UAE Luxury:</strong> Burj Khalifa 124th floor, Desert 4x4 Dune Bashing safari with BBQ dinner, Dubai Marina yacht cruise, and Abu Dhabi Ferrari World.</li>
          <li><strong>Bali & Tropical Asia:</strong> Ubud private pool villas, Nusa Penida island tours, Kintamani volcano, and Uluwatu sunset temple.</li>
          <li><strong>Thailand, Vietnam & Georgia:</strong> Bangkok & Phuket beach holidays, Hanoi & Ha Long Bay cruises, and Tbilisi & Kazbegi Caucasus mountain tours.</li>
        </ul>
      </section>
    `
  },
  '/booking': {
    title: 'Book Your Holiday Tour Package | Ghumo Firoo Travels',
    description: 'Confirm your holiday package booking with Ghumo Firoo Travels. Secure online payments, instant vouchers, verified stays, and 24x7 on-trip assistance.',
    h1: 'Book & Confirm Your Tour Package Booking',
    h2: 'Secure Reservation Portal with Instant Confirmation Vouchers',
    bodyHtml: `
      <section>
        <h2>Simple, Secure & Transparent Holiday Booking Process</h2>
        <p>Booking your customized holiday with Ghumo Firoo Travels is seamless, safe, and protected by bank-grade 256-bit SSL encryption. Once your travel consultant finalizes your custom itinerary, you can confirm your reservation by depositing the agreed advance token amount through our secure portal.</p>
      </section>

      <section>
        <h2>What You Receive Upon Booking Confirmation</h2>
        <ul>
          <li><strong>Official Booking Voucher:</strong> A detailed PDF document outlining your day-by-day itinerary, verified hotel name, meal plans, and pickup details.</li>
          <li><strong>Hotel Confirmation Numbers:</strong> Direct hotel booking reference codes for complete peace of mind before you travel.</li>
          <li><strong>Chauffeur & Vehicle Allocation:</strong> Driver name, mobile contact number, and sanitized vehicle license plate details dispatched 24 hours prior to departure.</li>
          <li><strong>Dedicated 24x7 Relationship Manager:</strong> Direct line to a senior travel manager dedicated to overseeing your on-trip logistics and special requests.</li>
        </ul>
      </section>

      <section>
        <h2>Multiple Safe Payment Modes Supported</h2>
        <p>We accept all standard payment gateways including Instant UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay, Amex), Net Banking across 50+ Indian banks, and direct NEFT/RTGS wire transfers. Tax invoices with GST input credit are available for corporate travelers.</p>
      </section>
    `
  },
  '/enquire-now': {
    title: 'Enquire Now | Custom Holiday Package Quote | Ghumo Firoo',
    description: 'Request a customized quote for your upcoming journey. Our travel specialists build tailored hotel, cab, and sightseeing packages within 2 hours.',
    h1: 'Enquire Now for Custom Tour Packages & Best Price Quotes',
    h2: 'Tell Us Your Travel Plans & Receive a Free Tailored Itinerary',
    bodyHtml: `
      <section>
        <h2>Start Planning Your Next Unforgettable Journey</h2>
        <p>Planning a vacation should be exciting, not stressful. Fill out our quick enquiry form with your destination of interest, tentative travel dates, number of travelers, and accommodation preferences. A dedicated Ghumo Firoo destination specialist will prepare a handcrafted itinerary proposal and share the lowest available rates within minutes.</p>
      </section>

      <section>
        <h2>Why Enquire With Ghumo Firoo Travels?</h2>
        <ul>
          <li><strong>Zero Obligation, 100% Free Quotes:</strong> Receive comprehensive itineraries with full inclusions and transparent pricing without any upfront cost.</li>
          <li><strong>Bespoke Customization:</strong> Want to add an extra night in a luxury houseboat or upgrade to a helicopter Darshan? We adapt everything to your exact wishlist.</li>
          <li><strong>Exclusive Partner Rates:</strong> Enjoy direct wholesale pricing through our official partnerships with Evoke Experiences, luxury resort chains, and private vehicle fleets.</li>
          <li><strong>Rapid 15-Minute Turnaround:</strong> Our consultants respond promptly via WhatsApp or Phone call with detailed day-wise breakdowns.</li>
        </ul>
      </section>
    `
  },
  '/enquire-success': {
    title: 'Enquiry Received | Ghumo Firoo Travels',
    description: 'Thank you for your enquiry. A Ghumo Firoo travel specialist will get in touch with your customized itinerary and best price quote shortly.',
    h1: 'Your Holiday Enquiry Has Been Successfully Received',
    h2: 'Our Travel Specialists Are Crafting Your Customized Itinerary',
    bodyHtml: `
      <section>
        <h2>Thank You for Reaching Out to Ghumo Firoo Travels</h2>
        <p>We have successfully registered your travel enquiry in our central reservation system. A dedicated destination manager has been assigned to your request and is currently checking real-time hotel availability, transport logistics, and the best available promotional discounts for your travel dates.</p>
      </section>

      <section>
        <h2>Next Steps in Your Holiday Planning</h2>
        <ul>
          <li><strong>Consultant Review (10-15 Minutes):</strong> Our specialist will review your preferences and customize the day-by-day sightseeing schedule.</li>
          <li><strong>Proposal Dispatch via WhatsApp & Email:</strong> You will receive a clean, itemized proposal PDF detailing hotel options, inclusions, meals, and transparent pricing.</li>
          <li><strong>Personalized Adjustments:</strong> Review the plan at your leisure and let us know if you want any modifications to hotels, dates, or routes.</li>
        </ul>
        <p>Need urgent assistance? Call our direct reservation line at <strong>+91 99109 87264</strong> or message us on WhatsApp for immediate support.</p>
      </section>
    `
  },
  '/thank-you': {
    title: 'Thank You | Ghumo Firoo Travels',
    description: 'Thank you for choosing Ghumo Firoo Travels. Your booking details and travel confirmation have been safely registered with our operations desk.',
    h1: 'Thank You for Choosing Ghumo Firoo Travels',
    h2: 'Your Holiday Reservation Is Confirmed & Protected',
    bodyHtml: `
      <section>
        <h2>We Are Honored to Be Part of Your Travel Journey</h2>
        <p>Your holiday booking with Ghumo Firoo Travels is officially confirmed. Our operations team is now finalizing your hotel vouchers, private vehicle allocations, and yatra permits. A digital copy of your confirmed itinerary and payment receipt has been sent to your registered email and WhatsApp number.</p>
      </section>

      <section>
        <h2>Pre-Departure Checklist & What to Expect</h2>
        <ul>
          <li><strong>Digital Vouchers:</strong> Your official hotel check-in vouchers and transport service orders are available for download in your confirmation email.</li>
          <li><strong>Driver Details (24h Before Trip):</strong> We will send your chauffeur's verified name, phone number, and vehicle license plate 24 hours before your trip begins.</li>
          <li><strong>24x7 Trip Support:</strong> Your assigned relationship manager is on standby throughout your entire holiday to answer questions or assist with special requests.</li>
        </ul>
      </section>
    `
  },
  '/terms-of-service': {
    title: 'Terms of Service | Ghumo Firoo Travels',
    description: 'Terms of service governing the use of the Ghumo Firoo Travels website, digital booking platforms, and travel concierge services.',
    h1: 'Terms of Service & User Agreement',
    h2: 'Legal Guidelines for Using Ghumo Firoo Digital Platforms and Services',
    bodyHtml: `
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the website ghumofiroo.com, mobile interfaces, booking engines, or communicating with our travel consultants, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. Ghumo Firoo Travels reserves the right to update these terms periodically to reflect operational, legal, or regulatory changes.</p>
      </section>

      <section>
        <h2>2. Scope of Travel Concierge & Agency Services</h2>
        <p>Ghumo Firoo Travels acts as an authorized travel curator and intermediary connecting guests with third-party service providers, including airlines, hotels, transport operators, helicopter charter providers, and local tour guides. While we carefully vet and select only premium, verified partners, each independent provider is governed by its respective service terms and conditions.</p>
      </section>

      <section>
        <h2>3. Booking Confirmation, Payments & Price Integrity</h2>
        <p>All package quotes provided by Ghumo Firoo Travels are subject to availability at the time of booking. A reservation is officially confirmed only upon receipt of the agreed advance payment and the subsequent generation of an official booking voucher. Quoted prices include only the specific items itemized in your itinerary's "Inclusions" list. Personal expenses, optional activities, travel insurance, and unforeseen government tax hikes are excluded unless explicitly stated.</p>
      </section>

      <section>
        <h2>4. Guest Responsibilities & Travel Documentation</h2>
        <p>Travelers are strictly responsible for carrying valid government-issued photo identification (Aadhaar Card, Passport, or Voter ID for Indian nationals; Valid Passport and Visa/OCI for international travelers) throughout their journey. For Himalayan circuits such as Char Dham Yatra and Leh Ladakh, guests must ensure medical fitness for high-altitude travel and complete mandatory state registration permits.</p>
      </section>

      <section>
        <h2>5. Unforeseen Events & Force Majeure</h2>
        <p>Ghumo Firoo Travels and its partner vendors shall not be held liable for itinerary changes, flight cancellations, road blockages, landslides, extreme weather disruptions, or government restrictions that occur due to Force Majeure. In such events, our team will make every reasonable effort to provide alternative lodging, transport, or rescheduled routes at minimum inconvenience to guests.</p>
      </section>

      <section>
        <h2>6. Dispute Resolution & Legal Jurisdiction</h2>
        <p>Any disputes, claims, or controversies arising out of or relating to your booking with Ghumo Firoo Travels shall be governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in New Delhi, India.</p>
      </section>
    `
  },
  '/terms-conditions': {
    title: 'Terms & Conditions | Ghumo Firoo Travels',
    description: 'Terms and conditions for holiday package bookings, payments, amendments, and cancellations with Ghumo Firoo Travels.',
    h1: 'Booking Terms & Conditions',
    h2: 'Official Reservation Policies, Payment Schedules & Travel Guidelines',
    bodyHtml: `
      <section>
        <h2>1. Reservation & Deposit Policy</h2>
        <p>To secure a holiday package reservation with Ghumo Firoo Travels, an initial deposit of 30% to 50% of the total package value is required at the time of booking confirmation. The remaining balance must be cleared no later than 15 days prior to the departure date, or at hotel check-in as agreed in writing on your booking voucher.</p>
      </section>

      <section>
        <h2>2. Itinerary Amendments & Modifications</h2>
        <p>Requests for date changes, hotel upgrades, or additional sightseeing stops will be accommodated subject to vendor availability and any applicable tariff differences. Amendments made within 7 days of departure may incur supplier fees.</p>
      </section>

      <section>
        <h2>3. Hotel Check-in / Check-out Standards</h2>
        <p>Standard international check-in time across hotels is 12:00 PM to 02:00 PM, and check-out is 10:00 AM to 11:00 AM. Early check-in and late check-out are subject to room availability and hoteliers' discretion. Room categories booked are specified in your voucher (e.g. Deluxe Room, AC Swiss Tent, Premium Cottage).</p>
      </section>

      <section>
        <h2>4. Cancellation & Refund Policy</h2>
        <p>Cancellations must be submitted in writing to info@ghumofiroo.com. Refunds are processed according to our standard cancellation timeline: cancellations made 30+ days prior to travel receive a full refund minus nominal processing charges; 15-29 days prior receive a 50% refund; and cancellations within 14 days of travel or peak festival dates (e.g. Diwali, New Year, Rann Utsav full moon) are subject to vendor non-refundable terms.</p>
      </section>
    `
  },
  '/refund-policy': {
    title: 'Cancellation & Refund Policy | Ghumo Firoo Travels',
    description: 'Read our transparent cancellation and refund policy for tour packages, hotels, flights, and seasonal festival bookings with Ghumo Firoo Travels.',
    h1: 'Cancellation & Refund Policy',
    h2: 'Clear, Transparent Timelines for Refunds and Booking Cancellations',
    bodyHtml: `
      <section>
        <h2>Our Commitment to Fair & Transparent Refunds</h2>
        <p>At Ghumo Firoo Travels, we understand that unexpected situations can arise requiring travel dates to change or bookings to be cancelled. We strive to provide transparent, fair, and swift refund processing while adhering to airline, hotel, and transport supplier cancellation rules.</p>
      </section>

      <section>
        <h2>Standard Tour Package Cancellation Timelines</h2>
        <ul>
          <li><strong>30 Days or More Prior to Departure:</strong> 90% refund of total booking amount (10% standard administrative and banking fee deducted).</li>
          <li><strong>15 to 29 Days Prior to Departure:</strong> 50% refund of the total package cost.</li>
          <li><strong>0 to 14 Days Prior to Departure:</strong> Non-refundable due to advance hotel blockages and non-refundable vehicle reservations.</li>
        </ul>
      </section>

      <section>
        <h2>Seasonal & Special Event Packages</h2>
        <p>For high-demand seasonal events such as <strong>Evoke Rann Utsav Tent City Dhordo</strong> (during Full Moon, Christmas, and New Year dates) and <strong>Char Dham VIP Helicopter Charters</strong>, cancellation terms are governed strictly by the respective operators' non-refundable peak season policies.</p>
      </section>

      <section>
        <h2>Refund Processing Duration</h2>
        <p>Approved refunds are processed back to the original payment source (Bank Account, UPI, or Credit Card) within 5 to 7 business days following formal approval.</p>
      </section>
    `
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Ghumo Firoo Travels',
    description: 'Read the Privacy Policy of Ghumo Firoo Travels regarding how we collect, protect, and use your personal information and travel data securely.',
    h1: 'Privacy Policy & Data Protection',
    h2: 'How Ghumo Firoo Travels Collects, Uses and Safeguards Your Personal Data',
    bodyHtml: `
      <section>
        <h2>Your Privacy Matters to Us</h2>
        <p>Ghumo Firoo Travels is dedicated to safeguarding your personal data and respecting your privacy rights. This policy explains what information we collect when you visit ghumofiroo.com, submit an itinerary enquiry, or book a tour with us, and how that information is utilized strictly to provide travel services.</p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <ul>
          <li><strong>Contact Details:</strong> Full name, email address, phone number, and city for communicating itinerary quotes and vouchers.</li>
          <li><strong>Travel Details:</strong> Destination preferences, travel dates, passenger counts, and dietary/accommodation requests.</li>
          <li><strong>Government ID & Permits:</strong> Required solely for booking flight tickets, Char Dham Yatra permits, and hotel registrations.</li>
          <li><strong>Payment Information:</strong> Processed securely through PCI-DSS compliant third-party payment gateways; we never store your credit card numbers or UPI PINs.</li>
        </ul>
      </section>

      <section>
        <h2>Data Security & No Third-Party Selling</h2>
        <p>We do not sell, rent, or trade your personal information with third-party advertisers. Your information is shared only with verified service providers (hotels, airlines, chauffeurs) directly involved in executing your holiday itinerary.</p>
      </section>
    `
  },
  '/profile': {
    title: 'Traveler Profile | Ghumo Firoo Travels',
    description: 'Access your Ghumo Firoo traveler profile, manage booked holiday packages, check itinerary vouchers, and update your personal travel preferences.',
    h1: 'Ghumo Firoo Traveler Profile & Guest Portal',
    h2: 'Manage Your Vacation Itineraries, Saved Trips & Booking History',
    bodyHtml: `
      <section>
        <h2>Welcome to the Ghumo Firoo Guest Portal</h2>
        <p>The Ghumo Firoo Traveler Profile portal allows our valued guests to review their past and upcoming holiday itineraries, access confirmed hotel vouchers, manage travel preferences, and connect directly with their assigned holiday concierge.</p>
      </section>

      <section>
        <h2>Features of Your Traveler Profile</h2>
        <ul>
          <li><strong>Active Trip Management:</strong> View live day-by-day itineraries, flight details, pickup times, and chauffeur contact information for current bookings.</li>
          <li><strong>Digital Vouchers & Invoices:</strong> Download official hotel check-in vouchers, payment receipts, GST tax invoices, and state permit documents.</li>
          <li><strong>Personalized Travel Wishlist:</strong> Save custom tour packages, explore seasonal holiday deals, and request tailored quotation updates with a single click.</li>
          <li><strong>Direct Concierge Assistance:</strong> Get in touch with your dedicated 24x7 holiday manager for special requests, dietary preferences, or room upgrades.</li>
        </ul>
      </section>

      <section>
        <h2>Need Help with Your Account or Bookings?</h2>
        <p>If you need assistance accessing your booking records or updating your profile details, our customer support desk is available 24x7 via phone at <strong>+91 99109 87264</strong> or email at <strong>info@ghumofiroo.com</strong>.</p>
      </section>
    `
  },
  '/blog': {
    title: 'Travel Blog – Tips, Guides & Itineraries | Ghumo Firoo',
    description: 'Read expert travel blogs, packing tips, pilgrimage advice, and destination guides for Char Dham, Rann Utsav, Kashmir, Europe, and India holidays.',
    h1: 'Ghumo Firoo Travel Blog & Destination Guides',
    h2: 'Inspiration, Itinerary Insights & Practical Travel Tips for Your Next Holiday',
    bodyHtml: `
      <section>
        <h2>Expert Travel Guides, Pilgrimage Insights & Holiday Inspiration</h2>
        <p>Welcome to the Ghumo Firoo Travel Blog, your trusted digital journal for comprehensive destination guides, packing checklists, pilgrimage planning tips, and insider travel recommendations crafted by our seasoned holiday curators in New Delhi.</p>
      </section>

      <section>
        <h2>Featured Travel Articles & Destination Spotlights</h2>
        <ul>
          <li><strong>Complete Char Dham Yatra Guide:</strong> Essential biometric registration procedures, helicopter booking timelines, weather advisory, and packing tips for Kedarnath, Badrinath, Gangotri, and Yamunotri.</li>
          <li><strong>Rann Utsav Tent City Survival Guide:</strong> Everything you need to know about visiting Dhordo White Desert, attending Kutchi folk festivals, exploring Kalo Dungar, and booking premium Swiss cottages.</li>
          <li><strong>Kashmir in All Seasons:</strong> Spring tulip gardens in Srinagar, summer shikara rides on Dal Lake, autumn chinar foliage in Pahalgam, and winter snow sports at Gulmarg Gondola.</li>
          <li><strong>Europe First-Timer Handbook:</strong> Step-by-step Schengen visa guidelines, top rail journeys in Switzerland, and must-visit landmarks across Paris, Rome, and Amsterdam.</li>
        </ul>
      </section>

      <section>
        <h2>Plan Your Holiday with Our Destination Experts</h2>
        <p>Inspired by our travel stories? Reach out to our dedicated travel desk at <strong>+91 99109 87264</strong> or email <strong>info@ghumofiroo.com</strong> to begin crafting your customized holiday itinerary.</p>
      </section>
    `
  },
  '/guides': {
    title: 'Travel Guides & Destination Insights | Ghumo Firoo',
    description: 'Comprehensive travel guides for Char Dham Yatra, Rann Utsav Kutch, Kashmir Valley, Europe, and Kerala. Best time to visit, routes, and expert advice.',
    h1: 'Complete Destination Travel Guides & Itinerary Tips',
    h2: 'Everything You Need to Know Before You Embark on Your Next Journey',
    bodyHtml: `
      <section>
        <h2>Comprehensive Travel Resources & Field Guides</h2>
        <p>Explore in-depth travel guides created by Ghumo Firoo Travels to help you plan safe, memorable, and well-organized vacations across India's most iconic landscapes and top international holiday spots.</p>
      </section>

      <section>
        <h2>Popular Destination Guides</h2>
        <ul>
          <li><strong>Uttarakhand Spiritual Circuit:</strong> Comprehensive trekking routes, altitude precautions, helicopter landing details, and temple timings for Kedarnath and Badrinath.</li>
          <li><strong>Gujarat Culture & Desert Circuit:</strong> Full moon desert safari schedules, UNESCO World Heritage site Dholavira, Mandvi beach palaces, and Kutchi handicraft villages.</li>
          <li><strong>Rajasthan Heritage Corridor:</strong> Royal fort circuits in Jaipur, Jodhpur, Udaipur, and desert dune camps in Jaisalmer.</li>
          <li><strong>Kerala Backwaters & Hill Country:</strong> Munnar tea estate trails, Periyar wildlife sanctuaries, and Alleppey traditional luxury houseboat routes.</li>
        </ul>
      </section>

      <section>
        <h2>Personalized Holiday Consultation</h2>
        <p>Have questions about permits, peak travel seasons, or luxury hotel recommendations? Our travel specialists are available 24x7 to assist you. Contact us today.</p>
      </section>
    `
  },
  '/custom-tour-packages': {
    title: 'Custom Tour Packages & Tailored Itineraries | Ghumo Firoo',
    description: 'Design your own custom tour package with Ghumo Firoo Travels. Flexible dates, private cab transfers, hand-picked hotels, and tailor-made sightseeing circuits.',
    h1: 'Custom Tour Packages & Tailored Holiday Itineraries',
    h2: 'Design Your Dream Vacation Exactly the Way You Want It',
    bodyHtml: `
      <section>
        <h2>Personalized Travel Crafted Around You</h2>
        <p>Say goodbye to rigid group bus tours and rushed itineraries. With Ghumo Firoo Travels' custom package curation, you dictate the schedule, the destinations, the hotel categories, and the sightseeing stops. Whether you want a leisurely 7-day road trip through the tea plantations of Kerala or a high-adrenaline 10-day Himalayan expedition, our travel planners design every detail around your vision.</p>
      </section>

      <section>
        <h2>How Custom Trip Planning Works</h2>
        <ol>
          <li><strong>Share Your Wishlist:</strong> Tell us your desired destinations, dates, group size, and must-see attractions.</li>
          <li><strong>Collaborative Itinerary Design:</strong> Your personal travel consultant builds a customized day-by-day route map and suggests verified boutique hotels.</li>
          <li><strong>Fine-Tune to Perfection:</strong> Modify routes, swap hotels, add private yacht cruises, or adjust the daily pace until you are 100% satisfied.</li>
          <li><strong>Confirm & Enjoy 24x7 Concierge:</strong> Lock in your booking with flexible terms and travel with the confidence of round-the-clock on-trip support.</li>
        </ol>
      </section>
    `
  },
  '/faq': {
    title: 'Frequently Asked Questions (FAQ) | Ghumo Firoo Travels',
    description: 'Find answers to common questions about tour booking, cancellation policies, payment modes, custom itineraries, and travel support with Ghumo Firoo.',
    h1: 'Frequently Asked Questions (FAQ)',
    h2: 'Everything You Need to Know About Booking with Ghumo Firoo Travels',
    bodyHtml: `
      <section>
        <h2>General Booking & Customization Questions</h2>
        <p><strong>Can I modify any package on your website?</strong> Absolutely. Every package listed is 100% customizable. You can add extra days, change hotel tiers, include special experiences, or alter pickup locations.</p>
        <p><strong>Are transfers private or shared?</strong> All our road transfers are strictly conducted in private, air-conditioned vehicles (Sedans, SUVs, or Luxury Urbanas) with dedicated professional chauffeurs.</p>
        <p><strong>How far in advance should I book Char Dham or Rann Utsav?</strong> We recommend booking at least 30 to 60 days in advance for peak travel seasons (May-June for Char Dham; November to February for Rann Utsav Tent City) to ensure premium tent and hotel availability.</p>
      </section>

      <section>
        <h2>Payments, Safety & Support</h2>
        <p><strong>Is advance payment secure?</strong> Yes, all digital payments are processed through RBI-authorized payment gateways using 256-bit SSL encryption with immediate digital receipt generation.</p>
        <p><strong>What support do you offer while on the trip?</strong> You will have a dedicated trip relationship manager reachable via direct phone call and WhatsApp 24 hours a day to handle any on-ground needs immediately.</p>
      </section>
    `
  },
  '/career': {
    title: 'Careers | Join the Ghumo Firoo Travels Team',
    description: 'Explore career opportunities in travel management, holiday consulting, customer support, and sales at Ghumo Firoo Travels in New Delhi.',
    h1: 'Careers at Ghumo Firoo Travels',
    h2: 'Build the Future of Experiential Travel with Our Team in South Delhi',
    bodyHtml: `
      <section>
        <h2>Join a Passionate Team of Tourism Specialists</h2>
        <p>At Ghumo Firoo Travels, we are always on the lookout for dynamic, passionate travel professionals who love exploring destinations and delivering exceptional guest experiences. Located in Munirka, New Delhi, we offer an inspiring, collaborative work culture with competitive compensation and rapid growth opportunities.</p>
      </section>

      <section>
        <h2>Current Open Positions</h2>
        <ul>
          <li><strong>Senior Holiday Consultant (Domestic & International):</strong> 2+ years experience in designing custom tour packages, negotiating with B2B hoteliers, and closing guest enquiries.</li>
          <li><strong>Travel Operations & Concierge Executive:</strong> Managing on-ground logistics, driver coordination, voucher issuance, and guest relations.</li>
          <li><strong>Digital Marketing & Content Specialist:</strong> Managing SEO, social media campaigns, and travel blog curation.</li>
        </ul>
        <p>To apply, please email your resume and cover letter to <strong>careers@ghumofiroo.com</strong> or call our HR desk at +91 9910987264.</p>
      </section>
    `
  },
  '/products': {
    title: 'Travel Products & Services | Ghumo Firoo Travels',
    description: 'Discover comprehensive travel services including customized holiday packages, hotel bookings, flight ticketing, private cab transfers, and visa support.',
    h1: 'Our Travel Products & Concierge Services',
    h2: 'End-to-End Tourism Solutions for Leisure, Pilgrimage & Corporate Travel',
    bodyHtml: `
      <section>
        <h2>Comprehensive Travel Management for Every Need</h2>
        <p>From tailor-made family vacations and VIP helicopter charters to corporate retreats and international visa assistance, Ghumo Firoo Travels offers an all-inclusive suite of professional tourism services designed to deliver unmatched comfort and value.</p>
      </section>

      <section>
        <h2>Our Core Service Verticals</h2>
        <ul>
          <li><strong>Tailor-Made Holiday Packages:</strong> Handcrafted itineraries across 40+ domestic and international destinations.</li>
          <li><strong>VIP Helicopter Charter Services:</strong> Exclusive helicopter charters for Char Dham Yatra, Kedarnath Darshan, and destination weddings.</li>
          <li><strong>Corporate MICE & Group Travel:</strong> End-to-end conference planning, team retreats, and group transport logistics.</li>
          <li><strong>Chauffeured Private Vehicle Fleet:</strong> Well-maintained sedans, premium SUVs, and luxury tempo travelers with professional drivers.</li>
          <li><strong>Boutique & Heritage Hotel Booking:</strong> Direct partnerships with luxury hotels, heritage havelis, and eco-resorts worldwide.</li>
        </ul>
      </section>
    `
  },
  '/landing/char-dham-helicopter': {
    title: 'Char Dham Yatra by Helicopter 2026 | VIP Darshan Packages',
    description: 'Book luxury Char Dham Yatra by Helicopter with VIP Darshan at Kedarnath and Badrinath. Dehradun departure, premium stay, and priority ground transfers.',
    h1: 'Char Dham Yatra by Helicopter 2026 - VIP Darshan Packages',
    h2: 'Same-Day & 5N/6D VIP Helicopter Pilgrimages from Dehradun',
    bodyHtml: `
      <section>
        <h2>Experience the Divine Char Dham with Speed, Comfort & Luxury</h2>
        <p>Embark on the ultimate spiritual journey to Yamunotri, Gangotri, Kedarnath, and Badrinath with Ghumo Firoo Travels' exclusive Char Dham Helicopter Charter packages. Departing directly from Sahastradhara Helipad in Dehradun, our helicopter tours eliminate arduous road journeys and high-altitude treks, allowing devotees and senior citizens to complete their sacred pilgrimage in sheer comfort.</p>
      </section>

      <section>
        <h2>VIP Helicopter Package Inclusions</h2>
        <ul>
          <li><strong>Charter Flights:</strong> Complete helicopter shuttle flights between Dehradun, Kharsali (Yamunotri), Harsil (Gangotri), Sersi/Phata (Kedarnath), and Badrinath.</li>
          <li><strong>Priority VIP Darshan Passes:</strong> Guaranteed VIP access at all four holy shrines without waiting in long queues.</li>
          <li><strong>Luxury Accommodations:</strong> Premium resort stays in Dehradun, Kharsali, Harsil, Guptkashi, and Badrinath with all vegetarian meals included.</li>
          <li><strong>Ground Transfers & Palki/Pony:</strong> Palki or pony arrangements at Yamunotri and dedicated vehicle transfers at all landing sectors.</li>
          <li><strong>Special Maha Abhishek Puja:</strong> Opportunity to participate in early morning special puja rituals at Badrinath Temple.</li>
        </ul>
      </section>

      <section>
        <h2>Why Book Helicopter Yatra With Ghumo Firoo?</h2>
        <p>With 10+ years of mountain aviation coordination and dedicated ground handlers stationed across all helipads, we ensure prompt slot clearances, weather monitoring, and round-the-clock safety support.</p>
      </section>
    `
  },
  '/landing/char-dham-road': {
    title: 'Char Dham Yatra by Road 2026 | Delhi & Haridwar Departure',
    description: 'Affordable and comfortable Char Dham Yatra by road. Packages from Delhi and Haridwar with private cab, verified hotels, and local sightseeing.',
    h1: 'Char Dham Yatra by Road 2026 - Complete Pilgrimage Packages',
    h2: '9 Nights / 10 Days Sacred Uttarakhand Circuit from Haridwar & Delhi',
    bodyHtml: `
      <section>
        <h2>Sacred Himalayan Road Pilgrimage to Uttarakhand's Four Dhams</h2>
        <p>The Char Dham Yatra by Road is India's most revered pilgrimage circuit, taking devotees through breathtaking Himalayan valleys, roaring rivers, and ancient temples. Ghumo Firoo Travels organizes complete 9N/10D and 11N/12D road yatras departing from Haridwar, Rishikesh, and New Delhi with dedicated private commercial vehicles and experienced mountain chauffeurs.</p>
      </section>

      <section>
        <h2>Detailed Day-by-Day Pilgrimage Route</h2>
        <ul>
          <li><strong>Day 1: Haridwar to Barkot via Mussoorie:</strong> Scenic drive past Kempty Falls, check-in at Barkot hotel, evening rest and acclimatization.</li>
          <li><strong>Day 2: Yamunotri Temple Darshan:</strong> Drive to Janki Chatti, 6km trek/palki to holy Yamunotri Temple, Divya Shila pooja, return to Barkot.</li>
          <li><strong>Day 3: Barkot to Uttarkashi:</strong> Visit ancient Kashi Vishwanath Temple on the banks of Bhagirathi River.</li>
          <li><strong>Day 4: Gangotri Temple Darshan:</strong> Drive through picturesque Harsil Valley, holy dip at Bhagirathi, darshan at Gangotri Temple, return to Uttarkashi.</li>
          <li><strong>Day 5: Uttarkashi to Guptkashi:</strong> Scenic drive via Tehri Dam and Mandakini River valley, check-in at Guptkashi.</li>
          <li><strong>Day 6: Guptkashi to Kedarnath:</strong> Drive to Sonprayag, trek to Kedarnath, evening Aarti and overnight stay in Kedarnath.</li>
          <li><strong>Day 7: Kedarnath Morning Darshan to Guptkashi:</strong> Morning temple darshan, trek down to Gaurikund, drive back to Guptkashi.</li>
          <li><strong>Day 8: Guptkashi to Badrinath via Joshimath:</strong> Drive to Badrinath, evening Aarti at Badrinath Temple, overnight stay in Badrinath.</li>
          <li><strong>Day 9: Badrinath to Rudraprayag:</strong> Visit Mana Village (last Indian village), Vyas Cave, drive to Rudraprayag confluence.</li>
          <li><strong>Day 10: Rudraprayag to Haridwar / Delhi:</strong> Drive back via Rishikesh Ram Jhula and Laxman Jhula; drop at railway station/airport.</li>
        </ul>
      </section>

      <section>
        <h2>Key Inclusions in Our Road Packages</h2>
        <p>All road packages include dedicated private vehicle (Innova / Ertiga / Tempo Traveler) with all toll taxes, parking, driver allowances, clean hotel stays with breakfast and dinner, and mandatory yatra registration assistance.</p>
      </section>
    `
  }
};

const packageRoutesMeta: Record<string, { title: string; description: string; h1: string; bodyHtml: string; image?: string }> = {
  '/packages/rann-utsav': {
    title: 'Rann Utsav Tour Packages 2026-2027 | Tent City Dhordo Booking',
    description: 'Official partner for Evoke Rann Utsav Tent City Dhordo. All-inclusive luxury packages with White Desert permits, cultural shows, Kutchi cuisine & transfers.',
    h1: 'Rann Utsav Tour Packages 2026-2027 - Tent City Dhordo Official Partner',
    image: '/Rann-Utsav-Gujarat.png',
    bodyHtml: `
      <section>
        <h2>Witness the Magic of the White Rann of Kutch</h2>
        <p>Rann Utsav is Gujarat's world-famous cultural festival held annually in the surreal white salt desert of Kutch. As an authorized official partner of <strong>Evoke Experiences (Tent City Dhordo)</strong>, Ghumo Firoo Travels offers exclusive all-inclusive holiday packages featuring luxury AC Swiss Cottages, Darbari Suites, traditional Kutchi folk music, artisan handicraft markets, camel cart safaris, and unforgettable full moon desert walks.</p>
      </section>

      <section>
        <h2>Available Rann Utsav Itinerary Packages</h2>
        <ul>
          <li><strong>2 Days / 1 Night Express Package:</strong> Perfect weekend getaway including 1 night in AC Swiss Tent at Tent City Dhordo, all meals, White Desert sunset excursion, cultural shows, and Bhuj transfers.</li>
          <li><strong>3 Days / 2 Nights Complete Package:</strong> Our most popular tour featuring 2 nights at Tent City, White Rann sunset and sunrise walks, Kalo Dungar (Black Hill) panoramic viewpoint, Gandhi Nu Gam artisan village, and full cultural shows.</li>
          <li><strong>4 Days / 3 Nights Heritage Package:</strong> Extended Kutch holiday covering Tent City Dhordo, UNESCO World Heritage archaeological site Dholavira, Mandvi Vijay Vilas Palace, beach sunset, and Bhuj heritage sightseeing.</li>
        </ul>
      </section>

      <section>
        <h2>All-Inclusive Tent City Dhordo Amenities</h2>
        <p>Every package booked through Ghumo Firoo includes luxury accommodation with attached modern bathrooms, morning and evening tea, authentic Kutchi and Gujarati buffet meals, complimentary Wi-Fi in activity zones, daily cultural folk dances, adventure activities (paramotoring, ATV rides), and AC coach transfers from Bhuj Airport and Railway Station.</p>
      </section>
    `
  },
  '/packages/rann-utsav-2d1n': {
    title: 'Rann Utsav 2D/1N Express Overnight Tent City Package | Ghumo Firoo',
    description: 'Book 2D/1N Rann Utsav Express package with Evoke Tent City Dhordo AC Swiss Tent stay, White Desert sunset walk, meals & Bhuj transfers.',
    h1: 'Rann Utsav 2 Days / 1 Night Express Overnight Package',
    image: '/Rann-Utsav-Gujarat.png',
    bodyHtml: `
      <section>
        <h2>Quick Weekend Escape to the White Salt Desert</h2>
        <p>The 2 Days / 1 Night Rann Utsav Express package is designed for travelers looking for a quick yet unforgettable weekend holiday. Experience the sheer beauty of the White Rann of Kutch, witness a breathtaking desert sunset, enjoy traditional Kutchi folk dance performances, and stay in luxurious air-conditioned Swiss Tents at Tent City Dhordo.</p>
      </section>
      <section>
        <h2>Package Highlights & Inclusions</h2>
        <ul>
          <li>1 Night luxury accommodation in AC Swiss Cottage or Premium Tent at Tent City Dhordo.</li>
          <li>Pickup and drop transfers from Bhuj Railway Station / Airport in air-conditioned coaches.</li>
          <li>All buffet meals: Welcome Lunch, Hi-Tea, Grand Dinner, and Morning Breakfast.</li>
          <li>Guided White Desert sunset tour with camel cart ride options.</li>
          <li>Access to cultural activity zones, handicraft bazaars, and live Kutchi folk entertainment.</li>
        </ul>
      </section>
    `
  },
  '/packages/rann-utsav-3d2n': {
    title: 'Rann Utsav 3D/2N Complete White Desert Package | Ghumo Firoo',
    description: 'Experience 3D/2N Rann Utsav with 2 nights in Tent City Dhordo, Kalo Dungar excursion, artisan village visits, all meals & transfers.',
    h1: 'Rann Utsav 3 Days / 2 Nights Complete White Desert Holiday',
    image: '/Rann-Utsav-Gujarat.png',
    bodyHtml: `
      <section>
        <h2>The Definitive 3 Days / 2 Nights Rann Utsav Experience</h2>
        <p>Our 3D/2N Rann Utsav package is our most highly rated itinerary. Enjoy two full nights at the luxurious Tent City Dhordo, witness both sunset and sunrise over the shimmering salt plains, explore Kalo Dungar (the highest point in Kutch), and shop for authentic handicrafts at Gandhi Nu Gam craft village.</p>
      </section>
      <section>
        <h2>Itinerary Highlights & Inclusions</h2>
        <ul>
          <li>2 Nights stay in luxury AC Swiss Cottages with modern en-suite amenities.</li>
          <li>Complimentary AC transfers from and to Bhuj Railway Station and Airport.</li>
          <li>Complete meal plan covering 2 Lunches, 2 Hi-Teas, 2 Dinners, and 2 Breakfasts.</li>
          <li>Excursion to Kalo Dungar (Black Hill) and Dattatreya Temple.</li>
          <li>Visit to artisan craft villages (Gandhi Nu Gam) for authentic Kutchi embroidery and pottery.</li>
          <li>Evening cultural shows, star-gazing sessions, and club house activities.</li>
        </ul>
      </section>
    `
  },
  '/packages/rann-utsav-4d3n': {
    title: 'Rann Utsav 4D/3N Extended Kutch Heritage Package | Ghumo Firoo',
    description: 'Book 4D/3N Rann Utsav package covering Tent City Dhordo, Dholavira Harappan site, Mandvi beach & Bhuj palace sightseeing.',
    h1: 'Rann Utsav 4 Days / 3 Nights Extended Kutch Heritage Holiday',
    image: '/Rann-Utsav-Gujarat.png',
    bodyHtml: `
      <section>
        <h2>Grand 4 Days / 3 Nights Kutch Cultural & Heritage Expedition</h2>
        <p>Immerse yourself completely in the history, architecture, and landscapes of Kutch. This extended 4D/3N package combines luxury tent living at Dhordo with visits to the UNESCO World Heritage Harappan site of Dholavira, the royal Vijay Vilas Palace and beach in Mandvi, and historical sightseeing in Bhuj (Aina Mahal, Prag Mahal, and Swaminarayan Temple).</p>
      </section>
      <section>
        <h2>Comprehensive Tour Inclusions</h2>
        <ul>
          <li>3 Nights luxury accommodation with full board meals.</li>
          <li>Exclusive sightseeing tours to Dholavira Harappan excavations via the scenic Road to Heaven.</li>
          <li>Day excursion to Mandvi Beach, coastal ship building yards, and Vijay Vilas Palace.</li>
          <li>Complete Bhuj heritage monuments tour with shopping at local bandhani markets.</li>
          <li>All ground transportation, permits, entrance fees, and guide support included.</li>
        </ul>
      </section>
    `
  },
  '/packages/char-dham-yatra': {
    title: 'Char Dham Yatra Package 2026 | Kedarnath, Badrinath, Gangotri, Yamunotri',
    description: 'Complete Char Dham Yatra 2026 packages from Delhi and Haridwar. 9N/10D and 11N/12D itineraries with VIP Darshan, verified hotels, and private transfers.',
    h1: 'Char Dham Yatra Tour Packages 2026',
    image: '/Kedarnath.png',
    bodyHtml: `
      <section>
        <h2>The Sacred Four Shrines Pilgrimage in the Garhwal Himalayas</h2>
        <p>Embark on the holiest Hindu pilgrimage to Yamunotri, Gangotri, Kedarnath, and Badrinath. Ghumo Firoo Travels provides complete, worry-free Char Dham Yatra packages departing from Delhi, Haridwar, and Dehradun with premium chauffeured road transport, verified hotel stays, and guaranteed VIP Darshan assistance.</p>
      </section>
      <section>
        <h2>Available Char Dham Package Formats</h2>
        <ul>
          <li><strong>9 Nights / 10 Days Road Package from Haridwar:</strong> The classic pilgrimage route covering all four temples with comfortable halts.</li>
          <li><strong>11 Nights / 12 Days Extended Package from Delhi:</strong> Relaxed journey starting from Delhi with additional acclimatization stops.</li>
          <li><strong>Same-Day & 5N/6D VIP Helicopter Packages:</strong> Charter helicopter service from Sahastradhara Helipad, Dehradun with VIP priority passes.</li>
          <li><strong>Do Dham Packages (Kedarnath & Badrinath):</strong> 5N/6D express pilgrimage focusing on Kedarnath and Badrinath temples.</li>
        </ul>
      </section>
    `
  },
  '/packages/kashmir-paradise': {
    title: 'Kashmir Tour Packages 2026 | Srinagar, Gulmarg, Pahalgam & Sonamarg',
    description: 'Book luxury Kashmir holiday packages with Dal Lake houseboat stays, Shikara rides, Gulmarg Gondola tickets, and scenic Pahalgam valley tours.',
    h1: 'Kashmir Paradise Tour Packages 2026',
    image: '/blog/Scenic view of Chitkul village with traditional wooden houses and snow-capped Himalayan mountains in Himachal Pradesh.png',
    bodyHtml: `
      <section>
        <h2>Discover Heaven on Earth in the Kashmir Valley</h2>
        <p>Experience the timeless romance and majestic natural beauty of Kashmir with Ghumo Firoo Travels. Our luxury Kashmir tour packages include stays in premium wooden houseboats on Dal Lake, romantic sunset Shikara rides, Gulmarg Gondola Phase 1 & 2 tickets, river rafting in Pahalgam, and pony treks in Sonamarg.</p>
      </section>
      <section>
        <h2>Tour Highlights & Custom Inclusions</h2>
        <ul>
          <li>1 Night luxury carved wooden Houseboat stay on Dal Lake / Nigeen Lake with traditional Wazwan meals.</li>
          <li>Gulmarg cable car (Gondola) pre-booked passes for seamless snow activity access.</li>
          <li>Pahalgam valley excursions to Betaab Valley, Aru Valley, and Chandanwari in local private union vehicles.</li>
          <li>Visit to historic Mughal Gardens in Srinagar: Shalimar Bagh, Nishat Bagh, and Chashme Shahi.</li>
          <li>Dedicated private commercial vehicle for all transfers from Srinagar Airport throughout the trip.</li>
        </ul>
      </section>
    `
  },
  '/packages/europe': {
    title: 'Europe Tour Packages 2026 | Switzerland, Paris, Italy & Austria',
    description: 'Explore customized Europe holiday packages from India. Swiss Alps excursions, Eiffel Tower tickets, Venice gondolas, and Schengen visa assistance.',
    h1: 'Europe Grand Tour Packages 2026',
    image: '/Europe Image New.png',
    bodyHtml: `
      <section>
        <h2>Unforgettable European Holidays Crafted for Discerning Travelers</h2>
        <p>From the snow-covered alpine peaks of Switzerland to the romantic avenues of Paris and the ancient history of Rome, Ghumo Firoo Travels crafts bespoke European holidays. We provide complete end-to-end guidance including Schengen visa document verification, 4-star and 5-star hotel reservations, Swiss Travel Pass passes, and skip-the-line attraction tickets.</p>
      </section>
      <section>
        <h2>Key European Destinations Covered</h2>
        <ul>
          <li><strong>Switzerland:</strong> Zurich, Lucerne, Interlaken, Mount Titlis revolving cable car, Jungfraujoch Top of Europe, and Glacier 3000.</li>
          <li><strong>France:</strong> Paris city tour, Eiffel Tower 2nd/3rd level tickets, Seine River cruise, and Louvre Museum.</li>
          <li><strong>Italy:</strong> Rome Colosseum & Vatican City, Florence Renaissance walking tour, and Venice private Gondola rides.</li>
          <li><strong>Austria & Germany:</strong> Innsbruck Swarovski Crystal Worlds, Salzburg Sound of Music tour, and Munich Bavarian castles.</li>
        </ul>
      </section>
    `
  }
};

async function main() {
  console.log('🚀 Generating static pre-rendered pages with custom SEO tags for all routes...');
  
  if (!(await fs.stat(templatePath).catch(() => false))) {
    console.error('❌ dist/index.html not found! Run vite build first.');
    process.exit(1);
  }

  const baseHtml = await fs.readFile(templatePath, 'utf8');

  const routesToGenerate: RouteMeta[] = [];

  // 1. Static Routes
  for (const [route, data] of Object.entries(staticRoutesMeta)) {
    routesToGenerate.push({
      route,
      title: data.title,
      description: data.description,
      canonical: formatCanonical(route),
      h1: data.h1,
      h2: data.h2,
      bodyHtml: data.bodyHtml,
      ogType: 'website'
    });
  }

  // 2. Package Routes
  for (const [route, data] of Object.entries(packageRoutesMeta)) {
    routesToGenerate.push({
      route,
      title: data.title,
      description: data.description,
      canonical: formatCanonical(route),
      h1: data.h1,
      bodyHtml: data.bodyHtml,
      ogImage: data.image,
      ogType: 'website'
    });
  }

  // 3. Blog Routes
  for (const post of blogPosts) {
    routesToGenerate.push({
      route: `/blog/${post.slug}`,
      title: `${post.title} | Ghumo Firoo Travels`,
      description: post.metaDescription || post.excerpt,
      canonical: formatCanonical(`/blog/${post.slug}`),
      ogImage: post.image,
      ogType: 'article',
      publishedTime: post.date,
      author: post.author,
      h1: post.title,
      h2: `${post.category} · ${post.readTime} · By ${post.author}`,
      bodyHtml: `
        <article>
          <header>
            <p><strong>Published on:</strong> ${post.date} | <strong>Author:</strong> ${post.author} | <strong>Category:</strong> ${post.category}</p>
          </header>
          <section>
            <p>${post.excerpt}</p>
            ${post.content ? `<div>${post.content}</div>` : ''}
          </section>
        </article>
      `
    });
  }

  // 4. Guide Routes from JSON
  const guidesDir = path.resolve(process.cwd(), 'src', 'content', 'destinations');
  try {
    const guideFiles = await fs.readdir(guidesDir);
    for (const file of guideFiles) {
      if (file.endsWith('.json')) {
        const slug = file.replace(/\.json$/, '');
        const contentRaw = await fs.readFile(path.join(guidesDir, file), 'utf8');
        try {
          const guide = JSON.parse(contentRaw);
          routesToGenerate.push({
            route: `/guides/${slug}`,
            title: `${guide.title || slug} | Ghumo Firoo Travels Guide`,
            description: guide.summary || guide.metaDescription || `Comprehensive travel guide for ${guide.title || slug} by Ghumo Firoo Travels.`,
            canonical: formatCanonical(`/guides/${slug}`),
            ogImage: guide.heroImage || guide.image || '/Rann-Utsav-Gujarat.png',
            ogType: 'article',
            h1: guide.title || slug,
            h2: guide.region ? `${guide.region} · Best Time: ${guide.bestTime || 'Winter'}` : 'Travel Guide',
            bodyHtml: `
              <article>
                <section>
                  <p>${guide.summary || guide.metaDescription || 'Complete destination guidebook from Ghumo Firoo Travels.'}</p>
                  ${guide.details ? `<p>${guide.details}</p>` : ''}
                </section>
              </article>
            `
          });
        } catch (e) {}
      }
    }
  } catch (e) {}

  console.log(`📦 Rendering ${routesToGenerate.length} static SEO routes into dist/ ...`);

  let count = 0;

  for (const item of routesToGenerate) {
    let pageHtml = baseHtml;

    // Replace Title
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/is, `<title>${item.title}</title>`);

    // Replace Meta Description (any attribute order)
    pageHtml = pageHtml.replace(
      /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>|<meta\s+content=["'].*?["']\s+name=["']description["']\s*\/?>/is,
      `<meta name="description" content="${item.description.replace(/"/g, '&quot;')}" />`
    );

    // Ensure Canonical tag is ALWAYS present in <head>
    const canonicalTag = `<link rel="canonical" href="${item.canonical}" />`;
    if (pageHtml.includes('rel="canonical"')) {
      pageHtml = pageHtml.replace(
        /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>|<link\s+href=["'].*?["']\s+rel=["']canonical["']\s*\/?>/is,
        canonicalTag
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `    ${canonicalTag}\n  </head>`);
    }

    // Replace OG Title
    pageHtml = pageHtml.replace(
      /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>|<meta\s+content=["'].*?["']\s+property=["']og:title["']\s*\/?>/is,
      `<meta property="og:title" content="${item.title.replace(/"/g, '&quot;')}" />`
    );

    // Replace Twitter Title
    pageHtml = pageHtml.replace(
      /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>|<meta\s+content=["'].*?["']\s+name=["']twitter:title["']\s*\/?>/is,
      `<meta name="twitter:title" content="${item.title.replace(/"/g, '&quot;')}" />`
    );

    // Replace OG Description
    pageHtml = pageHtml.replace(
      /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>|<meta\s+content=["'].*?["']\s+property=["']og:description["']\s*\/?>/is,
      `<meta property="og:description" content="${item.description.replace(/"/g, '&quot;')}" />`
    );

    // Replace Twitter Description
    pageHtml = pageHtml.replace(
      /<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>|<meta\s+content=["'].*?["']\s+name=["']twitter:description["']\s*\/?>/is,
      `<meta name="twitter:description" content="${item.description.replace(/"/g, '&quot;')}" />`
    );

    // Replace OG URL
    pageHtml = pageHtml.replace(
      /<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>|<meta\s+content=["'].*?["']\s+property=["']og:url["']\s*\/?>/is,
      `<meta property="og:url" content="${item.canonical}" />`
    );

    // Replace OG Image & Twitter Image if custom
    if (item.ogImage) {
      const fullImg = item.ogImage.startsWith('http') ? item.ogImage : `${siteUrl}${item.ogImage.startsWith('/') ? '' : '/'}${item.ogImage}`;
      const imgPath = item.ogImage.startsWith('http') ? item.ogImage : (item.ogImage.startsWith('/') ? item.ogImage : `/${item.ogImage}`);
      pageHtml = pageHtml.replace(
        /<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>|<meta\s+content=["'].*?["']\s+property=["']og:image["']\s*\/?>/is,
        `<meta property="og:image" content="${fullImg}" />\n    <link rel="preload" as="image" href="${imgPath}" fetchpriority="high" />`
      );
      pageHtml = pageHtml.replace(
        /<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>|<meta\s+content=["'].*?["']\s+name=["']twitter:image["']\s*\/?>/is,
        `<meta name="twitter:image" content="${fullImg}" />`
      );
    }

    // Build rich, crawlable, semantic markup inside <div id="root">
    const crawlableMarkup = `
      <header>
        <img src="/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels Logo" width="180" height="60" />
        <h1>${item.h1 || item.title}</h1>
        ${item.h2 ? `<h2>${item.h2}</h2>` : ''}
        <p>${item.description}</p>
      </header>
      <main>
        ${item.ogImage ? `<img src="${item.ogImage}" alt="${item.h1 || item.title} - Ghumo Firoo Travels" width="800" height="500" />` : ''}
        ${item.bodyHtml || `<article><p>${item.description}</p></article>`}
      </main>
      <footer>
        <section>
          <h3>Ghumo Firoo Travels — Ministry of Tourism Registered Partner</h3>
          <p>Munirka, South Delhi 110067 | Phone: +91 9910987264, +91 9870229792 | Email: info@ghumofiroo.com</p>
          <nav aria-label="Footer Navigation">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/packages">Tour Packages</a></li>
              <li><a href="/packages/rann-utsav">Rann Utsav Packages</a></li>
              <li><a href="/packages/char-dham-yatra">Char Dham Yatra</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/booking">Book a Tour</a></li>
              <li><a href="/enquire-now">Enquire Now</a></li>
              <li><a href="/terms-of-service">Terms of Service</a></li>
              <li><a href="/terms-conditions">Terms & Conditions</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/refund-policy">Refund Policy</a></li>
              <li><a href="/blog">Travel Blog</a></li>
            </ul>
          </nav>
        </section>
      </footer>
    `.trim();

    pageHtml = pageHtml.replace(
      /<div id="root">.*?<\/div>/s,
      `<div id="root">${crawlableMarkup}</div>`
    );

    // Determine target directory and write index.html
    const targetFolder = item.route === '/' 
      ? distDir 
      : path.join(distDir, ...item.route.split('/').filter(Boolean));

    await fs.mkdir(targetFolder, { recursive: true });
    await fs.writeFile(path.join(targetFolder, 'index.html'), pageHtml, 'utf8');
    count++;
  }

  console.log(`✅ Successfully generated ${count} unique pre-rendered HTML pages in dist/!`);
}

main().catch(err => {
  console.error('❌ Static generator failed:', err);
  process.exit(1);
});