import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PIXEL_ID = '1111618530664737';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const MetaPixel = () => {
  const location = useLocation();

  useEffect(() => {
    // Suppress Meta Pixel tracking on internal CRM and Auth routes
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/crm') || window.location.pathname.startsWith('/auth')) {
        return;
      }

      if (!window.fbq) {
        (function (f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod
              ? n.callMethod.apply(n, arguments)
              : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(
          window,
          document,
          'script',
          'https://connect.facebook.net/en_US/fbevents.js'
        );
        
        window.fbq('init', PIXEL_ID);
      }

      // Track PageView
      window.fbq('track', 'PageView');
    }
  }, [location.pathname, location.search]);

  return null;
};

export default MetaPixel;
