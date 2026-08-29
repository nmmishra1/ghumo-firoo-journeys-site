import React, { useState, useEffect } from 'react';

const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const pct = scrollHeight > 0 
        ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(pct);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-[rgba(201,162,90,0.1)]">
      <div 
        className="h-full bg-gradient-to-r from-[#C9A25A] to-[#D8B97A] transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ScrollProgressBar;
