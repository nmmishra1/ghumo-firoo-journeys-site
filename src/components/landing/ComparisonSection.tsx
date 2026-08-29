import React from 'react';
import { Check, X } from 'lucide-react';

const ComparisonSection = () => {
  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Perfect Yatra</h2>
          <p className="text-gray-600">Compare our two most popular Char Dham packages</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <div className="min-w-[550px] sm:min-w-0">
              <div className="grid grid-cols-3 text-center border-b border-gray-100 bg-gray-50">
                <div className="p-4 font-bold text-gray-500">Feature</div>
                <div className="p-4 font-bold text-blue-700 bg-blue-100/50">Helicopter Yatra</div>
                <div className="p-4 font-bold text-accent bg-accent/10/50">Road Journey</div>
              </div>

              {[
                { feature: "Duration", heli: "5 Nights / 6 Days", road: "9 Nights / 10 Days" },
                { feature: "Physical Effort", heli: "Minimal (VIP Darshan)", road: "Moderate (Trekking involved)" },
                { feature: "Travel Mode", heli: "Chopper + Luxury Car", road: "AC Tempo Traveller/Innova" },
                { feature: "Accommodation", heli: "Premium 4/5 Star Hotels", road: "Standard/Deluxe Hotels" },
                { feature: "VIP Darshan", heli: true, road: false },
                { feature: "Sightseeing", heli: "Aerial Views", road: "En-route scenic stops" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 text-center border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="p-4 text-sm font-medium text-gray-600 flex items-center justify-center sm:justify-start">{row.feature}</div>
                  <div className="p-4 text-sm font-bold text-gray-800 bg-blue-50/30 flex items-center justify-center">
                    {typeof row.heli === 'boolean' ? (
                      row.heli ? <Check className="text-green-500" /> : <X className="text-red-400" />
                    ) : row.heli}
                  </div>
                  <div className="p-4 text-sm font-medium text-gray-700 flex items-center justify-center">
                    {typeof row.road === 'boolean' ? (
                      row.road ? <Check className="text-green-500" /> : <X className="text-red-400" />
                    ) : row.road}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
