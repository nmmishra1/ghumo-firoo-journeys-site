import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import LeadForm from './LeadForm';

interface ExitIntentPopupProps {
  packageName: string;
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ packageName }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    // Also show on mobile after 30 seconds if not shown
    const timer = setTimeout(() => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
        >
          <X size={20} className="text-gray-600" />
        </button>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 p-3 rounded-full animate-bounce">
              <Clock size={32} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">Wait! Don't Miss Out</h3>
          <p className="text-blue-100">
            Helicopter slots for {new Date().getFullYear()} are booking fast. 
            Get your priority quote now!
          </p>
        </div>
        
        <div className="p-6">
          <LeadForm packageName={packageName} variant="popup" hideHeader={true} clean={true} />
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
