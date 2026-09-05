import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Loader2, Phone, Mail, MapPin, User, Calendar, Users, Star, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitToGoogleSheets } from '@/lib/googleSheets';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { pushEvent } from '@/lib/analytics';
import { Link, useNavigate } from 'react-router-dom';
import { validateIndianPhone, sanitizePhone, PHONE_ERROR_MSG } from '@/lib/validation';
import { leadService } from '@/services/leadService';

const pdfCache = new Map<string, Uint8Array>();

// Helper to generate next 12 months dynamically starting from the current date
export const getNext12Months = () => {
  const months = [];
  const date = new Date();
  for (let i = 0; i < 12; i++) {
    const m = date.toLocaleString('default', { month: 'long' });
    const y = date.getFullYear();
    months.push(`${m} ${y}`);
    date.setMonth(date.getMonth() + 1);
  }
  return months;
};

// Define the schema for the lead form
const leadSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().refine((val) => validateIndianPhone(val), { message: PHONE_ERROR_MSG }),
  email: z.string().email({ message: "Please enter a valid email address." }).min(1, { message: "Email is required." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  travelMonth: z.string().min(1, { message: "Please select your travel month." }),
  numberOfTravelers: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num >= 1 && num <= 99;
  }, { message: "Number of travelers must be at least 1." }),
  budget: z.string().min(1, { message: "Please select your budget range." })
});

type LeadFormData = z.infer<typeof leadSchema>;

interface PackageDetails {
  title: string;
  duration: string;
  price: string;
  highlights: string[];
  inclusions: string[];
  exclusions?: string[];
  hotels?: Array<{ name: string; location: string; stars?: number; room_type?: string; meal_plan?: string }>;
  attractions?: Array<{ name: string; description: string; image?: string }>;
  itinerary: Array<{ day: number; title: string; description: string }>;
  image?: string;
}

interface EnhancedBrochureDownloadProps {
  packageDetails: PackageDetails;
  packageType?: 'domestic' | 'international';
  destination: string;
  className?: string;
  groupSize?: string;
  bestTime?: string;
  difficulty?: string;
  ageLimit?: string;
  accommodation?: string;
  meals?: string;
  transport?: string;
  pickupLocation?: string;
  dropLocation?: string;
}

