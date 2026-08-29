
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately when route changes, but defer it slightly 
    // to yield the main thread for React rendering, improving INP
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }, 0);
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
