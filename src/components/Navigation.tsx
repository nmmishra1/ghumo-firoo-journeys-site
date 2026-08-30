import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, MessageSquare, MapPin, Compass, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { preloadGuides, preloadBlog } from '@/lib/routePrefetch';
import { prefetchRoute } from '@/utils/routePrefetch';

interface NavigationItem {
  name: string;
  path: string;
  sub?: string;
  badge?: string;
}

interface MainNavigationItem {
  name: string;
  path: string;
  submenu?: NavigationItem[];
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect for navigation background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const navigationItems: MainNavigationItem[] = [
    {
      name: 'Destinations',
      path: '/packages',
      submenu: [
        { name: 'Kashmir Paradise', sub: 'Dal Lake & Gulmarg Gondola', path: '/packages/kashmir-paradise', badge: 'Best Seller' },
        { name: 'Europe Collection', sub: 'Swiss Alps, Paris & Italy', path: '/packages/europe', badge: 'Schengen' },
        { name: 'Singapore & Sentosa', sub: 'Universal & Cruise Combos', path: '/packages/singapore', badge: 'E-Visa' },
        { name: 'Rann Utsav Kutch', sub: 'Tent City & White Desert', path: '/packages/rann-utsav', badge: 'Festival' },
        { name: 'Char Dham Yatra', sub: 'Helicopter & Road Pilgrimage', path: '/packages/char-dham-yatra', badge: 'Sacred' },
        { name: 'All Destinations', sub: 'Explore 50+ Curated Trips', path: '/packages', badge: 'All' }
      ]
    },
    {
      name: 'Luxury Packages',
      path: '/packages',
      submenu: [
        { name: 'Char Dham Helicopter Charter', sub: '6D/5N VIP Dehradun Charter', path: '/packages/char-dham-yatra' },
        { name: 'Grand Europe 15-Day Tour', sub: 'France, Swiss, Italy & Germany', path: '/packages/europe' },
        { name: 'Tent City Dhordo Rann Retreat', sub: '3D/2N White Desert Package', path: '/packages/rann-utsav' },
        { name: 'Singapore Sentosa & Cruise', sub: 'Universal Studios & Genting Cruise', path: '/packages/singapore' },
        { name: 'Kashmir Houseboat & Gondola', sub: '6D/5N Dal Lake & Gulmarg', path: '/packages/kashmir-paradise' },
        { name: 'Custom Bespoke Packages', sub: 'Craft your tailored trip', path: '/custom-tour-packages' }
      ]
    },
    { name: 'Explore India', path: '/explore-india' },
    { name: 'The Experience', path: '/custom-tour-packages' },
    { name: 'Concierge', path: '/enquire-now' },
    { name: 'Blogs', path: '/blog' }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleMouseEnter = (itemName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(itemName);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 220);
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-500 border-b ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#070C1E]/95 backdrop-blur-2xl border-gray-200/40 dark:border-[#C9A25A]/20 shadow-glass-lg h-16'
          : 'bg-white/98 dark:bg-[#070C1E]/98 border-gray-100 dark:border-white/10 shadow-sm h-20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg" aria-label="Ghumo Firoo Home">
                <img
                  className="h-10 md:h-12 w-auto transition-all duration-300 hover:scale-105 dark:brightness-110 filter drop-shadow-md"
                  src="/ghumo-firoo-logo.png"
                  alt="Ghumo Firoo Travels"
                  loading="eager"
                  decoding="async"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
              {navigationItems.map((item) => (
                <div
                  key={item.name}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => item.submenu && handleMouseEnter(item.name)}
                  onMouseLeave={() => item.submenu && handleMouseLeave()}
                >
                  {item.submenu ? (
                    <div className="relative py-4">
                      <button
                        onClick={() => navigate(item.path)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none cursor-pointer ${
                          isActivePath(item.path) || activeDropdown === item.name
                            ? 'text-[#C9A25A] dark:text-[#E5C378] font-bold'
                            : 'text-gray-700 dark:text-gray-200 hover:text-[#C9A25A] dark:hover:text-[#E5C378]'
                        }`}
                        aria-expanded={activeDropdown === item.name}
                      >
                        {item.name}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          activeDropdown === item.name ? 'rotate-180 text-[#C9A25A]' : 'text-gray-400'
                        }`} />
                      </button>

                      {/* Dropdown Menu Container with Hover Bridge */}
                      <div 
                        onMouseEnter={() => {
                          if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                            timeoutRef.current = null;
                          }
                        }}
                        onMouseLeave={handleMouseLeave}
                        className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[380px] z-50 transform transition-all duration-200 ${
                          activeDropdown === item.name
                            ? 'opacity-100 visible translate-y-0 scale-100'
                            : 'opacity-0 invisible -translate-y-2 scale-95 pointer-events-none'
                        }`}
                      >
                        {/* Invisible hover bridge connecting button to dropdown */}
                        <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent" />

                        <div className="bg-white dark:bg-[#0B1226] border border-gray-200 dark:border-[#C9A25A]/30 rounded-2xl shadow-2xl p-3">
                          <div className="space-y-1">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.name}
                                to={subItem.path}
                                onMouseEnter={() => prefetchRoute(subItem.path)}
                                onFocus={() => prefetchRoute(subItem.path)}
                                className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 border border-transparent hover:border-[#C9A25A]/30 transition-all flex items-center justify-between group text-left"
                              >
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white text-xs group-hover:text-[#C9A25A] dark:group-hover:text-[#E5C378] transition-colors flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#C9A25A]" /> {subItem.name}
                                  </div>
                                  {subItem.sub && <div className="text-[10px] text-gray-500 dark:text-slate-300 font-light pl-5">{subItem.sub}</div>}
                                </div>
                                {subItem.badge && (
                                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#C9A25A]/15 text-[#C9A25A] dark:text-[#E5C378] font-bold border border-[#C9A25A]/30">
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      onMouseEnter={() => prefetchRoute(item.path)}
                      onFocus={() => prefetchRoute(item.path)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${
                        isActivePath(item.path)
                          ? 'text-[#C9A25A] dark:text-[#E5C378] font-bold'
                          : 'text-gray-700 dark:text-gray-200 hover:text-[#C9A25A] dark:hover:text-[#E5C378]'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              
              <a 
                href="tel:+919910987264" 
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 hover:bg-gray-50/50 dark:hover:bg-white/5"
              >
                <Phone className="w-3.5 h-3.5 text-[#C9A25A] animate-pulse" />
                <span className="text-gray-700 dark:text-gray-200">+91 9910987264</span>
              </a>

              <Link to="/custom-tour-packages">
                <Button className="bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold shadow-md hover:scale-105 active:scale-95 transition-all duration-300 rounded-full px-5 py-2 text-xs border-0 uppercase tracking-wider">
                  Plan My Trip
                </Button>
              </Link>
            </div>

            {/* Mobile menu triggers */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <a 
                href="tel:+919910987264" 
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-accent transition-colors duration-200"
                aria-label="Call Expert"
              >
                <Phone className="w-5 h-5 text-[#C9A25A] animate-pulse" />
              </a>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-accent hover:bg-gray-50/50 dark:hover:bg-white/5"
                aria-expanded={isMenuOpen}
                aria-label="Toggle main menu"
              >
                {isMenuOpen ? <X className="h-6 w-6 text-[#C9A25A]" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Panel */}
          <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? 'max-h-[90vh] opacity-100 border-t border-gray-100 dark:border-white/10 mt-2' : 'max-h-0 opacity-0 pointer-events-none'
          }`}>
            <div className="px-3 pt-3 pb-6 space-y-2 bg-white dark:bg-[#070C1E] rounded-2xl shadow-glass-lg border border-gray-100 dark:border-white/10 max-h-[75vh] overflow-y-auto">
              {navigationItems.map((item) => (
                <div key={item.name} className="space-y-1">
                  {item.submenu ? (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-bold text-[#C9A25A] dark:text-[#E5C378] uppercase tracking-wider border-b border-gray-100 dark:border-white/10 mb-1">
                        {item.name}
                      </div>
                      <div className="space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className="block p-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-[#C9A25A] hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="flex justify-between items-center">
                              <span>{subItem.name}</span>
                              {subItem.badge && <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#C9A25A]/15 text-[#C9A25A] dark:text-[#E5C378] font-bold">{subItem.badge}</span>}
                            </div>
                            {subItem.sub && <div className="text-[9px] text-gray-400 dark:text-slate-400 font-light mt-0.5">{subItem.sub}</div>}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`block px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        isActivePath(item.path) 
                          ? 'text-[#C9A25A] dark:text-[#E5C378] bg-gray-50 dark:bg-white/5' 
                          : 'text-gray-700 dark:text-gray-200 hover:text-[#C9A25A] hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-4 px-2">
                <Link to="/custom-tour-packages" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold shadow-md rounded-full py-3 text-xs uppercase tracking-wider">
                    Plan My Trip
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#070C1E]/95 border-t border-gray-200/50 dark:border-white/10 py-3 px-4 shadow-glass-lg backdrop-blur-xl flex gap-3 pb-safe-bottom">
        <a 
          href="tel:+919910987264" 
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-bold text-xs bg-white dark:bg-[#0B1226] shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
        >
          <Phone className="w-3.5 h-3.5 text-[#C9A25A]" />
          Call Expert
        </a>
        <a 
          href="https://wa.me/919910987264?text=Hi,%20I'm%20interested%20in%20planning%20a%20trip%20with%20Ghumo%20Firoo%20Travels." 
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#070C1E]" />
          WhatsApp Us
        </a>
      </div>
    </>
  );
};

export default Navigation;