const EnhancedBrochureDownload: React.FC<EnhancedBrochureDownloadProps> = ({
  packageDetails,
  packageType = 'domestic',
  destination,
  className,
  groupSize,
  bestTime,
  difficulty,
  ageLimit,
  accommodation,
  meals,
  transport,
  pickupLocation,
  dropLocation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [generatedPdfData, setGeneratedPdfData] = useState<{ url: string; fileName: string } | null>(null);
  
  const abortRef = useRef(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    return () => { abortRef.current = true; };
  }, []);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    mode: 'onChange' // Live validation
  });

  const watchedName = watch("name");
  const watchedPhone = watch("phone");
  const watchedEmail = watch("email");
  const watchedCity = watch("city");
  const watchedTravelMonth = watch("travelMonth");
  const watchedNumberOfTravelers = watch("numberOfTravelers");
  const watchedBudget = watch("budget");

  const onDownloadClick = () => {
    setIsOpen(true);
    pushEvent('brochure_download_click', { destination, package_title: packageDetails.title });
  };

  const getCacheKey = () => {
    const schemaVersion = 'v5';
    const s = JSON.stringify({ v: schemaVersion, packageDetails, packageType, destination }).slice(0, 10000);
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
    return `brochure:${h >>> 0}`;
  };

  const getLegacyKeys = () => {
    const v1 = JSON.stringify({ packageDetails, packageType, destination }).slice(0, 10000);
    const v2fast = JSON.stringify({ v: 'v2', packageDetails, packageType, destination, mode: 'fast' as const }).slice(0, 10000);
    const v2rich = JSON.stringify({ v: 'v2', packageDetails, packageType, destination, mode: 'rich' as const }).slice(0, 10000);
    const hash = (s: string) => {
      let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
      return `brochure:${h >>> 0}`;
    };
    return [hash(v1), hash(v2fast), hash(v2rich)];
  };

  const saveToCache = (key: string, buf: Uint8Array) => {
    try {
      pdfCache.set(key, buf);
      if (buf.byteLength < 2_500_000) {
        const b64 = btoa(String.fromCharCode(...buf));
        sessionStorage.setItem(key, b64);
      }
    } catch {}
  };

  const loadFromCache = (key: string): Uint8Array | null => {
    if (pdfCache.has(key)) return pdfCache.get(key)!;
    try {
      const b64 = sessionStorage.getItem(key);
      if (!b64) return null;
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      pdfCache.set(key, arr);
      return arr;
    } catch { return null; }
  };

  // IndexedDB persistent cache (best-effort)
  const idbPut = async (key: string, data: Uint8Array) => {
    try {
      const req = indexedDB.open('BrochureCache', 1);
      const db: IDBDatabase = await new Promise((res, rej) => {
        req.onupgradeneeded = () => {
          req.result.createObjectStore('pdfs');
        };
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      await new Promise<void>((res, rej) => {
        const tx = db.transaction('pdfs', 'readwrite');
        tx.objectStore('pdfs').put(new Blob([data], { type: 'application/pdf' }), key);
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      db.close();
    } catch {}
  };
  const idbGet = async (key: string): Promise<Uint8Array | null> => {
    try {
      const req = indexedDB.open('BrochureCache', 1);
      const db: IDBDatabase = await new Promise((res, rej) => {
        req.onupgradeneeded = () => {
          req.result.createObjectStore('pdfs');
        };
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      const blob: Blob | null = await new Promise((res, rej) => {
        const tx = db.transaction('pdfs', 'readonly');
        const g = tx.objectStore('pdfs').get(key);
        g.onsuccess = () => res(g.result || null);
        g.onerror = () => rej(g.error);
      });
      db.close();
      if (!blob) return null;
      const buf = new Uint8Array(await blob.arrayBuffer());
      pdfCache.set(key, buf);
      return buf;
    } catch { return null; }
  };

  const idbDelete = async (key: string) => {
    try {
      const req = indexedDB.open('BrochureCache', 1);
      const db: IDBDatabase = await new Promise((res, rej) => {
        req.onupgradeneeded = () => {
          req.result.createObjectStore('pdfs');
        };
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      await new Promise<void>((res, rej) => {
        const tx = db.transaction('pdfs', 'readwrite');
        tx.objectStore('pdfs').delete(key);
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      db.close();
    } catch {}
  };

  const clearLegacyCaches = async () => {
    try {
      for (const legacyKey of getLegacyKeys()) {
        try { sessionStorage.removeItem(legacyKey); } catch {}
        await idbDelete(legacyKey);
      }
    } catch {}
  };

  const getOfficialBrochureUrl = (): string | null => {
    const d = (destination || packageDetails?.title || '').toLowerCase();
    const dur = (packageDetails?.duration || '').toLowerCase();
    
    if (d.includes('kutch') || d.includes('rann') || d.includes('dhordo') || d.includes('white desert')) {
      if (dur.includes('1n') || dur.includes('2d/1n') || dur.includes('1 night') || dur.includes('2 days / 1 night')) {
        return '/Ghumo_Firoo_Culture_Kutch_1N2D_Brochure.pdf';
      }
      if (dur.includes('3n') || dur.includes('4d/3n') || dur.includes('3 night') || dur.includes('4 days / 3 nights')) {
        return '/Ghumo_Firoo_Culture_Kutch_3N4D_Brochure.pdf';
      }
      if (dur.includes('4n') || dur.includes('5d/4n') || dur.includes('4 night') || dur.includes('5 days / 4 nights')) {
        return '/Ghumo_Firoo_Culture_Kutch_4N5D_Brochure.pdf';
      }
      return '/Ghumo_Firoo_Culture_Kutch_2N3D_Brochure.pdf';
    }
    return null;
  };

  const generatePdfBase64 = async (): Promise<string> => {
    const officialPdf = getOfficialBrochureUrl();
    if (officialPdf) {
      try {
        const resp = await fetch(officialPdf);
        if (resp.ok) {
          const ab = await resp.arrayBuffer();
          const u8 = new Uint8Array(ab);
          let binary = '';
          const len = u8.byteLength;
          for (let i = 0; i < len; i += 1024) {
            const chunk = u8.subarray(i, Math.min(i + 1024, len));
            binary += String.fromCharCode.apply(null, chunk as any);
          }
          return window.btoa(binary);
        }
      } catch (err) {
        console.warn('Could not fetch static PDF, generating dynamic:', err);
      }
    }

    const container = document.createElement('div');
    container.innerHTML = generatePagedBrochureContent();
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.zIndex = '-1';
    document.body.appendChild(container);

    await waitForImages(container, 8000);

    const pages = Array.from(container.querySelectorAll('.pdf-page')) as HTMLElement[];
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

    const scale = 2.0;
    for (let i = 0; i < pages.length; i++) {
      if (abortRef.current) break;
      const page = pages[i];
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const canvas = await html2canvas(page, { 
        scale, 
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        imageTimeout: 3000,
        logging: false,
        removeContainer: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const imgWidth = 210; 
      const imgHeight = 297; 
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      
      setProgress(Math.round(((i + 1) / pages.length) * 100));
      canvas.width = 0;
      canvas.height = 0;
    }
    
    pdf.setProperties({ 
      title: `${packageDetails.title} Brochure`, 
      subject: `Travel Itinerary for ${destination}`, 
      author: 'Ghumo Firoo Travels', 
      creator: 'Ghumo Firoo Travels' 
    });
    
    const buf = pdf.output('arraybuffer');
    document.body.removeChild(container);
    
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    
    let binary = '';
    const len = u8.byteLength;
    for (let i = 0; i < len; i += 1024) {
      const chunk = u8.subarray(i, Math.min(i + 1024, len));
      binary += String.fromCharCode.apply(null, chunk as any);
    }
    return window.btoa(binary);
  };

  const onSubmit = async (data: LeadFormData) => {
    try {
      setIsDownloading(true);
      setProgress(0);
      abortRef.current = false;
      
      toast({
        title: "Preparing Brochure...",
        description: "Please stay on this page. We are preparing your official travel brochure.",
      });

      // 1. Silent PDF Generation or Official Brochure Attachment
      const base64Pdf = await generatePdfBase64();
      if (abortRef.current) return;

      const officialPdf = getOfficialBrochureUrl();
      const pdfFileName = officialPdf ? officialPdf.split('/').pop()! : `${destination.replace(/\s+/g, '_')}_Brochure.pdf`;

      // Create PDF blob URL for instant download
      const bin = atob(base64Pdf);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const pdfBlob = new Blob([u8], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setGeneratedPdfData({
        url: pdfUrl,
        fileName: pdfFileName
      });

      // 2. Prepare Lead Data
      const leadData = {
        packageName: packageDetails.title,
        packagePrice: Number(packageDetails.price.replace(/[^\d]/g, '')) || 0,
        duration: packageDetails.duration,
        destinations: destination,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        source: 'Brochure Download',
        status: 'New Inquiry',
        notes: `Requested brochure for ${packageDetails.title}. City: ${data.city}, Travel Month: ${data.travelMonth}, Travelers: ${data.numberOfTravelers}, Budget: ${data.budget}`,
        brochureRequested: 'Yes' as const,
        brochureSent: 'Pending' as const,
        brochureEmailStatus: 'Pending' as const,
        brochureSentDate: '',
        city: data.city,
        travelMonth: data.travelMonth,
        numberOfTravelers: Number(data.numberOfTravelers) || 1,
        budget: data.budget,
        pdfBase64: base64Pdf,
        pdfFileName: pdfFileName
      };

      // 3. Trigger PDF download immediately so user gets brochure without delay
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = pdfFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 4. Create Lead in CRM & sheets non-blockingly
      try {
        await leadService.createLead(leadData);
        pushEvent('lead_submission', { 
          source: 'brochure_download', 
          destination, 
          status: 'success' 
        });
      } catch (leadErr) {
        console.warn('Lead service notice (PDF downloaded successfully):', leadErr);
      }

      // Transition to success screen inside modal
      setSubmittedName(data.name);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err) {
      console.error('Submission or generation failed:', err);
      toast({
        title: "Submission Failed",
        description: "There was an error generating or submitting your brochure request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  const selectBrochureHeroImage = () => {
    let img = packageDetails.image?.trim();
    if (!img) {
      const d = (destination || packageDetails.title || '').toLowerCase();
      if (d.includes('rann') || d.includes('kutch') || d.includes('gujarat')) {
        img = '/Kutch-Rann-Utsav-2023-2024.jpg';
      } else if (d.includes('char dham') || d.includes('chardham') || d.includes('badrinath') || d.includes('kedarnath')) {
        img = '/Kedarnath.png';
      } else if (d.includes('kashmir') || d.includes('srinagar') || d.includes('gulmarg')) {
        img = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80';
      } else if (d.includes('europe')) {
        img = '/Europe Image New.png';
      } else {
        img = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80';
      }
    }

    // Ensure absolute URL for local images to prevent html2canvas CORS issues
    if (img && img.startsWith('/')) {
      return `${window.location.origin}${img}`;
    }
    return img || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80';
  };

  const brandLogo = '/Ghumo_Firoo.png';

  const getDestinationFallbackAttractions = (dest: string) => {
    const d = (dest || packageDetails?.title || '').toLowerCase();
    if (d.includes('kashmir') || d.includes('srinagar') || d.includes('gulmarg') || d.includes('pahalgam')) {
      return [
        { name: "Gulmarg Gondola Cable Car (Phase 1 & 2)", description: "Asia's highest cable car ride to Apharwat Peak at 14,000 ft." },
        { name: "Pahalgam Betaab Valley & Lidder River", description: "Scenic alpine valley surrounded by snow-clad peaks & pine trails." },
        { name: "Dal Lake Shikara Ride & Luxury Houseboat", description: "Traditional romantic Shikara ride over serene waters of Dal Lake." },
        { name: "Mughal Gardens (Shalimar & Nishat Bagh)", description: "Historic terraced gardens built by Mughal emperors with fountains." }
      ];
    } else if (d.includes('dham') || d.includes('kedarnath') || d.includes('badrinath') || d.includes('uttarakhand')) {
      return [
        { name: "Kedarnath Temple & Shiv Aarti", description: "Sacred 8th-century stone temple dedicated to Lord Shiva at 11,755 ft." },
        { name: "Badrinath Temple & Tapt Kund Thermal Dip", description: "Holy Vishnu shrine with thermal sulfur hot springs bath." },
        { name: "Mana First Indian Village & Saraswati River", description: "Border village featuring Vyas Gufa, Ganesh Gufa & Bhim Pul." },
        { name: "Chopta Meadows & Devprayag Sangam View", description: "Scenic Mini Switzerland alpine meadows & river confluence." }
      ];
    } else if (d.includes('kerala') || d.includes('munnar') || d.includes('alleppey')) {
      return [
        { name: "Munnar Tea Plantations & Mattupetty Dam", description: "Rolling green tea estates with mist-covered valleys & echo point." },
        { name: "Alleppey Backwaters Houseboat Cruise", description: "Overnight luxury houseboat cruise through palm-fringed backwaters." },
        { name: "Periyar Wildlife Sanctuary Thekkady", description: "Boating safari to spot wild elephants, tigers & exotic birds." },
        { name: "Kovalam Beach & Fort Kochi Heritage", description: "Golden sand beaches & historic Chinese fishing nets." }
      ];
    }
    return [
      { name: "White Rann Salt Desert Sunrise", description: "Vast glittering salt marshes with spectacular sunrise views." },
      { name: "Kalo Dungar Black Hill (1,525 ft)", description: "Highest summit offering panoramic 360° views of Great Rann." },
      { name: "Road to Heaven Highway", description: "Iconic straight highway cutting through crystal turquoise salt waters." },
      { name: "Handicraft & Artisan Village", description: "Famous heritage village known for Kutchi embroidery & crafts." }
    ];
  };

  const formatPrice = () => {
    const v: any = (packageDetails as any).price;
    if (typeof v === 'number') return v.toLocaleString();
    if (typeof v === 'string') {
      const n = Number(v.replace(/[^\d]/g, ''));
      return isNaN(n) || n <= 0 ? v : n.toLocaleString();
    }
    return String(v ?? '');
  };

  const generatePagedBrochureContent = () => {
    const a4w = 794; 
    const a4h = 1123; 
    
    // Chunk itinerary for pagination
    const daysPerPage = 3; // Fewer days per page for better layout
    const itineraryChunks = [];
    for (let i = 0; i < packageDetails.itinerary.length; i += daysPerPage) {
      itineraryChunks.push(packageDetails.itinerary.slice(i, i + daysPerPage));
    }
    
    const primaryColor = '#ea580c'; // Vibrant Orange
    const secondaryColor = '#0f172a'; // Luxury Navy
    const accentColor = '#D4AF37'; // Luminous Gold
    const white = '#ffffff';

    const bgImage = selectBrochureHeroImage();
    const brandLogo = '/Ghumo_Firoo.png';

    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700;800&display=swap');

        :root { 
          --serif: 'Playfair Display', serif; 
          --sans: 'Inter', sans-serif; 
        }
        
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { margin: 0; padding: 0; background: #e2e8f0; }
        
        .pdf-page {
          width: ${a4w}px;
          height: ${a4h}px;
          position: relative;
          overflow: hidden;
          background: ${white};
          font-family: var(--sans);
          color: #334155;
          page-break-after: always;
        }

        /* --- DECORATIVE ELEMENTS --- */
        .gold-line { height: 1px; background: linear-gradient(to right, transparent, ${accentColor}, transparent); width: 100%; margin: 20px 0; }
        .corner-accent { position: absolute; width: 150px; height: 150px; border: 1px solid ${accentColor}30; z-index: 10; }
        .corner-tl { top: 30px; left: 30px; border-right: 0; border-bottom: 0; }
        .corner-br { bottom: 30px; right: 30px; border-left: 0; border-top: 0; }

        /* --- COVER PAGE: ULTRA LUXURY --- */
        .cover-container { height: 100%; display: flex; flex-direction: column; background: ${secondaryColor}; }
        .cover-top { height: 70%; position: relative; overflow: hidden; }
        .cover-main-img { width: 100%; height: 100%; object-fit: cover; }
        .cover-overlay { position: absolute; inset: 0; background: linear-gradient(to top, ${secondaryColor} 0%, rgba(15,23,42,0.2) 50%, rgba(15,23,42,0.6) 100%); }
        
        .brand-header { position: absolute; top: 60px; left: 60px; right: 60px; display: flex; justify-content: space-between; align-items: center; z-index: 20; }
        .brand-logo-main { height: 60px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }
        .brand-tag-luxe { color: ${accentColor}; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; font-size: 10px; border-bottom: 1px solid ${accentColor}; padding-bottom: 5px; }

        .cover-info { position: absolute; bottom: 0; left: 60px; right: 60px; padding-bottom: 40px; color: white; z-index: 20; }
        .exclusive-badge { display: inline-block; background: ${accentColor}; color: white; padding: 6px 15px; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; border-radius: 4px; margin-bottom: 20px; }
        .cover-main-title { font-family: var(--serif); font-size: 64px; font-weight: 900; line-height: 1; margin: 0; text-shadow: 0 10px 20px rgba(0,0,0,0.4); }
        
        .cover-bottom { height: 30%; background: ${secondaryColor}; padding: 0 60px 60px; display: flex; justify-content: space-between; align-items: flex-end; }
        .meta-group { display: flex; gap: 40px; }
        .meta-cell { }
        .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: ${accentColor}; margin-bottom: 8px; font-weight: 700; }
        .meta-val { font-family: var(--serif); font-size: 32px; color: white; font-weight: 700; font-style: italic; }

        /* --- PAGE HEADER & FOOTER --- */
        .page-header-luxe { height: 110px; padding: 30px 60px 0; position: relative; }
        .page-header-title { 
          font-family: var(--serif); 
          font-size: 42px; 
          color: ${secondaryColor}; 
          font-weight: 900; 
          position: relative; 
          z-index: 2;
          display: inline-block;
          border-bottom: 6px solid ${primaryColor};
          padding-bottom: 10px;
          line-height: 1.2;
        }
        .page-number-giant { position: absolute; top: 30px; right: 60px; font-family: var(--serif); font-size: 120px; font-weight: 900; color: ${secondaryColor}08; line-height: 1; pointer-events: none; }
        
        /* --- CONTENT BLOCKS --- */
        .content-wrap { padding: 20px 60px 10px; }
        
        .highlights-masonry { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
        .masonry-card { border-left: 4px solid ${primaryColor}; padding: 14px 16px; background: #f8fafc; border-radius: 0 15px 15px 0; position: relative; }
        .card-icon { position: absolute; right: 12px; top: 12px; font-size: 18px; color: ${secondaryColor}10; }
        .card-text { font-size: 13px; font-weight: 700; color: ${secondaryColor}; line-height: 1.4; }

        .experience-banner { background: ${secondaryColor}; color: white; padding: 20px 24px; border-radius: 16px; display: flex; gap: 20px; margin-bottom: 22px; box-shadow: 0 12px 24px rgba(15,23,42,0.2); }
        .banner-item { flex: 1; border-right: 1px solid rgba(255,255,255,0.1); padding-right: 16px; }
        .banner-item:last-child { border: 0; }
        .banner-icon { color: ${accentColor}; font-size: 22px; margin-bottom: 6px; }
        .banner-title { font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .banner-desc { font-size: 10px; opacity: 0.7; line-height: 1.4; }

        .inclusion-elegant { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px 28px 20px; position: relative; box-shadow: 0 6px 18px rgba(0,0,0,0.03); }
        .inc-header-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: ${secondaryColor}; color: white; padding: 6px 20px; border-radius: 30px; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
        .inc-grid-luxe { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
        .inc-item-luxe { display: flex; align-items: flex-start; gap: 8px; font-size: 11px; font-weight: 600; color: #334155; line-height: 1.4; margin-bottom: 8px; }
        .inc-check { width: 16px; height: 16px; min-width: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; flex-shrink: 0; margin-top: 2px; }

        /* --- TIMELINE: PREMIUM --- */
        .timeline-container { position: relative; padding-left: 100px; }
        .timeline-main-line { position: absolute; left: 49px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, ${primaryColor}, ${secondaryColor}20); }
        
        .timeline-page-item { position: relative; margin-bottom: 32px; }
        .timeline-day-box { position: absolute; left: -100px; top: 0; width: 100px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .day-label-giant { font-family: var(--serif); font-size: 11px; color: ${accentColor}; text-transform: uppercase; font-weight: 900; letter-spacing: 3px; line-height: 1; }
        .day-num-giant { font-family: var(--serif); font-size: 42px; color: ${secondaryColor}; font-weight: 900; line-height: 1; }
        
        .timeline-dot-outer { position: absolute; left: -59px; top: 26px; width: 16px; height: 16px; background: white; border: 3px solid ${primaryColor}; border-radius: 50%; z-index: 5; }
        .timeline-content-luxe { background: #f8fafc; padding: 20px 24px; border-radius: 16px; border: 1px solid #e2e8f0; }
        .timeline-title-luxe { font-family: var(--serif); font-size: 19px; font-weight: 800; color: ${secondaryColor}; margin-bottom: 8px; }
        .timeline-desc-luxe { font-size: 13px; line-height: 1.6; color: #64748b; text-align: justify; }

        /* --- FOOTER: MINIMAL --- */
        .footer-luxe { position: absolute; bottom: 0; left: 0; right: 0; height: 80px; padding: 0 60px; display: flex; align-items: center; justify-content: space-between; font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase; }
        
        /* --- CONTACT: THE FINALE --- */
        .final-page { height: 100%; background: ${secondaryColor}; display: flex; align-items: center; justify-content: center; position: relative; }
        .final-bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.15; filter: contrast(1.2) brightness(0.8); }
        .final-card { width: 680px; padding: 60px; background: rgba(255,255,255,0.03); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; text-align: center; z-index: 10; display: flex; flex-direction: column; align-items: center; }
        .final-title { font-family: var(--serif); font-size: 52px; color: white; margin-bottom: 10px; font-weight: 900; }
        .final-subtitle { font-size: 18px; color: ${accentColor}; font-weight: 600; letter-spacing: 1px; margin-bottom: 40px; }
        
        .contact-grid-luxe { display: grid; grid-template-columns: 1fr; gap: 20px; width: 100%; max-width: 450px; }
        .contact-pill { background: rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 25px; width: 100%; }
        .contact-icon-luxe { width: 60px; height: 60px; background: ${primaryColor}; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
        .contact-label-luxe { font-size: 12px; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 800; letter-spacing: 2px; margin-bottom: 5px; }
        .contact-val-luxe { font-size: 20px; color: white; font-weight: 700; white-space: nowrap; }
      </style>

      <!-- PAGE 1: THE MASTER COVER -->
      <div class="pdf-page">
        <div class="cover-container">
          <div class="cover-top">
            <img src="${bgImage}" class="cover-main-img" crossorigin="anonymous" />
            <div class="cover-overlay"></div>
            <div class="brand-header">
              <img src="${brandLogo}" class="brand-logo-main" crossorigin="anonymous" />
              <div class="brand-tag-luxe">Elite Curations</div>
            </div>
            <div class="cover-info">
              <div class="exclusive-badge">Private Experience</div>
              <h1 class="cover-main-title">${packageDetails.title}</h1>
              <div class="gold-line" style="margin-top: 30px;"></div>
            </div>
          </div>
          <div class="cover-bottom">
            <div class="meta-group">
              <div class="meta-cell">
                <div class="meta-label">Journey Length</div>
                <div class="meta-val">${packageDetails.duration}</div>
              </div>
              <div class="meta-cell">
                <div class="meta-label">Package Charges</div>
                <div class="meta-val" style="font-size: 20px; font-style: normal; color: #E5C378;">Post Executive Discussion</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="meta-label">Curated For You</div>
              <div style="font-family: var(--serif); font-size: 18px; color: white; font-weight: 700;">Ghumo Firoo Travels</div>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGE 2: TRIP ESSENTIALS & HIGHLIGHTS -->
      <div class="pdf-page">
        <div class="corner-accent corner-tl"></div>
        <div class="page-header-luxe">
          <div class="page-number-giant">02</div>
          <h2 class="page-header-title">The Masterplan</h2>
        </div>
        <div class="content-wrap">
          <!-- CHARGES CONSULTATION POLICY NOTICE -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border: 1px solid #D4AF37; border-radius: 14px; padding: 12px 18px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; color: white;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 22px;">💼</span>
              <div>
                <div style="font-size: 11px; font-weight: 800; color: #D4AF37; text-transform: uppercase; letter-spacing: 1.5px;">Customized Pricing Policy</div>
                <div style="font-size: 10px; color: #cbd5e1; line-height: 1.4;">Exact package charges will be given post discussion with our executive, tailored to your exact travel dates, chosen vehicle, group size, and hotel star tiers.</div>
              </div>
            </div>
          </div>

          <!-- LOGISTICS BAR: TRAVELERS, PICKUP, DROP -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 18px;">
            <div>
              <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${primaryColor}; letter-spacing: 1.5px; margin-bottom: 3px;">👥 Total Travelers</div>
              <div style="font-size: 13px; font-weight: 800; color: ${secondaryColor};">${watchedNumberOfTravelers ? `${watchedNumberOfTravelers} Travelers` : (groupSize || 'Custom Private Group')}</div>
            </div>
            <div>
              <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${primaryColor}; letter-spacing: 1.5px; margin-bottom: 3px;">🛫 Pickup Point</div>
              <div style="font-size: 12px; font-weight: 700; color: ${secondaryColor};">${pickupLocation || `${destination} Pickup (Station/Airport)`}</div>
            </div>
            <div>
              <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${primaryColor}; letter-spacing: 1.5px; margin-bottom: 3px;">🛬 Drop-off Point</div>
              <div style="font-size: 12px; font-weight: 700; color: ${secondaryColor};">${dropLocation || `${destination} Drop-off Point`}</div>
            </div>
          </div>

          <div class="highlights-masonry">
            ${packageDetails.highlights.slice(0, 6).map(h => `
              <div class="masonry-card">
                <div class="card-icon">✦</div>
                <div class="card-text">${h}</div>
              </div>
            `).join('')}
          </div>

          <div class="experience-banner">
            <div class="banner-item">
              <div class="banner-icon">🛡️</div>
              <div class="banner-title">Elite Safety</div>
              <div class="banner-desc">Hand-picked properties with premium security protocols.</div>
            </div>
            <div class="banner-item">
              <div class="banner-icon">💎</div>
              <div class="banner-title">Concierge</div>
              <div class="banner-desc">24/7 dedicated travel expert for on-ground assistance.</div>
            </div>
            <div class="banner-item">
              <div class="banner-icon">🥂</div>
              <div class="banner-title">Luxe Stay</div>
              <div class="banner-desc">Pre-vetted 4 & 5-star accommodations guaranteed.</div>
            </div>
          </div>

          <div class="inclusion-elegant" style="margin-top: 15px;">
            <div class="inc-header-badge">Inclusions & Exclusions</div>
            <div class="inc-grid-luxe" style="grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <div style="font-weight: 800; font-size: 11px; text-transform: uppercase; color: ${primaryColor}; margin-bottom: 8px;">✓ Included in Package</div>
                ${(packageDetails.inclusions || []).slice(0, 6).map(inc => `
                  <div class="inc-item-luxe" style="margin-bottom: 6px;">
                    <div class="inc-check">✓</div>
                    <div style="font-size: 11px;">${inc}</div>
                  </div>
                `).join('')}
              </div>
              <div>
                <div style="font-weight: 800; font-size: 11px; text-transform: uppercase; color: #ef4444; margin-bottom: 8px;">✕ Excluded</div>
                ${((packageDetails.exclusions && packageDetails.exclusions.length > 0)
                  ? packageDetails.exclusions
                  : ['Personal expenses & laundry', 'GST / TCS extra as applicable', 'Flights / Train fare to destination']
                ).slice(0, 5).map(exc => `
                  <div class="inc-item-luxe" style="margin-bottom: 6px;">
                    <div class="inc-check" style="background: #fef2f2; color: #ef4444;">✕</div>
                    <div style="font-size: 11px; color: #64748b;">${exc}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="footer-luxe">
          <span style="color: ${secondaryColor};">Ghumo Firoo Travels</span>
          <span>Boutique Itinerary 2026</span>
        </div>
      </div>

      <!-- PAGE 3: HOTELS & SIGHTSEEING ATTRACTIONS -->
      <div class="pdf-page">
        <div class="page-header-luxe">
          <div class="page-number-giant">03</div>
          <h2 class="page-header-title">Hotels & Sightseeing</h2>
        </div>
        <div class="content-wrap">
          <!-- HOTELS SECTION -->
          <div style="font-family: var(--serif); font-size: 18px; font-weight: 800; color: ${secondaryColor}; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <span>🏨</span> Luxury Accommodations
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
            ${((packageDetails.hotels && packageDetails.hotels.length > 0)
              ? packageDetails.hotels
              : [
                  { name: `${destination} Luxury Resort & Spa`, location: destination, stars: 4, room_type: "Deluxe Suite Room", meal_plan: "MAP (Breakfast & Dinner)" },
                  { name: `Grand ${destination} Heritage Hotel`, location: destination, stars: 4, room_type: "Premium Mountain View", meal_plan: "CP (Breakfast Included)" }
                ]
            ).map((h: any) => `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 18px; display: flex; items-center; justify-content: space-between;">
                <div style="display: flex; items-center; gap: 14px;">
                  <div style="width: 38px; height: 38px; background: ${secondaryColor}; color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800;">
                    🏨
                  </div>
                  <div>
                    <div style="font-family: var(--serif); font-size: 15px; font-weight: 800; color: ${secondaryColor}; margin-bottom: 2px;">
                      ${h.name}
                    </div>
                    <div style="font-size: 10px; color: #64748b; font-weight: 600; display: flex; items-center; gap: 8px;">
                      <span>📍 ${h.location || destination}</span>
                      <span>•</span>
                      <span>🛏️ ${h.room_type || 'Deluxe Room'}</span>
                    </div>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="color: ${accentColor}; font-size: 12px; margin-bottom: 2px;">
                    ${'★'.repeat(h.stars || 4)}
                  </div>
                  <div style="background: ${primaryColor}15; color: ${primaryColor}; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; display: inline-block;">
                    ${h.meal_plan || 'MAP Plan'}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- SIGHTSEEING ATTRACTIONS SECTION -->
          <div style="font-family: var(--serif); font-size: 18px; font-weight: 800; color: ${secondaryColor}; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <span>🏞️</span> Included Sightseeing & Attractions
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${((packageDetails.attractions && packageDetails.attractions.length > 0)
              ? packageDetails.attractions
              : getDestinationFallbackAttractions(destination)
            ).slice(0, 4).map((att: any) => `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="font-weight: 800; font-size: 11px; color: ${secondaryColor}; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: flex-start; gap: 6px;">
                    <span style="line-height: 1.35; font-weight: 800; word-break: break-word;">📍 ${att.name}</span>
                    <span style="font-size: 8px; background: ${primaryColor}15; color: ${primaryColor}; padding: 2px 6px; border-radius: 8px; text-transform: uppercase; font-weight: 800; flex-shrink: 0; white-space: nowrap; margin-top: 1px;">Sightseeing</span>
                  </div>
                  <div style="font-size: 10px; color: #64748b; line-height: 1.35;">${att.description || 'Guided sightseeing excursion included in itinerary.'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="footer-luxe">
          <span style="color: ${secondaryColor};">Ghumo Firoo Travels</span>
          <span>Hotels & Sightseeing</span>
        </div>
      </div>

      <!-- ITINERARY PAGES -->
      ${itineraryChunks.map((chunk, idx) => `
        <div class="pdf-page">
          <div class="page-header-luxe">
            <div class="page-number-giant">${String(idx + 4).padStart(2, '0')}</div>
            <h2 class="page-header-title">Detailed Journey</h2>
          </div>
          <div class="content-wrap">
            <div class="timeline-container">
              <div class="timeline-main-line"></div>
              ${chunk.map(day => `
                <div class="timeline-page-item">
                  <div class="timeline-day-box">
                    <div class="day-label-giant">Day</div>
                    <div class="day-num-giant">${String(day.day).padStart(2, '0')}</div>
                  </div>
                  <div class="timeline-dot-outer"></div>
                  <div class="timeline-content-luxe">
                    <h3 class="timeline-title-luxe">${day.title}</h3>
                    <p class="timeline-desc-luxe">${day.description}</p>
                    ${(day as any).activities && (day as any).activities.length > 0 ? `
                      <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px;">
                        ${(day as any).activities.map((act: string) => `
                          <span style="background: #ea580c12; color: #ea580c; border: 1px solid #ea580c35; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
                            ✦ ${act}
                          </span>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="footer-luxe">
            <span style="color: ${secondaryColor};">Ghumo Firoo Travels</span>
            <span>Day-By-Day Experience</span>
          </div>
        </div>
      `).join('')}

      <!-- FINAL PAGE: THE CALL TO ADVENTURE & POLICY -->
      <div class="pdf-page">
        <div class="final-page">
          <img src="${bgImage}" class="final-bg-img" crossorigin="anonymous" />
          <div class="final-card">
            <div style="background: rgba(255,255,255,0.95); padding: 12px 28px; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
              <img src="${brandLogo}" style="height: 48px;" crossorigin="anonymous" />
            </div>
            <h2 class="final-title" style="font-size: 44px; color: #ffffff; text-shadow: 0 4px 12px rgba(0,0,0,0.6);">Begin Your Journey</h2>
            <p class="final-subtitle" style="color: #F59E0B; font-weight: 800; font-size: 16px; letter-spacing: 1px; margin-top: 5px;">Crafted with passion, executed with precision.</p>
            
            <div class="contact-grid-luxe" style="margin-top: 30px;">
              <div class="contact-pill" style="background: rgba(15,23,42,0.85); border: 1px solid rgba(245,158,11,0.4); padding: 18px 24px; border-radius: 20px; display: flex; align-items: center; gap: 20px; width: 100%;">
                <div class="contact-icon-luxe" style="width: 48px; height: 48px; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div style="text-align: left;">
                  <div class="contact-label-luxe" style="color: #F59E0B; font-weight: 800; font-size: 11px; letter-spacing: 2px;">Direct Concierge</div>
                  <div class="contact-val-luxe" style="color: #ffffff; font-weight: 800; font-size: 20px;">+91 99109 87264</div>
                </div>
              </div>
              <div class="contact-pill" style="background: rgba(15,23,42,0.85); border: 1px solid rgba(245,158,11,0.4); padding: 18px 24px; border-radius: 20px; display: flex; align-items: center; gap: 20px; width: 100%;">
                <div class="contact-icon-luxe" style="width: 48px; height: 48px; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div style="text-align: left;">
                  <div class="contact-label-luxe" style="color: #F59E0B; font-weight: 800; font-size: 11px; letter-spacing: 2px;">Official Email</div>
                  <div class="contact-val-luxe" style="color: #ffffff; font-weight: 800; font-size: 20px;">booking@ghumofiroo.com</div>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 30px; background: rgba(15,23,42,0.85); padding: 16px 25px; border-radius: 18px; border: 1px solid rgba(245,158,11,0.4); width: 100%; text-align: center;">
              <div style="font-size: 11px; color: #F59E0B; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">Booking Advance Policy</div>
              <div style="font-size: 12px; color: #ffffff; font-weight: 700;">25% at booking confirmation • 50% 30 days prior • 100% 15 days prior to travel date</div>
            </div>

            <div style="margin-top: 35px;">
              <div style="font-size: 14px; letter-spacing: 5px; color: #F59E0B; font-weight: 900; text-transform: uppercase;">www.ghumofiroo.com</div>
              <div style="margin-top: 10px; font-size: 10px; color: rgba(255,255,255,0.6); letter-spacing: 2px;">© ${new Date().getFullYear()} GHUMO FIROO TRAVELS • ALL RIGHTS RESERVED</div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const waitForImages = async (root: HTMLElement, timeoutMs = 8000) => {
    const preload = (src: string) => new Promise<void>(res => {
      if (!src) return res();
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => res();
      im.onerror = () => res();
      im.src = src;
    });
    const imgEls = Array.from(root.querySelectorAll('img'));
    const imgPromises = imgEls.map(img => (img.complete ? Promise.resolve() : new Promise<void>(res => {
      img.onload = () => res();
      img.onerror = () => res();
    })));
    const bgUrls = new Set<string>();
    const allEls = Array.from(root.querySelectorAll<HTMLElement>('*'));
    for (const el of allEls) {
      const style = getComputedStyle(el);
      const bg = style.getPropertyValue('background-image');
      if (bg && bg.includes('url(')) {
        const re = /url\((['"]?)(.*?)\1\)/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(bg)) !== null) {
          if (m[2]) bgUrls.add(m[2]);
        }
      }
    }
    const bgPromises = Array.from(bgUrls).map(u => preload(u));
    await Promise.race([
      Promise.all([...imgPromises, ...bgPromises]),
      new Promise<void>(res => setTimeout(res, timeoutMs))
    ]);
  };

  // Vector/fast mode generator (no html2canvas)
  // unified: rich visual generator with optimized scale and consistent contact page

  const downloadBrochure = async () => {
    try {
      const t0 = performance.now();
      setIsDownloading(true);
      setProgress(0);
      abortRef.current = false;

      const officialPdf = getOfficialBrochureUrl();
      if (officialPdf) {
        const link = document.createElement('a');
        link.href = officialPdf;
        link.download = officialPdf.split('/').pop() || `${destination.replace(/\s+/g, '_')}_Brochure.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false);
        toast({
          title: "Official Brochure Downloaded",
          description: `Your official ${packageDetails.title} PDF brochure is ready.`,
          variant: "default"
        });
        return;
      }

      const cacheKey = getCacheKey();
      let cached = loadFromCache(cacheKey) || await idbGet(cacheKey);
      // Legacy cache discovery (v1/v2). Do NOT use directly; prefer regenerating to ensure branding.
      let legacyBuf: Uint8Array | null = null;
      if (!cached) {
        for (const legacyKey of getLegacyKeys()) {
          const s1 = sessionStorage.getItem(legacyKey);
          if (s1) {
            const bin = atob(s1);
            const arr = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            legacyBuf = arr; break;
          }
          const d1 = await idbGet(legacyKey);
          if (d1) { legacyBuf = d1; break; }
        }
      }
      if (cached && !abortRef.current) {
        const blob = new Blob([cached], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${destination.replace(/\s+/g, '_')}_Brochure.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        await clearLegacyCaches();
        pushEvent('brochure_perf', { cached: true, duration_ms: Math.round(performance.now() - t0) });
        return;
      }

      let buf: ArrayBuffer | Uint8Array;
      let pagesCount = 1;
      let scaleUsed = 1.5;
        const container = document.createElement('div');
        container.innerHTML = generatePagedBrochureContent();
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '794px';
        container.style.zIndex = '-1';
        document.body.appendChild(container);
  
        await waitForImages(container, 8000);
  
        const pages = Array.from(container.querySelectorAll('.pdf-page')) as HTMLElement[];
        pagesCount = pages.length;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  
        const scale = 1.5; // Optimized scale for quality vs performance
        scaleUsed = scale;
        for (let i = 0; i < pages.length; i++) {
          if (abortRef.current) break;
          const page = pages[i];
          
          // Use a small delay to keep UI responsive
          await new Promise(resolve => setTimeout(resolve, 50));
          
          const canvas = await html2canvas(page, { 
            scale, 
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            imageTimeout: 3000, // Reduced timeout
            logging: false,
            removeContainer: true
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.85); // Reduced quality slightly for much smaller size
          const imgWidth = 210; 
          const imgHeight = 297; 
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
          
          setProgress(Math.round(((i + 1) / pages.length) * 100));
          
          // Clean up canvas memory immediately
          canvas.width = 0;
          canvas.height = 0;
        }
        pdf.setProperties({ title: `${packageDetails.title} Brochure`, subject: `Travel Itinerary for ${destination}`, author: 'Ghumo Firoo Travels', creator: 'Ghumo Firoo Travels' });
        buf = pdf.output('arraybuffer');
        document.body.removeChild(container);

      const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
      saveToCache(cacheKey, u8);
      idbPut(cacheKey, u8);
      const blob = new Blob([u8], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${destination.replace(/\s+/g, '_')}_Brochure.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      await clearLegacyCaches();
      pushEvent('brochure_perf', { cached: false, pages: pagesCount, scale: scaleUsed, duration_ms: Math.round(performance.now() - t0) });
    } catch (error) {
      console.error('PDF Generation failed:', error);
      // Fallback to legacy cache if available to avoid user interruption
      try {
        const legacyKeys = getLegacyKeys();
        for (const legacyKey of legacyKeys) {
          const s1 = sessionStorage.getItem(legacyKey);
          if (s1) {
            const bin = atob(s1);
            const arr = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            const blob = new Blob([arr], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${destination.replace(/\s+/g, '_')}_Brochure.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: "Downloaded Cached Brochure", description: "Showing an older cached version while we regenerate.", variant: "default" });
            return;
          }
          const d1 = await idbGet(legacyKey);
          if (d1) {
            const blob = new Blob([d1], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${destination.replace(/\s+/g, '_')}_Brochure.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: "Downloaded Cached Brochure", description: "Showing an older cached version while we regenerate.", variant: "default" });
            return;
          }
        }
      } catch {}
      toast({ title: "PDF Generation Failed", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  const heroImage = selectBrochureHeroImage();
  const whatsappUrl = `https://wa.me/919910987264?text=${encodeURIComponent(`Hi Ghumo Firoo Travels! I just downloaded the brochure for ${packageDetails.title} and want to consult a travel expert about planning this trip.`)}`;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        setIsSuccess(false);
        setSubmittedName('');
        setSubmittedEmail('');
        reset();
      }, 300);
    }
  };

  const handleDownloadCachedPdf = () => {
    if (generatedPdfData) {
      const a = document.createElement('a');
      a.href = generatedPdfData.url;
      a.download = generatedPdfData.fileName;
      a.click();
      
      pushEvent('brochure_redownload', { destination, package_title: packageDetails.title });
    }
  };

  return (
    <>
      <Button onClick={onDownloadClick} className={`${className} bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2`} aria-label="Download brochure">
        <FileText className="w-5 h-5" aria-hidden="true" /> Download PDF Brochure
      </Button>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden bg-[#0a1128] text-white border-white/10 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] focus:outline-none" aria-label="Luxury Travel Consultation">
          <DialogTitle className="sr-only">Download Brochure & Consultation</DialogTitle>
          <DialogDescription className="sr-only">Request custom itinerary and download brochure</DialogDescription>
          <div className="flex flex-col md:flex-row h-auto md:h-[620px] overflow-hidden">
            
            {/* LEFT SIDE (40% width on desktop, top on mobile) */}
            <div className="relative w-full md:w-[40%] h-[220px] md:h-full flex flex-col justify-between p-6 md:p-8 overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
              {/* Background Hero Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={heroImage}
                  alt={destination}
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a1128]/70 via-[#1c2541]/85 to-[#0a1128]" />
              </div>
              
              {/* Content Overlay */}
              <div className="relative z-10 flex flex-col justify-between h-full text-left">
                <div>
                  <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full mb-2">
                    Luxury Consult
                  </span>
                  <h3 className="font-display text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
                    {packageDetails.title.replace(/^\d+-Day\s+/, '')}
                  </h3>
                  <div className="w-8 h-[2px] bg-[#D4AF37] my-2" />
                </div>
                
                <div className="space-y-3 my-auto pt-2">
                  {/* Duration */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-[#D4AF37]">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Duration</p>
                      <p className="text-xs font-semibold text-white">{packageDetails.duration}</p>
                    </div>
                  </div>
                  
                  {/* Destinations Covered */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-[#D4AF37]">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Destinations Covered</p>
                      <p className="text-xs font-semibold text-white truncate max-w-[180px]">
                        {packageDetails.destinations ? packageDetails.destinations.join(' + ') : destination}
                      </p>
                    </div>
                  </div>

                  {/* Hotel Category */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-[#D4AF37]">
                      <Star className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Hotel Category</p>
                      <p className="text-xs font-semibold text-white">{accommodation || "4 Star Hotels"}</p>
                    </div>
                  </div>

                  {/* Starting Price */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-[#D4AF37]">
                      <span className="text-xs font-bold">₹</span>
                    </span>
                    <div>
                      <p className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Starting Price</p>
                      <p className="text-xs font-bold text-white">₹{formatPrice()}</p>
                    </div>
                  </div>

                  {/* Travel Style */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-[#D4AF37]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Travel Style</p>
                      <p className="text-xs font-semibold text-white">{transport || "Airport Transfers Included"}</p>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block pt-3 border-t border-white/10">
                  <p className="text-[9px] text-white/40 tracking-wider font-semibold">CURATED BY</p>
                  <p className="text-xs font-display italic text-white/60">Ghumo Firoo Travels</p>
                </div>
              </div>
            </div>
            
            {/* RIGHT SIDE (60% width on desktop, bottom on mobile) */}
            <div className="w-full md:w-[60%] flex flex-col justify-between p-6 md:p-8 bg-[#0a1128] overflow-y-auto max-h-[calc(95vh-220px)] md:max-h-full">
              {isSuccess ? (
                /* Success Screen state */
                <div className="flex flex-col justify-center items-center h-full text-center space-y-6 py-6 md:py-10 animate-in fade-in duration-300">
                  <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">Thank You</h2>
                    <p className="text-[#D4AF37] font-semibold text-sm">Your brochure is ready.</p>
                    {submittedName && (
                      <p className="text-[11px] text-white/50">Itinerary sent to {submittedEmail}</p>
                    )}
                  </div>
                  
                  <div className="w-full max-w-xs space-y-3 pt-2">
                    <Button
                      onClick={handleDownloadCachedPdf}
                      className="w-full py-5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#0a1128] font-bold text-sm shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </Button>
                    
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button
                        variant="outline"
                        className="w-full py-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4 text-[#D4AF37]" /> Talk To Travel Expert
                      </Button>
                    </a>
                    
                    <Link
                      to={`/enquire-now?package=${encodeURIComponent(packageDetails.title)}&destination=${encodeURIComponent(destination)}`}
                      onClick={() => setIsOpen(false)}
                      className="block w-full"
                    >
                      <Button
                        variant="outline"
                        className="w-full py-5 rounded-xl border border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 text-[#D4AF37] font-semibold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <span>🚀</span> Request Custom Quote
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Lead Form state */
                <div className="flex flex-col h-full justify-between space-y-4 text-left">
                  {/* Header */}
                  <div>
                    <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-white mb-1.5 leading-tight">
                      Download Premium Travel Guide
                    </h2>
                    <p className="text-white/70 text-[11px] leading-relaxed md:text-xs">
                      Receive complete itinerary, hotel options, sightseeing, inclusions, exclusions, and pricing details.
                    </p>
                  </div>

                  {/* Trust Indicators */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-white/90">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#D4AF37] font-bold">✓</span> Trusted Travel Experts
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#D4AF37] font-bold">✓</span> Customizable Itinerary
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#D4AF37] font-bold">✓</span> Instant PDF Access
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#D4AF37] font-bold">✓</span> No Spam Guarantee
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-1" aria-live="polite">
                    
                    {/* Row 1: Full Name */}
                    <div className="relative">
                      <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        autoComplete="name"
                        id="name"
                        placeholder=" "
                        className={`peer block w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all placeholder:opacity-0 ${
                          errors.name ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                        }`}
                        {...register("name")}
                      />
                      <label
                        htmlFor="name"
                        className={`absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] ${
                          watchedName ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                        }`}
                      >
                        Full Name
                      </label>
                      {errors.name && <p className="text-[9px] text-red-400 mt-0.5 pl-2">{errors.name.message}</p>}
                    </div>

                    {/* Row 2: Phone & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Phone */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          autoComplete="tel"
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder=" "
                          className={`peer block w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all placeholder:opacity-0 ${
                            errors.phone ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                          }`}
                          {...register("phone", {
                            onChange: (e) => {
                              e.target.value = sanitizePhone(e.target.value);
                            }
                          })}
                        />
                        <label
                          htmlFor="phone"
                          className={`absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] ${
                            watchedPhone ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                          }`}
                        >
                          Phone Number
                        </label>
                        {errors.phone && <p className="text-[9px] text-red-400 mt-0.5 pl-2">{errors.phone.message}</p>}
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          autoComplete="email"
                          id="email"
                          type="email"
                          placeholder=" "
                          className={`peer block w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all placeholder:opacity-0 ${
                            errors.email ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                          }`}
                          {...register("email")}
                        />
                        <label
                          htmlFor="email"
                          className={`absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] ${
                            watchedEmail ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                          }`}
                        >
                          Email Address
                        </label>
                        {errors.email && <p className="text-[9px] text-red-400 mt-0.5 pl-2">{errors.email.message}</p>}
                      </div>
                    </div>

                    {/* Row 3: City & Travel Month */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* City */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input
                          id="city"
                          placeholder=" "
                          className={`peer block w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all placeholder:opacity-0 ${
                            errors.city ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                          }`}
                          {...register("city")}
                        />
                        <label
                          htmlFor="city"
                          className={`absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] ${
                            watchedCity ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                          }`}
                        >
                          City
                        </label>
                        {errors.city && <p className="text-[9px] text-red-400 mt-0.5 pl-2">{errors.city.message}</p>}
                      </div>

                      {/* Travel Month */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <select
                          id="travelMonth"
                          className={`peer block w-full pl-9 pr-8 pt-5 pb-1.5 text-xs text-white bg-[#0a1128] border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all appearance-none cursor-pointer ${
                            errors.travelMonth ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                          }`}
                          {...register("travelMonth")}
                        >
                          <option value="" disabled hidden></option>
                          {getNext12Months().map((m, idx) => (
                            <option key={idx} value={m} className="bg-[#0a1128] text-white">{m}</option>
                          ))}
                        </select>
                        <label
                          htmlFor="travelMonth"
                          className={`absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] ${
                            watchedTravelMonth ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                          }`}
                        >
                          Travel Month
                        </label>
                        <div className="absolute right-3 top-3.5 text-white/40 pointer-events-none">
                          <span className="text-[8px]">▼</span>
                        </div>
                        {errors.travelMonth && <p className="text-[9px] text-red-400 mt-0.5 pl-2">{errors.travelMonth.message}</p>}
                      </div>
                    </div>

                    {/* Row 4: Number of Travelers & Budget */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Number of Travelers */}
                      <div className="relative">
                        <div className="absolute left-3 top-3.5 text-white/40 pointer-events-none">
                          <Users className="w-4 h-4" />
                        </div>
                        <input
                          id="numberOfTravelers"
                          type="number"
                          min={1}
                          max={99}
                          placeholder=" "
                          className={`peer block w-full pl-9 pr-3 pt-5 pb-1.5 text-xs text-white bg-white/5 border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all placeholder:opacity-0 ${
                            errors.numberOfTravelers ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                          }`}
                          {...register("numberOfTravelers")}
                        />
                        <label
                          htmlFor="numberOfTravelers"
                          className={`absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] ${
                            watchedNumberOfTravelers ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                          }`}
                        >
                          Number of Travelers
                        </label>
                        {errors.numberOfTravelers && <p className="text-[9px] text-red-400 mt-0.5 pl-2">{errors.numberOfTravelers.message}</p>}
                      </div>

                      {/* Budget Range */}
                      <div className="relative">
                        <div className="absolute left-3.5 top-3.5 text-white/40 font-bold text-xs pointer-events-none">
                          ₹
                        </div>
                        <select
                          id="budget"
                          className={`peer block w-full pl-9 pr-8 pt-5 pb-1.5 text-xs text-white bg-[#0a1128] border rounded-xl focus:border-[#D4AF37] focus:outline-none transition-all appearance-none cursor-pointer ${
                            errors.budget ? "border-red-500/80 focus:border-red-500" : "border-white/10"
                          }`}
                          {...register("budget")}
                        >
                          <option value="" disabled hidden></option>
                          <option value="₹25,000–50,000" className="bg-[#0a1128] text-white">₹25,000–50,000</option>
                          <option value="₹50,000–1 Lakh" className="bg-[#0a1128] text-white">₹50,000–1 Lakh</option>
                          <option value="₹1–2 Lakh" className="bg-[#0a1128] text-white">₹1–2 Lakh</option>
                          <option value="₹2 Lakh+" className="bg-[#0a1128] text-white">₹2 Lakh+</option>
                        </select>
                        <label
                          htmlFor="budget"
                          className={`absolute left-9 transition-all duration-200 pointer-events-none origin-[0] peer-focus:top-1 peer-focus:text-[9px] peer-focus:text-[#D4AF37] ${
                            watchedBudget ? "top-1 text-[9px] text-[#D4AF37]" : "top-3.5 text-xs text-white/40"
                          }`}
                        >
                          Budget Range
                        </label>
                        <div className="absolute right-3 top-3.5 text-white/40 pointer-events-none">
                          <span className="text-[8px]">▼</span>
                        </div>
                        {errors.budget && <p className="text-[9px] text-red-400 mt-0.5 pl-2">{errors.budget.message}</p>}
                      </div>
                    </div>

                    {/* Progress Bar for generating PDF */}
                    {isDownloading && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[9px] text-white/50 font-semibold">
                          <span>Preparing Premium Brochure...</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                          <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isDownloading}
                        className="w-full h-11 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-[#0a1128] font-bold text-xs shadow-[0_4px_15px_rgba(212,175,55,0.2)] hover:opacity-95 hover:scale-[1.005] active:scale-[0.995] transition-all flex items-center justify-center gap-2"
                      >
                        {isDownloading ? (
                          <><Loader2 className="w-4 h-4 animate-spin text-[#0a1128]" /> Preparing Itinerary {progress ? `${progress}%` : ''}</>
                        ) : (
                          <><Download className="w-3.5 h-3.5" /> Download Premium Brochure</>
                        )}
                      </Button>
                    </div>

                  </form>
                </div>
              )}
            </div>
            
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedBrochureDownload;
