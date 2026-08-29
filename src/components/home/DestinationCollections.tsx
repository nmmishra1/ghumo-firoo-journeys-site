import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import LazyImage from '@/components/ui/LazyImage';
import { supabase } from '@/integrations/supabase/client';

interface PackageRow {
  id: string;
  name: string;
  price: number | null;
}

interface DestinationCardData {
  name: string;
  slug: string;
  image: string;
  packageCount: number;
  startingPrice: number;
  bestSeason: string;
}

const PRIORITY_DESTINATIONS = [
  // India
  'Rann Utsav', 'Char Dham', 'Kashmir', 'Leh Ladakh', 'Kerala', 'Goa', 'Rajasthan', 'Andaman', 'North East', 'Himachal', 'Uttarakhand',
  // International
  'Dubai', 'Singapore', 'Thailand', 'Bali', 'Maldives', 'Vietnam', 'Europe', 'Turkey', 'Japan', 'Switzerland'
];

const DESTINATION_META: Record<string, { image: string; bestSeason: string }> = {
  'Rann Utsav': { image: '/Rann-Utsav-Gujarat.png', bestSeason: 'Nov-Feb' },
  'Char Dham': { image: '/Kedarnath.png', bestSeason: 'May-Oct' },
  'Kashmir': { image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=800', bestSeason: 'Mar-Oct' },
  'Leh Ladakh': { image: 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?q=80&w=800', bestSeason: 'Jun-Sep' },
  'Kerala': { image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800', bestSeason: 'Sep-Mar' },
  'Goa': { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', bestSeason: 'Nov-Feb' },
  'Rajasthan': { image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800', bestSeason: 'Oct-Mar' },
  'Andaman': { image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800', bestSeason: 'Oct-May' },
  'North East': { image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?q=80&w=800', bestSeason: 'Oct-Apr' },
  'Himachal': { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800', bestSeason: 'Mar-Jun' },
  'Uttarakhand': { image: 'https://images.unsplash.com/photo-1549492423-400259a2e57f?q=80&w=800', bestSeason: 'Apr-Jun' },
  'Dubai': { image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800', bestSeason: 'Nov-Apr' },
  'Singapore': { image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800', bestSeason: 'Year-round' },
  'Thailand': { image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800', bestSeason: 'Nov-Apr' },
  'Bali': { image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=800', bestSeason: 'Apr-Oct' },
  'Maldives': { image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800', bestSeason: 'Nov-Apr' },
  'Vietnam': { image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800', bestSeason: 'Nov-Apr' },
  'Europe': { image: '/Europe Image New.png', bestSeason: 'May-Sep' },
  'Turkey': { image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800', bestSeason: 'Apr-Oct' },
  'Japan': { image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800', bestSeason: 'Mar-May' },
  'Switzerland': { image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=800', bestSeason: 'Jun-Oct' },
};

const fallbackPackages: Omit<PackageRow, 'id'>[] = [
  { name: 'Rann Utsav Luxury Tent Experience', price: 15999 },
  { name: 'Rann Utsav Deluxe Swiss Tents', price: 9999 },
  { name: 'Char Dham Yatra Holy Pilgrimage', price: 35999 },
  { name: 'Grand Europe Highlights Tour', price: 125999 },
  { name: 'Bali Paradise Honeymoon Getaway', price: 48000 },
  { name: 'Singapore City Delight Tour', price: 59999 },
  { name: 'Kashmir Paradise Package', price: 25000 },
  { name: 'Leh Ladakh Bike Tour Adventure', price: 32000 },
  { name: 'Goa Beach Holiday Package', price: 12000 },
  { name: 'Dubai Delights Package', price: 45000 },
  { name: 'Thailand Tropical Getaway', price: 24999 }
];

const DestinationCollections: React.FC = () => {
  const [destinations, setDestinations] = useState<DestinationCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  useEffect(() => {
    const fetchPackagesAndGroup = async () => {
      try {
        setLoading(true);
        let dbPackages = null;
        try {
          const res = await fetch('/php-backend/packages.php');
          if (res.ok) {
            dbPackages = await res.json();
          }
        } catch (e) {
          console.error('Fetch packages error:', e);
        }

        // Use database packages if present, otherwise use local fallback packages
        const hasDbData = dbPackages && dbPackages.length > 0;
        const sourcePackages = hasDbData ? dbPackages : fallbackPackages;
        setIsUsingFallback(!hasDbData);

        // Group packages by destination name
        const destinationMap: Record<string, { count: number; prices: number[] }> = {};

        sourcePackages.forEach((pkg) => {
          if (!pkg.name) return;
          
          let matchedDest = '';
          const nameLower = pkg.name.toLowerCase();

          // Try to match one of our priority destinations
          for (const dest of PRIORITY_DESTINATIONS) {
            if (nameLower.includes(dest.toLowerCase())) {
              matchedDest = dest;
              break;
            }
          }

          // Fallback matching if no priority matches
          if (!matchedDest) {
            const cleanName = pkg.name.replace(/[^a-zA-Z\s]/g, '').trim();
            const words = cleanName.split(/\s+/);
            if (words.length > 0 && words[0].length > 3) {
              matchedDest = words[0];
            } else {
              matchedDest = 'Other';
            }
          }

          if (!destinationMap[matchedDest]) {
            destinationMap[matchedDest] = { count: 0, prices: [] };
          }
          
          destinationMap[matchedDest].count += 1;
          if (pkg.price) {
            destinationMap[matchedDest].prices.push(Number(pkg.price));
          }
        });

        // Map grouped packages to destination card data
        const cardDataList: DestinationCardData[] = Object.keys(destinationMap).map((destName) => {
          const stats = destinationMap[destName];
          const meta = DESTINATION_META[destName] || {
            image: `https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800`,
            bestSeason: 'Year-round'
          };
          
          const startingPrice = stats.prices.length > 0 ? Math.min(...stats.prices) : 9999;
          const slug = destName.toLowerCase().replace(/\s+/g, '-');

          return {
            name: destName,
            slug,
            image: meta.image,
            packageCount: stats.count,
            startingPrice,
            bestSeason: meta.bestSeason
          };
        });

        // Filter out destinations having 0 packages and sort by package count descending
        const activeDestinations = cardDataList.filter(d => d.packageCount > 0)
          .sort((a, b) => b.packageCount - a.packageCount);

        setDestinations(activeDestinations);
      } catch (err) {
        console.error('Error grouping destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackagesAndGroup();
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-[#0B1026] to-[#050814] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            Curated Collections
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Explore <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Top Destinations</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
            Handpicked journeys across India and the world.
          </p>
          
          {isUsingFallback && (
            <div className="inline-flex items-center gap-2 bg-accent/5 border border-accent/20 text-accent/80 px-4.5 py-2 rounded-2xl text-xs font-semibold mt-2 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Preview Mode: Showing default curated destinations. Admin packages added to the database will automatically display here.</span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-bold tracking-wider">Syncing destinations...</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-20 bg-[#1A2342]/40 rounded-3xl border border-white/5">
            <p className="text-slate-400 font-bold">No active packages found in the database.</p>
            <p className="text-slate-500 text-sm mt-1">Please insert rows in the packages database table to generate destinations.</p>
          </div>
        ) : (
          /* Cards Grid: Responsive sizes: Mobile: 1, Tablet: 2, Laptop: 3, Desktop: 4 */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {destinations.map((dest) => (
              <Link 
                key={dest.name} 
                to={`/destinations/${dest.slug}`}
                className="group relative rounded-[24px] overflow-hidden shadow-2xl aspect-[3/4] block bg-[#1A2342] border border-white/5 hover:border-accent hover:shadow-[0_0_30px_rgba(201,162,90,0.35)] hover:-translate-y-3 transition-all duration-500"
              >
                {/* Destination Hero Image */}
                <div className="absolute inset-0 overflow-hidden">
                  <LazyImage
                    src={dest.image}
                    alt={`${dest.name} hero`}
                    className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 opacity-50 group-hover:opacity-70"
                  />
                </div>

                {/* Dark Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent"></div>

                {/* Best Season Badge */}
                <div className="absolute top-4 right-4 bg-slate-950/70 backdrop-blur-md text-accent border border-accent/20 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                  ☀️ {dest.bestSeason}
                </div>

                {/* Glassmorphism Card Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-950/80 backdrop-blur-lg border-t border-white/10 rounded-b-[24px] flex flex-col gap-2 transition-all duration-500 group-hover:bg-slate-950/90">
                  {/* Destination Name */}
                  <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-accent transition-colors duration-300">
                    {dest.name}
                  </h3>

                  {/* Number of Packages */}
                  <span className="text-[11px] font-extrabold text-accent tracking-wider uppercase">
                    {dest.packageCount} {dest.packageCount === 1 ? 'Package' : 'Packages'} Available
                  </span>

                  {/* Starting Price and Best Travel Season */}
                  <div className="flex flex-col gap-1.5 pt-2.5 border-t border-white/5 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-200">
                        Starting ₹{dest.startingPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Best Season: {dest.bestSeason}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-accent group-hover:text-accent transition-colors">
                      View Packages <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DestinationCollections;
