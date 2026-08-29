import * as React from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Menu, X, Search, Phone, Sparkles, Shield, Star, Users, ChevronDown, MapPin, Compass, Award, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface NavbarShellProps extends React.HTMLAttributes<HTMLElement> {
  logoText?: string
}

export function NavbarShell({ logoText = "GhumoFiroo", className, ...props }: NavbarShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [navSearch, setNavSearch] = React.useState('')
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile drawer on route change
  React.useEffect(() => {
    setIsOpen(false)
    setActiveDropdown(null)
  }, [location.pathname])

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (navSearch.trim()) {
      navigate(`/packages?search=${encodeURIComponent(navSearch.trim())}`)
      setIsOpen(false)
    }
  }

  const destinationItems = [
    { name: "Kashmir Paradise", sub: "Dal Lake & Gulmarg Gondola", path: "/packages/kashmir-paradise", badge: "Best Seller" },
    { name: "Europe Collection", sub: "Swiss Alps, Paris & Italy", path: "/packages/europe", badge: "Schengen" },
    { name: "Singapore & Sentosa", sub: "Universal & Cruise Combos", path: "/packages/singapore", badge: "E-Visa" },
    { name: "Rann Utsav Kutch", sub: "Tent City & White Desert", path: "/packages/rann-utsav", badge: "Festival" },
    { name: "Char Dham Yatra", sub: "Helicopter & Road Pilgrimage", path: "/packages/char-dham-yatra", badge: "Sacred" },
    { name: "Explore All Destinations", sub: "Discover 50+ Curated Trips", path: "/packages", badge: "All" }
  ]

  const packageItems = [
    { name: "Char Dham Helicopter Charter", sub: "6D/5N VIP Dehradun Charter", path: "/packages/char-dham-yatra" },
    { name: "Grand Europe 15-Day Tour", sub: "France, Swiss, Italy & Germany", path: "/packages/europe" },
    { name: "Tent City Dhordo Rann Retreat", sub: "3D/2N White Desert Package", path: "/packages/rann-utsav" },
    { name: "Singapore Sentosa & Cruise", sub: "Universal Studios & Genting Cruise", path: "/packages/singapore" },
    { name: "Kashmir Houseboat & Gondola", sub: "6D/5N Dal Lake & Gulmarg", path: "/packages/kashmir-paradise" },
    { name: "Bespoke Custom Itinerary", sub: "Craft your tailored trip", path: "/custom-tour-packages" }
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-sans",
        className
      )}
      {...props}
    >


      {/* Main Navbar Navigation */}
      <div
        className={cn(
          "transition-all duration-300 px-6",
          isScrolled
            ? "bg-[#070C1E]/95 backdrop-blur-2xl border-b border-[#C9A25A]/25 shadow-2xl py-3"
            : "bg-gradient-to-b from-[#070C1E]/95 via-[#070C1E]/80 to-[#070C1E]/40 backdrop-blur-md py-4"
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center cursor-pointer group">
            <img
              className="h-10 md:h-12 w-auto transition-transform duration-300 hover:scale-105 filter drop-shadow-md brightness-110"
              src="/ghumo-firoo-logo.png"
              alt="Ghumo Firoo Travels"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.18em] text-white/90">
            
            {/* 1. DESTINATIONS DROPDOWN */}
            <div 
              className="relative py-2"
              onMouseEnter={() => setActiveDropdown('destinations')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => navigate('/packages')}
                className="flex items-center gap-1.5 hover:text-[#E5C378] transition-colors relative py-1 focus:outline-none"
              >
                <span>Destinations</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300 text-[#C9A25A]", activeDropdown === 'destinations' ? "rotate-180 text-[#E5C378]" : "")} />
              </button>

              {/* Mega Dropdown Card */}
              <div className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] bg-[#0B1226]/95 border border-[#C9A25A]/30 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 z-50 text-left normal-case tracking-normal",
                activeDropdown === 'destinations' ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
              )}>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-3 px-2 flex justify-between items-center border-b border-white/10 pb-2">
                  <span>Curated Collection Hubs</span>
                  <span className="text-white/40">5 Key Destinations</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {destinationItems.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      className="p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-[#C9A25A]/30 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-white text-xs group-hover:text-[#E5C378] transition-colors flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C9A25A]" /> {item.name}
                        </div>
                        <div className="text-[10px] text-slate-300 font-light pl-5">{item.sub}</div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#C9A25A]/15 text-[#E5C378] font-semibold border border-[#C9A25A]/30">
                        {item.badge}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. LUXURY PACKAGES DROPDOWN */}
            <div 
              className="relative py-2"
              onMouseEnter={() => setActiveDropdown('packages')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => navigate('/packages')}
                className="flex items-center gap-1.5 hover:text-[#E5C378] transition-colors relative py-1 focus:outline-none"
              >
                <span>Luxury Packages</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300 text-[#C9A25A]", activeDropdown === 'packages' ? "rotate-180 text-[#E5C378]" : "")} />
              </button>

              {/* Mega Dropdown Card */}
              <div className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] bg-[#0B1226]/95 border border-[#C9A25A]/30 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 z-50 text-left normal-case tracking-normal",
                activeDropdown === 'packages' ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
              )}>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] mb-3 px-2 flex justify-between items-center border-b border-white/10 pb-2">
                  <span>Signature Itineraries</span>
                  <span className="text-white/40">VIP Travel</span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {packageItems.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      className="p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-[#C9A25A]/30 transition-all flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-white text-xs group-hover:text-[#E5C378] transition-colors flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#C9A25A]" /> {item.name}
                        </div>
                        <div className="text-[10px] text-slate-300 font-light pl-5">{item.sub}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. THE EXPERIENCE */}
            <Link to="/custom-tour-packages" className="hover:text-[#E5C378] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#C9A25A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform duration-300">
              The Experience
            </Link>

            {/* 4. CONCIERGE */}
            <Link to="/enquire-now" className="hover:text-[#E5C378] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#C9A25A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform duration-300">
              Concierge
            </Link>

          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">

            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold tracking-wider text-[#E5C378] border-[#C9A25A]/50 hover:border-[#C9A25A] hover:bg-[#C9A25A]/10 bg-black/40 rounded-full px-5 py-2"
              onClick={() => navigate('/enquire-now')}
            >
              Connect Expert
            </Button>

            <Button
              size="sm"
              className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] hover:brightness-110 shadow-lg shadow-[#C9A25A]/25 rounded-full px-6 py-2"
              onClick={() => navigate('/custom-tour-packages')}
            >
              Book Journey
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-6 w-6 text-[#C9A25A]" /> : <Menu className="h-6 w-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          "fixed inset-x-0 top-[88px] bottom-0 bg-[#070C1E]/98 backdrop-blur-2xl z-40 transition-all duration-300 flex flex-col px-6 py-8 lg:hidden border-t border-[#C9A25A]/20 overflow-y-auto",
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-4 text-sm font-semibold tracking-wide">
          
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A25A] border-b border-white/10 pb-2">
            Explore Collection Hubs
          </div>

          <div className="grid grid-cols-1 gap-2">
            {destinationItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-white hover:border-[#C9A25A]/40"
              >
                <div>
                  <div className="font-bold text-xs text-white">{item.name}</div>
                  <div className="text-[10px] text-slate-300 font-light">{item.sub}</div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#C9A25A]/15 text-[#E5C378] font-bold">
                  {item.badge}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <Link
              to="/custom-tour-packages"
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[#C9A25A] py-2.5 px-3 bg-white/5 rounded-xl border border-white/10 font-bold text-xs"
            >
              The Experience (Bespoke Travel)
            </Link>
            <Link
              to="/enquire-now"
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-[#C9A25A] py-2.5 px-3 bg-white/5 rounded-xl border border-white/10 font-bold text-xs"
            >
              Concierge & Travel Advisor
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleNavSearch} className="relative mt-6">
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Search destinations, packages..."
            className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-white/50 border border-white/20 focus:border-[#C9A25A] rounded-full focus:outline-none text-xs"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
        </form>

        {/* Mobile Actions */}
        <div className="mt-8 flex flex-col gap-3 pb-8">
          <Button
            variant="outline"
            className="w-full py-5 gap-2 text-xs justify-center text-[#E5C378] border-[#C9A25A]/50 bg-black/40 rounded-full font-bold uppercase tracking-wider"
            onClick={() => { setIsOpen(false); navigate('/enquire-now'); }}
          >
            <Phone className="h-4 w-4 text-[#C9A25A]" /> Speak with Travel Designer
          </Button>
          <Button
            className="w-full py-5 gap-2 text-xs justify-center bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold rounded-full shadow-lg uppercase tracking-wider"
            onClick={() => { setIsOpen(false); navigate('/custom-tour-packages'); }}
          >
            <Sparkles className="h-4 w-4" /> Plan My Custom Trip
          </Button>
        </div>
      </div>
    </header>
  )
}
