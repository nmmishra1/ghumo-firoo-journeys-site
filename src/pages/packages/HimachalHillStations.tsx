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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  Clock, Star, ArrowRight, ShieldCheck, Heart, Sparkles, Compass, 
  CheckCircle2, Hotel, Check, X, Calendar, MapPin, Info, Mountain, 
  Eye, Snowflake, Filter, Car, Award, ChevronRight
} from "lucide-react"

const HimachalHillStations: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Himachal', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const himachalPackages = [
    {
      id: "himachal-5d-4n",
      title: "Shimla & Manali Express (5D/4N)",
      subtitle: "Shimla Mall Road, Kufri Meadows, Manali Hadimba Temple & Solang Valley",
      desc: "Short Himachal break covering Shimla colonial promenade, Kufri snow peak, Manali Hadimba wood pagoda & Solang Valley snow sports.",
      badge: "Popular Express",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1000",
      price: 19500,
      duration: "5 Days / 4 Nights",
      rating: 4.9,
      reviewsCount: 420,
      stay: "Shimla Resort (2N) + Manali Resort (2N)",
      vehicle: "Chauffeured Private AC SUV / Sedan",
      link: "/packages/himachal-5d-4n",
      highlights: ["Solang Valley Paragliding", "Shimla Christ Church", "Kufri Yak Rides", "Hadimba Temple"],
      itinerary: [
        { day: "Day 1", title: "Chandigarh Pickup → Scenic Drive to Shimla", desc: "Private pickup from Chandigarh Airport / Railway Station. Drive past Pinjore Gardens to Shimla. Evening Mall Road walk." },
        { day: "Day 2", title: "Shimla Kufri Snow Adventure & Jakhoo Temple", desc: "Excursion to Kufri Mahasu Peak, yak rides, snow viewpoints & Jakhoo Hanuman statue." },
        { day: "Day 3", title: "Shimla to Manali via Kullu Valley Rafting", desc: "Drive along Beas river. Visit Pandoh Dam, Kullu shawl factory & Manali mountain resort check-in." },
        { day: "Day 4", title: "Solang Valley Snow Sports & Hadimba Temple", desc: "Paragliding, snow skiing in Solang Valley, Solang ropeway & 450-yr-old Hadimba Temple." },
        { day: "Day 5", title: "Manali to Chandigarh Departure Transfer", desc: "Breakfast and drive back to Chandigarh for departure drop-off." }
      ],
      inclusions: ["4 Nights 4-Star Mountain Resort Stay", "Daily Breakfast & Dinner", "Solang Valley Sightseeing Cab", "Private Chauffeured AC SUV/Sedan"],
      exclusions: ["Rohtang NGT Permit", "Personal skiing fees"]
    },
    {
      id: "himachal-7d-6n",
      title: "Himachal Hill Stations Spectacular (7D/6N)",
      subtitle: "Shimla, Manali, Solang Valley, Atal Tunnel, Kasol & Manikaran Hot Springs",
      desc: "Our flagship Himachal tour adding Kasol Parvati river walk, Manikaran Sahib sacred sulfur springs & Atal Tunnel Lahaul view.",
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1000",
      price: 24500,
      duration: "7 Days / 6 Nights",
      rating: 4.95,
      reviewsCount: 890,
      stay: "Shimla Resort (2N) + Manali Resort (3N) + Kasol Resort (1N)",
      vehicle: "Chauffeured Private AC SUV / Innova",
      link: "/packages/himachal-7d-6n",
      highlights: ["Atal Tunnel Sissu View", "Kasol Parvati River Walk", "Manikaran Hot Springs", "Solang Paragliding"],
      itinerary: [
        { day: "Day 1", title: "Chandigarh Pickup → Shimla Hill Station", desc: "Chauffeured pickup from Chandigarh. Mall Road & Ridge walk." },
        { day: "Day 2", title: "Shimla & Kufri Snow Excursion", desc: "Kufri snow adventure, horse riding & Jakhoo Temple." },
        { day: "Day 3", title: "Shimla to Manali via Kullu Valley", desc: "Pandoh Dam, Beas River rafting & Kullu handloom tour." },
        { day: "Day 4", title: "Solang Valley & Rohtang Pass / Atal Tunnel", desc: "Snow sports, paragliding, Solang ropeway & Atal Tunnel view." },
        { day: "Day 5", title: "Manali Heritage & Vashisht Hot Springs", desc: "Hadimba Temple, Club House, Vashisht sulfur springs & Mall Road." },
        { day: "Day 6", title: "Manali to Kasol & Manikaran Sahib Excursion", desc: "Kasol Parvati River stroll, Manikaran Gurudwara & hot spring bath." },
        { day: "Day 7", title: "Kasol to Chandigarh Departure Transfer", desc: "Breakfast and chauffeured transfer back to Chandigarh." }
      ],
      inclusions: ["6 Nights 4-Star Mountain Resorts", "Solang Valley & Kasol Excursion Included", "Daily Breakfast & Dinner", "Private Chauffeured SUV/Sedan"],
      exclusions: ["Rohtang Pass NGT Permit"]
    },
    {
      id: "himachal-8d-7n",
      title: "Grand Himachal & Dharamshala Dalhousie (8D/7N)",
      subtitle: "Shimla, Manali, Solang, McLeodganj Dalai Lama Temple & Dalhousie Khajjiar",
      desc: "Complete Himachal circuit covering Shimla, Manali, Dharamshala Dalai Lama Temple, Bhagsu waterfall & Dalhousie Khajjiar 'Mini Switzerland'.",
      badge: "Grand Circuit",
      image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=1000",
      price: 32000,
      duration: "8 Days / 7 Nights",
      rating: 5.0,
      reviewsCount: 510,
      stay: "Shimla (2N) + Manali (2N) + Dharamshala (2N) + Dalhousie (1N)",
      vehicle: "Chauffeured Private AC Innova / SUV",
      link: "/packages/himachal-8d-7n",
      highlights: ["Khajjiar Mini Switzerland", "McLeodganj Dalai Lama Temple", "Solang Snow Bowl", "Kufri Mahasu Peak"],
      itinerary: [
        { day: "Day 1", title: "Chandigarh Pickup → Shimla Drive", desc: "Pickup & Shimla Mall Road stroll." },
        { day: "Day 2", title: "Shimla Kufri Sightseeing", desc: "Kufri snow point & Jakhoo temple." },
        { day: "Day 3", title: "Shimla to Manali Drive", desc: "Kullu valley rafting & Manali check-in." },
        { day: "Day 4", title: "Solang Valley Snow Sports", desc: "Paragliding, zorbing & ropeway flight." },
        { day: "Day 5", title: "Manali to Dharamshala McLeodganj", desc: "Drive to Dharamshala. Visit Dalai Lama Temple & Bhagsu waterfall." },
        { day: "Day 6", title: "Dharamshala to Dalhousie & Khajjiar 'Mini Switzerland'", desc: "Drive to Dalhousie. Visit Khajjiar lake meadow plateau." },
        { day: "Day 7", title: "Dalhousie Heritage & St. John Church", desc: "Heritage walk in Dalhousie pine forests." },
        { day: "Day 8", title: "Dalhousie to Pathankot / Chandigarh Airport", desc: "Breakfast and departure transfer." }
      ],
      inclusions: ["7 Nights 4-Star Mountain Resorts", "Khajjiar & McLeodganj Excursions", "Daily Breakfast & Dinner", "Private AC Vehicle for 8 Days"],
      exclusions: ["Flight / Train tickets"]
    }
  ]

  const FALLBACK_HIMACHAL_IMG = "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800"

  const attractions = [
    {
      id: "solang-valley",
      category: "adventure",
      categoryName: "Snow & Adventure",
      title: "Solang Valley Snow & Paragliding",
      description: "Himachal's premier snow adventure bowl at 8,400 ft altitude. Famous for tandem paragliding flights over pine forests, winter skiing slopes, zorbing balls, quad biking, and the Solang Ropeway cable car.",
      image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800",
      distance: "Manali (13 km)",
      highlights: ["Tandem Paragliding", "Winter Ski Slopes", "Solang Cable Car", "Zorbing & ATV Biking"],
      details: {
        altitude: "8,400 feet (2,560 m)",
        bestTime: "Dec to Feb for Snow Sports | Mar to June for Paragliding",
        overview: "Solang Valley (Solang Nala) derives its name from the combination of Solang (Nearby village) and Nala (Water stream). Located 13 km north of Manali on the way to Rohtang Pass, it is a world-renowned destination for outdoor adventure lovers.",
        experiences: [
          "Soar high with licensed tandem paragliding pilots over pine tree valleys.",
          "Ride the state-of-the-art Solang Ropeway cable car to Mt. Phatru peak (10,000 ft).",
          "Rent ski gear and take beginner snow skiing lessons on natural slopes in Jan-Feb.",
          "Experience thrilling 4x4 quad biking (ATV) and giant roll-down zorbing balls."
        ],
        travelTips: "Book paragliding only through govt-certified pilots at the official counter. Carry waterproof gloves and heavy thermals during winter months."
      }
    },
    {
      id: "rohtang-pass",
      category: "adventure",
      categoryName: "Snow & Adventure",
      title: "Rohtang Pass (13,058 ft Snow Ridge)",
      description: "The gateway to Lahaul & Spiti valley at 13,058 ft elevation on the Pir Panjal range. Offers year-round snow walls, snow scooter rides, and breathtaking views of glaciers and twin peaks.",
      image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=800",
      distance: "Manali (51 km)",
      highlights: ["13,058 ft Snow Ridge", "Snow Scooter Ride", "Pir Panjal Glaciers", "NGT Permit Zone"],
      details: {
        altitude: "13,058 feet (3,978 m)",
        bestTime: "June to October (Closed on Tuesdays & heavy winter snow)",
        overview: "Rohtang Pass is an iconic high-mountain pass connecting the Kullu Valley with the Lahaul and Spiti Valleys of Himachal Pradesh. Surrounded by majestic Himalayan peaks and permanent glaciers, it is the ultimate snow experience near Manali.",
        experiences: [
          "Walk through massive 10 to 15-foot snow walls carved along the highway.",
          "Ride high-speed snowmobiles and snow scooters across snowfields.",
          "Enjoy panoramic views of Gheyphan peak and Sonapani glacier.",
          "Play with fresh snow and slide down natural sledding slopes."
        ],
        travelTips: "National Green Tribunal (NGT) permits are strictly required. GhumoFiroo handles vehicle NGT permit approvals for all guest bookings."
      }
    },
    {
      id: "atal-tunnel",
      category: "adventure",
      categoryName: "Snow & Adventure",
      title: "Atal Tunnel Rohtang (9.02 km World Record)",
      description: "The world's longest highway tunnel above 10,000 feet (9.02 km long) connecting Solang Valley directly to the breathtaking cold desert landscape of Sissu in Lahaul Valley.",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
      distance: "Manali to Sissu (28 km)",
      highlights: ["9.02 km Highway Tunnel", "Sissu Waterfall", "Lahaul Valley Entrance", "World Record Engineering"],
      details: {
        altitude: "10,040 feet (3,060 m)",
        bestTime: "Open Year-Round (Subject to snow clearings)",
        overview: "Named after former Prime Minister Atal Bihari Vajpayee, this 9.02 km horseshoe-shaped tunnel cuts through the Pir Panjal range under Rohtang Pass, reducing travel time between Manali and Lahaul Valley from 4 hours to just 15 minutes.",
        experiences: [
          "Drive through the state-of-the-art 9.02 km illuminated tunnel under the mountains.",
          "Emerge at the North Portal directly into the dramatic snow peaks of Sissu, Lahaul.",
          "Visit Sissu Waterfall and stroll along the frozen Chandra River.",
          "Experience sudden transformation of climate from lush green Kullu to rugged Lahaul."
        ],
        travelTips: "Maintain strict speed limits inside the tunnel (60 km/h). Keep cameras ready for the breathtaking view at the North Portal exiting into Sissu."
      }
    },
    {
      id: "shimla-mall-road",
      category: "heritage",
      categoryName: "Colonial Heritage",
      title: "Shimla Mall Road & Ridge Promenade",
      description: "Shimla's iconic vehicle-free colonial promenade featuring the neo-Gothic Christ Church (1857), Scandal Point, historic Gaiety Theatre, and bustling Himachali handicraft bazaars.",
      image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=800",
      distance: "Shimla City Center",
      highlights: ["Christ Church 1857", "Scandal Point", "Colonial Architecture", "Pedestrian Zone"],
      details: {
        altitude: "7,200 feet (2,200 m)",
        bestTime: "Year-Round | Evening Golden Hour",
        overview: "The Mall Road and The Ridge form the social and cultural heart of Shimla. Built during British rule when Shimla was the Summer Capital of British India, this pedestrian-only area offers colonial charm, heritage architecture, and panoramic Himalayan vistas.",
        experiences: [
          "Photograph the yellow-hued neo-Gothic Christ Church built in 1857.",
          "Enjoy coffee at historic cafes while soaking in panoramic views from The Ridge.",
          "Shop for authentic Himachali caps, wooden handicrafts, and woolens at Lakkar Bazaar.",
          "Ride the glass-walled Lift from Cart Road up to Mall Road."
        ],
        travelTips: "Vehicles are strictly forbidden on Mall Road. Use the Municipal Lift for easy access if traveling with senior citizens."
      }
    },
    {
      id: "kufri-mahasu",
      category: "adventure",
      categoryName: "Snow & Adventure",
      title: "Kufri Mahasu Peak & Yak Rides",
      description: "Charming hill station at 8,600 ft famous for snow adventure parks, traditional Himachali Yak and horse rides to Mahasu Peak, tobogganing, and panoramic Himalayan views.",
      image: "https://images.unsplash.com/photo-1612456225451-bb8d10d0131d?q=80&w=800",
      distance: "Shimla (16 km)",
      highlights: ["Mahasu Peak Ride", "Traditional Yaks", "Snow Tobogganing", "Himalayan Nature Park"],
      details: {
        altitude: "8,600 feet (2,625 m)",
        bestTime: "Dec to Mar for Snow | April to June for Greenery",
        overview: "Kufri, derived from the word 'Kufr' meaning lake in local dialect, is a popular high-altitude hill resort near Shimla. It serves as the starting point for treks to Fagu, Shimla, and Manali.",
        experiences: [
          "Ride a decorated furry Himachali Yak for traditional photos against snow peaks.",
          "Take a horseback ride up the cedar forest path to Mahasu Peak viewpoint.",
          "Visit Himalayan Nature Park to spot rare Monal birds, snow leopards, and musk deer.",
          "Enjoy tobogganing down snow ramps during peak winter months."
        ],
        travelTips: "Wear comfortable sturdy shoes for the muddy trail to Mahasu Peak. Horse rides are fixed-rate by local union."
      }
    },
    {
      id: "kasol-parvati",
      category: "nature",
      categoryName: "Rivers & Lakes",
      title: "Kasol & Parvati River Trail",
      description: "Known as the 'Mini Israel of India', Kasol is a bohemian riverside village in Parvati Valley surrounded by dense pine forests, crystal clear rivers, and authentic Israeli bakeries.",
      image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800",
      distance: "Parvati Valley (30 km from Bhuntar)",
      highlights: ["Parvati River Walk", "Israeli Bakeries", "Pine Forest Trails", "Hippie Cafe Vibe"],
      details: {
        altitude: "5,180 feet (1,580 m)",
        bestTime: "March to June & September to November",
        overview: "Nestled in the lush Parvati Valley along the roaring Parvati River, Kasol has evolved into a global hub for backpackers, trekkers, and nature lovers seeking peace among giant coniferous mountains.",
        experiences: [
          "Stroll along suspension bridges over the turquoise roaring Parvati River.",
          "Savor fresh Shakshuka, falafel, and baked goods at famous German and Israeli bakeries.",
          "Trek to peaceful nearby villages like Chalal, Katagla, and Rasol through pine woods.",
          "Relax in cozy riverside cafes with acoustic music and mountain views."
        ],
        travelTips: "Kasol has cool mountain evenings year-round. Carry light jacket even in summer."
      }
    },
    {
      id: "manikaran-sahib",
      category: "spiritual",
      categoryName: "Spiritual Shrines",
      title: "Manikaran Sahib Hot Sulfur Springs",
      description: "Sacred pilgrimage destination located between the Beas and Parvati Rivers, famous for its historic Gurudwara, Ram Temple, and natural boiling hot sulfur springs with therapeutic properties.",
      image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=800",
      distance: "Kasol (4 km)",
      highlights: ["Sacred Hot Springs", "Manikaran Gurudwara", "Steam Cooked Langar", "Therapeutic Baths"],
      details: {
        altitude: "5,770 feet (1,760 m)",
        bestTime: "Year-Round",
        overview: "Manikaran is a revered holy spot for both Sikhs and Hindus. The hot springs here are so hot that rice and pulses for the Gurudwara's free community kitchen (Langar) are cooked directly in boiling water pots submerged in the spring water.",
        experiences: [
          "Take a holy dip in the segregated indoor hot sulfur thermal baths inside the Gurudwara.",
          "Witness food being cooked in natural boiling spring water for the daily 24/7 Langar.",
          "Pay homage at the ancient Lord Ram and Shiva temples standing beside the hot springs.",
          "Walk across the historic footbridges spanning the roaring Parvati River."
        ],
        travelTips: "Maintain respectful decorum: cover head with scarf/handkerchief before entering Gurudwara complex."
      }
    },
    {
      id: "hadimba-temple",
      category: "heritage",
      categoryName: "Colonial Heritage",
      title: "Hadimba Wooden Pagoda Temple Manali",
      description: "A 450-year-old architectural marvel built in 1553 AD. Constructed in four-tiered wooden pagoda style tucked deep inside Dhungri Van Vihar cedar pine forest.",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800",
      distance: "Manali Old Town (2 km)",
      highlights: ["450yr Pagoda Architecture", "Dhungri Cedar Forest", "Yak Photo Spots", "Wooden Carvings"],
      details: {
        altitude: "6,700 feet (2,040 m)",
        bestTime: "Year-Round | May for Doongri Forest Fair",
        overview: "Surrounded by towering deodar (cedar) trees at the foot of the Himalayas, Hadimba Temple (also known as Dhungari Temple) is dedicated to Goddess Hadimba, wife of Bhima from the Mahabharata epic.",
        experiences: [
          "Admire the intricate 4-tiered wooden pagoda roof and brass carved entrance doorway.",
          "Take photos riding large Himalayan Yaks and furry Angora rabbits outside the forest.",
          "Walk through quiet stone trails surrounded by 100-foot ancient deodar cedar trees.",
          "Visit nearby Ghatotkacha tree shrine dedicated to Hadimba's warrior son."
        ],
        travelTips: "Visit early morning at 8:00 AM to enjoy peaceful forest silence before tourist crowds arrive."
      }
    },
    {
      id: "khajjiar-meadow",
      category: "nature",
      categoryName: "Rivers & Lakes",
      title: "Khajjiar 'Mini Switzerland of India'",
      description: "Dalhousie's crown jewel. A saucer-shaped emerald green mountain meadow surrounded by dense deodar pine forests, featuring a central lake and floating grass island.",
      image: "https://images.unsplash.com/photo-1612456225451-bb8d10d0131d?q=80&w=800",
      distance: "Dalhousie (24 km)",
      highlights: ["Emerald Green Meadow", "Floating Grass Island", "Deodar Pine Woods", "Horse Riding"],
      details: {
        altitude: "6,500 feet (1,950 m)",
        bestTime: "March to June (Summer greenery) | Dec to Feb (Snow landscape)",
        overview: "Officially certified on 7th July 1992 by the Swiss Ambassador as one of 160 locations worldwide that share physical resemblance with Switzerland. A stone with distance to Bern (6,194 km) is installed near Khajjiar lake.",
        experiences: [
          "Walk barefoot across soft carpet-like grass meadows overlooking pine forests.",
          "Ride horses along the forest perimeter surrounding the central Khajjiar lake.",
          "Experience zorbing in giant clear inflatable balls rolling down gentle green slopes.",
          "Visit 12th-century Khajji Nag Temple featuring wood carvings of Pandava heroes."
        ],
        travelTips: "Combine your Khajjiar excursion with Kalatop Wildlife Sanctuary trek for panoramic views."
      }
    },
    {
      id: "mcleodganj-dalai-lama",
      category: "spiritual",
      categoryName: "Spiritual Shrines",
      title: "McLeod Ganj & Dalai Lama Temple",
      description: "The spiritual heart of Tibetan Buddhism in exile. Residence of His Holiness 14th Dalai Lama, Tsuglagkhang Temple complex, prayer wheels, and Namgyal Monastery.",
      image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800",
      distance: "Dharamshala (10 km)",
      highlights: ["Dalai Lama Residence", "Tsuglagkhang Complex", "Tibetan Prayer Wheels", "McLeod Market"],
      details: {
        altitude: "6,830 feet (2,080 m)",
        bestTime: "March to June & September to November",
        overview: "McLeod Ganj (Upper Dharamshala) is world-famous as the headquarters of the Tibetan Government in Exile. Nestled on the Dhauladhar Range, it blends Tibetan culture, Buddhist meditation, and Himachali mountain scenery.",
        experiences: [
          "Spin copper prayer wheels while taking peaceful kora walks around Dalai Lama Temple.",
          "Observe Buddhist monks practicing traditional debate rituals in monastery courtyards.",
          "Shop for authentic Tibetan thangka paintings, singing bowls, and turquoise jewelry.",
          "Savor steaming hot Tibetan momos, thukpa, and butter tea at authentic cafes."
        ],
        travelTips: "Check His Holiness Dalai Lama's official schedule online for public teaching sessions."
      }
    },
    {
      id: "bhagsu-waterfall",
      category: "nature",
      categoryName: "Rivers & Lakes",
      title: "Bhagsu Waterfall & Shiva Cafe",
      description: "A scenic 30-foot mountain waterfall cascading down rocky cliffs near Bhagsu Nag temple, topped by the iconic bohemian Shiva Cafe overlooking Dhauladhar peaks.",
      image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800",
      distance: "McLeod Ganj (2 km)",
      highlights: ["30ft Mountain Cascade", "Bhagsu Nag Temple", "Iconic Shiva Cafe", "Dhauladhar Views"],
      details: {
        altitude: "6,900 feet (2,100 m)",
        bestTime: "Monsoon & Post-Monsoon (July to November for peak water flow)",
        overview: "Located a short 15-minute walk from McLeod Ganj market, Bhagsu Waterfall is famous for its natural mountain spring water pool and its historic 16th-century Lord Shiva temple.",
        experiences: [
          "Hike up the paved mountain trail to the base of Bhagsu Waterfall.",
          "Dip feet in cool, fresh mountain spring water flowing down the rocks.",
          "Continue hiking 15 minutes further up to legendary cliffside Shiva Cafe.",
          "Enjoy herbal tea, wood-fired pizzas, and soul music with views of McLeod Ganj valley."
        ],
        travelTips: "Carry light sweater for evening walks. The stone stairs can get slippery during rains."
      }
    },
    {
      id: "bir-billing",
      category: "adventure",
      categoryName: "Snow & Adventure",
      title: "Bir Billing World Paragliding Take-Off",
      description: "Asia's highest and world's 2nd highest paragliding site at 8,000 ft altitude. Offers 30 to 45-minute tandem flights soaring over Tea Gardens and Dhauladhar valleys.",
      image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800",
      distance: "Dharamshala (65 km)",
      highlights: ["World #2 Paragliding Site", "8,000 ft Take-Off Point", "Tandem Thermal Flight", "Bir Tibetan Colony"],
      details: {
        altitude: "Billing Take-Off: 8,000 ft | Bir Landing: 4,350 ft",
        bestTime: "October to November & March to May (Clear thermals)",
        overview: "Host to the Paragliding World Cup, Bir Billing is universally acknowledged as one of the safest and most exhilarating paragliding destinations on Earth due to favorable air currents and ideal mountain topography.",
        experiences: [
          "Drive 14 km up pine forest hairpins to Billing take-off cliff at 8,000 ft.",
          "Strap into tandem harness with expert pilot and launch into open Himalayan sky.",
          "Glide for 25 to 40 minutes over green tea estates, monasteries, and river beds.",
          "Land smoothly at sunset at Bir landing site while enjoying sunset music gatherings."
        ],
        travelTips: "GoPro video recording packages are available directly from pilots during flight."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "hp-faq-1", question: "What is the best month to see snow in Himachal?", answer: "December to February offers heavy snow in Solang Valley, Rohtang Pass, and Kufri. April to June offers pleasant 15°C summer weather." },
    { id: "hp-faq-2", question: "Is Rohtang Pass permit included in the package?", answer: "Rohtang Pass permits are issued by the NGT online on a daily quota basis. GhumoFiroo handles NGT permit application for your vehicle." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Himachal Hill Stations", item: "/packages/himachal-hill-stations" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Himachal Hill Stations Tour Packages 2026",
    description: "Book top-rated Himachal tour packages with GhumoFiroo. Includes Shimla Mall Road, Kufri, Manali Solang Valley snow sports, Rohtang Pass & Kasol Parvati valley.",
    url: config.baseUrl + "/packages/himachal-hill-stations",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    duration: "P7D",
    itinerary: [
      { position: 1, name: "Shimla & Kufri Meadows", description: "Shimla Mall Road & Kufri snow sports." },
      { position: 2, name: "Solang Valley & Rohtang Pass", description: "Solang Valley paragliding & snow skiing." },
      { position: 3, name: "Kasol Parvati River Walk", description: "Manikaran Sahib hot springs & Kasol cafes." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "19500",
      includes: "4-star mountain resorts, Solang Valley cab, breakfast & dinner, private AC vehicle transfers"
    },
    aggregateRating: {
      ratingValue: 4.9,
      reviewCount: 1820
    }
  })

  return (
    <Layout>
      <SEO 
        title="Himachal Tour Packages 2026 | Shimla, Manali & Solang Valley"
        description="Book top-rated Himachal tour packages. Includes Shimla Mall Road, Kufri snow adventure, Manali Solang Valley snow sports, Rohtang Pass & Kasol Parvati valley."
        keywords="Himachal tour package 2026, Shimla Manali tour package price, Solang Valley paragliding cost, Kasol Manikaran package"
        canonicalUrl={config.baseUrl + "/packages/himachal-hill-stations"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-white min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600" 
              alt="Himachal Snow Mountains Manali" 
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Land of Gods & Eternal Snow
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Himachal Paradise Collection
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Shimla colonial promenade, Kufri snow peaks, Manali Solang Valley paragliding, Kasol Parvati River, Manikaran Sahib & Dharamshala.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("packages-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Himachal Packages <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-6 rounded-full bg-black/40 border-white/20 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 backdrop-blur-md"
                onClick={() => document.getElementById("highlights-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Sightseeing Guide <Compass className="ml-2 h-4 w-4 text-[#C9A25A]" />
              </Button>
            </div>

            {/* QUICK STATS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 w-full max-w-3xl">
              {[
                { label: "Guest Rating", val: "4.95 ★", sub: "1,820+ Travelers" },
                { label: "Private Vehicle", val: "100% SUV", sub: "Dedicated Chauffeured" },
                { label: "Resort Stay", val: "4-Star Tiers", sub: "Breakfast & Dinner" },
                { label: "Snow Guarantee", val: "Solang / Rohtang", sub: "Year-Round Altitude" }
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
            title="Select Your Himachal Tour Package" 
            subtitle="Choose from express 5-day mountain breaks, 7-day best sellers with Kasol, or 8-day Dharamshala & Dalhousie circuits." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {himachalPackages.map((pkg, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 50}>
                <div className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group">
                  <Link to={pkg.link} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
                    <img 
                      src={pkg.image} 
                      alt={pkg.title} 
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
                        <h3 className="text-lg font-serif font-bold text-white mb-1 group-hover:text-[#E5C378] transition-colors">
                          {pkg.title}
                        </h3>
                      </Link>
                      <p className="text-[11px] text-[#C9A25A] font-medium mb-2">{pkg.subtitle}</p>
                      <p className="text-xs text-slate-300 font-light leading-relaxed mb-3">{pkg.desc}</p>

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
              kicker="In-Depth Sightseeing Guide" 
              title="Himachal Highlights Included" 
              subtitle="Explore complete details of iconic attractions covered across our Himachal itineraries. Click any card to view full travel advice & altitude guides." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights" },
                { key: "adventure", label: "Snow & Adventure" },
                { key: "heritage", label: "Colonial Heritage" },
                { key: "nature", label: "Rivers & Lakes" },
                { key: "spiritual", label: "Spiritual Shrines" }
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
                <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 40}>
                  <div 
                    onClick={() => setSelectedAttraction(item)}
                    className="bg-[#0B1226]/90 border border-[#C9A25A]/25 rounded-2xl overflow-hidden h-full flex flex-col justify-between hover:border-[#C9A25A] hover-gold-glow transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <img 
                        src={item.image} 
                        alt="" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_HIMACHAL_IMG
                        }}
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
                  <img src={selectedAttraction.image} alt={selectedAttraction.title} className="w-full h-full object-cover" />
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
                      <Mountain className="w-3.5 h-3.5 text-[#C9A25A]" /> Altitude: {selectedAttraction.details.altitude}
                    </div>
                    <DialogTitle className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                      {selectedAttraction.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-300 font-light leading-relaxed">
                      {selectedAttraction.details.overview}
                    </DialogDescription>
                  </div>

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
                      <span className="text-xs text-slate-400 block font-light">Includes private cab transfers & hotel stays</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Packages from ₹19,500</span>
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
          <SectionHeading kicker="Assurance Details" title="Himachal Travel FAQ" subtitle="Important details regarding snow timing, Rohtang permits & vehicle transfers." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Himachal Paradise Collection"
          priceText="From ₹19,500"
          priceSubtext="Mountain Resort & Solang Cab Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Himachal%20Spectacular%207D6N&price=24500")}
        />
      </div>
    </Layout>
  )
}

export default HimachalHillStations