import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane } from 'lucide-react';

interface FlightRoute {
  from: string;
  to: string;
  duration: string;
}

interface FlightRouteMapProps {
  isInternational: boolean;
  destination: string;
  routes?: FlightRoute[];
}

const FlightRouteMap: React.FC<FlightRouteMapProps> = ({ isInternational, destination, routes }) => {
  const defaultRoutes = [
    { from: 'Delhi (DEL)', to: destination, duration: '3h 30m' },
    { from: 'Mumbai (BOM)', to: destination, duration: '3h 45m' },
    { from: 'Bangalore (BLR)', to: destination, duration: '4h 15m' },
    { from: 'Chennai (MAA)', to: destination, duration: '4h 30m' },
    { from: 'Kolkata (CCU)', to: destination, duration: '5h 00m' }
  ];

  const flightRoutes = routes || defaultRoutes;

  if (!isInternational) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl text-blue-800">
          <Plane className="w-6 h-6 text-blue-600" />
          Flight Routes to {destination}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative">
          {/* Modern Flight Route Visualization */}
          <div className="h-48 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl relative overflow-hidden border border-gray-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <svg width="100%" height="100%" viewBox="0 0 400 200">
                <defs>
                  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#cbd5e1" opacity="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)"/>
              </svg>
            </div>
            
            {/* Flight Paths */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
              {/* Multiple curved flight paths */}
              <path 
                d="M 60 60 Q 200 40 340 100" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                fill="none" 
                strokeDasharray="8,4"
                className="animate-pulse"
              />
              <path 
                d="M 60 100 Q 200 80 340 100" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                fill="none" 
                strokeDasharray="8,4"
                style={{ animationDelay: '0.5s' }}
                className="animate-pulse"
              />
              <path 
                d="M 60 140 Q 200 120 340 100" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                fill="none" 
                strokeDasharray="8,4"
                style={{ animationDelay: '1s' }}
                className="animate-pulse"
              />
              
              {/* Animated Plane */}
              <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                <path 
                  d="M 180 85 L 190 87 L 190 93 L 180 91 L 170 93 L 170 87 Z" 
                  fill="#1e40af"
                />
              </g>
            </svg>
            
            {/* Legend */}
            <div className="absolute top-4 left-4 flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Major Indian Cities</span>
              </div>
            </div>
            
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{destination}</span>
              </div>
            </div>
            
            {/* Airport Markers */}
            <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
            </div>
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
            </div>
          </div>

          {/* Flight Routes Grid */}
          <div className="mt-6">
            <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" />
              Available Flight Routes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {flightRoutes.map((route, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Plane className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{route.from}</div>
                      <div className="text-xs text-gray-600">to {route.to}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">{route.duration}</div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong className="text-blue-900">✈️ Flight Information:</strong> Timings are approximate and may vary based on airline and route. 
              We assist with finding the best flight deals from your nearest airport.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightRouteMap;