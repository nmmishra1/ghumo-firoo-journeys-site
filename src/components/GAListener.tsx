import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GAListener = () => {
  const location = useLocation();

  useEffect(() => {
    // Suppress marketing analytics for internal CRM and Auth panels
    if (location.pathname.startsWith('/crm') || location.pathname.startsWith('/auth')) {
      return;
    }

    const path = location.pathname + location.search + location.hash;
    const href = typeof window !== 'undefined' ? window.location.href : path;
    const title = typeof document !== 'undefined' ? document.title : undefined;

    try {
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'page_view', {
          page_location: href,
          page_path: path,
          page_title: title,
        });
      } else if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'page_view',
          page_location: href,
          page_path: path,
          page_title: title,
        });
      }
    } catch {
      // no-op
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
};

export default GAListener;