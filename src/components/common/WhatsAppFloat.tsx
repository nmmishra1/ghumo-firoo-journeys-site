import React from 'react';
import { useLocation } from 'react-router-dom';

const WhatsAppFloat = () => {
  const location = useLocation();

  // Hide on CRM and Auth portal routes
  if (
    location.pathname.startsWith('/crm') ||
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/signup') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/reset-password')
  ) {
    return null;
  }

  // Build context-aware pre-filled message
  const getMessage = () => {
    const path = location.pathname;
    if (path.includes('char-dham') || 
        path.includes('kedarnath') || 
        path.includes('badrinath'))
      return 'Hi GhumoFiroo! I am interested in the Char Dham Yatra package. Please share details.';
    if (path.includes('rann-utsav'))
      return 'Hi GhumoFiroo! I want to know more about Rann Utsav packages. Please help.';
    if (path.includes('singapore'))
      return 'Hi GhumoFiroo! I am interested in Singapore packages. Can you share more?';
    if (path.includes('europe'))
      return 'Hi GhumoFiroo! I am looking at Europe tour packages. Please share details.';
    if (path.includes('kashmir'))
      return 'Hi GhumoFiroo! Interested in Kashmir package. Please share availability.';
    return 'Hi GhumoFiroo! I want to enquire about your travel packages.';
  };

  const waLink = `https://wa.me/919910987264?text=${encodeURIComponent(getMessage())}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-2xl hover:bg-[#20BA5A] hover:scale-105 transition-all duration-200 group"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12 0C5.373 0 0 5.373 0 12c0 2.107.547 4.088 1.502 5.815L.057 23.487a.5.5 0 0 0 .609.61l5.753-1.508A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
      <span className="text-sm font-bold whitespace-nowrap max-w-0 overflow-hidden group-hover:max-w-[160px] transition-all duration-300">
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppFloat;
