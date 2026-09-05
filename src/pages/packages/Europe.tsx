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
  Eye, Car, ChevronRight
} from "lucide-react"

const Europe: React.FC = () => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const FALLBACK_EUROPE_IMG = "/europe/paris_eiffel_tower.jpg"

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewService.getReviewsByDestination('Europe', 3)
        setReviews(data)
      } catch (err) {
        console.error(err)
      }
    }
    loadReviews()
  }, [])

  const countries = [
    { name: "Switzerland", code: "CH", image: "/europe/switzerland.jpg", link: "/packages/switzerland" },
    { name: "France", code: "FR", image: "/europe/france.jpg", link: "/packages/france" },
    { name: "Italy", code: "IT", image: "/europe/italy.jpg", link: "/packages/italy" },
    { name: "Austria", code: "AT", image: "/europe/austria.jpg", link: "/packages/austria" },
    { name: "Germany", code: "DE", image: "/europe/germany.jpg", link: "/packages/germany" },
    { name: "Netherlands", code: "NL", image: "/europe/netherlands.jpg", link: "/packages/netherlands" },
    { name: "Belgium", code: "BE", image: "/europe/belgium.jpg", link: "/packages/belgium" },
    { name: "Czech Republic", code: "CZ", image: "/europe/czech_republic.jpg", link: "/packages/czech-republic" },
  ]

  const attractions = [
    {
      id: "eiffel-tower",
      category: "heritage",
      categoryName: "Royal Palaces & Castles",
      title: "Paris Eiffel Tower & Seine River Cruise",
      description: "Iconic 330-meter wrought-iron tower overlooking Paris, paired with a sunset glass-canopy Seine River cruise past Notre-Dame.",
      image: "/europe/paris_eiffel_tower.jpg",
      distance: "Paris, France",
      highlights: ["Eiffel Tower 2nd Floor Access", "Glass-Canopy Seine Cruise", "Champs-Élysées Walk", "Louvre Museum"],
      details: {
        altitude: "330 meters",
        bestTime: "May to October | Sunset Hours 7:30 PM",
        overview: "The Eiffel Tower is the world's most famous monument. Standing 330 meters high over Champ de Mars, guests take high-speed elevators to the 2nd floor and summit platforms for 360-degree views over Paris.",
        experiences: [
          "Ascend high-speed elevators to the Eiffel Tower 2nd floor observation deck.",
          "Board an illuminated glass-roof boat cruise along the Seine River.",
          "Walk under the Arc de Triomphe along the world-famous Champs-Élysées avenue.",
          "See Mona Lisa and Venus de Milo inside the historic Louvre Museum."
        ],
        travelTips: "Skip-the-line timed access tickets are included in all GhumoFiroo Europe packages."
      }
    },
    {
      id: "jungfraujoch-top-of-europe",
      category: "alpine",
      categoryName: "Alpine Nature & Mountains",
      title: "Jungfraujoch — Top of Europe",
      description: "Highest railway station in Europe at 3,454m altitude, featuring glacier ice palaces, Sphinx Observatory & eternal snow.",
      image: "/europe/jungfraujoch_top_of_europe.jpg",
      distance: "Bernese Oberland, Switzerland",
      highlights: ["Eiger Express Cable Car", "3,454m Altitude Station", "Ice Palace Sculptures", "Sphinx Panorama Deck"],
      details: {
        altitude: "3,454 meters (11,332 ft)",
        bestTime: "Year-Round | Morning Train Departures 8:30 AM",
        overview: "Jungfraujoch sits between the Jungfrau and Mönch peaks in the Swiss Alps. Reached via the ultra-modern Eiger Express tricable gondola, travelers step onto eternal snow and ice surrounded by 4,000m peaks.",
        experiences: [
          "Ride the state-of-the-art Eiger Express cable car from Grindelwald Terminal to Eigergletscher in 15 minutes.",
          "Step onto the open-air Sphinx Observatory platform for views over the 22km Aletsch Glacier (UNESCO).",
          "Walk through hand-carved crystalline tunnels inside the Ice Palace glacier cavern.",
          "Play on eternal snow at the Alpine Sensation snow park."
        ],
        travelTips: "Swiss Travel Passes cover up to 50% discount on Jungfraujoch summit train tickets."
      }
    },
    {
      id: "mount-titlis-rotair",
      category: "alpine",
      categoryName: "Alpine Nature & Mountains",
      title: "Mount Titlis & Rotair Revolving Cable Car",
      description: "Glacier mountain peak in Engelberg at 3,020m featuring Titlis Rotair (world's first revolving cable car) & Europe's highest suspension bridge.",
      image: "/europe/mount_titlis_rotair.jpg",
      distance: "Engelberg, Switzerland",
      highlights: ["Rotair 360° Cable Car", "Cliff Walk Suspension Bridge", "Ice Flyer Chairlift", "Glacier Cave Tunnels"],
      details: {
        altitude: "3,020 meters (9,908 ft)",
        bestTime: "Year-Round | Morning 9:00 AM",
        overview: "Mount Titlis is Central Switzerland's highest summit. The final leg of the ascent is aboard Titlis Rotair, which rotates 360 degrees during the 5-minute ride, giving panoramic views of snow crevices and alpine valleys.",
        experiences: [
          "Cross Titlis Cliff Walk, Europe's highest suspension bridge hanging 500m off the ground.",
          "Fly over glacier snowfields on the open-air Ice Flyer chairlift.",
          "Explore the 150m long subterranean Glacier Cave carved into 5,000-year-old ice.",
          "Toboggan and snow-tube down the snow park slopes."
        ],
        travelTips: "Warm waterproof jackets and sunglasses are recommended even during summer months."
      }
    },
    {
      id: "venice-gondola-grand-canal",
      category: "culture",
      categoryName: "Historic Cities & Canals",
      title: "Venice Grand Canal & Private Gondola Cruise",
      description: "Romantic boat ride along Venice's labyrinthine canals, passing Renaissance palaces, Rialto Bridge & St. Mark's Square.",
      image: "/europe/venice_grand_canal.jpg",
      distance: "Venice, Italy",
      highlights: ["Private Venetian Gondola", "Rialto Bridge Views", "St. Mark's Basilica", "Murano Glass Workshop"],
      details: {
        altitude: "Sea Level",
        bestTime: "April to October | Late Afternoon 5:00 PM",
        overview: "Venice is an amphibious city built on 118 small islands separated by canals and linked by over 400 bridges. Gliding through narrow canals on a traditional wooden gondola steered by a striped-shirt gondolier is an unmissable European experience.",
        experiences: [
          "Glide along quiet inner canals and under the 400-year-old Rialto Bridge on a private gondola.",
          "Walk across St. Mark's Square and admire the Byzantine mosaic domes of St. Mark's Basilica.",
          "Tour the Doge's Palace and cross the historic Bridge of Sighs.",
          "Watch master glassblowers craft blown crystal art on Murano Island."
        ],
        travelTips: "All GhumoFiroo Venice tours include private water-taxi transfers from Tronchetto to St. Mark's."
      }
    },
    {
      id: "rome-colosseum-forum",
      category: "culture",
      categoryName: "Historic Cities & Canals",
      title: "Rome Colosseum & Vatican City",
      description: "Step into 2,000 years of history at the ancient Flavian Amphitheatre, Roman Forum, Trevi Fountain & Vatican Museums.",
      image: "/europe/rome_colosseum.jpg",
      distance: "Rome, Italy",
      highlights: ["Colosseum Gladiator Arena", "Trevi Fountain Coin Toss", "St. Peter's Basilica Dome", "Sistine Chapel Ceilings"],
      details: {
        altitude: "21 meters",
        bestTime: "Year-Round | Morning Guided Tour 9:00 AM",
        overview: "Rome, the Eternal City, is an open-air museum filled with ancient Roman ruins, Baroque fountains, and Renaissance cathedrals. Vatican City, the world's smallest independent state, houses the Sistine Chapel painted by Michelangelo.",
        experiences: [
          "Walk through the gladiator archways of the 50,000-seat ancient Colosseum.",
          "Toss a coin over your shoulder into Trevi Fountain to ensure your return to Rome.",
          "Gaze up at Michelangelo's ceiling frescoes inside the Sistine Chapel.",
          "Climb St. Peter's Basilica dome for sweeping views of St. Peter's Square."
        ],
        travelTips: "Skip-the-line VVIP fast-track passes are pre-booked to bypass multi-hour queues."
      }
    },
    {
      id: "neuschwanstein-castle",
      category: "heritage",
      categoryName: "Royal Palaces & Castles",
      title: "Neuschwanstein Fairy Tale Castle",
      description: "19th-century Romanesque Revival palace perched on a rugged Bavarian hill; the real-life inspiration for Disney's Sleeping Beauty castle.",
      image: "/europe/neuschwanstein_castle.jpg",
      distance: "Bavaria, Germany",
      highlights: ["Disney Castle Inspiration", "Mary's Bridge Panorama", "Throne Room Murals", "Alpsee Lake Walk"],
      details: {
        altitude: "800 meters",
        bestTime: "May to October | Morning Visit 10:00 AM",
        overview: "Built by King Ludwig II of Bavaria in 1869 as a personal retreat, Neuschwanstein Castle stands majestically against the backdrop of the Bavarian Alps and Alpsee Lake. Its towering turrets inspired Walt Disney.",
        experiences: [
          "Take a horse-drawn carriage ride up the wooded castle hill from Schwangau village.",
          "Walk out onto Marienbrücke (Mary's Bridge) hanging over Pöllat Gorge for iconic postcard photos.",
          "Tour the opulent Throne Hall and Singer's Hall featuring Richard Wagner opera murals.",
          "Stroll along the shores of alpine Alpsee Lake below the castle."
        ],
        travelTips: "Timed interior guided tour tickets are reserved in advance by GhumoFiroo."
      }
    },
    {
      id: "amsterdam-canals-windmills",
      category: "culture",
      categoryName: "Historic Cities & Canals",
      title: "Amsterdam Canals & Zaanse Schans Windmills",
      description: "Glide along 17th-century UNESCO canal rings, past gabled merchant houses, followed by a visit to historic wooden windmills & cheese farms.",
      image: "/europe/amsterdam_canals.jpg",
      distance: "Amsterdam, Netherlands",
      highlights: ["UNESCO Canal Belt Cruise", "Zaanse Schans Windmills", "Henri Willig Cheese Tasting", "Clog Crafting Demo"],
      details: {
        altitude: "Sea Level",
        bestTime: "April to October | Daytime Tour",
        overview: "Amsterdam is famous for its intricate canal system, narrow gabled townhouses, and rich artistic heritage. Nearby Zaanse Schans offers a living museum of green wooden windmills, clog-making workshops, and Gouda cheese tasting.",
        experiences: [
          "Cruise through Herengracht and Keizersgracht canals on an electric glass-topped boat.",
          "Visit operating 18th-century windmills grinding spices and oil at Zaanse Schans.",
          "Watch a master craftsman hollow out traditional wooden Dutch clogs.",
          "Sample award-winning Dutch Gouda and Edam cheeses at a local farm."
        ],
        travelTips: "Includes Keukenhof Tulip Gardens day trip access during spring season (April-May)."
      }
    },
    {
      id: "prague-old-town-clock",
      category: "heritage",
      categoryName: "Royal Palaces & Castles",
      title: "Prague Old Town & Astronomical Clock",
      description: "Gothic and Baroque fairy-tale city featuring the 600-year-old Astronomical Clock, Charles Bridge statues & Prague Castle complex.",
      image: "/europe/prague_astronomical_clock.jpg",
      distance: "Prague, Czech Republic",
      highlights: ["600-Year-Old Astronomical Clock", "Charles Bridge Statue Walk", "Prague Castle Complex", "Vltava River Cruise"],
      details: {
        altitude: "200 meters",
        bestTime: "May to October | Sunset Hours 6:00 PM",
        overview: "Known as the 'City of a Hundred Spires', Prague survived WWII intact. Its historic heart features cobblestone lanes, red-tiled roofs, and the world's oldest operating Astronomical Clock built in 1410.",
        experiences: [
          "Watch the hourly show of 12 Apostles figures at the medieval Astronomical Clock in Old Town Square.",
          "Stroll across 14th-century Charles Bridge lined with 30 baroque saint statues.",
          "Explore St. Vitus Cathedral and Golden Lane inside the world's largest ancient castle complex.",
          "Enjoy a traditional Czech dinner with Vltava river views."
        ],
        travelTips: "Walking tour shoes are essential for Prague's historic cobblestone streets."
      }
    },
    {
      id: "vienna-schonbrunn-palace",
      category: "heritage",
      categoryName: "Royal Palaces & Castles",
      title: "Vienna Schönbrunn Palace & Classical Opera",
      description: "1,441-room Baroque summer residence of Habsburg monarchs, featuring Gloriette hill gardens, St. Stephen's & Mozart concerts.",
      image: "/europe/vienna_schonbrunn_palace.jpg",
      distance: "Vienna, Austria",
      highlights: ["Schönbrunn Imperial Apartments", "Gloriette Hill Gardens", "St. Stephen's Cathedral", "Mozart & Strauss Concert"],
      details: {
        altitude: "170 meters",
        bestTime: "May to October | Afternoon Visit 2:00 PM",
        overview: "Vienna was the capital of the Austro-Hungarian Empire. Schönbrunn Palace was the summer residence of Emperor Franz Joseph and Empress Sisi. Its manicured French gardens house the world's oldest zoo and the Gloriette archway.",
        experiences: [
          "Tour the luxurious Grand Apartments of Emperor Franz Joseph inside Schönbrunn Palace.",
          "Walk up to the Gloriette hilltop pavilion for panoramic views over Vienna's skyline.",
          "Attend an evening classical orchestra performance playing Mozart and Strauss waltzes.",
          "Savor authentic Viennese Sachertorte chocolate cake at a historic coffeehouse."
        ],
        travelTips: "Imperial Tour tickets with audio guide in English/Hindi are included in GhumoFiroo packages."
      }
    },
    {
      id: "lucerne-chapel-bridge",
      category: "alpine",
      categoryName: "Alpine Nature & Mountains",
      title: "Lucerne Chapel Bridge & Lake Steamer Cruise",
      description: "Picturesque medieval Swiss city set on Lake Lucerne, featuring 14th-century covered Kapellbrücke, Lion Monument & Rigi views.",
      image: "/europe/lucerne_chapel_bridge.jpg",
      distance: "Lucerne, Switzerland",
      highlights: ["Kapellbrücke Wooden Bridge", "Lake Lucerne Steamer Cruise", "Lion Monument Sculpture", "Old Town Frescoes"],
      details: {
        altitude: "436 meters",
        bestTime: "May to October | Afternoon Steamer Cruise",
        overview: "Lucerne is the gateway to Central Switzerland. The covered Kapellbrücke (Chapel Bridge) built in 1333 is Europe's oldest wooden bridge, decorated with 17th-century interior roof paintings.",
        experiences: [
          "Walk across Chapel Bridge and admire historic triangular roof paintings depicting Swiss history.",
          "Board a paddle-steamer boat cruise across Lake Lucerne framed by Mt. Pilatus and Mt. Rigi.",
          "Pay quiet respect at the Dying Lion Monument carved into rock wall in memory of Swiss Guards.",
          "Shop for Swiss watches and chocolates along Schwanenplatz."
        ],
        travelTips: "Swiss Travel Pass permits unlimited free boat rides on Lake Lucerne."
      }
    },
    {
      id: "florence-duomo-ponte-vecchio",
      category: "culture",
      categoryName: "Historic Cities & Canals",
      title: "Florence Duomo & Ponte Vecchio",
      description: "Birthplace of the Italian Renaissance featuring Santa Maria del Fiore red-tiled dome, Uffizi Gallery & Ponte Vecchio gold shops.",
      image: "/europe/florence_duomo.jpg",
      distance: "Tuscany, Italy",
      highlights: ["Brunelleschi's Red Duomo", "Uffizi Gallery Botticelli", "Ponte Vecchio Gold Bridge", "Piazzale Michelangelo View"],
      details: {
        altitude: "50 meters",
        bestTime: "April to October | Sunset at Piazzale Michelangelo",
        overview: "Florence is the capital of Tuscany and birthplace of the Renaissance. Dominating the skyline is Filippo Brunelleschi's terracotta-tiled Duomo dome, built without scaffolding in the 15th century.",
        experiences: [
          "Gaze at the green and white marble facade of Santa Maria del Fiore Cathedral.",
          "Walk across medieval Ponte Vecchio bridge lined with traditional goldsmith shops.",
          "View Michelangelo's original David statue inside the Accademia Gallery.",
          "Watch the sunset over Florence from Piazzale Michelangelo terrace."
        ],
        travelTips: "Reservations to climb Brunelleschi's Dome are secured 30 days prior by GhumoFiroo."
      }
    },
    {
      id: "brussels-grand-place",
      category: "heritage",
      categoryName: "Royal Palaces & Castles",
      title: "Brussels Grand Place & Atomium Sphere",
      description: "UNESCO world heritage central market square lined with gilded 17th-century guildhouses, chocolate ateliers & futuristic Atomium.",
      image: "/europe/brussels_grand_place.jpg",
      distance: "Brussels, Belgium",
      highlights: ["UNESCO Gilded Grand Place", "Atomium 102m Futuristic Sphere", "Belgian Chocolate Tasting", "Manneken Pis Fountain"],
      details: {
        altitude: "13 meters",
        bestTime: "Year-Round | Evening Illumination",
        overview: "Brussels is the seat of the European Union. Grand Place is considered one of the world's most beautiful squares, surrounded by gold-leaf guildhouses, Town Hall, and cobblestone lanes smelling of fresh waffles.",
        experiences: [
          "Marvel at the gold-leaf architectural details of Grand Place illuminated at night.",
          "Ride high-speed escalators inside the 102-meter high steel Atomium sphere.",
          "Taste handmade praline chocolates at Neuhaus and Godiva flagship stores.",
          "Photograph the famous Manneken Pis bronze fountain."
        ],
        travelTips: "Brussels is a convenient 1-hour 20-minute Thalys high-speed train connection from Paris."
      }
    }
  ]

  const filteredAttractions = activeCategory === "all" 
    ? attractions 
    : attractions.filter(item => item.category === activeCategory)

  const faqItems = [
    { id: "eu-faq-1", question: "Does GhumoFiroo provide end-to-end Schengen Visa assistance?", answer: "Yes! Our dedicated Europe visa team manages your entire Schengen visa workflow — document verification, VFS appointment booking, travel insurance, cover letter drafting, and hotel/flight vouchers." },
    { id: "eu-faq-2", question: "What is the typical processing time for a Schengen Visa?", answer: "Standard Schengen visa processing takes 15-20 calendar days after your VFS appointment. We strongly recommend initiating your booking 45-60 days prior to departure." },
    { id: "eu-faq-3", question: "What is the best month to visit Switzerland, Paris & Italy?", answer: "May through September is ideal for pleasant weather, green alpine meadows, and long daylight hours. December through February is perfect for winter snow sports and Christmas markets." }
  ]

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: "Packages", item: "/packages" },
    { name: "Europe Tour Packages", item: "/packages/europe" }
  ])

  const faqSchema = buildFaqJsonLd(faqItems)

  const tripSchema = buildTouristTripJsonLd({
    name: "Europe Luxury Vacation & Schengen Packages 2026",
    description: "Book bespoke Europe tour packages with GhumoFiroo. Includes Schengen visa assistance, 4-star stays, Eurail passes & Indian dining.",
    url: config.baseUrl + "/packages/europe",
    image: config.baseUrl + "/Europe Image New.png",
    duration: "P12D",
    itinerary: [
      { position: 1, name: "Paris Eiffel Tower & Seine Cruise", description: "Guided Paris city tour, Eiffel Tower access & evening Seine river cruise." },
      { position: 2, name: "Swiss Alps & Jungfraujoch", description: "Scenic Eurail train pass to Interlaken, Grindelwald & Top of Europe summit." },
      { position: 3, name: "Venice Canals & Rome Colosseum", description: "Private gondola ride through Venice Grand Canal & guided Roman Forum tour." }
    ],
    offer: {
      priceCurrency: "INR",
      price: "185000",
      includes: "4-star hotels, daily breakfast, Schengen visa assistance, Eurail passes & private transfers"
    },
    aggregateRating: {
      ratingValue: 4.9,
      reviewCount: 420
    }
  })

  return (
    <Layout>
      <SEO 
        title="Europe Tour Packages from India 2026 | Schengen Visa & Luxury Stays"
        description="Book bespoke Europe tour packages from India. Explore Switzerland, France, Italy, Germany, Austria, Netherlands, Belgium & Czech Republic with Schengen visa assistance, 4-star stays & Eurail passes."
        keywords="Europe tour package from India, Schengen visa assistance, Switzerland Paris tour itinerary, Grand Europe 15 days price, Europe holiday for couples, best travel agency Delhi Europe, Paris Switzerland Italy tour"
        canonicalUrl={config.baseUrl + "/packages/europe"}
        structuredData={[breadcrumbSchema, faqSchema, tripSchema]}
      />

      <div className="bg-[#070C1E] text-[#F8FAFC] min-h-screen font-sans">

        {/* HERO SECTION */}
        <ScrollReveal variant="fade-in-scale" duration="slow" className="relative h-[85vh] min-h-[560px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#0B1026]">
            <img 
              src="/Europe Image New.png" 
              alt="Europe Alps Eiffel Tower" 
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_EUROPE_IMG }}
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070C1E]/80 via-[#070C1E]/60 to-[#070C1E] z-10" />
          </div>
          
          <div className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center space-y-6 pt-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-[#C9A25A]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A25A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378]">
                Schengen Visa & Luxury Curated Tours
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-white max-w-4xl leading-tight tracking-tight drop-shadow-2xl">
              Grand Europe Collection 2026
            </h1>
            
            <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
              Switzerland, France, Italy, Austria, Germany, Netherlands, Belgium & Czech Republic — 4-Star Stays, Eurail Passes & Guaranteed Schengen Visa Support.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button 
                size="lg"
                className="px-8 py-6 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-xl shadow-[#C9A25A]/25 transition-all gold-sheen"
                onClick={() => document.getElementById("countries-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Destinations <ArrowRight className="ml-2 h-4 w-4" />
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
                { label: "Guest Rating", val: "4.95 ★", sub: "420+ Europe Travelers" },
                { label: "Visa Support", val: "Schengen 100%", sub: "VFS Appointment Desk" },
                { label: "Iconic Landmarks", val: "12 Highlights", sub: "Eiffel, Titlis & Colosseum" },
                { label: "Meals & Transfers", val: "Indian Food Option", sub: "Eurail & Private Coaches" }
              ].map((stat, i) => (
                <div key={i} className="bg-black/40 border border-white/10 p-3 rounded-xl backdrop-blur-md text-center">
                  <div className="text-sm font-serif font-bold text-[#E5C378]">{stat.val}</div>
                  <div className="text-[10px] text-slate-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* COUNTRIES GRID SECTION */}
        <section id="countries-section" className="py-24 container mx-auto px-6 max-w-7xl">
          <SectionHeading 
            kicker="European Countries" 
            title="Choose Your Dream Destinations" 
            subtitle="Explore our dedicated country hubs featuring multi-day itinerary variants, Eurail connections & hotel options." 
            align="center" 
            className="mx-auto mb-16" 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {countries.map((c, idx) => (
              <ScrollReveal key={idx} variant="fade-in-up" delay={idx * 30}>
                <Link to={c.link} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 block hover:border-[#C9A25A] hover-gold-glow transition-all duration-300">
                  <img 
                    src={c.image} 
                    alt={c.name} 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_EUROPE_IMG }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#E5C378] uppercase tracking-wider block">{c.code} Destination</span>
                      <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#E5C378] transition-colors">{c.name}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-[#C9A25A] group-hover:text-[#070C1E] transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ATTRACTIONS GRID SECTION - ELABORATE SIGHTSEEING GUIDE */}
        <section id="highlights-section" className="py-24 bg-[#050A18] border-y border-[#C9A25A]/15">
          <div className="container mx-auto px-6 max-w-7xl">
            <SectionHeading 
              kicker="In-Depth Sightseeing Guide" 
              title="Iconic European Landmarks Included" 
              subtitle="Explore complete details of world-renowned monuments, alpine peaks & romantic canals included in our Europe tours. Click any card for full details." 
              align="center" 
              className="mx-auto mb-12" 
            />

            {/* CATEGORY FILTER TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {[
                { key: "all", label: "All Highlights (12 Landmarks)" },
                { key: "alpine", label: "Alpine Nature & Mountains" },
                { key: "heritage", label: "Royal Palaces & Castles" },
                { key: "culture", label: "Historic Cities & Canals" }
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
                        alt={item.title} 
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_EUROPE_IMG }}
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
                  <img 
                    src={selectedAttraction.image} 
                    alt={selectedAttraction.title} 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_EUROPE_IMG }}
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
                      <Mountain className="w-3.5 h-3.5 text-[#C9A25A]" /> Location / Altitude: {selectedAttraction.details.altitude}
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
                      <span className="text-xs text-slate-400 block font-light">Schengen Visa & 4-Star Stays Included</span>
                      <span className="text-sm font-serif font-bold text-[#E5C378]">Europe Packages from ₹1,15,000</span>
                    </div>
                    <Button 
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg"
                      onClick={() => {
                        setSelectedAttraction(null)
                        document.getElementById("countries-section")?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      Explore Destinations <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* FAQ SECTION */}
        <section className="py-24 container mx-auto px-6 max-w-4xl">
          <SectionHeading kicker="Travel Assurance" title="Europe Travel FAQ" subtitle="Important details regarding Schengen visa processing, Eurail passes & Indian dining." align="center" className="mx-auto mb-16" />
          <FAQAccordion items={faqItems} />
        </section>

        {/* STICKY CTA */}
        <StickyCTA 
          packageName="Grand Europe Collection 2026"
          priceText="From ₹1,15,000"
          priceSubtext="Guaranteed Schengen Visa Support & 4-Star Stays Included"
          primaryLabel="Proceed to Booking"
          onPrimaryClick={() => navigate("/booking?package=Grand%20Europe%20Collection%2012D11N&price=185000")}
        />
      </div>
    </Layout>
  )
}

export default Europe
