import fs from 'fs/promises';
import path from 'path';
import { blogPosts } from '../src/data/blogData.tsx';

const siteUrl = 'https://ghumofiroo.com';
const distDir = path.resolve(process.cwd(), 'dist');
const templatePath = path.join(distDir, 'index.html');

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
  bodySnippet?: string;
}

const staticRoutesMeta: Record<string, { title: string; description: string; h1: string; bodySnippet: string }> = {
  '/': {
    title: 'Ghumofiroo Travels – Custom Tour Packages for Char Dham, Kashmir & Europe',
    description: "Plan your trip with Ghumofiroo, Delhi's trusted agency & Evoke Rann Utsav partner. Custom Char Dham Yatra, Kashmir & Europe packages. Enquire today!",
    h1: 'Ghumofiroo Travels – Custom Tour Packages for Char Dham, Kashmir & Europe',
    bodySnippet: 'Discover premium custom holiday packages, Char Dham Yatra tours, Europe grand vacations, and Rann Utsav Kutch desert stays.'
  },
  '/about': {
    title: 'About Us | Ghumo Firoo Travels - Trusted Delhi Travel Agency',
    description: 'Learn about Ghumo Firoo Travels, our journey, mission, and experienced travel specialists providing customized holiday packages and 24x7 support.',
    h1: 'About Ghumo Firoo Travels',
    bodySnippet: 'Ghumo Firoo Travels is a premier Indian travel agency based in South Delhi specializing in tailored holiday packages, spiritual yatras, and luxury vacations.'
  },
  '/contact': {
    title: 'Contact Us | Ghumo Firoo Travels - 24x7 Holiday Support Desk',
    description: 'Get in touch with Ghumo Firoo Travels. Reach our Delhi travel desk via phone, WhatsApp (+91 9910987264), or email (info@ghumofiroo.com) for travel enquiries.',
    h1: 'Contact Ghumo Firoo Travels',
    bodySnippet: 'Connect with our dedicated travel experts in Munirka, South Delhi for customized itineraries, instant quotes, and 24x7 holiday booking assistance.'
  },
  '/packages': {
    title: 'All Tour Packages & Holiday Itineraries | Ghumo Firoo Travels',
    description: 'Explore all customized tour packages: Rann Utsav Kutch, Char Dham Yatra, Kashmir Paradise, Europe, Rajasthan Heritage, Kerala Backwaters, Dubai, and Singapore.',
    h1: 'All Tour Packages & Curated Holiday Itineraries',
    bodySnippet: 'Explore handcrafted domestic and international travel packages tailored to your schedule, comfort, and preferences with Ghumo Firoo Travels.'
  },
  '/blog': {
    title: 'Travel Blog & Destination Guides | Ghumo Firoo Travels',
    description: 'Read expert travel tips, destination itineraries, hotel booking guides, and festival advice for Rann Utsav, Char Dham, Kashmir, and Europe.',
    h1: 'Ghumo Firoo Travel Blog & Comprehensive Destination Guides',
    bodySnippet: 'Explore practical travel guides, booking advice, seasonal festival insights, and expert itineraries written by Ghumo Firoo travel specialists.'
  },
  '/faq': {
    title: 'Frequently Asked Questions (FAQ) | Ghumo Firoo Travels',
    description: 'Find answers to common questions about tour booking, cancellation policies, payment modes, custom itineraries, and travel support with Ghumo Firoo.',
    h1: 'Frequently Asked Questions',
    bodySnippet: 'Got questions about booking your holiday with Ghumo Firoo? Browse our detailed FAQs on payment terms, hotel ratings, permits, and cancellation policies.'
  },
  '/career': {
    title: 'Careers | Join the Ghumo Firoo Travels Team',
    description: 'Explore career opportunities in travel management, holiday consulting, customer support, and sales at Ghumo Firoo Travels in New Delhi.',
    h1: 'Careers at Ghumo Firoo Travels',
    bodySnippet: 'Join our passionate team of travel curators, destination specialists, and tourism professionals creating unforgettable journeys for thousands of travelers.'
  },
  '/products': {
    title: 'Travel Products & Services | Ghumo Firoo Travels',
    description: 'Discover comprehensive travel services including customized holiday packages, hotel bookings, flight ticketing, private cab transfers, and visa support.',
    h1: 'Our Travel Products & Concierge Services',
    bodySnippet: 'From end-to-end holiday planning to corporate MICE tours, private cab networks, and helicopter bookings, explore Ghumo Firoo premium services.'
  },
  '/booking': {
    title: 'Book Your Holiday Tour Package | Ghumo Firoo Travels',
    description: 'Confirm your holiday package booking with Ghumo Firoo Travels. Secure online payments, instant vouchers, verified stays, and 24x7 on-trip assistance.',
    h1: 'Confirm Your Holiday Booking',
    bodySnippet: 'Secure your dream holiday with Ghumo Firoo Travels. Enjoy instant booking confirmations, verified accommodations, and dedicated concierge assistance.'
  },
  '/enquire-now': {
    title: 'Enquire Now | Custom Holiday Package Quote | Ghumo Firoo',
    description: 'Request a customized quote for your upcoming journey. Our travel specialists build tailored hotel, cab, and sightseeing packages within 2 hours.',
    h1: 'Enquire Now for Custom Tour Packages',
    bodySnippet: 'Tell us where you want to travel! Our destination experts will craft a bespoke holiday itinerary with verified hotel stays and transparent pricing.'
  },
  '/enquire-success': {
    title: 'Enquiry Received | Ghumo Firoo Travels',
    description: 'Thank you for your enquiry. A Ghumo Firoo travel specialist will get in touch with your customized itinerary and best price quote shortly.',
    h1: 'Enquiry Successfully Received',
    bodySnippet: 'We have received your holiday enquiry. Our travel specialist is reviewing your travel preferences and will connect with you via Call / WhatsApp shortly.'
  },
  '/thank-you': {
    title: 'Thank You | Ghumo Firoo Travels',
    description: 'Thank you for choosing Ghumo Firoo Travels. Your booking details and travel confirmation have been safely registered with our operations desk.',
    h1: 'Thank You for Choosing Ghumo Firoo Travels',
    bodySnippet: 'Your journey with Ghumo Firoo Travels is officially confirmed. Our operations team is preparing your vouchers, hotel confirmations, and driver details.'
  },
  '/custom-tour-packages': {
    title: 'Custom Tour Packages & Tailored Itineraries | Ghumo Firoo',
    description: 'Design your own custom tour package with Ghumo Firoo Travels. Flexible dates, private cab transfers, hand-picked hotels, and tailor-made sightseeing circuits.',
    h1: 'Custom Tour Packages & Tailored Holiday Itineraries',
    bodySnippet: 'Experience travel on your terms. Build custom holiday itineraries tailored to your dates, group size, budget, and destination preferences.'
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Ghumo Firoo Travels',
    description: 'Read the Privacy Policy of Ghumo Firoo Travels regarding how we collect, protect, and use your personal information and travel data securely.',
    h1: 'Privacy Policy',
    bodySnippet: 'Ghumo Firoo Travels is committed to protecting your privacy and ensuring your personal information is handled safely and responsibly.'
  },
  '/terms-conditions': {
    title: 'Terms & Conditions | Ghumo Firoo Travels',
    description: 'Terms and conditions for holiday package bookings, payments, amendments, and cancellations with Ghumo Firoo Travels.',
    h1: 'Terms & Conditions',
    bodySnippet: 'Please read our terms and conditions governing tour package bookings, payment schedules, itinerary amendments, and passenger responsibilities.'
  },
  '/terms-of-service': {
    title: 'Terms of Service | Ghumo Firoo Travels',
    description: 'Terms of service governing the use of the Ghumo Firoo Travels website, digital booking platforms, and travel concierge services.',
    h1: 'Terms of Service',
    bodySnippet: 'These Terms of Service govern your access to and use of the Ghumo Firoo Travels website, mobile services, and travel booking features.'
  },
  '/refund-policy': {
    title: 'Cancellation & Refund Policy | Ghumo Firoo Travels',
    description: 'Read our transparent cancellation and refund policy for tour packages, hotels, flights, and seasonal festival bookings with Ghumo Firoo Travels.',
    h1: 'Cancellation & Refund Policy',
    bodySnippet: 'Review the cancellation timelines, refund processing terms, and peak-season festival policies for tour packages booked with Ghumo Firoo Travels.'
  },
  '/guides': {
    title: 'Comprehensive Travel Guides | Ghumo Firoo Travels',
    description: 'Explore comprehensive destination travel guides for Char Dham Yatra, Rann Utsav Kutch, Europe, and Himalayan treks curated by experts.',
    h1: 'Comprehensive Destination Travel Guides',
    bodySnippet: 'In-depth destination guidebooks featuring route maps, packing checklists, best travel months, and insider tips from Ghumo Firoo specialists.'
  },
  '/landing/char-dham-helicopter': {
    title: 'Char Dham Yatra by Helicopter 2026 | VIP Darshan Packages',
    description: 'Book luxury Char Dham Yatra by Helicopter with VIP Darshan at Kedarnath and Badrinath. Dehradun departure, premium stay, and priority ground transfers.',
    h1: 'Char Dham Yatra by Helicopter 2026 - VIP Darshan Packages',
    bodySnippet: 'Experience the ultimate spiritual pilgrimage with same-day and 5N/6D Char Dham helicopter tour packages departing from Sahastradhara Helipad, Dehradun.'
  },
  '/landing/char-dham-road': {
    title: 'Char Dham Yatra by Road 2026 | Delhi & Haridwar Departure',
    description: 'Affordable and comfortable Char Dham Yatra by road. Packages from Delhi and Haridwar with private cab, verified hotels, and local sightseeing.',
    h1: 'Char Dham Yatra by Road 2026 - Complete Pilgrimage Packages',
    bodySnippet: 'Embark on the holy pilgrimage to Yamunotri, Gangotri, Kedarnath, and Badrinath with dedicated private cabs, clean hotel stays, and expert drivers.'
  }
};

