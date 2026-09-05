import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { leadService } from '@/services/leadService';
import { pushEvent } from '@/lib/analytics';

interface PackageActionButtonsProps {
  packageTitle: string;
  packagePrice: number | string;
  packageDuration: string;
  packageImage?: string;
  destinations: string[];
  variant?: 'default' | 'sidebar';
  ctaLabel?: string;
  enquireLabel?: string;
  pickupLocation?: string;
  dropLocation?: string;
  travelDate?: string;
  returnDate?: string;
  passengersCount?: number;
  selectedCabName?: string;
  selectedCabId?: string;
  selectedHotels?: any[];
  selectedSightseeing?: any[];
  itinerary?: any[];
  inclusions?: any[];
}

const PackageActionButtons: React.FC<PackageActionButtonsProps> = ({
  packageTitle,
  packagePrice,
  packageDuration,
  packageImage,
  destinations,
  variant = 'default',
  ctaLabel,
  enquireLabel,
  pickupLocation,
  dropLocation,
  travelDate,
  returnDate,
  passengersCount,
  selectedCabName,
  selectedCabId,
  selectedHotels,
  selectedSightseeing,
  itinerary,
  inclusions
}) => {
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const handleBookNow = async () => {
    setIsBooking(true);
    try {
      const priceValue = typeof packagePrice === 'string' 
        ? parseInt(packagePrice.replace(/[^0-9]/g, '')) 
        : packagePrice;

      const fullBookingPayload = {
        id: packageTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title: packageTitle,
        price: priceValue,
        duration: packageDuration,
        image: packageImage || '/placeholder.svg',
        destination: destinations.join(', '),
        destinations: destinations,
        pickupLocation: pickupLocation || '',
        dropLocation: dropLocation || '',
        travelDate: travelDate || '',
        returnDate: returnDate || '',
        passengersCount: passengersCount || 2,
        cabType: selectedCabName || 'AC Private Vehicle',
        selectedCabId: selectedCabId || 'sedan',
        hotels: selectedHotels || [],
        sightseeing: selectedSightseeing || [],
        itinerary: itinerary || [],
        inclusions: inclusions || []
      };

      try {
        localStorage.setItem('pending_booking_payload', JSON.stringify(fullBookingPayload));
      } catch (e) {
        console.warn('LocalStorage payload save notice:', e);
      }

      // Redirect to booking page with package details
      const queryParams = new URLSearchParams({
        package: packageTitle,
        price: priceValue.toString(),
        duration: packageDuration,
        destination: destinations.join(', ')
      });
      
      if (packageImage) {
        queryParams.append('image', packageImage);
      }
      if (pickupLocation) {
        queryParams.append('pickup', pickupLocation);
      }
      if (dropLocation) {
        queryParams.append('drop', dropLocation);
      }
      if (travelDate) {
        queryParams.append('travelDate', travelDate);
      }
      if (returnDate) {
        queryParams.append('returnDate', returnDate);
      }
      if (passengersCount) {
        queryParams.append('travelers', passengersCount.toString());
      }
      if (selectedCabName) {
        queryParams.append('cabType', selectedCabName);
      }
      if (selectedCabId) {
        queryParams.append('cabId', selectedCabId);
      }

      // Track the event
      try {
        pushEvent('book_now_click', { 
          package: packageTitle, 
          price: priceValue,
          destination: destinations[0] 
        });
      } catch (e) {
        console.error('Analytics error:', e);
      }

      setTimeout(() => {
        window.location.href = `/booking?${queryParams.toString()}`;
      }, 300);

    } catch (error) {
      console.error('Error processing booking request:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const isSidebar = variant === 'sidebar';

  const enquireParams = new URLSearchParams({
    package: packageTitle,
    destination: destinations.join(', ')
  });

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleBookNow}
        disabled={isBooking}
        className={`w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 ${
          isSidebar 
            ? "bg-white text-accent hover:bg-accent/10" 
            : "bg-accent hover:bg-accent/90 text-white"
        }`}
        size="lg"
      >
        {isBooking ? 'Processing...' : (ctaLabel || (isSidebar ? '⚡ Book Now' : 'Book Now'))}
      </Button>
      
      <Link 
        to={`/enquire-now?${enquireParams.toString()}`}
        className="block"
        onClick={() => { 
          try { 
            pushEvent('enquire_now_click', { 
              source: isSidebar ? 'package_sidebar' : 'package_page', 
              package_title: packageTitle 
            }); 
          } catch {} 
        }}
      >
        <Button 
          variant={isSidebar ? "default" : "outline"}
          className={`w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 ${
            isSidebar 
              ? "bg-white text-accent hover:bg-accent/10" 
              : "border-accent text-accent hover:bg-accent/10"
          }`}
          size="lg"
        >
          {enquireLabel || (isSidebar ? '🚀 Enquire Now' : 'Enquire Now')}
        </Button>
      </Link>
    </div>
  );
};

export default PackageActionButtons;
