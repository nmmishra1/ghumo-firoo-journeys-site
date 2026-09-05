import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MASTER_DESTINATIONS, MasterDestination } from '@/data/masterDestinations';
import { getCuratedGuide, CuratedDestinationGuide } from '@/data/curatedDestinationContent';
import { getDestinationFaqs } from '@/data/destinationFaqs';
import { 
  MapPin, Search, ArrowRight, Sparkles, Globe, Compass, 
  Clock, Plane, Calendar, Phone, MessageCircle, CheckCircle2,
  ChevronRight, Filter, Landmark, Trees, ShieldCheck, Heart,
  ArrowLeft, Share2, Eye, Star, Loader2, IndianRupee, Utensils,
  Train, Sun, CloudRain, HelpCircle, Award, Check, Navigation,
  FileText, Shield, UserCheck, Car, Camera, Flame, Waves, Mountain,
  Tent, ExternalLink
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

// State-Specific Intelligent Activity & Culinary Databases
const STATE_ACTIVITIES: Record<string, any[]> = {
  'rajasthan': [
    { name: 'Thar Desert Sunset Camel Safari & Dune Camp', category: 'Desert Experience', duration_hours: 4, average_cost: '₹2,500 - ₹3,800', description: 'Experience an unforgettable golden sunset camel trek across Sam Sand Dunes, followed by Rajasthani folk dance and campfire dinner.' },
    { name: 'Royal Fort & Palace Heritage Walk with Historian', category: 'Heritage Walk', duration_hours: 3, average_cost: '₹800 - ₹1,200', description: 'Explore ancient royal architecture, royal weaponry arsenals, and hidden courtyards with a government-licensed heritage guide.' },
    { name: 'Lake Pichola / Fateh Sagar Private Sunset Boat Cruise', category: 'Lake Boating', duration_hours: 1.5, average_cost: '₹1,000 / Boat', description: 'Scenic boat cruise offering panoramic views of royal island palaces, illuminated city ghats, and the Aravalli hills.' },
    { name: 'Ranthambore / Sariska Open 4x4 Tiger Safari', category: 'Wildlife Safari', duration_hours: 3.5, average_cost: '₹3,500 - ₹4,500 / Jeep', description: 'Thrilling open-top jeep safari through historic forest ruins, hunting spots, and Royal Bengal Tiger territories.' }
  ],
  'kerala': [
    { name: 'Traditional Deluxe Houseboat Day Cruise & Village Trail', category: 'Backwater Cruise', duration_hours: 5, average_cost: '₹4,500 - ₹7,000 / Houseboat', description: 'Glide along serene palm-fringed canals, paddy fields, and backwater lagoons while enjoying fresh coastal Kerala cuisine.' },
    { name: 'Munnar Rolling Tea Garden & Factory Tasting Trail', category: 'Nature Walk', duration_hours: 3, average_cost: '₹500 / Person', description: 'Walk through emerald tea plantations, learn CTC and orthodox tea processing, and taste award-winning Nilgiri blends.' },
    { name: 'Periyar Tiger Reserve Guided Bamboo Rafting', category: 'Eco Adventure', duration_hours: 4, average_cost: '₹2,200 / Person', description: 'Forest hiking combined with bamboo rafting on Periyar Lake with scenic wild elephant and bird sightings.' },
    { name: 'Authentic Kathakali & Kalaripayattu Martial Arts Show', category: 'Cultural Show', duration_hours: 2, average_cost: '₹400 / Person', description: 'Live classical storytelling with intricate face makeup, followed by ancient Dravidian martial art demonstrations.' }
  ],
  'goa': [
    { name: 'Grande Island Scuba Diving & Dolphin Sightseeing', category: 'Water Sports', duration_hours: 5, average_cost: '₹2,800 - ₹3,500', description: 'PADI-guided discovery scuba dive into crystal waters with coral reefs, marine life, and complimentary underwater video.' },
    { name: 'Dudhsagar Waterfalls Open 4x4 Jungle Jeep Safari', category: 'Waterfall Safari', duration_hours: 5, average_cost: '₹1,200 / Person', description: 'Off-road jeep journey through Mollem National Park to India’s second highest waterfall with freshwater swimming.' },
    { name: 'Fontainhas Latin Quarter Heritage Photography Walk', category: 'Cultural Walk', duration_hours: 2, average_cost: '₹600 / Person', description: 'Stroll through charming Portuguese-era colorful streets, heritage villas, art galleries, and historic bakeries in Panaji.' }
  ],
  'himachal pradesh': [
    { name: 'Solang Valley Paragliding & Snow Sports Adventure', category: 'Adventure Sports', duration_hours: 3, average_cost: '₹2,500 - ₹3,500', description: 'High-altitude tandem paragliding flight offering bird’s eye views of snow-capped Pir Panjal peaks and cedar forests.' },
    { name: 'Tandem Paragliding Flight at Bir Billing (World Cup Site)', category: 'Extreme Sports', duration_hours: 2.5, average_cost: '₹3,000 / Flight', description: 'Fly from 8,000 ft at Asia’s highest paragliding takeoff point and land in the scenic Kangra Valley tea gardens.' },
    { name: 'Historic Shimla Mall Road & Jakhoo Temple Ropeway', category: 'Cable Car Ride', duration_hours: 2, average_cost: '₹500 / Ticket', description: 'Aerial cable car ride up to Jakhoo Hill with panoramic views of snow ridges and the 108-ft Lord Hanuman statue.' }
  ],
  'uttarakhand': [
    { name: 'Rishikesh White Water River Rafting & Cliff Jump', category: 'River Rafting', duration_hours: 3.5, average_cost: '₹1,000 - ₹1,800', description: 'Exciting Grade III and IV rapids (Roller Coaster, Golf Course) along the holy Ganges with cliff jumping and body surfing.' },
    { name: 'Jim Corbett Core Zone Open 4x4 Tiger Safari', category: 'Wildlife Safari', duration_hours: 4, average_cost: '₹4,000 - ₹5,500 / Jeep', description: 'Explore Dhikala, Bijrani, or Jhirna zones in an open 4WD vehicle with expert forest trackers and naturalists.' },
    { name: 'Auli Aerial Ropeway & Himalayan Snow Vantage Trek', category: 'Mountain Cable Car', duration_hours: 3, average_cost: '₹1,000 / Ticket', description: 'One of Asia’s longest cable cars offering jaw-dropping views of Nanda Devi peak (7,816m) and alpine meadows.' },
    { name: 'Haridwar VIP Har Ki Pauri Evening Ganga Aarti', category: 'Spiritual Ritual', duration_hours: 2, average_cost: '₹300 / Person', description: 'Assisted VIP seating at the sacred river ghat during the mesmerizing evening lamp offering ritual with chanting.' }
  ],
  'jammu & kashmir': [
    { name: 'Dal Lake Sunset Shikara Ride & Houseboat Experience', category: 'Lake Cruise', duration_hours: 2, average_cost: '₹800 - ₹1,500 / Boat', description: 'Romantic wooden boat cruise through floating lotus gardens, Char Chinar island, and historic handicraft markets.' },
    { name: 'Gulmarg Gondola Phase 1 & 2 Cable Car to Apharwat Peak', category: 'Snow Cable Car', duration_hours: 4, average_cost: '₹1,850 / Ticket', description: 'Ascend to 13,780 ft above sea level for breathtaking year-round snow activities, skiing, and Himalayan views.' },
    { name: 'Betaab Valley & Aru Valley Private Excursion in Pahalgam', category: 'Valley Tour', duration_hours: 4, average_cost: '₹1,800 - ₹2,500 / Cab', description: 'Explore lush pine meadows, rushing Lidder River streams, and Bollywood film locations by private vehicle.' }
  ],
  'madhya pradesh': [
    { name: 'Bandhavgarh / Kanha / Pench Open Jeep Tiger Safari', category: 'Tiger Safari', duration_hours: 4, average_cost: '₹3,500 - ₹5,000 / Jeep', description: 'High-density Royal Bengal Tiger safari tracking with government-approved naturalist guides across core forest zones.' },
    { name: 'UNESCO Khajuraho Western Group Light & Sound Show', category: 'Heritage Show', duration_hours: 1.5, average_cost: '₹300 / Person', description: 'Evening Amitabh Bachchan narrated sound and light spectacle bringing the 1,000-year-old Chandela temples to life.' },
    { name: 'Bhedaghat Marble Rocks Sunset Boating on Narmada River', category: 'River Boating', duration_hours: 2, average_cost: '₹500 - ₹800 / Boat', description: 'Boat ride through towering 100-ft marble rock gorges illuminated by changing natural sunlight and full moon.' },
    { name: 'Ujjain Mahakaleshwar & Omkareshwar Jyotirlinga Darshan', category: 'Spiritual Pilgrimage', duration_hours: 3, average_cost: '₹500 / Person', description: 'Assisted darshan at one of India’s most sacred Jyotirlingas, ancient Bhasma Aarti, and holy shipra river rituals.' }
  ],
  'uttar pradesh': [
    { name: 'Sunrise Boat Cruise & Subah-e-Banaras Ghat Walk in Varanasi', category: 'Cultural Cruise', duration_hours: 2.5, average_cost: '₹800 - ₹1,200 / Boat', description: 'Morning boat ride along 84 historic ghats witnessing sacred rituals, followed by a guided alley heritage walk.' },
    { name: 'Taj Mahal Sunrise Photography Tour with ASI Licensed Historian', category: 'Monument Tour', duration_hours: 3, average_cost: '₹1,000 - ₹1,500', description: 'Skip-the-line entrance at dawn to capture the Taj Mahal bathed in pink morning light with detailed Mughal history.' },
    { name: 'Awadhi Royal Food Walk & Chatori Gali Trail in Lucknow', category: 'Culinary Walk', duration_hours: 2.5, average_cost: '₹700 / Person', description: 'Sample melt-in-mouth Galouti kebabs, fragrant Awadhi mutton biryani, Sheermal, and Royal Kulfi at historic stalls.' }
  ],
  'gujarat': [
    { name: 'Tent City Dhordo White Rann Sunset & Full Moon Safari', category: 'Desert Festival', duration_hours: 4, average_cost: '₹1,500 - ₹2,500', description: 'Walk on the endless shimmering white salt desert, camel cart rides, Kutchi folk performances, and stargazing.' },
    { name: 'Gir National Park Asiatic Lion Open Jeep Safari', category: 'Wildlife Safari', duration_hours: 3.5, average_cost: '₹4,000 - ₹5,000 / Jeep', description: 'The only sanctuary on Earth where you can see pure Asiatic Lions in their natural dry deciduous forest habitat.' },
    { name: 'Statue of Unity (182m) High-Speed Elevator & Laser Show', category: 'World Landmark', duration_hours: 4, average_cost: '₹1,000 / Ticket', description: 'Visit the world’s tallest statue with viewing gallery at chest level (153m), valley of flowers, and evening projection show.' }
  ],
  'karnataka': [
    { name: 'UNESCO Hampi Boulders & Vijayanagara Palace Bicycle Tour', category: 'Archaeological Tour', duration_hours: 4, average_cost: '₹800 / Person', description: 'Explore the Stone Chariot at Vittala Temple, Virupaksha Temple, and royal elephant stables across surreal boulder landscapes.' },
    { name: 'Coorg Private Coffee Plantation & Spice Trail Walk', category: 'Plantation Walk', duration_hours: 2.5, average_cost: '₹500 / Person', description: 'Guided walking tour through aromatic Arabica and Robusta coffee estates with vanilla, pepper, and cardamom plants.' },
    { name: 'Kabini River Wildlife Boat Safari & Black Panther Tracking', category: 'Wildlife Boat Safari', duration_hours: 3, average_cost: '₹2,500 / Person', description: 'Cruise on the Kabini reservoir watching wild elephant herds swimming, marsh crocodiles, and elusive leopards.' }
  ],
  'tamil nadu': [
    { name: 'UNESCO Mahabalipuram Shore Temple & Pancha Rathas Tour', category: 'Heritage Tour', duration_hours: 3, average_cost: '₹700 / Person', description: '7th-century monolithic rock-cut cave temples, Arjuna’s Penance bas-relief, and sea-facing Shore Temple.' },
    { name: 'Madurai Meenakshi Amman Temple 1,000-Pillar Hall Tour', category: 'Temple Architecture', duration_hours: 3, average_cost: '₹500 / Person', description: 'Explore towering gopurams, sacred Golden Lotus tank, musical pillars, and evening chariot procession.' },
    { name: 'Nilgiri Mountain UNESCO Toy Train Ride to Ooty', category: 'Scenic Train Ride', duration_hours: 3.5, average_cost: '₹400 / Ticket', description: 'Historic steam-hauled cog railway passing through 16 tunnels, 250 bridges, and lush mist-covered tea slopes.' }
  ],
  'west bengal & sikkim': [
    { name: 'Darjeeling Tiger Hill Sunrise over Mount Kanchenjunga', category: 'Sunrise Vantage', duration_hours: 3, average_cost: '₹1,500 / Cab', description: 'Witness the morning sun illuminate the world’s third highest peak in dazzling shades of gold and orange.' },
    { name: 'Tsomgo Glacial Lake & Nathula Pass Indo-China Border Tour', category: 'High-Altitude Tour', duration_hours: 6, average_cost: '₹3,500 / Cab', description: 'Journey to 12,400 ft to the sacred alpine lake surrounded by snow ridges, yak rides, and historic Silk Route border.' },
    { name: 'Sundarbans Mangrove Royal Bengal Tiger Boat Safari', category: 'Mangrove Safari', duration_hours: 6, average_cost: '₹2,500 / Person', description: 'Cruise through the world’s largest delta mangrove forest with estuarine crocodiles, spotted deer, and tigers.' }
  ]
};

// State-Specific Intelligent Culinary Databases
const STATE_FOODS: Record<string, any[]> = {
  'rajasthan': [
    { name: 'Authentic Dal Baati Churma', desc: 'Crispy ghee-baked wheat dough balls served with spicy five-lentil curry, roasted garlic chutney, and sweet jaggery churma.' },
    { name: 'Royal Laal Maas / Ker Sangri', desc: 'Signature fiery smoked mutton curry cooked in Mathania red chilies, or vegetarian desert bean delicacy Ker Sangri.' },
    { name: 'Traditional Ghevar & Mawa Kachori', desc: 'Honeycomb disc sweet soaked in saffron syrup topped with rabdi and silver vark, plus dry fruit stuffed sweet kachoris.' }
  ],
  'kerala': [
    { name: 'Appam with Coconut Vegetable/Chicken Stew', desc: 'Soft-centered fermented rice bowl pancakes with crispy lacy edges, paired with aromatic spiced coconut milk stew.' },
    { name: 'Karimeen Pollichathu (Pearl Spot Fish)', desc: 'Fresh backwater fish marinated in ginger, shallots, and red chili, wrapped in banana leaf and slow-roasted in coconut oil.' },
    { name: 'Malabar Parotta with Pepper Roast & Payasam', desc: 'Multi-layered flaky griddled flatbread paired with rich black pepper masala curry and traditional jaggery payasam.' }
  ],
  'goa': [
    { name: 'Goan Fish Curry Rice & Prawn Balchão', desc: 'Tangy coconut and kokum curry with fresh Kingfish, served with steamed red rice and spicy pickled prawn relish.' },
    { name: 'Traditional Pork/Chicken Vindaloo & Xacuti', desc: 'Heritage Portuguese-Goan slow-simmered curry made with toddy vinegar, whole spices, and roasted grated coconut.' },
    { name: 'Authentic Bebinca & Alle Belle Pancakes', desc: 'Seven-layered rich coconut milk and egg yolk pudding, accompanied by warm jaggery-coconut rolled crepes.' }
  ],
  'himachal pradesh': [
    { name: 'Traditional Himachali Dham Feast', desc: 'Celebratory vegetarian banquet served on leaf plates with Madra (chickpeas in yogurt), Mahni (sour black gram), and Meetha chawal.' },
    { name: 'Siddu with Desi Ghee & Mint Chutney', desc: 'Steamed wheat yeast bread stuffed with spiced poppy seeds, walnuts, or dal, eaten steaming hot with homemade pure ghee.' },
    { name: 'Trout Fish Fry & Kullu Trout Grill', desc: 'Fresh mountain river rainbow trout pan-fried in mustard oil with local mountain herbs and lemon zest.' }
  ],
  'uttarakhand': [
    { name: 'Kumaoni & Garhwali Thali', desc: 'Nutritious mountain banquet featuring Kafuli (spinach and fenugreek gravy), Chainsoo (roasted black gram paste), and Jhangore ki Kheer.' },
    { name: 'Aloo Ke Gutke & Singodi Sweets', desc: 'Spiced baby potatoes tempered with mountain jamboo herb, followed by traditional condensed milk fudge wrapped in Maalu leaves.' },
    { name: 'Bal Mithai & Chocolate Fudge of Almora', desc: 'Roasted roasted-khoya brown fudge coated with tiny sugar globes, famous throughout the Himalayan foothills.' }
  ],
  'jammu & kashmir': [
    { name: 'Royal Kashmiri Wazwan Banquet', desc: 'Traditional multi-course feast featuring Rogan Josh (slow cooked tender mutton), Gustaba (velvety meatballs in yogurt gravy), and Rista.' },
    { name: 'Kashmiri Kahwa & Saffron Tea', desc: 'Soothing golden green tea brewed with whole saffron strands, crushed green cardamom, cinnamon, and slivered almonds.' },
    { name: 'Modur Pulao & Nadru Yakhni', desc: 'Sweet saffron-infused basmati rice garnished with dried fruits, paired with lotus stem cooked in mild yogurt gravy.' }
  ],
  'madhya pradesh': [
    { name: 'Indori Poha Jalebi & Sev Trail', desc: 'Lightly steamed flattened rice tempered with fennel seeds and pomegranate pearls, topped with spicy Ratlami Sev and hot crispy jalebis.' },
    { name: 'Sarafa Night Bazaar Garadu & Bhutte Ka Kees', desc: 'Crispy fried yam tossed in chaat masala and lime, plus grated corn slow-cooked in spiced milk at Indore’s midnight food market.' },
    { name: 'Bundelkhandi Dal Bafla & Mawa Bati', desc: 'Boiled and ghee-roasted wheat dumplings served with spicy dal, roasted tomato bharta, and mawa-stuffed gulab jamuns.' }
  ],
  'uttar pradesh': [
    { name: 'Awadhi Dum Biryani & Galouti Kebabs', desc: 'Fragrant saffron-tinted basmati rice cooked on charcoal dum, paired with melt-in-mouth smoked papaya minced kebabs.' },
    { name: 'Banarasi Kachori Sabzi & Malaiyo', desc: 'Crispy urad dal stuffed poori with spicy potato gravy, followed by airy saffron-flavored winter milk froth (Malaiyo).' },
    { name: 'Mathura Peda & Bedmi Poori', desc: 'Rich caramelized khoya fudge infused with cardamom, and crispy spiced lentil pooris served with tangy pumpkin sabzi.' }
  ],
  'gujarat': [
    { name: 'Grand Gujarati Thali Experience', desc: 'Balanced sweet and savory multi-dish banquet with Gujarati Kadhi, Undhiyu (winter mixed vegetable), Rotli, and Aamras.' },
    { name: 'Khaman Dhokla, Fafda & Jalebi', desc: 'Spongy steamed gram flour cakes tempered with mustard and green chilies, eaten with crispy besan fafda and sweet papaya sambharo.' },
    { name: 'Kutchi Dabeli & Sev Khamani', desc: 'Spicy mashed potato burger stuffed with pomegranate pearls, roasted peanuts, and tamarind chutney inside a toasted pav.' }
  ],
  'karnataka': [
    { name: 'Mysore Masala Dosa with Filter Coffee', desc: 'Crispy golden crepe smeared with spicy red garlic chutney, filled with potato bhaji, and served with frothy chicory filter coffee.' },
    { name: 'Bisi Bele Bath & Mangalore Ghee Roast', desc: 'Wholesome hot lentil rice preparation with vegetables and nutmeg aroma, plus fiery Kundapur ghee roast seafood/paneer.' },
    { name: 'Mysore Pak & Dharwad Peda', desc: 'Royal melt-in-mouth sweet prepared with pure desi ghee, gram flour, and sugar at iconic heritage confectioners.' }
  ],
  'tamil nadu': [
    { name: 'Authentic Chettinad Chicken & Mutton Curry', desc: 'Spicy and deeply aromatic curry freshly ground with star anise, stone flower (kalpasi), black peppercorns, and coconut.' },
    { name: 'Crispy Medu Vada & Traditional Sambar', desc: 'Piping hot fluffy lentil donuts served with tangy drumstick shallot sambar and freshly ground coconut-green chili chutney.' },
    { name: 'Kumbakonam Degree Coffee & Jigarthanda', desc: 'Fresh whole cow milk decoction coffee, and Madurai’s cooling summer dessert with almond gum, nannari syrup, and ice cream.' }
  ],
  'west bengal & sikkim': [
    { name: 'Kolkata Kosha Mangsho & Luchi', desc: 'Slow-cooked rich dark mutton gravy infused with mustard oil and whole spices, served with deep-fried refined flour pooris.' },
    { name: 'Authentic Momos & Thukpa Noodle Soup', desc: 'Steamed delicate dumplings filled with seasoned vegetables/chicken with fiery red chili-garlic dip and steaming broth.' },
    { name: 'Mishti Doi & Rosogolla Sweets', desc: 'Creamy caramelized fermented sweet yogurt in baked clay pots, and spongy cottage cheese balls soaked in warm sugar syrup.' }
  ]
};

export default function PublicDestinationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [cityData, setCityData] = useState<any | null>(null);
  const [dbSightseeing, setDbSightseeing] = useState<any[]>([]);
  const [dbActivities, setDbActivities] = useState<any[]>([]);
  const [nearbyCities, setNearbyCities] = useState<any[]>([]);

  // Lead Modal States
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelersCount, setTravelersCount] = useState('2');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  const [notFound, setNotFound] = useState(false);
  const [matchedMasterState, setMatchedMasterState] = useState<MasterDestination | undefined>(undefined);

  // Helper function to strictly match master destination
  const findMasterDestination = (querySlug: string): MasterDestination | undefined => {
    if (!querySlug) return undefined;
    const clean = querySlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanAlpha = clean.replace(/-/g, '');

    return MASTER_DESTINATIONS.find(d => {
      const dName = d.city.toLowerCase().trim();
      const dSlug = dName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const dAlpha = dSlug.replace(/-/g, '');

      // Exact slug or alphanumeric match
      if (dSlug === clean || dAlpha === cleanAlpha) return true;

      // Match base name before parentheses (e.g., "Gir National Park" in "Gir National Park (Sasan Gir)")
      const baseName = dName.split('(')[0].trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (baseName === clean || baseName.replace(/-/g, '') === cleanAlpha) return true;

      // Match content inside parentheses (e.g. "sasan-gir" or "ekta-nagar")
      if (dName.includes('(')) {
        const parenContent = dName.substring(dName.indexOf('(') + 1, dName.indexOf(')')).trim();
        const parenSlug = parenContent.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (parenSlug === clean || parenSlug.replace(/-/g, '') === cleanAlpha) return true;
      }

      return false;
    });
  };

  // Targeted live DB data fetch by slug from get_india_tourism.php
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const cleanSlug = decodeURIComponent(slug).toLowerCase().trim().replace(/\/+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const matched = findMasterDestination(cleanSlug);
    setMatchedMasterState(matched);

    // Check session storage cache first
    const cacheKey = `dest_cache_${cleanSlug}`;
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.city) {
          setCityData(parsed.city);
          setDbSightseeing(parsed.sightseeing || []);
          setDbActivities(parsed.activities || []);
          setNearbyCities(parsed.nearby_cities || []);
          setLoading(false);
          setNotFound(false);
          return;
        }
      } catch {}
    }

    setLoading(true);
    setNotFound(false);

    // Single targeted API call (< 3 KB) instead of heavy baseline dataset
    fetch(`${API_BASE}/get_india_tourism.php?action=details&slug=${encodeURIComponent(cleanSlug)}`)
      .then(res => res.json())
      .then((detData) => {
        if (detData.success && detData.city) {
          setCityData(detData.city);
          setDbSightseeing(detData.sightseeing || []);
          setDbActivities(detData.activities || []);
          setNearbyCities(detData.nearby_cities || []);
          setNotFound(false);

          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(detData));
          } catch {}
        } else if (matched) {
          // Master Catalog Fallback with curated destination data
          setCityData({
            name: matched.city,
            city_name: matched.city,
            state_name: matched.state,
            destination_type: matched.destination_group,
            description: `Discover ${matched.city}, one of India's most celebrated travel destinations in ${matched.state}. Famous for its ${matched.destination_group.toLowerCase()}, rich history, scenic landscapes, and signature hospitality.`
          });

          // Find other master destinations in same state for nearby cards
          const otherMasters = MASTER_DESTINATIONS.filter(d => 
            d.city !== matched.city && d.state.toLowerCase() === matched.state.toLowerCase()
          ).slice(0, 4);
          setNearbyCities(otherMasters);
          setNotFound(false);
        } else {
          // Destination not found in database or catalog
          setCityData(null);
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching destination data:", err);
        if (matched) {
          setCityData({
            name: matched.city,
            city_name: matched.city,
            state_name: matched.state,
            destination_type: matched.destination_group,
            description: `Discover ${matched.city}, one of India's most celebrated travel destinations in ${matched.state}.`
          });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const matchedMaster = matchedMasterState;
  const curatedGuide = useMemo(() => getCuratedGuide(slug || ''), [slug]);

  const cityName = curatedGuide?.city || cityData?.name || cityData?.city_name || matchedMaster?.city || 'Indian Destination';
  const displayCityName = (curatedGuide?.city || cityName || '').split('(')[0].trim();
  const stateName = curatedGuide?.state || cityData?.state_name || cityData?.state || matchedMaster?.state || 'India';
  const stateKey = stateName.toLowerCase().trim();
  const groupName = curatedGuide?.heroBadge || matchedMaster?.destination_group || cityData?.destination_type || 'Heritage, Leisure & Sightseeing';
  const pageTitle = useMemo(() => {
    if (curatedGuide?.title) return curatedGuide.title;
    const cLower = displayCityName.toLowerCase();
    const gLower = groupName.toLowerCase();

    if (cLower === 'agra') {
      return 'Agra Travel Guide: Taj Mahal & Top Places | Ghumo Firoo';
    }
    if (cLower === 'varanasi' || cLower === 'kashi') {
      return 'Varanasi Travel Guide: Ghats & Temples | Ghumo Firoo';
    }
    if (cLower === 'jaipur') {
      return 'Jaipur Travel Guide: Forts & Palaces | Ghumo Firoo';
    }
    if (cLower === 'goa') {
      return 'Goa Travel Guide: Beaches & Top Places | Ghumo Firoo';
    }
    if (cLower === 'rann of kutch' || cLower === 'kutch') {
      return 'Rann of Kutch Guide: White Desert & Utsav | Ghumo Firoo';
    }

    if (cLower.includes('statue of unity')) {
      return 'Statue of Unity Guide: Kevadia Tour | Ghumo Firoo';
    }

    // Dedicated Wildlife Reserves / National Parks
    const isDedicatedWildlife = 
      gLower.includes('wildlife') || 
      gLower.includes('tiger reserve') ||
      cLower.includes('national park') ||
      cLower.includes('sanctuary') ||
      cLower.includes('corbett') ||
      cLower.includes('ranthambore') ||
      cLower.includes('kanha') ||
      cLower.includes('bandhavgarh') ||
      cLower.includes('kaziranga') ||
      cLower.includes('gir') ||
      cLower.includes('pench') ||
      cLower.includes('tadoba') ||
      cLower.includes('periyar') ||
      cLower.includes('nagarhole') ||
      cLower.includes('bandipur');

    if (isDedicatedWildlife) {
      const t = `${displayCityName} Safari & Wildlife Guide | Ghumo Firoo`;
      return t.length <= 60 ? t : `${displayCityName} Safari Guide | Ghumo Firoo`;
    }

    // Dedicated Pilgrimages / Temples
    const isDedicatedPilgrimage =
      gLower.includes('pilgrimage') ||
      gLower.includes('jyotirlinga') ||
      cLower.includes('dham') ||
      cLower.includes('temple') ||
      ['badrinath', 'kedarnath', 'gangotri', 'yamunotri', 'ujjain', 'omkareshwar', 'somnath', 'tirupati', 'haridwar', 'rishikesh', 'ayodhya', 'mathura', 'vrindavan', 'puri', 'rameshwaram', 'dwarka', 'shirdi'].includes(cLower);

    if (isDedicatedPilgrimage) {
      const t = `${displayCityName} Pilgrimage & Temple Guide | Ghumo Firoo`;
      return t.length <= 60 ? t : `${displayCityName} Pilgrimage Guide | Ghumo Firoo`;
    }

    // Beach & Coastal
    const isBeach =
      gLower.includes('beach') ||
      gLower.includes('coastal') ||
      gLower.includes('island') ||
      ['goa', 'andaman', 'havelock', 'neil island', 'kovalam', 'varkala', 'gokarna', 'lakshadweep', 'puducherry', 'pondicherry', 'daman', 'diu'].includes(cLower);

    if (isBeach) {
      const t = `${displayCityName} Beach & Holiday Guide | Ghumo Firoo`;
      return t.length <= 60 ? t : `${displayCityName} Beach Guide | Ghumo Firoo`;
    }

    // Hill Stations & Valleys
    const isHillStation =
      gLower.includes('hill') ||
      gLower.includes('himalayan') ||
      gLower.includes('valley') ||
      ['manali', 'shimla', 'dharamshala', 'dalhousie', 'nainital', 'mussoorie', 'kullu', 'kashmir', 'srinagar', 'gulmarg', 'pahalgam', 'ladakh', 'leh', 'munnar', 'ooty', 'kodaikanal', 'coorg', 'chikmagalur', 'wayanad', 'darjeeling', 'gangtok', 'shillong', 'auli', 'chopta', 'spiti', 'kasol', 'jibhi'].includes(cLower);

    if (isHillStation) {
      const t = `${displayCityName} Hill Station Travel Guide | Ghumo Firoo`;
      return t.length <= 60 ? t : `${displayCityName} Travel Guide | Ghumo Firoo`;
    }

    // Royal Heritage & UNESCO Palaces
    if (gLower.includes('heritage') || gLower.includes('unesco') || gLower.includes('fort') || gLower.includes('palace')) {
      const t = `${displayCityName} Heritage & Travel Guide | Ghumo Firoo`;
      return t.length <= 60 ? t : `${displayCityName} Travel Guide | Ghumo Firoo`;
    }

    const defaultTitle = `${displayCityName} Travel Guide: Top Places & Tour | Ghumo Firoo`;
    return defaultTitle.length <= 60 ? defaultTitle : `${displayCityName} Travel Guide | Ghumo Firoo`;
  }, [curatedGuide?.title, displayCityName, groupName]);

  const pageDescription = curatedGuide?.metaDescription || `Discover ${displayCityName}, ${stateName}. Comprehensive travel guide with top sightseeing places, local culture, best travel months, and custom private tour packages by Ghumo Firoo.`;
  const heroOverview = curatedGuide?.overview || cityData?.description || `Explore the timeless beauty, iconic landmarks, vibrant cuisine, and signature experiences of ${displayCityName}. Plan your customized private tour with verified chauffeur cars and hand-picked boutique stays.`;

  // Compute Sightseeings (Curated Signature / Live DB / Master popular attractions)
  const allSightseeings = useMemo(() => {
    if (curatedGuide?.signatureExperiences && curatedGuide.signatureExperiences.length > 0) {
      return curatedGuide.signatureExperiences.map((exp, idx) => ({
        id: `curated-sig-${idx}`,
        name: exp.title,
        sightseeing_name: exp.title,
        category: exp.category,
        recommended_duration_hours: exp.duration,
        entry_fee_estimate: exp.price,
        description: exp.description
      }));
    }

    const list: any[] = [...dbSightseeing];
    const existingNames = new Set(list.map(s => (s.name || s.sightseeing_name || '').toLowerCase()));

    if (matchedMaster?.popular_attractions) {
      matchedMaster.popular_attractions.forEach((att, idx) => {
        if (!existingNames.has(att.toLowerCase())) {
          list.push({
            id: `master-att-${idx}`,
            name: att,
            sightseeing_name: att,
            category: 'Iconic Landmark',
            recommended_duration_hours: 2.5,
            entry_fee_estimate: 'Included in Tour',
            description: `Must-visit tourist highlight in ${cityName}. Renowned for historical architecture, scenic photo vantage points, and local cultural significance.`
          });
        }
      });
    }

    if (list.length === 0) {
      list.push(
        { id: '1', name: `${cityName} Old Town & Heritage Centre`, category: 'Heritage', recommended_duration_hours: 2, entry_fee_estimate: 'Free', description: 'Explore historic alleys, heritage architecture, and local handicraft bazaars.' },
        { id: '2', name: `${cityName} Grand Palace & Monument`, category: 'Monument', recommended_duration_hours: 3, entry_fee_estimate: '₹50 - ₹100', description: 'Marvel at timeless royal craftsmanship, intricate stone carvings, and landscaped royal gardens.' },
        { id: '3', name: `${cityName} Scenic Nature Vantage Point`, category: 'Nature', recommended_duration_hours: 2, entry_fee_estimate: 'Free', description: 'Breathtaking panoramic sunset views and serene walking trails.' }
      );
    }
    return list;
  }, [curatedGuide, dbSightseeing, matchedMaster, cityName]);

  // Compute Activities (Curated Heritage Trail / Live DB / Tailored experiences)
  const allActivities = useMemo(() => {
    if (curatedGuide?.heritageAndCultureTrail && curatedGuide.heritageAndCultureTrail.length > 0) {
      return curatedGuide.heritageAndCultureTrail.map((act, idx) => ({
        id: `curated-act-${idx}`,
        name: act.title,
        activity_name: act.title,
        category: act.category,
        duration_hours: act.duration,
        average_cost: act.price,
        description: act.description
      }));
    }

    const list: any[] = [...dbActivities];
    if (list.length === 0) {
      // Look up in state activities dictionary
      for (const [key, acts] of Object.entries(STATE_ACTIVITIES)) {
        if (stateKey.includes(key) || key.includes(stateKey)) {
          return acts;
        }
      }

      // Generic fallback
      const isWildlife = groupName.toLowerCase().includes('wildlife') || groupName.toLowerCase().includes('safari');
      const isSpiritual = groupName.toLowerCase().includes('spiritual') || groupName.toLowerCase().includes('pilgrimage');
      
      if (isWildlife) {
        return [
          { id: 'act-1', name: 'Open 4x4 Jeep Jungle Safari Drive', category: 'Wildlife Safari', duration_hours: 4, average_cost: '₹3,500 - ₹4,500 / Jeep', description: 'Guided morning or evening game drive through core tiger territory with expert forest naturalists.' },
          { id: 'act-2', name: 'Guided Buffer Zone Nature Trail Walk', category: 'Eco Adventure', duration_hours: 2, average_cost: '₹800 / Person', description: 'Explore birdwatching hotspots, pugmark tracking, and rich biodiversity on foot.' }
        ];
      } else if (isSpiritual) {
        return [
          { id: 'act-1', name: 'VIP Darshan & Temple Orientation', category: 'Spiritual', duration_hours: 2.5, average_cost: '₹500 / Person', description: 'Assisted sanctum darshan, traditional pooja offerings, and heritage temple walkthrough.' },
          { id: 'act-2', name: 'Evening Holy River Aarti & Sunset Boat Ride', category: 'Cultural', duration_hours: 1.5, average_cost: '₹400 / Person', description: 'Witness sacred oil-lamp aarti rituals accompanied by devotional hymns and private boat cruise.' }
        ];
      } else {
        return [
          { id: 'act-1', name: `Curated ${cityName} Heritage Walk & Bazaar Trail`, category: 'Cultural Tour', duration_hours: 2.5, average_cost: '₹600 / Person', description: `Walk through centuries-old quarters, artisan workshops, and architectural landmarks with a certified local guide.` },
          { id: 'act-2', name: `Evening Food & Street Delicacies Trail`, category: 'Food Walk', duration_hours: 2, average_cost: '₹500 / Person', description: `Savor authentic local delicacies, signature sweets, and street-food gems across famous night markets.` }
        ];
      }
    }
    return list;
  }, [curatedGuide, dbActivities, groupName, cityName, stateKey]);

  // Compute Culinary Highlights tailored to state & city
  const foodHighlights = useMemo(() => {
    // Check state food dictionary
    for (const [key, foods] of Object.entries(STATE_FOODS)) {
      if (stateKey.includes(key) || key.includes(stateKey)) {
        return foods;
      }
    }

    return [
      { name: `Signature ${cityName} Street Specialities`, desc: `Authentic regional flavors prepared fresh at legendary heritage food stalls.` },
      { name: 'Traditional Sweet Confections & Desserts', desc: 'Locally handcrafted milk sweets, halwas, and festive desserts.' },
      { name: 'Regional Thali Banquet', desc: 'Wholesome traditional multi-course meal featuring local seasonal farm-fresh recipes.' }
    ];
  }, [cityName, stateKey]);

  const nearestAirport = curatedGuide?.howToReach.airport || matchedMaster?.nearest_airport || (cityData?.has_airport === 1 ? 'Regional Airport Connected' : 'Connected via State Airport Hub');
  const nearestRailway = curatedGuide?.howToReach.railway || matchedMaster?.nearest_railway || 'Central Railway Junction with Express Trains';
  const bestSeason = curatedGuide?.bestTimeToVisit.season || cityData?.best_time_to_visit || 'October to March (Pleasant Autumn & Winter)';

  // SEO Schema Keywords
  const seoKeywords = useMemo(() => {
    return [
      `${cityName} tourism`,
      `${cityName} tour packages`,
      `places to visit in ${cityName}`,
      `top attractions in ${cityName}`,
      `${cityName} sightseeing itinerary`,
      `${cityName} travel guide`,
      `best time to visit ${cityName}`,
      `how to reach ${cityName}`,
      `${cityName} hotel booking`,
      `${cityName} food trail`,
      `${stateName} tour packages`,
      `${stateName} tourism guide`
    ];
  }, [cityName, stateName]);

  // Handle WhatsApp Inquiry
  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hello Ghumo Firoo! 👋 I am interested in planning a customized private holiday package to ${cityName} in ${stateName}. Please share itinerary options, boutique hotel choices, and price quote.`);
    window.open(`https://wa.me/919910987264?text=${message}`, '_blank');
  };

  // Submit Inquiry into CRM Leads
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter your full name and phone number.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingInquiry(true);
    try {
      const payload = {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        destination: `${cityName} (${stateName})`,
        travel_date: travelDate,
        travelers: travelersCount,
        notes: customerNotes,
        source: `Explore India Page: ${cityName}`
      };

      const res = await fetch(`${API_BASE}/api.php?table=leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({
          title: "Custom Itinerary Request Received! ✈️",
          description: `Thank you, ${customerName}! Our holiday concierge for ${cityName} will contact you on WhatsApp / Phone with your customized day-by-day proposal.`,
        });
        setInquiryModalOpen(false);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setCustomerNotes('');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (err) {
      toast({
        title: "Inquiry Sent!",
        description: "Your inquiry has been received. Our team will contact you on WhatsApp shortly.",
      });
      setInquiryModalOpen(false);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#060913] text-white pt-24">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 border-2 border-[#C9A25A]/20 border-t-[#C9A25A] rounded-full animate-spin"></div>
            <p className="text-xs font-extrabold tracking-widest text-[#C9A25A] uppercase">Loading Destination Guide...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (notFound || (!cityData && !matchedMaster)) {
    return (
      <Layout>
        <SEO
          title="Destination Guide Coming Soon | Ghumo Firoo"
          description="Explore curated travel guides, sightseeing circuits, and luxury tour packages across India with Ghumo Firoo."
        />
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#060913] text-white px-4 pt-28 pb-16 text-center">
          <div className="max-w-md space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#C9A25A]/10 border border-[#C9A25A]/30 text-[#C9A25A] flex items-center justify-center mx-auto text-2xl">
              🗺️
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-montserrat text-white">
              Destination Coming Soon
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              We are currently curating handpicked heritage stays, verified chauffeur routes, and private safari trails for <strong className="text-amber-400 font-bold capitalize">{slug ? slug.replace(/-/g, ' ') : 'this destination'}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/explore-india">
                <Button className="bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-bold text-xs h-10 px-5 rounded-xl gap-2">
                  <Compass className="w-4 h-4" /> Explore All Indian Destinations
                </Button>
              </Link>
              <Link to="/packages">
                <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-white font-bold text-xs h-10 px-5 rounded-xl">
                  Browse Tour Packages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={seoKeywords.join(', ')}
      />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-[#060913] via-[#0b1220] to-[#060913] text-white border-b border-border/20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-6 flex-wrap">
            <Link to="/" className="hover:text-amber-400">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link to="/explore-india" className="hover:text-amber-400">Explore India</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400">{stateName}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-extrabold">{cityName}</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 text-left">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-[#C9A25A]/20 text-[#C9A25A] border-[#C9A25A]/40 font-extrabold text-xs uppercase px-3 py-1">
                  {groupName}
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-extrabold text-xs">
                  {stateName}, India
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold text-xs">
                  Ideal: 2 Nights / 3 Days
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-montserrat text-white tracking-tight leading-tight">
                {displayCityName} Tourism &amp; Travel Guide
              </h1>

              <div className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium space-y-3">
                {String(heroOverview || '').split('\n\n').map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            </div>

            {/* ACTION CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <Button
                onClick={() => setInquiryModalOpen(true)}
                className="bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-black text-xs sm:text-sm h-11 px-6 rounded-2xl shadow-xl gap-2"
              >
                <Sparkles className="w-4 h-4" /> Plan a Custom Trip to {displayCityName}
              </Button>
              {curatedGuide?.officialPartnerCallout?.ctaLink && (
                <Link to={curatedGuide.officialPartnerCallout.ctaLink}>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm h-11 px-6 rounded-2xl shadow-xl gap-2"
                  >
                    <Tent className="w-4 h-4" /> Book Rann Utsav Package
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs sm:text-sm h-11 px-6 rounded-2xl font-bold gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Inquire on WhatsApp
              </Button>
            </div>
          </div>

          {/* OFFICIAL PARTNER CALLOUT BANNER (IF AVAILABLE) */}
          {curatedGuide?.officialPartnerCallout && (
            <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#C9A25A]/15 to-emerald-500/15 border border-[#C9A25A]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xl text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#C9A25A] text-slate-950 font-black text-[10px] uppercase px-3 py-0.5 shadow">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" /> {curatedGuide.officialPartnerCallout.badgeText}
                  </Badge>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white font-montserrat">
                  {curatedGuide.officialPartnerCallout.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {curatedGuide.officialPartnerCallout.description}
                </p>
              </div>
              <Link to={curatedGuide.officialPartnerCallout.ctaLink} className="shrink-0 w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-black text-xs sm:text-sm h-11 px-6 rounded-2xl shadow-xl gap-2">
                  <Tent className="w-4 h-4" /> {curatedGuide.officialPartnerCallout.ctaText} ➔
                </Button>
              </Link>
            </div>
          )}

          {/* QUICK TRANSIT & CLIMATE STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-slate-800 text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Best Season</span>
                <span className="text-xs font-bold text-white">{bestSeason}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Nearest Airport</span>
                <span className="text-xs font-bold text-white line-clamp-1">{nearestAirport}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Railway Connectivity</span>
                <span className="text-xs font-bold text-white line-clamp-1">{nearestRailway}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED CONTENT BODY */}
      <section className="py-12 bg-[#060913] text-slate-100 min-h-[800px]">
        <div className="container mx-auto px-4 max-w-6xl space-y-12">

          {/* SECTION 1: SIGNATURE EXPERIENCES / MUST-VISIT ATTRACTIONS */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#C9A25A] flex items-center gap-1.5">
                  <Landmark className="w-4 h-4" /> {curatedGuide ? 'Signature Experiences' : 'Must-Visit Attractions'}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white font-montserrat mt-1">
                  {curatedGuide ? `Signature Experiences in ${displayCityName}` : `Top Places to Visit in ${displayCityName} (${allSightseeings.length} Spots)`}
                </h2>
              </div>
              <Button 
                onClick={() => setInquiryModalOpen(true)}
                size="sm" 
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
              >
                Request Itinerary
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allSightseeings.map((sight, idx) => (
                <Card 
                  key={sight.id || idx} 
                  className="border border-slate-800 bg-slate-900/90 hover:border-amber-500/40 transition-all rounded-2xl shadow-md flex flex-col justify-between"
                >
                  <CardHeader className="p-4 border-b border-slate-800/80 bg-slate-850/60 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-extrabold text-white font-montserrat">
                          {sight.name || sight.sightseeing_name}
                        </CardTitle>
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 font-bold text-[9px] mt-0.5 uppercase">
                          {sight.category || 'Sightseeing'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-slate-500 uppercase block font-extrabold">Price / Entry</span>
                      <span className="text-xs font-black text-amber-400">
                        {sight.entry_fee_estimate ? (isNaN(sight.entry_fee_estimate) ? sight.entry_fee_estimate : `₹${sight.entry_fee_estimate}`) : 'Free'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {sight.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Recommended: <strong>{sight.recommended_duration_hours || '2'} Hours</strong></span>
                      </div>
                      <button
                        onClick={() => {
                          setCustomerNotes(`Interested in visiting ${sight.name || sight.sightseeing_name} during my tour.`);
                          setInquiryModalOpen(true);
                        }}
                        className="text-xs text-amber-400 hover:underline font-bold"
                      >
                        + Include in Trip
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* SECTION 2: HERITAGE, SAFARIS & EXPERIENCES */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Trees className="w-4 h-4" /> {curatedGuide ? 'Heritage & Culture Trail' : 'Experiential Activities & Tours'}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white font-montserrat mt-1">
                  {curatedGuide ? `Heritage, Palaces & Culture Trail in ${displayCityName}` : `Top Activities & Safaris in ${displayCityName}, ${stateName}`}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allActivities.map((act, idx) => (
                <Card 
                  key={act.id || idx} 
                  className="border border-slate-800 bg-slate-900/90 hover:border-emerald-500/40 transition-all rounded-2xl shadow-md flex flex-col justify-between"
                >
                  <CardHeader className="p-4 border-b border-slate-800/80 bg-slate-850/60 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-extrabold text-white font-montserrat">
                        {act.name || act.activity_name}
                      </CardTitle>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold text-[9px] mt-0.5 uppercase">
                        {act.category || 'Adventure'}
                      </Badge>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-slate-500 uppercase block font-extrabold">Price Range</span>
                      <span className="text-xs font-black text-emerald-400">
                        {act.average_cost ? (isNaN(act.average_cost) ? act.average_cost : `₹${act.average_cost}`) : 'Included in Package'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {act.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Duration: <strong>{act.duration_hours || '2'}</strong></span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCustomerNotes(`Please include ${act.name || act.activity_name} in my customized quote.`);
                          setInquiryModalOpen(true);
                        }}
                        className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-bold h-7 rounded-lg"
                      >
                        Book Experience
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* SECTION 3: LOCAL CUISINE & FOOD TRAILS */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-left space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white font-montserrat">
                  Famous Food &amp; Culinary Specialties in {displayCityName} ({stateName})
                </h3>
                <p className="text-xs text-slate-400">
                  Don't leave without savoring these authentic regional flavors and sweets:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {foodHighlights.map((food, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/50 space-y-1.5">
                  <div className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    {food.name}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    {food.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: NEARBY DESTINATIONS & REGIONAL HUBS */}
          {((curatedGuide?.nearbyDestinations && curatedGuide.nearbyDestinations.length > 0) || nearbyCities.length > 0) && (
            <div className="space-y-4 text-left">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#C9A25A]">Regional Circuit</span>
                <h2 className="text-xl md:text-2xl font-black text-white font-montserrat mt-1">
                  Nearby Destinations in {curatedGuide ? 'Kutch Region' : stateName}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {curatedGuide?.nearbyDestinations ? (
                  curatedGuide.nearbyDestinations.map((near, idx) => (
                    <Link
                      key={idx}
                      to={near.link || `/explore-india`}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all group flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <MapPin className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] text-slate-400 font-extrabold">{near.distance}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors font-montserrat mt-2">
                          {near.name}
                        </h4>
                        <Badge className="bg-slate-800 text-amber-300 text-[9px] font-bold mt-1">
                          {near.type}
                        </Badge>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                          {near.description}
                        </p>
                      </div>
                      <div className="pt-2 text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <span>Explore Guide</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))
                ) : (
                  nearbyCities.map((near: any, idx: number) => {
                    const nearName = near.name || near.city_name || near.city;
                    const nearSlug = nearName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <Link
                        key={idx}
                        to={`/explore-india/${nearSlug}`}
                        className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <MapPin className="w-4 h-4 text-amber-400 mb-2" />
                          <h4 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors font-montserrat">
                            {nearName}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {near.destination_group || near.destination_type || 'Tourism Hub'}
                          </p>
                        </div>
                        <div className="mt-3 text-[10px] text-amber-400 font-bold flex items-center gap-1">
                          <span>View Travel Guide</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: WIDER STATE HIGHLIGHTS (IF CURATED) */}
          {curatedGuide?.widerStateHighlights && curatedGuide.widerStateHighlights.length > 0 && (
            <div className="space-y-4 text-left">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Grand State Holiday Combination</span>
                <h2 className="text-xl md:text-2xl font-black text-white font-montserrat mt-1">
                  Other Gujarat Highlights (Worth Combining on a Longer Holiday)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  These aren't short day trips from Kutch, but pair exceptionally well if you are planning a comprehensive Gujarat holiday itinerary:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {curatedGuide.widerStateHighlights.map((hi, idx) => (
                  <Link
                    key={idx}
                    to={hi.link || `/explore-india`}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Landmark className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] text-slate-400 font-extrabold">{hi.distance}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors font-montserrat mt-1.5">
                        {hi.name}
                      </h4>
                      <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[9px] font-bold mt-1">
                        {hi.type}
                      </Badge>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                        {hi.description}
                      </p>
                    </div>
                    <div className="pt-2 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <span>View Destination</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: QUICK INTERNAL LINKS & BOOKING GUIDES */}
          {curatedGuide?.quickLinks && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-montserrat">
                    Helpful Links &amp; Detailed Booking Resources
                  </h3>
                  <p className="text-xs text-slate-400">
                    Direct access to official booking pages and in-depth travel guides:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {curatedGuide.quickLinks.map((lk, idx) => (
                  <Link
                    key={idx}
                    to={lk.path}
                    className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-750 hover:border-amber-500/50 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-xs text-white group-hover:text-amber-400 flex items-center justify-between font-montserrat">
                        {lk.label}
                        <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {lk.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: PRIMARY CTA BANNER */}
          {curatedGuide?.primaryCta ? (
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-600/20 via-[#0d172a] to-emerald-600/20 border border-[#C9A25A]/40 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-[#C9A25A]/20 text-[#C9A25A] flex items-center justify-center mx-auto text-xl font-black">
                ✨
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-montserrat">
                {curatedGuide.primaryCta.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {curatedGuide.primaryCta.subtitle}
              </p>
              <div className="pt-2">
                <Link to={curatedGuide.primaryCta.buttonLink}>
                  <Button className="bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-black text-xs sm:text-sm h-11 px-8 rounded-2xl shadow-xl gap-2">
                    <Tent className="w-4 h-4" /> {curatedGuide.primaryCta.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-600/20 via-[#0d172a] to-blue-600/20 border border-slate-800 text-center space-y-4 shadow-2xl">
              <h3 className="text-xl sm:text-2xl font-black text-white font-montserrat">
                Ready to Plan Your Private Holiday to {displayCityName}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                Get a customized day-by-day itinerary proposal with verified private chauffeur cars, curated stays, and 24x7 concierge.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => setInquiryModalOpen(true)}
                  className="bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-black text-xs sm:text-sm h-11 px-8 rounded-2xl shadow-xl gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Request Custom Itinerary &amp; Quote
                </Button>
              </div>
            </div>
          )}

          {/* SECTION 8: FAQ SECTION WITH GOOGLE SEO SCHEMA */}
          <div className="space-y-4 text-left">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Traveler Queries Answered
              </span>
              <h2 className="text-xl font-black text-white font-montserrat mt-1">
                Frequently Asked Questions about {displayCityName} ({stateName}) Travel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const guideFaqs = curatedGuide?.faqs || [];
                const destFaqs = getDestinationFaqs(`${cityName} ${stateName}`);
                const combinedFaqs = guideFaqs.length > 0 ? guideFaqs : destFaqs;
                return combinedFaqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 hover:border-[#C9A25A]/40 transition-colors">
                    <h4 className="text-xs font-bold text-white flex items-start gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-[#C9A25A] shrink-0 mt-0.5" />
                      {faq.question}
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium pl-5.5">
                      {faq.answer}
                    </p>
                  </div>
                ));
              })()}
            </div>
          </div>

        </div>
      </section>

      {/* TRIP INQUIRY MODAL */}
      <Dialog open={inquiryModalOpen} onOpenChange={setInquiryModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-white font-montserrat">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Plan a Custom Tour to {cityName}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300 font-medium">
              Fill in your trip details to receive a customized day-by-day itinerary proposal with verified hotels &amp; private transfers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitInquiry} className="space-y-3 pt-2 text-left">
            <div>
              <Label className="text-xs text-slate-300 font-bold">Your Full Name *</Label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-9 text-xs bg-slate-800 border-slate-700 text-white mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-slate-300 font-bold">Phone / WhatsApp *</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-white mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300 font-bold">Email Address</Label>
                <Input
                  type="email"
                  placeholder="rahul@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-slate-300 font-bold">Travel Date</Label>
                <Input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-300 font-bold">Number of Travelers</Label>
                <Input
                  type="number"
                  min="1"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(e.target.value)}
                  className="h-9 text-xs bg-slate-800 border-slate-700 text-white mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-300 font-bold">Custom Preferences / Hotel Category</Label>
              <Textarea
                placeholder="e.g. 4-star boutique hotel, interested in tiger safaris / heritage walks..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="text-xs bg-slate-800 border-slate-700 text-white mt-1 min-h-[60px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setInquiryModalOpen(false)} className="text-slate-400 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submittingInquiry} className="bg-[#C9A25A] hover:bg-[#d6af63] text-slate-950 font-bold">
                {submittingInquiry ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : `Get Quote for ${cityName}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
