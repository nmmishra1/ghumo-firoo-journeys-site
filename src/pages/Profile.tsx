import React from 'react';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, Calendar, FileText, Phone, Sparkles, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';

const Profile = () => {
  return (
    <Layout>
      <SEO
        title="Traveler Profile | Ghumo Firoo Travels"
        description="Access your Ghumo Firoo traveler profile, manage booked holiday packages, check itinerary vouchers, and update your personal travel preferences."
        canonicalUrl="https://ghumofiroo.com/profile/"
        url="https://ghumofiroo.com/profile/"
        keywords="Ghumo Firoo profile, traveler account, holiday booking status, download tour voucher, travel concierge, Ghumo Firoo guest portal"
      />

      <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Guest Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ghumo Firoo Traveler Profile
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Manage your vacation itineraries, download confirmed hotel vouchers, and connect with your dedicated 24x7 holiday concierge.
            </p>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/80 border-slate-800 text-slate-100 hover:border-amber-500/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-white">Active Itineraries</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Review day-wise trip schedules, hotel check-ins, and chauffeur pickup details.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold border-slate-700 hover:border-amber-500/50 hover:text-amber-400">
                  <Link to="/packages">
                    Explore Packages <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 text-slate-100 hover:border-amber-500/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-white">Booking Vouchers</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Access digital vouchers, payment receipts, and mandatory state yatra permits.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold border-slate-700 hover:border-blue-500/50 hover:text-blue-400">
                  <Link to="/booking">
                    Booking Desk <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 text-slate-100 hover:border-amber-500/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                  <Phone className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-white">24x7 Concierge</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Need on-trip assistance or itinerary changes? Our travel desk is live 24 hours daily.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400">
                  <Link to="/contact">
                    Contact Desk <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Account Status Information Box */}
          <Card className="bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-2xl shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-extrabold text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Traveler Account Portal</h2>
                  <p className="text-xs text-slate-400">Manage trip preferences & custom quote requests</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4" /> Verified Guest Access
              </div>
            </div>

            <div className="pt-6 space-y-4 text-xs sm:text-sm text-slate-300">
              <p>
                Welcome to your Ghumo Firoo guest portal. If you have recently requested a custom quotation or confirmed a holiday booking for Char Dham Yatra, Rann Utsav Tent City, Kashmir, or International circuits, your dedicated holiday manager will share all real-time itinerary updates and payment receipts directly to your registered WhatsApp number and email.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Registered Travel Desk</span>
                  <p className="text-white font-semibold">Ghumo Firoo Travels, Munirka, New Delhi</p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Direct Reservation Line</span>
                  <p className="text-white font-semibold">+91 99109 87264 (24x7 WhatsApp & Call)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-3 items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Ready to design your next journey?</span>
              <div className="flex gap-2">
                <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold">
                  <Link to="/enquire-now">Plan New Holiday</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-slate-400 hover:text-white">
                  <Link to="/">Return to Home</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
