import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import Layout from "@/components/Layout"
import SEO from "@/components/SEO"
import { config } from "@/config"
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildTouristTripJsonLd } from "@/components/seo/JsonLd"
import { Button } from "@/components/ui/button"
import ScrollReveal from "@/components/ui/ScrollReveal"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { FAQAccordion } from "@/components/ui/FAQAccordion"
import { StickyCTA } from "@/components/common/StickyCTA"
import { reviewService, GoogleReview } from "@/services/reviewService"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  Clock, Star, ArrowRight, ShieldCheck, Sparkles, Compass, 
  CheckCircle2, Hotel, Calendar, MapPin, Mountain, 
  Eye, Car, ChevronRight, Tag
} from "lucide-react"

const Singapore: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_SINGAPORE_IMG = "/singapore/gardens_by_the_bay.jpg"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Singapore', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const singaporePackages = [
    { 
      id: "singapore-4d-3n",
      title: "Singapore City & Sentosa Island Express (4D/3N)", 
      desc: "Ideal starter package covering Gardens by the Bay, Mandai Night Safari guided tram tour & Universal Studios Sentosa all-day theme park.", 
      badge: "Express Choice", 
      image: "/singapore/universal_studios.jpg",
      link: "/packages/singapore-4d-3n", 
      price: 48000,
      duration: "4 Days / 3 Nights",
      rating: 4.88,
      reviewsCount: 410,
      stay: "4-Star Orchard / Bugis Hotel (3N)",
      vehicle: "Chauffeured Private AC Vehicle",
      highlights: ["Universal Studios Sentosa", "Gardens by the Bay Supertrees", "Mandai Night Safari", "Merlion Park"],
      itinerary: [
        { day: "Day 1", title: "Changi Airport Pickup → Hotel Check-in & Night Safari", desc: "Chauffeured pickup at Changi Airport. Check-in to hotel & evening Mandai Night Safari guided tram tour." },
        { day: "Day 2", title: "Universal Studios Sentosa All-Day Pass", desc: "Full day at Universal Studios theme park: Battlestar Galactica, Transformers 3D & Mummy ride." },
        { day: "Day 3", title: "Gardens by the Bay & Marina Bay Sands SkyPark", desc: "Cloud Forest dome, Flower Dome, Supertree Grove light show & Marina Bay Sands observation deck." },
        { day: "Day 4", title: "Jewel Changi Rain Vortex → Airport Transfer", desc: "Explore Jewel Changi HSBC Rain Vortex waterfall and transfer to Changi Airport." }
      ],
      inclusions: [
        "3 Nights 4-Star Hotel Stay with Daily Breakfast",
        "Fast-Track Singapore Tourist E-Visa",
        "Universal Studios Sentosa + Night Safari Tram Tickets",
        "Private AC Airport & City Transfers"
      ],
      exclusions: ["Flight tickets to Singapore", "Personal expenses"]
    },
    { 
      id: "singapore-5d-4n",
      title: "Singapore Grand Delight & Cable Car Sky Dining (5D/4N)", 
      desc: "Our best-selling Singapore vacation featuring S.E.A. Aquarium, Cable Car Mount Faber line, Wings of Time & Jewel Canopy Park.", 
      badge: "Best Seller", 
      image: "/singapore/gardens_by_the_bay.jpg",
      link: "/packages/singapore-5d-4n", 
      price: 64000,
      duration: "5 Days / 4 Nights",
      rating: 4.95,
      reviewsCount: 890,
      stay: "4-Star Deluxe Marina Bay / Riverside Hotel (4N)",
      vehicle: "Chauffeured Private AC Vehicle",
      highlights: ["S.E.A. Aquarium", "Mount Faber Cable Car", "Wings of Time Laser Show", "Jewel Rain Vortex"],
      itinerary: [
        { day: "Day 1", title: "Changi Airport Pickup → Gardens by the Bay Light Show", desc: "Airport pickup, hotel check-in & evening Gardens by the Bay Supertree light show." },
        { day: "Day 2", title: "Universal Studios Sentosa & Wings of Time Show", desc: "Full day theme park fun and evening laser light water show at Siloso Beach." },
        { day: "Day 3", title: "S.E.A. Aquarium & Singapore Cable Car Sky Dining", desc: "Explore 100,000 ocean animals at S.E.A. Aquarium and evening cable car flight." },
        { day: "Day 4", title: "Mandai River Wonders Pandas & Orchard Road Shopping", desc: "Giant panda habitat at River Wonders and shopping spree along Orchard Road." },
        { day: "Day 5", title: "Jewel Changi Canopy Park → Airport Departure", desc: "Jewel Changi Bouncing Nets & departure transfer." }
      ],
      inclusions: [
        "4 Nights 4-Star Deluxe Hotel Accommodations",
        "Universal Studios + S.E.A. Aquarium + Cable Car Passes",
        "Singapore E-Visa Guaranteed Processing",
        "Private AC Transfers Throughout"
      ],
      exclusions: ["Flight tickets"]
    },
    { 
      id: "singapore-city-delight",
      title: "Singapore City Delight & Night Safari (4D/3N)", 
      desc: "Fast-paced Singapore holiday combining panoramic city sights, Merlion Park, Singapore Flyer and nocturnal Mandai safari.", 
      badge: "Family Favorite", 
      image: "/singapore/singapore_flyer.jpg",
      link: "/packages/singapore-city-delight", 
      price: 52000,
      duration: "4 Days / 3 Nights",
      rating: 4.89,
      reviewsCount: 320,
      stay: "4-Star Central City Hotel (3N)",
      vehicle: "Private AC Vehicle",
      highlights: ["Singapore Flyer Giant Wheel", "Mandai Night Safari", "Merlion Park & River Cruise", "Little India & Chinatown"],
      inclusions: ["3N 4-Star Hotel", "E-Visa Assistance", "Singapore Flyer + Night Safari Passes", "All Transfers"],
      exclusions: ["International Flights"]
    },
    { 
      id: "singapore-luxury",
      title: "Singapore Luxury Skyline & Marina Bay Sands (5D/4N)", 
      desc: "Ultra-luxury experience featuring 5-star hotel stay, iconic Marina Bay Sands SkyPark, celebrity dining and VIP private yacht.", 
      badge: "Ultra Luxury", 
      image: "/singapore/marina_bay_sands.jpg",
      link: "/packages/singapore-luxury", 
      price: 95000,
      duration: "5 Days / 4 Nights",
      rating: 4.98,
      reviewsCount: 260,
      stay: "5-Star Marina Bay Sands / Pan Pacific (4N)",
      vehicle: "Chauffeured Luxury Mercedes/Alphard",
      highlights: ["MBS SkyPark Infinity Experience", "Private Sunset Yacht Charter", "Universal Studios VIP Pass", "Fine Dining Credits"],
      inclusions: ["4N 5-Star Luxury Accommodations", "VIP Express Fast-Track Tickets", "Private Limousine Transfers", "E-Visa Support"],
      exclusions: ["Flight Tickets"]
    },
    { 
      id: "singapore-cruise",
      title: "Singapore & Resorts World Genting Dream Cruise (6D/5N)", 
      desc: "The ultimate land and ocean combo featuring 3 nights in Singapore and 2 nights aboard the luxury Genting Dream ocean cruise.", 
      badge: "Land & Cruise Combo", 
      image: "/singapore/wings_of_time_sentosa.jpg",
      link: "/packages/singapore-cruise", 
      price: 88000,
      duration: "6 Days / 5 Nights",
      rating: 4.96,
      reviewsCount: 640,
      stay: "3N Singapore Hotel + 2N Genting Dream Balcony Cabin",
      vehicle: "Private Transfers + Luxury Cruise Ship",
      highlights: ["Genting Dream Ocean Cruise", "Universal Studios Sentosa", "Gardens by the Bay", "Full Board Cruise Dining"],
      inclusions: ["3N Hotel + 2N Cruise Balcony Cabin", "All Cruise Meals & Theatrical Shows", "Universal Studios Tickets", "E-Visa Processing"],
      exclusions: ["Airfare", "Cruise Gratuities"]
    },
    { 
      id: "singapore-malaysia",
      title: "Singapore & Malaysia Twin Country Delight (7D/6N)", 
      desc: "Comprehensive Southeast Asia vacation combining Singapore's futuristic skyline with Kuala Lumpur Petronas Towers and Genting Highlands.", 
      badge: "Twin Country Tour", 
      image: "/singapore/merlion_park.jpg",
      link: "/packages/singapore-malaysia", 
      price: 79000,
      duration: "7 Days / 6 Nights",
      rating: 4.92,
      reviewsCount: 780,
      stay: "3N Singapore (4-Star) + 3N Kuala Lumpur (4-Star)",
      vehicle: "Private AC Vehicle & Cross-Border Coach",
      highlights: ["Universal Studios Singapore", "Petronas Twin Towers KL", "Batu Caves & Genting Highlands", "Gardens by the Bay"],
      inclusions: ["6N 4-Star Accommodations", "Singapore & Malaysia Dual E-Visas", "Cross-Border Executive Coach", "All Sightseeing Passes"],
      exclusions: ["International Flights"]
    }
  ]

  const attractions = [
    {
      id: "gardens-by-the-bay",
      category: "landmarks",
      categoryName: "Iconic Landmarks & Skyviews",
      title: "Gardens by the Bay & Supertree Grove",
      trendingKeywords: ["Gardens by the Bay Supertrees", "Cloud Forest Dome Waterfall", "Supertree Grove Light Show", "OCBC Skyway Aerial Walk", "Flower Dome"],
      description: "Futuristic 101-hectare botanical park featuring 50-meter high Supertree structures, climate-controlled Cloud Forest dome with indoor waterfall & Flower Dome.",
      image: "/singapore/gardens_by_the_bay.jpg",
      distance: "Marina Bayfront (Downtown Singapore)",
      highlights: ["50m Supertree Grove", "35m Cloud Forest Waterfall", "Flower Dome Conservatory", "Garden Rhapsody Light Show"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "Year-Round | Evening Light Show 7:45 PM & 8:45 PM",
        overview: "Gardens by the Bay is Singapore's iconic futuristic horticultural wonderland. Spanning 101 hectares, it features 18 colossal Supertrees wrapped in over 160,000 living plants, two world-record cooled conservatories, and the breathtaking mist-filled Cloud Forest.",
        experiences: [
          "Walk along the suspended OCBC Skyway bridge 22 meters above ground between majestic Supertrees.",
          "Enter the misty Cloud Forest dome and stand beneath the world's tallest 35-meter indoor mountain waterfall.",
          "Marvel at exotic Mediterranean flora inside the world's largest glass greenhouse (Flower Dome).",
          "Experience the synchronized sound and illumination of the nightly Garden Rhapsody light show."
        ],
        travelTips: "Pre-booked entry to Cloud Forest, Flower Dome and OCBC Skyway are included in all Ghumo Firoo Singapore itineraries."
      }
    },
    {
      id: "marina-bay-sands",
      category: "landmarks",
      categoryName: "Iconic Landmarks & Skyviews",
      title: "Marina Bay Sands SkyPark & Observation Deck",
      trendingKeywords: ["Marina Bay Sands SkyPark Observation Deck", "MBS Rooftop View", "Spectra Light & Water Show", "The Shoppes at Marina Bay"],
      description: "Iconic 57th-floor cantilevered rooftop observation deck offering 360-degree panoramic vistas of the Singapore skyline, Singapore Strait, and Marina Bay.",
      image: "/singapore/marina_bay_sands.jpg",
      distance: "Marina Bay (Central Boulevard)",
      highlights: ["57th Floor SkyPark Deck", "360° Marina Bay Skyline", "Spectra Laser Water Show", "Luxury The Shoppes at MBS"],
      details: {
        altitude: "200 meters (57 Stories High)",
        bestTime: "Golden Hour Sunset (6:00 PM – 8:00 PM)",
        overview: "Perched 57 stories atop three soaring towers, Marina Bay Sands SkyPark offers Singapore's most celebrated 360-degree panoramic vantage point, looking across the Singapore Strait, Gardens by the Bay, and the glittering city skyline.",
        experiences: [
          "Gaze out over the Singapore skyline from the cantilevered public observation deck 200 meters high.",
          "Watch the mesmerizing Spectra Light & Water Show from the waterfront event plaza below.",
          "Stroll through The Shoppes at Marina Bay Sands featuring luxury boutiques and indoor canal gondola sampans.",
          "Dine at celebrity chef rooftop lounges including CÉ LA VI, Spago, and LAVO."
        ],
        travelTips: "Visit at 6:30 PM to witness the transition from golden sunset to glowing neon night skyline."
      }
    },
    {
      id: "universal-studios",
      category: "themeparks",
      categoryName: "Theme Parks & Island Adventures",
      title: "Universal Studios Singapore (Sentosa)",
      trendingKeywords: ["Universal Studios Singapore Tickets", "Transformers The Ride 3D", "Battlestar Galactica Roller Coaster", "Ancient Egypt Mummy", "Far Far Away Castle"],
      description: "Southeast Asia's only Universal Studios theme park featuring 24 cutting-edge rides, blockbuster shows, and 6 themed zones across Sentosa Island.",
      image: "/singapore/universal_studios.jpg",
      distance: "Resorts World Sentosa",
      highlights: ["Transformers 3D Ultimate Battle", "Battlestar Galactica Dueling Coaster", "Revenge of the Mummy", "Minion Land & Far Far Away"],
      details: {
        altitude: "Sea Level (0 m)",
        bestTime: "Year-Round | Park Hours 10:00 AM – 7:00 PM",
        overview: "Universal Studios Singapore delivers Hollywood-grade thrills across 6 immersive themed zones. Highlights include the world's tallest dueling roller coaster (Battlestar Galactica) and the hyper-realistic Transformers 3D dark ride.",
        experiences: [
          "Join the Autobots in a hyper-realistic 3D battle on Transformers: The Ride.",
          "Plunge into pitch-black darkness with fireballs and scarab beetles on Revenge of the Mummy coaster.",
          "Experience high-G inversions on the world's tallest dueling roller coasters: Battlestar Galactica.",
          "Meet Illumination's Minions, Transformers, and Sesame Street characters during colorful street parades."
        ],
        travelTips: "Fast-Track Universal Express Passes can be added to bypass general queues during peak vacation periods."
      }
    },
    {
      id: "sea-aquarium",
      category: "themeparks",
      categoryName: "Theme Parks & Island Adventures",
      title: "S.E.A. Aquarium & Open Ocean Habitat",
      trendingKeywords: ["S.E.A. Aquarium Sentosa", "Open Ocean Habitat Shark Tunnel", "Resorts World Sentosa Marine Life", "Manta Ray Feeding Session"],
      description: "One of the world's largest marine realms, home to over 100,000 aquatic animals from 1,000 species across 45 unique naturalistic habitats.",
      image: "/singapore/sea_aquarium.jpg",
      distance: "Resorts World Sentosa",
      highlights: ["100,000+ Marine Animals", "Open Ocean Viewing Panel", "Shark Seas Underwater Tunnel", "Giant Manta Rays"],
      details: {
        altitude: "Sea Level (Underwater Habitat)",
        bestTime: "10:00 AM – 5:00 PM (Daily)",
        overview: "One of the world's premier oceanariums, S.E.A. Aquarium is home to over 100,000 marine creatures. Its centerpiece Open Ocean viewing panel creates the unforgettable sensation of standing on the ocean floor surrounded by gliding manta rays and apex sharks.",
        experiences: [
          "Stand in awe before the 36-meter wide Open Ocean panoramic habitat with gliding giant oceanic manta rays.",
          "Walk through the Shark Seas tunnel with over 100 apex predators swimming directly overhead.",
          "Observe glowing neon jellyfish exhibits and vibrant Indo-Pacific coral reef ecosystems.",
          "Watch live marine diver feeding sessions and learn about ocean conservation programs."
        ],
        travelTips: "Combine S.E.A. Aquarium with Sentosa Cable Car SkyPass for a seamless full-day island adventure."
      }
    },
    {
      id: "jewel-changi",
      category: "landmarks",
      categoryName: "Iconic Landmarks & Skyviews",
      title: "Jewel Changi Airport & HSBC Rain Vortex",
      trendingKeywords: ["Jewel Changi HSBC Rain Vortex Waterfall", "Canopy Park Bouncing Nets", "Shiseido Forest Valley Changi", "World's Best Airport Experience"],
      description: "Spectacular multi-dimensional lifestyle destination featuring the world's tallest 40m indoor waterfall surrounded by a lush 4-storey indoor forest.",
      image: "/singapore/jewel_changi.jpg",
      distance: "Changi Airport Terminal Complex",
      highlights: ["40m World's Tallest Indoor Waterfall", "Shiseido Forest Valley", "Canopy Park & Glass Sky Bridge", "Night Waterfall Light Show"],
      details: {
        altitude: "Indoor Multi-Level Biosphere",
        bestTime: "Year-Round | Hourly Light & Sound Show from 7:30 PM",
        overview: "Jewel Changi Airport is Singapore's multi-award-winning architectural masterpiece that connects airport terminals. Anchored by the 40-meter HSBC Rain Vortex—the world's tallest indoor waterfall—surrounded by a 4-storey terraced forest valley.",
        experiences: [
          "Witness 10,000 gallons of rainwater cascade from the glass oculus dome at the HSBC Rain Vortex.",
          "Hike the lush tropical walking trails of the 4-storey Shiseido Forest Valley with over 2,000 trees.",
          "Cross the glass-bottomed Canopy Bridge and bounce on the suspended Manulife Sky Nets on level 5.",
          "Catch the Skytrain glide right beside the waterfall as it connects airport terminals."
        ],
        travelTips: "Included as an arrival or departure transfer highlight on all Ghumo Firoo Singapore itineraries."
      }
    },
    {
      id: "singapore-flyer",
      category: "landmarks",
      categoryName: "Iconic Landmarks & Skyviews",
      title: "Singapore Flyer & Time Capsule",
      trendingKeywords: ["Singapore Flyer Giant Observation Wheel", "Time Capsule Immersive Experience", "Marina Bay Skyline View", "Singapore Giant Wheel VIP Capsule"],
      description: "Asia's largest giant observation wheel standing 165 meters tall, offering 360-degree bird's-eye views spanning Singapore, Malaysia, and Indonesian islands.",
      image: "/singapore/singapore_flyer.jpg",
      distance: "Marina Promenade",
      highlights: ["165m Giant Observation Wheel", "Multi-Sensory Time Capsule", "View of 3 Countries", "Air-Conditioned VIP Capsules"],
      details: {
        altitude: "165 meters High",
        bestTime: "Sunset to Twilight (6:15 PM – 7:45 PM)",
        overview: "Standing at 165 meters tall (the height of a 42-storey building), the Singapore Flyer is Asia's largest giant observation wheel. Each 30-minute rotation offers panoramic vistas across Marina Bay, the Singapore River, and on clear days, parts of Malaysia and Indonesia.",
        experiences: [
          "Embark on a gentle 30-minute scenic flight in a spacious, air-conditioned panoramic glass capsule.",
          "Walk through the interactive 'Time Capsule' multi-sensory journey showcasing Singapore's 700-year history.",
          "Capture breathtaking bird's-eye photos of the F1 Singapore Grand Prix circuit and Marina Bay.",
          "Enjoy romantic Champagne or Singapore Sling flight upgrades during twilight."
        ],
        travelTips: "Board right before dusk to capture both daytime city clarity and night city lights in one rotation."
      }
    },
    {
      id: "night-safari",
      category: "wildlife",
      categoryName: "Wildlife & Nature Safaris",
      title: "Mandai Night Safari & Tram Experience",
      trendingKeywords: ["Mandai Night Safari Tram Tour", "Creatures of the Night Show", "World's First Nocturnal Zoo Singapore", "Night Safari Guided Walking Trails"],
      description: "The world's first nocturnal wildlife park where you explore 35 hectares of dense secondary rainforest and observe over 900 night creatures via open tram.",
      image: "/singapore/night_safari.jpg",
      distance: "Mandai Wildlife Reserve (Northern Singapore)",
      highlights: ["World's 1st Nocturnal Wildlife Park", "Guided Tram Audio Tour", "Creatures of the Night Show", "4 Themed Walking Trails"],
      details: {
        altitude: "Mandai Rainforest Reserve",
        bestTime: "Evenings (7:15 PM – 11:00 PM)",
        overview: "The world's first nocturnal wildlife park, Night Safari spans 35 hectares of dense secondary rainforest. Home to over 900 nocturnal animals from 100 species living in open, naturalistic habitats illuminated with subtle moon-lighting.",
        experiences: [
          "Ride the 40-minute guided open tram with informative commentary through 6 geographical zones.",
          "Witness Asian elephants, Malayan tapirs, one-horned rhinoceroses, and lions active after dark.",
          "Stroll along the Fishing Cat, Leopard, East Lodge, and Wallaby walking trails.",
          "Enjoy the high-energy 'Creatures of the Night' animal presentation and Twilight Performance."
        ],
        travelTips: "Express tram boarding passes with reserved seating are included in Ghumo Firoo packages."
      }
    },
    {
      id: "cable-car-sentosa",
      category: "landmarks",
      categoryName: "Iconic Landmarks & Skyviews",
      title: "Singapore Cable Car SkyPass & Sky Dining",
      trendingKeywords: ["Singapore Cable Car SkyPass", "Mount Faber Line Sentosa", "Sentosa Sky Dining Cable Car", "HarbourFront Aerial Cableway"],
      description: "Iconic aerial cable ropeway connecting Mount Faber Peak across Keppel Harbour to Sentosa Island with 360-degree coastal and skyline views.",
      image: "/singapore/cable_car_sentosa.jpg",
      distance: "Mount Faber Peak to Sentosa Island",
      highlights: ["Two Interconnected Cable Lines", "360° Harbor & Island Views", "Mount Faber Hilltop Peak", "Sentosa Sky Dining Cabin"],
      details: {
        altitude: "100 meters above sea level",
        bestTime: "Late Afternoon (4:30 PM – 7:00 PM)",
        overview: "The Singapore Cable Car is an iconic aerial ropeway connecting mainland Singapore from Mount Faber Peak across Keppel Harbour to Sentosa Island. It offers unforgettable 360-degree vistas of the cruise port, skyscrapers, and Sentosa beaches.",
        experiences: [
          "Soar across the sea channel from Mount Faber Peak through HarbourFront to Sentosa's Imbiah Lookout.",
          "Hop onto the Sentosa Line to fly directly over the lush jungle canopy and sandy beaches.",
          "Ring the Bell of Happiness at Mount Faber's hilltop garden viewpoint.",
          "Upgrade to private 4-course Sky Dining in a decorated starlit cable car cabin."
        ],
        travelTips: "Both Mount Faber Line and Sentosa Island Line round-trip SkyPasses are included."
      }
    },
    {
      id: "wings-of-time",
      category: "themeparks",
      categoryName: "Theme Parks & Island Adventures",
      title: "Wings of Time & Siloso Beach Laser Show",
      trendingKeywords: ["Wings of Time Laser Water Show", "Sentosa Beach Fireworks", "Siloso Beach Sentosa Nightlife", "Multi-Sensory Outdoor Night Show"],
      description: "Spectacular multi-sensory night extravaganza on open sea featuring 3D projection mapping, state-of-the-art lasers, giant water fountains, and fireworks.",
      image: "/singapore/wings_of_time_sentosa.jpg",
      distance: "Siloso Beach (Sentosa Island)",
      highlights: ["Multi-Sensory Laser & Water Show", "Open-Sea Stage Fireworks", "Siloso Beach Coastal Vibes", "Award-Winning Sound Production"],
      details: {
        altitude: "Sea Level (Coastal Open-Sea Stage)",
        bestTime: "Nightly Shows at 7:40 PM & 8:40 PM",
        overview: "Wings of Time is an award-winning multi-sensory night extravaganza staged right on the open sea at Siloso Beach. It features 3D projection mapping, state-of-the-art lasers, giant water fountains, flame bursts, and brilliant fireworks.",
        experiences: [
          "Watch the mythical bird Shahbaz and friends travel across the Industrial Revolution, Silk Road, and African Savanna.",
          "Feel the warmth of synchronized flame jets and the ocean spray of giant dancing water jets.",
          "Marvel at the grand finale fireworks lighting up the night sky over the Singapore Strait.",
          "Relax at beachfront cafes and cocktail lounges along Siloso Beach promenade before the show."
        ],
        travelTips: "Premium grandstand seating tickets are pre-arranged with Ghumo Firoo for unobstructed central views."
      }
    },
    {
      id: "merlion-park",
      category: "culture",
      categoryName: "Cultural Heritage & Nightlife",
      title: "Merlion Park & Singapore River Cruise",
      trendingKeywords: ["Merlion Park Landmark Statue", "Singapore River Bumboat Cruise", "Clarke Quay Nightlife Promenade", "Boat Quay Waterfront Dining"],
      description: "Singapore's legendary 8.6m water-spouting Merlion statue overlooking Marina Bay paired with a scenic electric bumboat heritage river cruise.",
      image: "/singapore/merlion_park.jpg",
      distance: "One Fullerton (Marina Bay)",
      highlights: ["Iconic 8.6m Merlion Statue", "Electric Bumboat River Cruise", "Clarke Quay & Boat Quay", "Colonial Fullerton Heritage"],
      details: {
        altitude: "Sea Level (Waterfront)",
        bestTime: "Morning for photos (8:30 AM) or Night cruise (8:00 PM)",
        overview: "The Merlion—half lion, half fish—stands proudly at Merlion Park overlooking Marina Bay as the official national mascot of Singapore. From here, electric bumboats cruise historic waterways past colonial bridges, Boat Quay, and the vibrant dining district of Clarke Quay.",
        experiences: [
          "Capture the classic postcard photo with the spouting 8.6-meter Merlion statue and Marina Bay Sands backdrop.",
          "Board a 40-minute traditional electric bumboat cruise gliding past Raffles Landing Site and Asian Civilisations Museum.",
          "Pass beneath historic 19th-century colonial bridges including Cavenagh Bridge and Anderson Bridge.",
          "Disembark at Clarke Quay for lively riverside dinner, live music clubs, and artisan cocktail bars."
        ],
        travelTips: "Take the bumboat cruise in the evening to witness the city's illuminated bridges and waterfront buildings."
      }
    },
    {
      id: "haji-lane-heritage",
      category: "culture",
      categoryName: "Cultural Heritage & Nightlife",
      title: "Cultural Quarters: Little India, Chinatown & Haji Lane",
      trendingKeywords: ["Little India Heritage Trail Singapore", "Buddha Tooth Relic Temple Chinatown", "Haji Lane Trendy Cafes & Murals", "Sultan Mosque Kampong Glam", "Mustafa Centre 24x7 Shopping"],
      description: "Immerse in Singapore's multicultural tapestry: historic Chinatown temples, Little India's spice bazaars and 24/7 Mustafa Centre, and Haji Lane's indie murals.",
      image: "/singapore/haji_lane_heritage.jpg",
      distance: "Central Singapore Cultural Districts",
      highlights: ["Sri Veeramakaliamman Temple", "Buddha Tooth Relic Temple", "Sultan Mosque & Haji Lane Murals", "Mustafa Centre 24/7 Shopping"],
      details: {
        altitude: "City Level",
        bestTime: "Year-Round | Daytime Walking & Evening Cafes",
        overview: "Singapore's multicultural heritage thrives in its three historic ethnic quarters: vibrant Little India with fragrant spice bazaars and temples, historic Chinatown with ornate shophouses and Buddhist temples, and hip Kampong Glam centered around Sultan Mosque and the colorful graffiti walls of Haji Lane.",
        experiences: [
          "Admire the intricate Dravidian gopuram towers of Sri Veeramakaliamman Temple in Little India.",
          "Shop for gold, electronics, and authentic Indian spices at the legendary 24-hour Mustafa Centre.",
          "Visit the 4-storey Tang Dynasty-style Buddha Tooth Relic Temple and Museum in Chinatown.",
          "Snap vibrant photos in front of colorful street art murals and indie boutiques along narrow Haji Lane."
        ],
        travelTips: "Great spots for vegetarian and Jain Indian dining, including Komala Vilas, Saravanaa Bhavan, and Shivam."
      }
    },
    {
      id: "mandai-river-wonders",
      category: "wildlife",
      categoryName: "Wildlife & Nature Safaris",
      title: "Mandai River Wonders & Singapore Zoo",
      trendingKeywords: ["Mandai River Wonders Giant Panda Forest", "Amazon River Quest Boat Ride", "Singapore Zoo Rainforest Habitat", "Jia Jia & Kai Kai Giant Pandas"],
      description: "Asia's only river-themed wildlife park featuring giant pandas Kai Kai & Jia Jia, the Amazon River Quest boat ride, and the world's largest freshwater aquarium.",
      image: "/singapore/mandai_river_wonders.jpg",
      distance: "Mandai Wildlife Reserve",
      highlights: ["Giant Panda Forest (Jia Jia & Kai Kai)", "Amazon River Quest Boat Ride", "World's Largest Freshwater Aquarium", "Open-Concept Rainforest Zoo"],
      details: {
        altitude: "Mandai Rainforest Biosphere",
        bestTime: "Morning & Afternoon (9:00 AM – 5:30 PM)",
        overview: "River Wonders is Asia's first river-themed wildlife park, recreating iconic river ecosystems such as the Amazon, Mississippi, Nile, and Yangtze. It is famous for the Giant Panda Forest housing giant pandas Kai Kai and Jia Jia, as well as the thrilling Amazon River Quest boat ride.",
        experiences: [
          "Visit the climate-controlled biodome of the Giant Panda Forest and watch giant pandas munching fresh bamboo.",
          "Embark on the Amazon River Quest boat ride through simulated rainforest riverbeds with jaguars and tapirs.",
          "Walk inside the Amazon Flooded Forest, the world's largest freshwater aquarium exhibit housing manatees.",
          "Upgrade to experience the award-winning open-concept Singapore Zoo and Rainforest KidzWorld."
        ],
        travelTips: "Book the 11:00 AM Giant Panda feeding session for the best active photos."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "sg-faq-1", question: "Do Indian passport holders need a visa for Singapore, and how long does it take?", answer: "Yes, Indian passport holders require an electronic tourist visa (eVisa). Ghumo Firoo handles 100% of your Singapore eVisa filing with a guaranteed 3 to 5 working day approval turnaround." },
    { id: "sg-faq-2", question: "What top attractions are included in the Sentosa Island & Universal Studios package?", answer: "Our Sentosa packages include Universal Studios Express passes (no waiting in lines), Singapore Cable Car skypass, S.E.A. Aquarium entry, Wings of Time laser show, and Sentosa Express beach monorail passes." },
    { id: "sg-faq-3", question: "Can we combine Singapore with Genting Dream Cruise or Malaysia?", answer: "Yes! We offer popular 6N/7D twin-country combos (Singapore + Kuala Lumpur / Genting Highlands) as well as 4-night land + 2-night Resort World Genting Dream luxury ocean cruise packages." },
    { id: "sg-faq-4", question: "What is the difference between Singapore 4D3N and 5D4N packages?", answer: "The 4D3N itinerary is ideal for a quick holiday covering Gardens by the Bay, Night Safari, and Universal Studios. The 5D4N package adds a free day for shopping at Orchard Road, Jewel Changi Rain Vortex, and Sentosa Beach Resorts." },
    { id: "sg-faq-5", question: "Is Indian vegetarian and Jain food easily available in Singapore?", answer: "Yes! Singapore features hundreds of authentic Indian restaurants in Little India (like Saravanaa Bhavan, Ananda Bhavan, and Komala Vilas) as well as vegetarian options in Marina Bay Sands and Sentosa." },
    { id: "sg-faq-6", question: "What luxury hotel stay options are provided in Ghumo Firoo Singapore packages?", answer: "We provide 4-star and 5-star hotel options including Marina Bay Sands, Swissotel The Stamford, Pan Pacific, Shangri-La Sentosa, and Village Hotel Bugis with daily breakfast buffet." },
    { id: "sg-faq-7", question: "Are flight-inclusive Singapore packages available from major Indian cities?", answer: "Yes, we customize flight-inclusive packages with direct non-stop flights from Delhi (DEL), Mumbai (BOM), Bengaluru (BLR), Chennai (MAA), and Kolkata (CCU)." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Singapore Tour Packages", item: "/packages/singapore" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Singapore Luxury Vacation & Sentosa Packages 2026",
    description: "Experience top-rated Singapore luxury packages with Ghumo Firoo. Gardens by the Bay, Marina Bay Sands, Universal Studios Sentosa & Genting Dream cruise combos.",
    url: config.baseUrl + "/packages/singapore",
    image: "/singapore/gardens_by_the_bay.jpg",
    duration: "P5D",
    itinerary: [
      { position: 1, name: "Gardens by the Bay & Marina Bay Skyline", description: "Cloud Forest dome tour & rooftop Marina Bay Sands observation deck." },
      { position: 2, name: "Universal Studios & Sentosa Island", description: "Express theme park pass & Wings of Time laser show at Sentosa beach." },
      { position: 3, name: "Night Safari & Shopping Excursion", description: "Guided Night Safari tram tour & Orchard Road shopping experience." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "48000",
      includes: "4-star & 5-star hotels, daily breakfast, Singapore e-visa submission & private transfers"
    },
    aggregateRating: {
      ratingValue: 4.95,
      reviewCount: 3850
    }
  })

  return (
    <Layout>
      <SEO 
        title="Singapore Tour Packages 2026 | Sentosa, Universal Studios, Marina Bay & E-Visa"
        description="Book top-rated Singapore tour packages from India. Experience Marina Bay Sands, Gardens by the Bay Supertrees, Universal Studios Sentosa VIP, Genting Dream Cruise, S.E.A. Aquarium & Fast-Track E-Visa."
        keywords="Singapore tour package 2026, Singapore sightseeing places, Gardens by the Bay tickets, Marina Bay Sands SkyPark, Universal Studios Singapore Sentosa, S.E.A. Aquarium Sentosa, Jewel Changi Rain Vortex, Singapore Flyer tickets, Mandai Night Safari tram, Singapore Cable Car Skypass, Wings of Time Sentosa, Merlion Park Singapore, Haji Lane Little India, Singapore E-visa assistance, Genting Dream Cruise Singapore, Singapore Malaysia twin delight 7 days, Singapore family package price"
        canonicalUrl={config.baseUrl + "/packages/singapore"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="/singapore/gardens_by_the_bay.jpg" 
              alt="Singapore Marina Bay Sands Night Skyline" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SINGAPORE_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Lion City Collection 2026
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Singapore Paradise Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Gardens by the Bay Supertrees, Marina Bay Sands skyline, Universal Studios Sentosa VIP passes, Night Safari & Genting Dream ocean cruises.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Singapore Packages <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-6 rounded-full bg-black/40 border-white/20 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 backdrop-blur-md"
                onClick={() => document.getElementById("highlights-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                View 12 Sightseeing Highlights <Compass className="ml-2 h-4 w-4 text-[#C9A25A]" />
              </Button>
            </div>

            {/* QUICK STATS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 w-full max-w-3xl">
              {[
                { label: "Guest Rating", val: "4.95 ★", sub: "3,850+ Travelers" },
                { label: "Visa Service", val: "Fast E-Visa", sub: "3-5 Days Turnaround" },
                { label: "Theme Parks", val: "Universal Studios", sub: "Express Passes Available" },
                { label: "Private Transfers", val: "100% Chauffeured", sub: "Airport & City Transfers" }
              ].map((stat, i) => (
                <div key={i} className="bg-black/40 border border-white/10 p-3 rounded-xl backdrop-blur-md text-center">
                  <div className="text-sm font-serif font-bold text-[#E5C378]">{stat.val}</div>
                  <div className="text-[10px] text-slate-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* PACKAGES GRID SECTION */}
        <section id="packages-section" className="py-24 container mx-auto px-6 max-w-7xl">
          <SectionHeading 
            kicker="Curated Itineraries" 
            title="Select Your Singapore Package" 
            subtitle="Choose from 4-day city express breaks, 5-day Sentosa & cable car sky dining specials, Genting Dream cruises, or Malaysia twin country combos." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {singaporePackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 40}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.title} 
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SINGAPORE_IMG }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/75 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        {pkg.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {pkg.rating} ({pkg.reviewsCount})
                    </div>
                  </Link>

                  <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#C9A25A] mb-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {pkg.duration}
                        </span>
                        <span className="text-slate-400 font-normal">Private Tour</span>
                      </div>
                      
                      <Link to={pkg.link} className="block">
                        <h3 className="text-lg font-serif font-bold text-white mb-1 group-hover:text-[#E5C378] transition-colors line-clamp-2">
                          {pkg.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-300 font-light leading-relaxed mb-3 line-clamp-2">{pkg.desc}</p>

                      <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Hotel className="w-3.5 h-3.5 text-[#C9A25A] shrink-0" />
                          <span className="truncate">{pkg.stay}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Car className="w-3.5 h-3.5 text-[#C9A25A] shrink-0" />
                          <span className="truncate">{pkg.vehicle}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-3">
                        {pkg.highlights.map((h, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-medium border border-white/10">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-bold block">Starting From</span>
                        <span className="text-lg font-serif font-extrabold text-[#E5C378]">₹{pkg.price.toLocaleString("en-IN")}</span>
                      </div>
                      <Link 
                        to={pkg.link}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md transition-all"
                      >
                        Explore Details <ArrowRight className="w-3.5 h-3.5 text-[#070C1E]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ATTRACTIONS GRID SECTION - ELABORATE DESIGN */}
        <section id="highlights-section" className="py-24 bg-[#050A18] border-y border-[#C9A25A]/15">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading 
              kicker="12 Trending Sightseeing Places" 
              title="Singapore Highlights Included" 
              subtitle="Explore high-definition details of top trending attractions covered across our Singapore itineraries. Click any attraction to view complete travel tips, altitudes, top experiences & trending keywords." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All 12 Highlights" },
                { key: "landmarks", label: "Iconic Landmarks & Skyviews" },
                { key: "themeparks", label: "Theme Parks & Island Adventures" },
                { key: "wildlife", label: "Wildlife & Nature Safaris" },
                { key: "culture", label: "Cultural Heritage & Nightlife" }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeCategory === tab.key
                      ? "bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] shadow-md shadow-[#C9A25A]/20"
                      : "bg-[#0B1226] text-slate-300 hover:text-white border border-white/10 hover:border-[#C9A25A]/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAttractions.map((item, idx) => (
                <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 30}>
                  <div 
                    onClick={() => setSelectedAttraction(item)}
                    className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SINGAPORE_IMG }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/75 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C9A25A]" /> {item.distance}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-[#C9A25A] text-[#070C1E] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1 shadow-lg group-hover:bg-[#E5C378] transition-colors">
                          <Eye className="w-3 h-3" /> View In-Depth Guide
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#C9A25A] mb-1">
                          {item.categoryName}
                        </div>
                        <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-[#E5C378] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-300 font-light leading-relaxed mb-4 line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-white/10">
                        <div className="flex flex-wrap gap-1.5">
                          {item.highlights.map((h, i) => (
                            <span key={i} className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C9A25A]/10 text-[#E5C378] font-medium border border-[#C9A25A]/25">
                              {h}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#C9A25A] font-bold pt-1">
                          <span className="flex items-center gap-1">
                            <Mountain className="w-3.5 h-3.5 text-[#C9A25A]" /> {item.details.altitude}
                          </span>
                          <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Full Details <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* DETAILED ATTRACTION MODAL POPUP */}
        <Dialog open={!!selectedAttraction} onOpenChange={() => setSelectedAttraction(null)}>
          <DialogContent className="bg-[#0B1026] text-white border-[#C9A25A]/40 max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl font-sans">
            {selectedAttraction && (
              <div>
                <div className="relative aspect-[21/9] overflow-hidden">
                  <img 
                    src={selectedAttraction.image} 
                    alt={selectedAttraction.title} 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_SINGAPORE_IMG }}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1026] via-[#0B1026]/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/70 backdrop-blur-md border border-[#C9A25A]/40 text-[#E5C378] text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A25A]" /> {selectedAttraction.distance}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A25A]/15 border border-[#C9A25A]/30 text-[#E5C378] text-xs font-bold uppercase tracking-wider mb-2">
                      <Mountain className="w-3.5 h-3.5 text-[#C9A25A]" /> Altitude / Level: {selectedAttraction.details.altitude}
                    </div>
                    <DialogTitle className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                      {selectedAttraction.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-300 font-light leading-relaxed">
                      {selectedAttraction.details.overview}
                    </DialogDescription>
                  </div>

                  {/* TRENDING SEARCH KEYWORDS BADGES */}
                  {selectedAttraction.trendingKeywords && (
                    <div className="bg-[#070C1E] p-4 rounded-xl border border-[#C9A25A]/25 space-y-2">
                      <h4 className="text-xs font-serif font-bold text-[#E5C378] uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#C9A25A]" /> Trending Search Keywords & Highlights
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedAttraction.trendingKeywords.map((kw: string, i: number) => (
                          <span key={i} className="text-[10px] px-2.5 py-1 rounded-md bg-[#C9A25A]/10 text-[#E5C378] border border-[#C9A25A]/20 font-medium">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* KEY EXPERIENCES */}
                  <div className="space-y-3 bg-white/5 p-5 rounded-xl border border-white/10">
                    <h4 className="text-sm font-serif font-bold text-[#E5C378] uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C9A25A]" /> Top Experiences Included
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedAttraction.details.experiences.map((exp: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-[#C9A25A] shrink-0 mt-0.5" />
                          <span>{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BEST SEASON & PRO TIPS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#070C1E] p-4 rounded-xl border border-[#C9A25A]/25 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#C9A25A] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Best Time to Visit
                      </span>
                      <p className="text-xs text-white font-medium">{selectedAttraction.details.bestTime}</p>
                    </div>

                    <div className="bg-[#070C1E] p-4 rounded-xl border border-[#C9A25A]/25 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#C9A25A] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Pro Travel Tip
                      </span>
                      <p className="text-xs text-slate-300 font-light">{selectedAttraction.details.travelTips}</p>
                    </div>
                  </div>

                  {/* CTA BUTTON */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-400 block font-light">Includes e-visa & 4-star hotel stay</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹48,000</span>
                    </div>
                    <Button 
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg"
                      onClick={() => {
                        setSelectedAttraction(null)
                        document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      Explore Tour Packages <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* FAQ SECTION */}
        <section className="py-24 container mx-auto px-6 max-w-4xl">
          <SectionHeading kicker="Assurance Details" title="Singapore Travel FAQ" subtitle="Important details regarding E-Visa submission, Sentosa rides & cruise packages." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Singapore Paradise Collection"
          priceText="From ₹48,000"
          priceSubtext="Fast-Track E-Visa & Sentosa Passes Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Singapore%20Grand%20Delight%205D4N&price=64000")}
        />
      </div>
    </Layout>
  )
}

export default Singapore
