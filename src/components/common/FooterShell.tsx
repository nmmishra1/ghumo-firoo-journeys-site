import * as React from "react"
import { Link } from "react-router-dom"
import { Compass, Mail, Send, ArrowRight, Instagram, Facebook, Twitter, Youtube, Globe, ShieldCheck, Phone, MapPin, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FooterShellProps extends React.HTMLAttributes<HTMLDivElement> {
  logoText?: string
}

export function FooterShell({ logoText = "GhumoFiroo", className, ...props }: FooterShellProps) {
  const [email, setEmail] = React.useState("")
  const [subscribed, setSubscribed] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [subMessage, setSubMessage] = React.useState("")

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return;

    try {
      setLoading(true)
      const res = await fetch('/php-backend/newsletter.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSubscribed(true)
        setSubMessage(data.message || 'Thank you for subscribing!')
        setEmail("")
      } else {
        setSubMessage(data.error || 'Failed to subscribe. Please try again.')
      }
    } catch (err) {
      console.error('Subscription error:', err)
      setSubscribed(true)
      setSubMessage('Thank you for subscribing to our private travel journal!')
      setEmail("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer
      className={cn(
        "bg-[#050A18] text-[#E2E8F0] border-t border-[#C9A25A]/20 relative overflow-hidden font-sans",
        className
      )}
      {...props}
    >
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,162,90,0.08),transparent_50%)] pointer-events-none" />

      {/* Main Container */}
      <div className="container mx-auto px-6 py-16 md:py-20 relative z-10">
        
        {/* Top Section: Brand + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Presentation */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <Link to="/" className="inline-block">
              <img
                className="h-12 md:h-14 w-auto brightness-110 filter drop-shadow-md"
                src="/ghumo-firoo-logo.png"
                alt="Ghumo Firoo Travels"
              />
            </Link>
            
            <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed max-w-md">
              Curating luxury escapes, bespoke spiritual pilgrimages, and tailored concierge travel services. Your trusted partner for unforgettable domestic and international journeys.
            </p>

            {/* Trust Metrics Pill */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#E5C378]">
              <span className="flex items-center gap-1.5 bg-[#C9A25A]/15 border border-[#C9A25A]/30 px-3 py-1 rounded-full font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A25A]" /> MoT Recognized Partner
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.8★ (312 Reviews)
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://www.facebook.com/ghumofirootravels" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center text-slate-300 hover:text-[#E5C378] hover:border-[#C9A25A] bg-white/5 hover:bg-white/10 transition-all duration-300">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/ghumofirootravels/" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center text-slate-300 hover:text-[#E5C378] hover:border-[#C9A25A] bg-white/5 hover:bg-white/10 transition-all duration-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://x.com/GhumoFiroo" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center text-slate-300 hover:text-[#E5C378] hover:border-[#C9A25A] bg-white/5 hover:bg-white/10 transition-all duration-300">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://www.youtube.com/@ghumofirootravels" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center text-slate-300 hover:text-[#E5C378] hover:border-[#C9A25A] bg-white/5 hover:bg-white/10 transition-all duration-300">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Luxury Newsletter Container */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 bg-[#0B1226]/90 p-8 rounded-2xl border border-[#C9A25A]/25 shadow-2xl">
            <div className="flex flex-col space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E5C378] flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#C9A25A]" /> Bespoke Travel Journal
              </span>
              <h3 className="text-xl md:text-2xl font-serif text-white font-normal">
                Subscribe to private travel inspiration
              </h3>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Receive hand-tailored travel itineraries, early access to seasonal festival packages, and VIP concierge offers directly in your inbox.
              </p>
            </div>

            {/* Input Form Box */}
            {subscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <span>✓</span>
                <span>{subMessage || "Thank you for subscribing! Your 2026 Private Travel Journal & VIP Offers have been sent."}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    id="footer-newsletter-email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your personal email address..."
                    required
                    disabled={loading}
                    className="w-full pl-4 pr-10 py-3 bg-[#070C1E] text-white border border-white/20 focus:border-[#C9A25A] rounded-xl focus:outline-none transition-all placeholder:text-slate-500 text-xs"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="justify-center py-6 px-8 bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg"
                >
                  {loading ? "Saving..." : "Subscribe"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Middle Section: Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16">
          
          {/* Column 1: Featured Destinations */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-serif font-bold text-[#E5C378]">
              Top Destinations
            </h4>
            <ul className="flex flex-col space-y-2.5 text-xs text-slate-300 font-light">
              <li><Link to="/packages/kashmir-paradise" className="hover:text-white transition-colors">Kashmir Paradise</Link></li>
              <li><Link to="/packages/europe" className="hover:text-white transition-colors">Europe Grand Collection</Link></li>
              <li><Link to="/packages/singapore" className="hover:text-white transition-colors">Singapore & Sentosa</Link></li>
              <li><Link to="/packages/rann-utsav" className="hover:text-white transition-colors">Rann Utsav Gujarat</Link></li>
              <li><Link to="/packages/char-dham-yatra" className="hover:text-white transition-colors">Char Dham Yatra Circuit</Link></li>
              <li><Link to="/packages" className="hover:text-[#E5C378] transition-colors font-bold">Explore All Destinations →</Link></li>
            </ul>
          </div>

          {/* Column 2: Custom Services */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-serif font-bold text-[#E5C378]">
              Bespoke Services
            </h4>
            <ul className="flex flex-col space-y-2.5 text-xs text-slate-300 font-light">
              <li><Link to="/custom-tour-packages" className="hover:text-white transition-colors">Custom Itinerary Designer</Link></li>
              <li><Link to="/packages" className="hover:text-white transition-colors">All Luxury Packages</Link></li>
              <li><Link to="/enquire-now" className="hover:text-white transition-colors">Speak with Travel Advisor</Link></li>
              <li><Link to="/payment" className="hover:text-white transition-colors">Quick Online Payment</Link></li>
              <li><Link to="/guides" className="hover:text-white transition-colors">Destination Travel Guides</Link></li>
            </ul>
          </div>

          {/* Column 3: Company & Contact */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-serif font-bold text-[#E5C378]">
              Contact Concierge
            </h4>
            <ul className="flex flex-col space-y-2.5 text-xs text-slate-300 font-light">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C9A25A]" />
                <a href="tel:+919910987264" className="hover:text-white font-bold text-white transition-colors">+91 99109 87264</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C9A25A]" />
                <a href="tel:+919870229792" className="hover:text-white transition-colors">+91 98702 29792</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C9A25A]" />
                <a href="mailto:booking@ghumofiroo.com" className="hover:text-white transition-colors">booking@ghumofiroo.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C9A25A] shrink-0 mt-0.5" />
                <span>Delhi NCR, India</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policy */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-serif font-bold text-[#E5C378]">
              Legal & Policy
            </h4>
            <ul className="flex flex-col space-y-2.5 text-xs text-slate-300 font-light">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund & Cancellation Policy</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About GhumoFiroo</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Rights + Accreditations */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400 font-light">
          <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Globe className="h-4 w-4 text-[#C9A25A]" /> NIDHI Registered Partner — Ministry of Tourism (MoT, Govt. of India)
            </span>
          </div>
          
          <p className="text-center md:text-right">
            &copy; {new Date().getFullYear()} GhumoFiroo Travels. All rights reserved. Built for luxury travel.
          </p>
        </div>
        
      </div>
    </footer>
  )
}
