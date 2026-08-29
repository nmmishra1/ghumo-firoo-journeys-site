import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-3 z-40 md:hidden animate-in slide-in-from-bottom duration-300">
      <div className="flex gap-3">
        <a 
          href="https://wa.me/919910987264" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-bold shadow-sm"
        >
          <MessageCircle size={20} />
          WhatsApp
        </a>
        <a 
          href="tel:+919910987264" 
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold shadow-sm"
        >
          <Phone size={20} />
          Call Now
        </a>
      </div>
    </div>
  );
};

export default StickyCTA;
