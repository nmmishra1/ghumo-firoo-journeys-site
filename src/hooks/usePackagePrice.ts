import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePackagePrice = (slug: string, fallbackPrice: string | number) => {
  const [price, setPrice] = useState<string>(() => {
    const num = Number(fallbackPrice);
    return isNaN(num) ? String(fallbackPrice) : num.toLocaleString('en-IN');
  });

  useEffect(() => {
    let isMounted = true;
    const fetchPrice = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '/php-backend';
        const res = await fetch(`${apiBase}/packages.php?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.price && data.is_active) {
            setPrice(Number(data.price).toLocaleString('en-IN'));
          }
        }
      } catch (err) {
        console.error(`Error fetching price for ${slug}:`, err);
      }
    };
    fetchPrice();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  return price;
};
