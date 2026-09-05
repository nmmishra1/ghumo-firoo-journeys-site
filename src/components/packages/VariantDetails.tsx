import React from 'react';
import { PackageVariant } from './PackageVariantSelector';
import { InclusionsExclusions } from '@/components/shared/InclusionsExclusions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building2, Compass, CheckCircle, PlusCircle, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';
import PremiumTimeline from './PremiumTimeline';

interface VariantDetailsProps {
  variant: PackageVariant;
}

export const VariantDetails: React.FC<VariantDetailsProps> = ({ variant }) => {
  const includedExcursions = variant.excursions.filter((e) => e.included);
  const optionalExcursions = variant.excursions.filter((e) => !e.included);

  return (
    <div className="space-y-10 my-10">
      {/* A. Inclusions & Exclusions */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#C9A25A]" />
          Inclusions & Exclusions ({variant.label})
        </h3>
        <InclusionsExclusions
          inclusions={variant.inclusions}
          exclusions={variant.exclusions}
        />
      </div>

      {/* B. Hotels Included */}
      {variant.hotels && variant.hotels.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#C9A25A]" />
            Hotels Included ({variant.hotelCategory})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variant.hotels.map((hotel, idx) => {
              const hName = typeof hotel === 'string' ? hotel : (hotel.name || hotel.hotel_name || hotel.hotelName || hotel.title || 'Hotel / Resort');
              const hStars = Number(typeof hotel === 'object' ? (hotel.stars || hotel.starRating || hotel.star_category) : 4) || 4;
              const hLoc = typeof hotel === 'object' ? (hotel.location || hotel.city || 'India') : 'India';
              const hHighlight = typeof hotel === 'object' ? (hotel.highlight || hotel.room_type || hotel.category) : undefined;

              return (
                <div
                  key={idx}
                  className="bg-[#1A2342] border border-[#C9A25A]/20 rounded-xl p-4 space-y-2 flex flex-col justify-between shadow-md"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-white text-base leading-snug">{hName}</h4>
                      <span className="text-[#C9A25A] text-sm whitespace-nowrap font-bold">
                        {'★'.repeat(hStars)}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs mt-1">📍 {hLoc}</p>
                  </div>
                  {hHighlight && (
                    <div className="pt-2">
                      <Badge variant="luxuryNavy" className="text-[10px]">
                        {hHighlight}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* C. Excursions */}
      {variant.excursions && variant.excursions.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#C9A25A]" />
            Activities & Excursions
          </h3>

          {includedExcursions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" /> Included Experiences ({includedExcursions.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {includedExcursions.map((exc, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-l-emerald-500 bg-[#1A2342] border border-white/5 rounded-r-xl p-3.5 flex justify-between items-center gap-3"
                  >
                    <div>
                      <h5 className="font-bold text-white text-sm">{exc.name}</h5>
                      <p className="text-xs text-white/60 mt-0.5">{exc.description}</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0">
                      ⏱ {exc.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {optionalExcursions.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                <PlusCircle className="w-4 h-4" /> Optional Add-ons ({optionalExcursions.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {optionalExcursions.map((exc, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-l-amber-500 bg-[#1A2342] border border-white/5 rounded-r-xl p-3.5 flex justify-between items-center gap-3"
                  >
                    <div>
                      <h5 className="font-bold text-white text-sm">{exc.name}</h5>
                      <p className="text-xs text-white/60 mt-0.5">{exc.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap block">
                        ⏱ {exc.duration}
                      </span>
                      {exc.price && (
                        <span className="text-[11px] text-amber-300 font-bold mt-1 block">
                          {exc.price}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* D. Variant Itinerary Timeline */}
      {variant.itinerary && variant.itinerary.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#C9A25A]" />
            Day-wise Itinerary ({variant.label})
          </h3>
          <PremiumTimeline itinerary={variant.itinerary} />
        </div>
      )}

      {/* D. Variant Price Breakdown */}
      <div className="bg-gradient-to-r from-[#0B1026] to-[#1A2342] border border-[#C9A25A]/30 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-xs font-bold text-[#C9A25A] uppercase tracking-wider">
            Package Pricing Tier ({variant.label})
          </span>
          <h4 className="text-lg font-semibold text-white mt-1">
            Package includes for {variant.nights} Nights / {variant.days} Days
          </h4>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#C9A25A]">
              ₹{variant.pricePerPerson.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-white/70">/ person (twin sharing)</span>
          </div>
          {/* EMI display */}
          <div className="text-[9px] text-[rgba(255,255,255,0.35)] mt-1">
            or ₹{Math.round(variant.pricePerPerson / 6).toLocaleString('en-IN')}/mo <span className="text-[rgba(201,162,90,0.6)]">· 6-month easy EMI</span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Total for 2 adults: ₹{(variant.pricePerPerson * 2).toLocaleString('en-IN')} • Prices may vary during peak season
          </p>
          <div className="flex justify-between text-xs border-t border-[rgba(255,255,255,0.06)] mt-3 pt-3">
            <span className="text-[rgba(255,255,255,0.4)]">Easy EMI (6 months)</span>
            <span className="text-[#C9A25A] font-bold">₹{Math.round(variant.pricePerPerson / 6).toLocaleString('en-IN')}/month</span>
          </div>
          <div className="text-[9px] text-[rgba(255,255,255,0.3)] mt-1 text-right">
            Zero cost EMI via major credit cards
          </div>
        </div>
        <div className="flex-shrink-0 w-full md:w-auto">
          <Button
            asChild
            className="w-full md:w-auto bg-[#C9A25A] text-[#0B1026] hover:bg-[#D8B97A] font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Link to="/enquire-now">
              Get Exact Quote <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VariantDetails;