const packageRoutesMeta: Record<string, { title: string; description: string; h1: string; bodySnippet: string; image?: string }> = {
  '/packages/rann-utsav': {
    title: 'Rann Utsav Tour Packages 2026-2027 | Tent City Dhordo Booking',
    description: 'Official partner for Evoke Rann Utsav Tent City Dhordo. All-inclusive luxury packages with White Desert permits, cultural shows, Kutchi cuisine & transfers.',
    h1: 'Rann Utsav Tour Packages 2026-2027 - Tent City Dhordo Booking',
    bodySnippet: 'Experience the magical white salt desert of Kutch with official Evoke Tent City luxury Swiss cottages, cultural folk dances, and full moon desert tours.',
    image: '/Rann-Utsav-Gujarat.png'
  },
  '/packages/char-dham-yatra': {
    title: 'Char Dham Yatra Package 2026 | Kedarnath, Badrinath, Gangotri, Yamunotri',
    description: 'Complete Char Dham Yatra 2026 packages from Delhi and Haridwar. 9N/10D and 11N/12D itineraries with VIP Darshan, verified hotels, and private transfers.',
    h1: 'Char Dham Yatra Tour Packages 2026',
    bodySnippet: 'Sacred pilgrimage to the four holy shrines of Uttarakhand: Yamunotri, Gangotri, Kedarnath, and Badrinath with comfortable transport and verified stays.',
    image: '/Kedarnath.png'
  },
  '/packages/kashmir-paradise': {
    title: 'Kashmir Tour Packages 2026 | Srinagar, Gulmarg, Pahalgam & Sonamarg',
    description: 'Book luxury Kashmir holiday packages with Dal Lake houseboat stays, Shikara rides, Gulmarg Gondola tickets, and scenic Pahalgam valley tours.',
    h1: 'Kashmir Paradise Tour Packages 2026',
    bodySnippet: 'Discover paradise on earth with customized Srinagar houseboat stays, Gulmarg snow activities, Betaab Valley tours, and private cab transfers.',
    image: '/blog/Scenic view of Chitkul village with traditional wooden houses and snow-capped Himalayan mountains in Himachal Pradesh.png'
  },
  '/packages/europe': {
    title: 'Europe Tour Packages 2026 | Switzerland, Paris, Italy & Austria',
    description: 'Explore customized Europe holiday packages from India. Swiss Alps excursions, Eiffel Tower tickets, Venice gondolas, and Schengen visa assistance.',
    h1: 'Europe Grand Tour Packages 2026',
    bodySnippet: 'Unforgettable European holidays featuring Mount Titlis, Jungfraujoch, Paris illuminations, Rome Colosseum, and scenic Alpine rail journeys.',
    image: '/Europe Image New.png'
  },
  '/packages/rajasthan-royal': {
    title: 'Rajasthan Royal Heritage Tour Packages | Jaipur, Udaipur, Jodhpur',
    description: 'Experience majestic forts, royal palaces, and desert camps with Rajasthan heritage holiday packages from Ghumo Firoo Travels.',
    h1: 'Rajasthan Royal Heritage Tour Packages',
    bodySnippet: 'Immerse yourself in royal palaces, majestic forts, Sam Sand Dunes desert safaris, and lakeside heritage hotels across Jaipur, Jodhpur, and Udaipur.',
    image: '/blog/A majestic view of Amer Fort Jaipur at sunset with ancient sandstone walls and grand courtyards.png'
  },
  '/packages/kerala-backwaters': {
    title: 'Kerala Backwaters & Hill Station Packages | Munnar, Alleppey & Thekkady',
    description: 'Plan your dream Kerala vacation: Munnar tea plantations, Alleppey luxury houseboat backwater cruises, and Thekkady spice plantations.',
    h1: 'Kerala Backwaters & Munnar Holiday Packages',
    bodySnippet: 'Relax in God’s Own Country with premium Alleppey houseboats, Munnar mountain resorts, Periyar wildlife sanctuaries, and Kovalam beaches.',
    image: '/blog/Lush green tea gardens in Munnar Kerala with misty hills and winding roads in early morning sunlight.png'
  },
  '/packages/goa-beach-holiday': {
    title: 'Goa Beach Holiday Packages | North & South Goa Resorts',
    description: 'Enjoy sun, sand, and sea with customized Goa holiday packages. Beachfront luxury resorts, water sports, sunset cruises, and heritage churches.',
    h1: 'Goa Beach Holiday Tour Packages',
    bodySnippet: 'Experience the ultimate coastal getaway with verified beachfront resorts, thrilling water sports, Mandovi river cruises, and vibrant beach shacks.',
    image: '/blog/Calm and clean beach in Gokarna with gentle waves rocky cliffs and quiet sunset atmosphere.png'
  },
  '/packages/himachal-hill-stations': {
    title: 'Himachal Hill Stations Tour Packages | Shimla, Manali & Dharamshala',
    description: 'Scenic Himachal tour packages featuring Shimla Mall Road, Manali Solang Valley snow adventures, Rohtang Pass, and Dharamshala monasteries.',
    h1: 'Himachal Hill Stations Holiday Packages',
    bodySnippet: 'Breathtaking Himalayan vacations with luxury hill resorts, Atal Tunnel drives, Solang Valley paragliding, and peaceful Dharamshala tea gardens.',
    image: '/blog/Wooden cottage in Jibhi, Tirthan Valley, Himachal Pradesh surrounded by lush greenery and misty mountains.png'
  },
  '/packages/leh-ladakh-tour': {
    title: 'Leh Ladakh Tour Packages 2026 | Pangong Lake, Nubra Valley & Khardung La',
    description: 'Adventure-filled Leh Ladakh bike and cab trips. Explore Pangong Tso, Nubra Valley sand dunes, Diskit Monastery, and magnetic hill.',
    h1: 'Leh Ladakh Adventure Tour Packages 2026',
    bodySnippet: 'Explore the land of high passes with private 4x4 cabs, high-altitude desert camping at Pangong Lake, double-humped camel rides in Nubra, and oxygen support.',
    image: '/blog/Scenic view of Chitkul village with traditional wooden houses and snow-capped Himalayan mountains in Himachal Pradesh.png'
  },
  '/packages/dubai-delights': {
    title: 'Dubai Tour Packages from India | Burj Khalifa & Desert Safari',
    description: 'Experience futuristic luxury with Dubai holiday packages: Burj Khalifa 124th floor, Desert Safari with BBQ dinner, Marina Dhow Cruise, and Abu Dhabi tours.',
    h1: 'Dubai Holiday Tour Packages',
    bodySnippet: 'Experience the glamour of the UAE with 4-star city hotels, Desert Safaris, Burj Khalifa observation decks, and Ferrari World Abu Dhabi excursions.',
    image: '/blog/Majestic Amer Fort in Jaipur, Rajasthan with grand sandstone walls and courtyards.png'
  },
  '/packages/thailand-tropical': {
    title: 'Thailand Tour Packages | Bangkok, Pattaya, Phuket & Krabi',
    description: 'Book tropical Thailand vacation packages with Phi Phi Island speedboats, Coral Island water sports, Bangkok temple tours, and luxury resorts.',
    h1: 'Thailand Tropical Vacation Packages',
    bodySnippet: 'Tropical paradise getaways featuring Phuket luxury beach villas, Krabi 4-island speedboat tours, Pattaya nightlife, and Bangkok shopping excursions.',
    image: '/blog/Calm and clean beach in Gokarna with gentle waves rocky cliffs and quiet sunset atmosphere.png'
  },
  '/packages/singapore-malaysia': {
    title: 'Singapore & Malaysia Tour Packages | Universal Studios & Genting',
    description: 'Exciting Singapore Malaysia combo packages with Sentosa Island, Universal Studios, Marina Bay Sands, Genting Highlands, and Kuala Lumpur city tour.',
    h1: 'Singapore & Malaysia Holiday Packages',
    bodySnippet: 'Two iconic countries in one seamless itinerary featuring Marina Bay Sands, Universal Studios Singapore, Petronas Twin Towers, and Genting cable cars.',
    image: '/Europe Image New.png'
  },
  '/packages/bali-paradise': {
    title: 'Bali Honeymoon & Family Packages | Ubud, Kuta & Nusa Penida',
    description: 'Romantic Bali tour packages featuring private pool villas, Ubud jungle swings, Kintamani volcano tours, and Nusa Penida island excursions.',
    h1: 'Bali Paradise Tour Packages',
    bodySnippet: 'Discover Bali’s tropical beauty with private pool villas, sacred water temples, Mount Batur sunrise treks, and crystal-clear Nusa Penida beaches.',
    image: '/blog/Calm and clean beach in Gokarna with gentle waves rocky cliffs and quiet sunset atmosphere.png'
  },
  '/packages/japan-cherry-blossom': {
    title: 'Japan Tour Packages | Tokyo, Kyoto, Mount Fuji & Osaka',
    description: 'Discover Japan’s ancient traditions and modern wonders. Cherry blossom tours, Shinkansen bullet trains, Mount Fuji 5th station, and Kyoto shrines.',
    h1: 'Japan Tour Packages - Tokyo, Kyoto & Mount Fuji',
    bodySnippet: 'Experience the magic of Japan with curated tours of Tokyo neon skylines, historic Kyoto bamboo groves, Mount Fuji viewpoints, and bullet train journeys.',
    image: '/Europe Image New.png'
  },
  '/packages/turkey-adventure': {
    title: 'Turkey Tour Packages | Istanbul, Cappadocia & Pamukkale',
    description: 'Explore Turkey with hot air balloon rides in Cappadocia, Bosphorus dinner cruises in Istanbul, and white calcium travertine terraces in Pamukkale.',
    h1: 'Turkey Adventure Tour Packages',
    bodySnippet: 'Where East meets West: Cappadocia cave hotels, sunrise hot air balloon flights, historic Hagia Sophia tours, and Pamukkale thermal springs.',
    image: '/Turkey_Image.jpg'
  },
  '/packages/georgia-adventure': {
    title: 'Georgia Tour Packages | Tbilisi, Kazbegi & Batumi',
    description: 'Discover the Caucasus with Georgia tour packages: Tbilisi Old Town, Caucasus Mountain vistas in Kazbegi, wine tasting in Kakheti, and Black Sea Batumi.',
    h1: 'Georgia Adventure Holiday Packages',
    bodySnippet: 'Explore breathtaking mountain landscapes, historic cave towns, ancient vineyards, and charming European cobblestone streets in Georgia.',
    image: '/Europe Image New.png'
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
      canonical: `${siteUrl}${route === '/' ? '' : route}`,
      h1: data.h1,
      bodySnippet: data.bodySnippet,
      ogType: 'website'
    });
  }

  // 2. Package Routes
  for (const [route, data] of Object.entries(packageRoutesMeta)) {
    routesToGenerate.push({
      route,
      title: data.title,
      description: data.description,
      canonical: `${siteUrl}${route}`,
      h1: data.h1,
      bodySnippet: data.bodySnippet,
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
      canonical: `${siteUrl}/blog/${post.slug}`,
      ogImage: post.image,
      ogType: 'article',
      publishedTime: post.date,
      author: post.author,
      h1: post.title,
      h2: `${post.category} · ${post.readTime} · By ${post.author}`,
      bodySnippet: post.excerpt
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
            canonical: `${siteUrl}/guides/${slug}`,
            ogImage: guide.heroImage || guide.image || '/Rann-Utsav-Gujarat.png',
            ogType: 'article',
            h1: guide.title || slug,
            h2: guide.region ? `${guide.region} · Best Time: ${guide.bestTime || 'Winter'}` : 'Travel Guide',
            bodySnippet: guide.summary || 'Essential travel advisory, recommended itineraries, permit guidelines, and packing lists.'
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

    // Replace Canonical (any attribute order)
    pageHtml = pageHtml.replace(
      /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>|<link\s+href=["'].*?["']\s+rel=["']canonical["']\s*\/?>/is,
      `<link rel="canonical" href="${item.canonical}" />`
    );

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
      pageHtml = pageHtml.replace(
        /<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>|<meta\s+content=["'].*?["']\s+property=["']og:image["']\s*\/?>/is,
        `<meta property="og:image" content="${fullImg}" />`
      );
      pageHtml = pageHtml.replace(
        /<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>|<meta\s+content=["'].*?["']\s+name=["']twitter:image["']\s*\/?>/is,
        `<meta name="twitter:image" content="${fullImg}" />`
      );
    }

    // Replace Root pre-rendered crawlable HTML skeleton for crawlers
    if (item.route !== '/') {
      const crawlableMarkup = `
        <header>
          <h1>${item.h1 || item.title}</h1>
          ${item.h2 ? `<h2>${item.h2}</h2>` : ''}
          <p>${item.description}</p>
        </header>
        <main>
          <article>
            <p>${item.bodySnippet || item.description}</p>
          </article>
        </main>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/packages">Tour Packages</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/blog">Travel Blog</a></li>
            <li><a href="/enquire-now">Enquire Now</a></li>
          </ul>
        </nav>
      `.trim();

      pageHtml = pageHtml.replace(
        /<div id="root">.*?<\/div>/s,
        `<div id="root">${crawlableMarkup}</div>`
      );
    }

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
