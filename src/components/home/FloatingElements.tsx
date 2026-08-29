
import React, { memo } from 'react';

// Memoized floating elements to prevent unnecessary re-renders
const FloatingElements = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full animate-float shadow-lg backdrop-blur-sm"></div>
    <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-pink-500/20 rounded-full animate-pulse-slow backdrop-blur-md"></div>
    <div className="absolute bottom-40 left-20 w-12 h-12 bg-blue-400/10 rounded-full animate-float delay-1000 backdrop-blur-sm"></div>
    <div className="absolute bottom-20 right-40 w-24 h-24 bg-white/5 rounded-full animate-pulse-slow delay-500 backdrop-blur-md"></div>
    <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-tr from-orange-400/30 to-yellow-500/30 rounded-full animate-float delay-700"></div>
    <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-white/5 rounded-full animate-pulse-slow delay-200 backdrop-blur-sm"></div>
  </div>
));

FloatingElements.displayName = 'FloatingElements';

export default FloatingElements;
