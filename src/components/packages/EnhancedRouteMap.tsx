import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Clock } from 'lucide-react';

interface MapLocation {
  name: string;
  coordinates: [number, number]; // [lat, lng]
  description?: string;
}

interface EnhancedRouteMapProps {
  locations: MapLocation[];
  totalDistance?: string;
  routeHighlights?: string;
  mapTitle?: string;
}

const EnhancedRouteMap: React.FC<EnhancedRouteMapProps> = ({ 
  locations = [], 
  totalDistance, 
  routeHighlights,
  mapTitle = "Tour Route Map"
}) => {
  const validLocations = (locations || []).filter(
    loc => loc && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2 && typeof loc.coordinates[0] === 'number' && typeof loc.coordinates[1] === 'number'
  );

  // Fallback static map with dark navy & gold route visualization
  const generateStaticMapSVG = () => {
    if (validLocations.length === 0) return '';
    const width = 800;
    const height = 400;
    const padding = 60;
    
    // Calculate bounds
    const lats = validLocations.map(loc => loc.coordinates[0]);
    const lngs = validLocations.map(loc => loc.coordinates[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = (maxLat - minLat) || 0.01;
    const lngSpan = (maxLng - minLng) || 0.01;
    
    // Convert coordinates to SVG positions
    const toSVGCoords = (lat: number, lng: number) => {
      const x = padding + ((lng - minLng) / lngSpan) * (width - 2 * padding);
      const y = padding + ((maxLat - lat) / latSpan) * (height - 2 * padding);
      return [x, y];
    };
    
    const svgPoints = validLocations.map(loc => toSVGCoords(loc.coordinates[0], loc.coordinates[1]));
    
    return `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mapGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0B1226;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#161E38;stop-opacity:1" />
          </linearGradient>
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#C9A25A" flood-opacity="0.6"/>
          </filter>
          <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.9"/>
          </filter>
          <pattern id="gridDark" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" stroke-width="0.5" opacity="0.2"/>
          </pattern>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#mapGradientDark)" rx="12"/>
        <rect width="100%" height="100%" fill="url(#gridDark)" />
        
        <!-- Route connecting path -->
        ${svgPoints.length > 1 ? `
          <path d="M ${svgPoints.map(p => p.join(',')).join(' L ')}" 
                stroke="#C9A25A" 
                stroke-width="3.5" 
                fill="none" 
                stroke-linecap="round"
                stroke-dasharray="10,6"
                filter="url(#goldGlow)">
            <animate attributeName="stroke-dashoffset" values="0;-16" dur="2s" repeatCount="indefinite"/>
          </path>
        ` : ''}
        
        <!-- Location markers & text labels -->
        ${svgPoints.map((point, index) => {
          const isFirst = index === 0;
          const isLast = index === svgPoints.length - 1;
          const color = isFirst ? '#34D399' : isLast ? '#F87171' : '#E5C378';
          const size = isFirst || isLast ? 9 : 7;
          const locName = validLocations[index]?.name || 'Point';
          
          return `
            <circle cx="${point[0]}" cy="${point[1]}" r="${size + 4}" fill="${color}" opacity="0.25"/>
            <circle cx="${point[0]}" cy="${point[1]}" r="${size}" fill="${color}" filter="url(#goldGlow)"/>
            <circle cx="${point[0]}" cy="${point[1]}" r="${size - 3}" fill="#0B1226"/>
            <text x="${point[0]}" y="${point[1] - 16}" 
                  text-anchor="middle" 
                  font-family="system-ui, -apple-system, sans-serif" 
                  font-size="12" 
                  font-weight="700" 
                  fill="#FFFFFF"
                  filter="url(#textShadow)">
              ${locName.replace(/[<>&'"]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;','\'':'&#39;','"':'&quot;'}[c]))}
            </text>
          `;
        }).join('')}
        
        <!-- Dark Theme Map Legend -->
        <g transform="translate(24, ${height - 75})">
          <rect x="0" y="0" width="220" height="55" fill="#0B1026" opacity="0.9" rx="8" stroke="#C9A25A" stroke-width="0.5"/>
          <circle cx="16" cy="18" r="4" fill="#34D399"/>
          <text x="28" y="22" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#E2E8F0">Start Hub</text>
          
          <circle cx="16" cy="36" r="4" fill="#E5C378"/>
          <text x="28" y="40" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#E2E8F0">Waypoints</text>
          
          <circle cx="120" cy="18" r="4" fill="#F87171"/>
          <text x="132" y="22" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#E2E8F0">Final Station</text>
        </g>
      </svg>
    `;
  };

  const staticMapSVG = generateStaticMapSVG();

  const [showInteractive, setShowInteractive] = React.useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  let googleMapUrl = null;
  let externalMapUrl = null;

  if (validLocations.length > 0) {
    const origin = `${validLocations[0].coordinates[0]},${validLocations[0].coordinates[1]}`;
    const destination = `${validLocations[validLocations.length - 1].coordinates[0]},${validLocations[validLocations.length - 1].coordinates[1]}`;
    
    // Construct external Google Maps URL
    if (validLocations.length === 1) {
      externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${origin}`;
    } else {
      const waypoints = validLocations.slice(1, -1).map(l => `${l.coordinates[0]},${l.coordinates[1]}`).join('|');
      externalMapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
      if (waypoints) {
        externalMapUrl += `&waypoints=${waypoints}`;
      }
    }

    // Construct Embed URL if API key present
    if (apiKey) {
      if (validLocations.length === 1) {
        googleMapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${origin}&zoom=10`;
      } else {
        const waypoints = validLocations.slice(1, -1).map(l => `${l.coordinates[0]},${l.coordinates[1]}`).join('|');
        googleMapUrl = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}`;
        if (waypoints) {
          googleMapUrl += `&waypoints=${waypoints}`;
        }
      }
    }
  }

  return (
    <Card className="bg-[#0B1026] border border-[#C9A25A]/20 text-white rounded-2xl shadow-xl overflow-hidden">
      <CardHeader className="border-b border-white/10 pb-4">
        <CardTitle className="flex items-center gap-2 text-white font-serif text-xl">
          <Navigation className="w-5 h-5 text-[#C9A25A]" />
          {mapTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Map Container */}
        <div className="h-[360px] rounded-xl overflow-hidden border border-[#C9A25A]/30 bg-[#0F172A] relative group shadow-inner">
          {showInteractive && googleMapUrl ? (
            <iframe
              src={googleMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={mapTitle}
            />
          ) : (
            /* Responsive SVG Map - Dark Navy Theme */
            <div className="absolute inset-0 flex items-center justify-center bg-[#0B1226]">
               <div dangerouslySetInnerHTML={{ __html: staticMapSVG }} className="w-full h-full flex items-center justify-center p-2" />
               
               {/* Overlay Action Buttons */}
               <div className="absolute bottom-4 right-4 flex gap-2">
                 {googleMapUrl && (
                   <button 
                     onClick={() => setShowInteractive(true)}
                     className="bg-[#0B1026]/90 hover:bg-[#0B1026] text-[#E5C378] px-4 py-2 rounded-full shadow-lg text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-md border border-[#C9A25A]/40"
                   >
                     <MapPin className="w-4 h-4 text-[#C9A25A]" />
                     Interactive View
                   </button>
                 )}
                 {externalMapUrl && (
                   <a 
                     href={externalMapUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="bg-[#C9A25A] hover:bg-[#b58e46] text-[#0B1026] px-4 py-2 rounded-full shadow-lg text-xs font-bold transition-all flex items-center gap-2"
                   >
                     <Navigation className="w-4 h-4" />
                     Open in Google Maps
                   </a>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Route Details Info Cards */}
        {(totalDistance || routeHighlights) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {totalDistance && (
              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A25A]" />
                  <span className="text-xs font-bold text-slate-300">Total Distance</span>
                </div>
                <span className="text-sm font-extrabold text-[#E5C378]">{totalDistance}</span>
              </div>
            )}
            
            {routeHighlights && (
              <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-300">Route Highlights</span>
                </div>
                <span className="text-xs font-semibold text-sky-300">{routeHighlights}</span>
              </div>
            )}
          </div>
        )}

        {/* Locations Grid List */}
        {validLocations.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-[#C9A25A] uppercase tracking-wider text-xs flex items-center gap-2">
              <span>📍</span> Cities & Destinations Covered:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {validLocations.map((location, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-[#C9A25A]/40 transition-colors">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    index === 0 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 
                    index === validLocations.length - 1 ? 'bg-rose-400 shadow-[0_0_8px_#f87171]' : 'bg-[#C9A25A] shadow-[0_0_8px_#c9a25a]'
                  }`} />
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-white block truncate">{location.name}</span>
                    {location.description && (
                      <p className="text-xs text-slate-300 font-light truncate">{location.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedRouteMap;