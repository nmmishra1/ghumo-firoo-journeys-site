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
import { getDestinationCode, formatQuoteRef } from '@/lib/voucherService';

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
  travelMonth: z.string().optional(),
  numberOfTravelers: z.string().optional(),
  budget: z.string().optional()
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
  buttonLabel?: string;
  isQuoteMode?: boolean;
  selectedCabName?: string;
  travelDate?: string;
  returnDate?: string;
  passengersCount?: number;
  adultsCount?: number;
  childrenCount?: number;
  infantsCount?: number;
  totalPrice?: number | string;
  leadId?: string | number;
  customQuoteRef?: string;
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
  dropLocation,
  buttonLabel,
  isQuoteMode = false,
  selectedCabName,
  travelDate,
  returnDate,
  passengersCount,
  adultsCount,
  childrenCount,
  infantsCount,
  totalPrice,
  leadId,
  customQuoteRef
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

  const defaultTravelMonth = travelDate 
    ? new Date(travelDate).toLocaleString('en-US', { month: 'long', year: 'numeric' }) 
    : getNext12Months()[0];
  const defaultBudget = totalPrice 
    ? `₹${Number(String(totalPrice).replace(/[^\d]/g, '')).toLocaleString('en-IN')}` 
    : '₹25,000–50,000';

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    mode: 'onChange',
    defaultValues: {
      numberOfTravelers: String(passengersCount || 2),
      travelMonth: defaultTravelMonth,
      budget: defaultBudget,
      city: ''
    }
  });

  useEffect(() => {
    if (passengersCount) {
      setValue('numberOfTravelers', String(passengersCount));
    }
    if (totalPrice) {
      setValue('budget', `₹${Number(String(totalPrice).replace(/[^\d]/g, '')).toLocaleString('en-IN')}`);
    }
    if (travelDate) {
      try {
        const d = new Date(travelDate);
        if (!isNaN(d.getTime())) {
          setValue('travelMonth', d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
        }
      } catch {}
    }
  }, [passengersCount, totalPrice, travelDate, setValue]);

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
    const BROCHURE_SCHEMA_VERSION = 'v15';
    const s = JSON.stringify({ 
      v: BROCHURE_SCHEMA_VERSION, 
      packageDetails, 
      packageType, 
      destination,
      isQuoteMode,
      selectedCabName,
      travelDate,
      returnDate,
      pickupLocation,
      dropLocation,
      passengersCount,
      totalPrice
    }).slice(0, 10000);
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
    // When generating an official quote with user's customized cab, dates, or price, always render dynamic quote PDF!
    if (isQuoteMode || selectedCabName || travelDate || totalPrice) {
      return null;
    }

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

  const generatePdfBase64 = async (leadInfo?: { name?: string; phone?: string }): Promise<string> => {
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

    const guestName = leadInfo?.name || watchedName || '';
    const guestPhone = leadInfo?.phone || watchedPhone || '';

    const container = document.createElement('div');
    container.innerHTML = generatePagedBrochureContent(guestName, guestPhone);
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
        title: isQuoteMode ? "Preparing Official Quotation..." : "Preparing Brochure...",
        description: isQuoteMode 
          ? "Please stay on this page. We are preparing your official customized travel quotation."
          : "Please stay on this page. We are preparing your official travel brochure.",
      });

      // 1. Silent PDF Generation or Official Brochure Attachment
      const base64Pdf = await generatePdfBase64({ name: data.name, phone: data.phone });
      if (abortRef.current) return;

      const officialPdf = getOfficialBrochureUrl();
      const cleanPkgName = packageDetails.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
      const pdfFileName = officialPdf 
        ? officialPdf.split('/').pop()! 
        : (isQuoteMode ? `${cleanPkgName}_Official_Quote.pdf` : `${destination.replace(/\s+/g, '_')}_Brochure.pdf`);

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
        source: isQuoteMode ? ('Quote PDF Download' as const) : ('Brochure Download' as const),
        status: 'New Inquiry',
        notes: `Requested ${isQuoteMode ? 'Official Quotation' : 'Brochure'} for ${packageDetails.title}. Cab: ${selectedCabName || transport || 'Standard'}, Travel Dates: ${travelDate || 'Not specified'} to ${returnDate || 'Not specified'}, Pickup: ${pickupLocation || 'Default'}, Drop: ${dropLocation || 'Default'}, City: ${data.city}, Travel Month: ${data.travelMonth}, Travelers: ${data.numberOfTravelers}, Budget: ${data.budget}`,
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

  const generatePagedBrochureContent = (guestName?: string, guestPhone?: string) => {
    const a4w = 794; 
    const a4h = 1123; 
    
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoImg = `${origin}/ghumo-firoo-logo.png`;
    const iconImg = `${origin}/ghumo-firoo-icon.png`;

    const effectivePax = passengersCount || Number(watchedNumberOfTravelers) || 2;
    const effectiveAdults = adultsCount || effectivePax;
    const effectiveChildren = childrenCount || 0;
    const effectiveCabName = selectedCabName || transport || 'AC SUV (Maruti Ertiga / Triber)';
    const effectivePickup = pickupLocation || 'Bhuj Railway Station';
    const effectiveDrop = dropLocation || 'Bhuj Railway Station';

    const formatDateDisplay = (dateStr?: string) => {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    const effectiveTravelDate = formatDateDisplay(travelDate) || 'As Confirmed';
    const effectiveReturnDate = formatDateDisplay(returnDate) || 'As Confirmed';

    let computedTotalCost = 0;
    if (totalPrice) {
      if (typeof totalPrice === 'number') {
        computedTotalCost = totalPrice;
      } else {
        const n = Number(String(totalPrice).replace(/[^\d]/g, ''));
        computedTotalCost = isNaN(n) ? 0 : n;
      }
    }
    if (!computedTotalCost || computedTotalCost <= 0) {
      const unit = Number(String(packageDetails.price).replace(/[^\d]/g, '')) || 0;
      computedTotalCost = unit * effectivePax;
    }
    const formattedTotalCost = computedTotalCost.toLocaleString('en-IN');
    const displayPerPaxPrice = Math.round(computedTotalCost / Math.max(1, effectivePax)).toLocaleString('en-IN');

    const destCode = getDestinationCode(destination, packageDetails.title);
    const quoteNumber = leadId ? String(leadId).padStart(4, '0') : String(Math.floor(1000 + Math.random() * 9000));
    const formattedQuoteRef = customQuoteRef || `GFQ-${destCode}-${quoteNumber}`;
    const quoteDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    let coverBg = selectBrochureHeroImage();
    const destLower = (destination || packageDetails.title || '').toLowerCase();
    if (destLower.includes('rann') || destLower.includes('kutch') || destLower.includes('gujarat') || destLower.includes('dhordo')) {
      coverBg = `${origin}/brochure-assets/cover_kutch.jpg`;
    }

    const displayGuestName = guestName?.trim() || watchedName?.trim() || 'Valued Guest';
    const displayGuestPhone = guestPhone?.trim() || watchedPhone?.trim() || '';

    // Dynamic Title Engine: extracts title dynamically, removes parenthetical tags, and balances across lines
    const rawTitle = (packageDetails.title || '').trim();
    const cleanedTitle = rawTitle.replace(/\s*\([^)]*\)/g, '').trim().toUpperCase();
    const titleWords = cleanedTitle.split(/\s+/).filter(Boolean);

    let titleLine1 = '';
    let titleLine2 = '';

    if (titleWords.length <= 2) {
      titleLine1 = titleWords[0] || '';
      titleLine2 = titleWords[1] || '';
    } else {
      // Find optimal split point for balanced character distribution across 2 lines
      let bestSplit = Math.ceil(titleWords.length / 2);
      let minDiff = Infinity;
      for (let i = 1; i < titleWords.length; i++) {
        const l1 = titleWords.slice(0, i).join(' ');
        const l2 = titleWords.slice(i).join(' ');
        const diff = Math.abs(l1.length - l2.length);
        if (diff < minDiff) {
          minDiff = diff;
          bestSplit = i;
        }
      }
      titleLine1 = titleWords.slice(0, bestSplit).join(' ');
      titleLine2 = titleWords.slice(bestSplit).join(' ');
    }

    const coverMainTitle = titleLine2 ? `${titleLine1}<br/>${titleLine2}` : titleLine1;
    const maxLineLength = Math.max(titleLine1.length, titleLine2.length);

    // Dynamically calculate font-size, letter-spacing, and line-height based on title length
    let dynamicTitleSize = 64;
    let dynamicLetterSpacing = 5.5;
    let dynamicLineHeight = 1.06;

    if (maxLineLength <= 7) {
      dynamicTitleSize = 64;
      dynamicLetterSpacing = 5.5;
      dynamicLineHeight = 1.05;
    } else if (maxLineLength <= 11) {
      dynamicTitleSize = 58;
      dynamicLetterSpacing = 4.5;
      dynamicLineHeight = 1.07;
    } else if (maxLineLength <= 15) {
      dynamicTitleSize = 50;
      dynamicLetterSpacing = 3.5;
      dynamicLineHeight = 1.09;
    } else if (maxLineLength <= 20) {
      dynamicTitleSize = 42;
      dynamicLetterSpacing = 2.5;
      dynamicLineHeight = 1.12;
    } else {
      dynamicTitleSize = 36;
      dynamicLetterSpacing = 1.8;
      dynamicLineHeight = 1.15;
    }

    const durLower = (packageDetails.duration || '').toLowerCase();
    let durationPillText = '02 NIGHTS / 03 DAYS';
    if (durLower.includes('4d') || durLower.includes('4 day') || durLower.includes('3n') || durLower.includes('3 night')) {
      durationPillText = '03 NIGHTS / 04 DAYS';
    } else if (durLower.includes('5d') || durLower.includes('4n')) {
      durationPillText = '04 NIGHTS / 05 DAYS';
    } else if (durLower.includes('2d') || durLower.includes('1n')) {
      durationPillText = '01 NIGHT / 02 DAYS';
    } else if (durLower.includes('3d') || durLower.includes('2n')) {
      durationPillText = '02 NIGHTS / 03 DAYS';
    }

    let nightsCount = 2;
    if (durLower.includes('1n') || durLower.includes('2d/1n') || durLower.includes('1 night') || durLower.includes('2 days / 1 night')) {
      nightsCount = 1;
    } else if (durLower.includes('2n') || durLower.includes('3d/2n') || durLower.includes('2 night') || durLower.includes('3 days / 2 night')) {
      nightsCount = 2;
    } else if (durLower.includes('3n') || durLower.includes('4d/3n') || durLower.includes('3 night') || durLower.includes('4 days / 3 night')) {
      nightsCount = 3;
    } else if (durLower.includes('4n') || durLower.includes('5d/4n') || durLower.includes('4 night') || durLower.includes('5 days / 4 night')) {
      nightsCount = 4;
    }

    // Dynamic Hotel Resolution:
    let resolvedHotels: Array<{ name: string; location: string; stars?: number; room_type?: string; meal_plan?: string; image?: string; description?: string }> = [];
    if (packageDetails.hotels && packageDetails.hotels.length > 0) {
      resolvedHotels = packageDetails.hotels.map((h: any, idx: number) => {
        let hImg = `${origin}/brochure-assets/gala_dinner.jpg`;
        const hNameLower = (h.name || '').toLowerCase();
        if (hNameLower.includes('tent city') || hNameLower.includes('evoke') || hNameLower.includes('praveg')) {
          hImg = `${origin}/rann_utsav_tent_city.jpg`;
        } else if (hNameLower.includes('dholavira') || hNameLower.includes('heaven')) {
          hImg = `${origin}/brochure-assets/dholavira.jpg`;
        } else if (hNameLower.includes('mandvi') || hNameLower.includes('beach') || hNameLower.includes('serena')) {
          hImg = `${origin}/Mandvi Beach_Kutch.png`;
        } else if (hNameLower.includes('bhuj') || hNameLower.includes('regenta') || hNameLower.includes('mangalam') || hNameLower.includes('fern')) {
          hImg = `${origin}/brochure-assets/palace_legacy.jpg`;
        } else {
          const fallbackImgs = [
            `${origin}/rann_utsav_tent_city.jpg`,
            `${origin}/brochure-assets/gala_dinner.jpg`,
            `${origin}/Mandvi Beach_Kutch.png`,
            `${origin}/brochure-assets/palace_legacy.jpg`
          ];
          hImg = fallbackImgs[idx % fallbackImgs.length];
        }
        return {
          name: h.name,
          location: h.location || 'Kutch, Gujarat',
          stars: h.stars || 4,
          room_type: h.room_type || 'Deluxe A/C Swiss Cottage Tent',
          meal_plan: h.meal_plan || 'ALL MEALS INCLUDED (BUFFET)',
          image: h.image || hImg,
          description: h.highlight || h.description || `${h.room_type || 'Luxury Stay'} with 24/7 concierge service`
        };
      });
    }

    // Default hotel fallback curated strictly by nights stayed
    if (resolvedHotels.length === 0) {
      if (nightsCount === 1) {
        resolvedHotels = [
          {
            name: "Evoke Tent City Dhordo",
            location: "Dhordo, Kutch",
            stars: 5,
            room_type: "A/C Premium Royal Swiss Tent",
            meal_plan: "ALL MEALS INCLUDED (BUFFET)",
            image: `${origin}/rann_utsav_tent_city.jpg`,
            description: "Official partner luxury Swiss Tent with White Rann proximity and all gourmet meals"
          }
        ];
      } else if (nightsCount === 2) {
        resolvedHotels = [
          {
            name: "Praveg Tent City Dhordo",
            location: "Dhordo, Kutch",
            stars: 5,
            room_type: "Night 1: A/C Royal Swiss Tent",
            meal_plan: "ALL MEALS INCLUDED (BUFFET)",
            image: `${origin}/rann_utsav_tent_city.jpg`,
            description: "Iconic White Desert resort with cultural folk stage shows and stargazing"
          },
          {
            name: "Evoke Resort & Swiss Tents",
            location: "Dhordo, Kutch",
            stars: 4,
            room_type: "Night 2: Deluxe A/C Swiss Cottage",
            meal_plan: "ALL MEALS INCLUDED (BUFFET)",
            image: `${origin}/brochure-assets/gala_dinner.jpg`,
            description: "Authentic Kutchi Bhunga & Swiss cottages with authentic Kutchi dining"
          }
        ];
      } else if (nightsCount === 3) {
        resolvedHotels = [
          {
            name: "Praveg Tent City Dhordo",
            location: "Dhordo, Kutch",
            stars: 5,
            room_type: "Nights 1 & 2: Royal Swiss Tent",
            meal_plan: "ALL MEALS INCLUDED (BUFFET)",
            image: `${origin}/rann_utsav_tent_city.jpg`,
            description: "Direct access to White Desert sunset walks and cultural amphitheater"
          },
          {
            name: "Regenta Resort / Palace Heritage",
            location: "Bhuj Heritage City",
            stars: 4,
            room_type: "Night 3: Royal Heritage Room",
            meal_plan: "BUFFET BREAKFAST & DINNER",
            image: `${origin}/brochure-assets/palace_legacy.jpg`,
            description: "Heritage luxury stay near Prag Mahal, Aina Mahal and Bhuj markets"
          }
        ];
      } else {
        resolvedHotels = [
          {
            name: "Praveg Tent City Dhordo",
            location: "Dhordo, Kutch",
            stars: 5,
            room_type: "Night 1: A/C Swiss Tent",
            meal_plan: "ALL MEALS INCLUDED",
            image: `${origin}/rann_utsav_tent_city.jpg`,
            description: "White Desert sunset and bonfire base"
          },
          {
            name: "StayGuru Dholavira Resort",
            location: "Dholavira UNESCO Site",
            stars: 4,
            room_type: "Night 2: Deluxe Cottage",
            meal_plan: "MAP (BREAKFAST & DINNER)",
            image: `${origin}/brochure-assets/dholavira.jpg`,
            description: "Road to Heaven highway & Harappan ruins base"
          },
          {
            name: "Serena Beach Resort",
            location: "Mandvi Beach",
            stars: 4,
            room_type: "Night 3: Coastal Sea Villa",
            meal_plan: "MAP (BREAKFAST & DINNER)",
            image: `${origin}/Mandvi Beach_Kutch.png`,
            description: "Private beach access and Vijay Vilas Palace retreat"
          },
          {
            name: "Regenta Resort Bhuj",
            location: "Bhuj Heritage City",
            stars: 4,
            room_type: "Night 4: Heritage Room",
            meal_plan: "MAP (BREAKFAST & DINNER)",
            image: `${origin}/brochure-assets/palace_legacy.jpg`,
            description: "Palaces, Smritivan museum and handicraft shopping base"
          }
        ];
      }
    }
    // Limit to actual nights stayed so 2N package displays exactly 2 cards side-by-side
    const displayHotels = resolvedHotels.slice(0, Math.min(Math.max(1, nightsCount), 4));

    // Context-Aware Day Images with Keyword Matching
    const getItineraryDayImage = (day: any, idx: number) => {
      if (day.image && day.image.startsWith('http')) return day.image;
      if (day.image && day.image.startsWith('/')) return `${origin}${day.image}`;
      
      const dayText = `${day.title || ''} ${day.description || ''} ${(day.activities || []).join(' ')}`.toLowerCase();
      
      if (destLower.includes('rann') || destLower.includes('kutch') || destLower.includes('dhordo')) {
        if (dayText.includes('heaven') || dayText.includes('dholavira') || dayText.includes('highway')) {
          return `${origin}/rann_utsav_road_to_heaven.jpg`;
        }
        if (dayText.includes('mandvi') || dayText.includes('beach') || dayText.includes('vijay vilas') || dayText.includes('coast')) {
          return `${origin}/Mandvi Beach_Kutch.png`;
        }
        if (dayText.includes('kalo dungar') || dayText.includes('black hill') || dayText.includes('dattatreya') || dayText.includes('magnetic')) {
          return `${origin}/kalodungar.jpg`;
        }
        if (dayText.includes('smritivan') || dayText.includes('museum') || dayText.includes('earthquake')) {
          return `${origin}/brochure-assets/smritivan.jpg`;
        }
        if (dayText.includes('prag mahal') || dayText.includes('aina mahal') || dayText.includes('palace') || dayText.includes('bhuj city')) {
          return `${origin}/brochure-assets/palace_legacy.jpg`;
        }
        if (dayText.includes('gala') || dayText.includes('folk') || dayText.includes('garba') || dayText.includes('craft') || dayText.includes('bazaar')) {
          return `${origin}/brochure-assets/gala_dinner.jpg`;
        }
        if (dayText.includes('white rann') || dayText.includes('sunset') || dayText.includes('sunrise') || dayText.includes('tent city')) {
          return `${origin}/rann_utsav_white_desert.jpg`;
        }

        // Ordered fallbacks if no specific keyword matched
        const kutchImages = [
          `${origin}/rann_utsav_white_desert.jpg`,
          `${origin}/rann_utsav_road_to_heaven.jpg`,
          `${origin}/Mandvi Beach_Kutch.png`,
          `${origin}/kalodungar.jpg`,
          `${origin}/brochure-assets/smritivan.jpg`,
          `${origin}/brochure-assets/palace_legacy.jpg`
        ];
        return kutchImages[idx % kutchImages.length];
      }
      return coverBg;
    };

    const itineraryList = packageDetails.itinerary || [];
    const totalDays = itineraryList.length;
    const totalPages = 4;
    const isRannUtsavPackage = destLower.includes('rann') || destLower.includes('kutch') || destLower.includes('dhordo');

    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .pdf-page {
          width: ${a4w}px !important;
          height: ${a4h}px !important;
          min-height: ${a4h}px !important;
          max-height: ${a4h}px !important;
          position: relative;
          overflow: hidden;
          background: #ffffff;
          font-family: 'Montserrat', sans-serif;
          color: #1e293b;
          page-break-after: always;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box !important;
        }

        .brand-header {
          padding: 14px 32px 10px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid rgba(201, 162, 90, 0.4);
          background: #ffffff;
          z-index: 10;
        }
        .brand-logo-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .brand-logo-img {
          height: 46px;
          width: auto;
          object-fit: contain;
        }
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .brand-name {
          font-family: 'Cinzel', serif;
          font-size: 22px;
          font-weight: 800;
          color: #0b1d3a;
          letter-spacing: 0.5px;
          line-height: 1.1;
        }
        .brand-tagline {
          font-size: 9px;
          font-weight: 700;
          color: #b8860b;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .brand-badge {
          font-size: 10px;
          font-weight: 800;
          color: #0b1d3a;
          background: rgba(201, 162, 90, 0.12);
          border: 1.5px solid #c9a25a;
          padding: 5px 14px;
          border-radius: 20px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .brand-footer {
          padding: 9px 32px;
          background: #081326;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.3px;
          border-top: 2px solid #c9a25a;
          z-index: 10;
        }
        .footer-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .footer-right {
          display: flex;
          align-items: center;
          gap: 14px;
          color: #e2e8f0;
        }

        /* PAGE 1: FULL BLEED LUXURY COVER */
        .page-cover {
          width: ${a4w}px !important;
          height: ${a4h}px !important;
          min-height: ${a4h}px !important;
          max-height: ${a4h}px !important;
          background-size: cover;
          background-position: center bottom;
          background-repeat: no-repeat;
          padding: 0;
          justify-content: space-between;
          box-sizing: border-box !important;
        }
        .cover-top-overlay {
          padding: 44px 36px 20px 36px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 48%, rgba(255, 255, 255, 0.40) 78%, rgba(255, 255, 255, 0) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          z-index: 5;
        }
        .cover-brand-header-inline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 20px;
        }
        .cover-airplane-img {
          height: 62px;
          width: 62px;
          object-fit: contain;
          filter: drop-shadow(0 3px 8px rgba(0,0,0,0.14));
        }
        .cover-brand-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .cover-brand-title {
          font-family: 'Cinzel', serif;
          font-size: 38px;
          font-weight: 900;
          color: #1877f2;
          letter-spacing: 1.6px;
          line-height: 1.08;
          text-transform: uppercase;
          text-shadow: 0 1px 2px rgba(24, 119, 242, 0.15);
          margin-bottom: 2.5px;
        }
        .cover-brand-tag {
          font-size: 11px;
          font-weight: 800;
          color: #65a30d;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .cover-brand-partner-badge {
          display: inline-block;
          height: 19px;
          line-height: 19px;
          padding: 0 16px;
          background: rgba(11, 29, 58, 0.05);
          border: 1px solid rgba(201, 162, 90, 0.7);
          border-radius: 12px;
          font-size: 8.5px;
          font-weight: 700;
          color: #0b1d3a;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          text-align: center;
          vertical-align: middle;
          box-sizing: border-box;
        }
        .cover-tagline-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: rgba(255, 255, 255, 0.96);
          border: 1.5px solid rgba(201, 162, 90, 0.85);
          color: #0b1d3a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          padding: 7px 26px;
          border-radius: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          margin-bottom: 22px;
          line-height: 1.2;
        }
        .cover-main-title {
          font-family: 'Cinzel', serif;
          font-weight: 900;
          color: #ffffff;
          text-shadow: 0 4px 22px rgba(11, 29, 58, 0.85), 0 2px 8px rgba(0,0,0,0.65);
          margin-bottom: 22px;
          text-align: center;
          max-width: 720px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .cover-guest-plaque {
          position: absolute;
          bottom: 58px;
          left: 36px;
          background: rgba(11, 29, 58, 0.90);
          backdrop-filter: blur(12px);
          border: 1.5px solid #c9a25a;
          border-radius: 10px;
          padding: 10px 18px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
          z-index: 10;
          max-width: 320px;
          text-align: left;
        }
        .guest-plaque-label {
          font-size: 8px;
          font-weight: 800;
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 3px;
        }
        .guest-plaque-name {
          font-family: 'Cinzel', serif;
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.8px;
          line-height: 1.25;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
        }
        .guest-plaque-phone {
          font-size: 9.5px;
          font-weight: 700;
          color: #cbd5e1;
          margin-top: 3px;
          letter-spacing: 0.5px;
        }
        .cover-duration-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
          color: #0b1d3a;
          font-size: 13.5px;
          font-weight: 900;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          padding: 8px 32px;
          border-radius: 25px;
          box-shadow: 0 6px 20px rgba(170, 124, 17, 0.45);
          line-height: 1.2;
        }
        .cover-bottom-bar {
          padding: 13px 36px;
          background: rgba(8, 19, 38, 0.92);
          backdrop-filter: blur(8px);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          border-top: 2px solid #c9a25a;
          z-index: 10;
        }

        .page-pricing-content {
          padding: 14px 30px 10px 30px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 9px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .p2-section-heading {
          text-align: center;
          margin-bottom: 4px;
        }
        .p2-section-title {
          font-family: 'Cinzel', serif;
          font-size: 20px;
          font-weight: 800;
          color: #0b1d3a;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .p2-gold-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 4px 0 2px 0;
        }
        .p2-gold-line {
          height: 1px;
          width: 50px;
          background: #c9a25a;
        }
        .p2-section-subtitle {
          font-size: 9.5px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.3px;
        }

        .quote-spec-card {
          background: linear-gradient(135deg, #0b1d3a 0%, #152744 100%);
          border: 1.8px solid #c9a25a;
          border-radius: 12px;
          padding: 13px 18px;
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(11,29,58,0.14);
        }
        .quote-spec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(201,162,90,0.35);
          padding-bottom: 8px;
          margin-bottom: 10px;
        }
        .quote-ref-badge {
          font-family: 'Cinzel', serif;
          font-size: 11px;
          font-weight: 800;
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 1.2px;
        }
        .quote-price-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
          min-width: 210px;
        }
        .quote-total-price {
          font-size: 26px;
          font-weight: 900;
          color: #f59e0b;
          line-height: 1.18;
          margin: 2px 0;
          white-space: nowrap;
        }
        .quote-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .quote-cell {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 8px 10px;
        }
        .quote-cell-label {
          font-size: 8px;
          font-weight: 800;
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 3px;
        }
        .quote-cell-val {
          font-size: 10.5px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.25;
        }
        .quote-cell-sub {
          font-size: 8px;
          color: #cbd5e1;
          margin-top: 3px;
        }

        .v-section-box {
          border: 1.5px solid rgba(201, 162, 90, 0.5);
          border-radius: 10px;
          padding: 10px 14px;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.04);
        }
        .v-section-title {
          font-family: 'Cinzel', serif;
          font-size: 11.5px;
          font-weight: 800;
          color: #0b1d3a;
          letter-spacing: 0.8px;
          margin-bottom: 7px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .hotels-visual-grid {
          display: grid;
          gap: 6px;
        }
        .hotels-visual-grid.cols-1 {
          grid-template-columns: 1fr;
        }
        .hotels-visual-grid.cols-2 {
          grid-template-columns: 1fr 1fr;
        }
        .hotel-visual-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', Arial, sans-serif;
        }
        .hvc-thumb {
          width: ${displayHotels.length > 2 ? '54px' : '62px'};
          height: ${displayHotels.length > 2 ? '46px' : '52px'};
          border-radius: 6px;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid rgba(201, 162, 90, 0.45);
        }
        .hvc-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hvc-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .hvc-name {
          font-weight: 800;
          font-size: ${displayHotels.length > 2 ? '9.5px' : '10.5px'};
          color: #0b1d3a;
          line-height: 1.25;
        }
        .hvc-stars {
          color: #f59e0b;
          font-size: 8px;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .hvc-meta {
          font-size: 8px;
          color: #475569;
          line-height: 1.2;
        }
        .hvc-desc {
          font-size: 7.5px;
          color: #64748b;
          line-height: 1.2;
        }
        .hvc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
          margin-top: 2px;
        }
        .gold-meal-badge {
          background: rgba(201,162,90,0.15);
          border: 1px solid #c9a25a;
          color: #92400e;
          font-size: 7.6px;
          font-weight: 800;
          padding: 1.5px 7px;
          border-radius: 10px;
          white-space: nowrap;
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .highlight-item-visual {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          padding: 5px 8px;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', Arial, sans-serif;
        }
        .highlight-thumb {
          width: 50px;
          height: 44px;
          border-radius: 5px;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid rgba(201, 162, 90, 0.35);
        }
        .highlight-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1.5px;
        }
        .highlight-title {
          font-weight: 800;
          font-size: 8.8px;
          color: #0b1d3a;
          line-height: 1.25;
        }
        .highlight-desc {
          font-size: 7.5px;
          color: #64748b;
          line-height: 1.25;
        }
        .assurance-strip {
          background: rgba(11,29,58,0.04);
          border: 1px solid rgba(201,162,90,0.4);
          border-radius: 8px;
          padding: 7px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 8.5px;
          color: #334155;
        }

        .page-itinerary-container {
          padding: 10px 30px 10px 30px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .itinerary-list-wrap {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: ${totalDays > 3 ? '8px' : '12px'};
          flex: 1;
          margin-top: 8px;
        }
        .itinerary-card {
          display: flex;
          height: ${totalDays > 3 ? '175px' : '240px'};
          border: 1.5px solid rgba(201, 162, 90, 0.45);
          border-radius: 10px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.05);
        }
        .itinerary-day-col {
          width: 90px;
          background: linear-gradient(180deg, #0b1d3a 0%, #162a4d 100%);
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 8px 6px;
          border-right: 2px solid #c9a25a;
        }
        .itinerary-day-num {
          font-family: 'Cinzel', serif;
          font-size: 14px;
          font-weight: 800;
          color: #d4af37;
          letter-spacing: 0.5px;
        }
        .itinerary-day-tag {
          font-size: 7.5px;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-top: 4px;
          line-height: 1.2;
        }
        .itinerary-details-col {
          flex: 1;
          padding: ${totalDays > 3 ? '6px 14px' : '10px 18px'};
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .itinerary-day-title {
          font-family: 'Cinzel', serif;
          font-size: ${totalDays > 3 ? '10px' : '11.5px'};
          font-weight: 800;
          color: #0b1d3a;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .itinerary-bullets {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .itinerary-bullets li {
          font-size: ${totalDays > 3 ? '8px' : '8.5px'};
          color: #334155;
          line-height: 1.35;
          display: flex;
          align-items: flex-start;
          gap: 5px;
        }
        .itinerary-bullets li::before {
          content: "✦";
          color: #b8860b;
          font-size: 8.5px;
          font-weight: 900;
          line-height: 1.35;
        }
        .itinerary-img-col {
          width: ${totalDays > 3 ? '150px' : '175px'};
          height: 100%;
        }
        .itinerary-img-col img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .page-policy-content {
          padding: 14px 30px 10px 30px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .inc-exc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .v-list-vertical {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .v-list-vertical li {
          font-size: 8px;
          color: #334155;
          line-height: 1.35;
          display: flex;
          align-items: flex-start;
          gap: 5px;
        }

        .rann-tips-box {
          border: 1.5px solid rgba(201, 162, 90, 0.55);
          background: #fffdf9;
          border-radius: 9px;
          padding: 7px 12px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.03);
        }
        .rann-tips-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 5px;
        }
        .rann-tips-title {
          font-family: 'Cinzel', serif;
          font-size: 9.8px;
          font-weight: 800;
          color: #0b1d3a;
          letter-spacing: 0.8px;
        }
        .rann-tips-pill {
          margin-left: auto;
          font-size: 7px;
          font-weight: 800;
          color: #b8860b;
          background: rgba(201,162,90,0.12);
          border: 1px solid #c9a25a;
          padding: 1.5px 7px;
          border-radius: 10px;
          letter-spacing: 0.5px;
        }
        .rann-tips-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 10px;
        }
        .rann-tip-card {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          font-size: 7.2px;
          color: #334155;
          line-height: 1.35;
        }
        .rann-tip-icon {
          font-size: 9px;
          flex-shrink: 0;
          line-height: 1.3;
        }
      </style>

      <div class="pdf-page page-cover" style="background-image: url('${coverBg}');">
        <div class="cover-top-overlay">
          <div class="cover-brand-header-inline">
            <img src="${iconImg}" class="cover-airplane-img" alt="Ghumo Firoo Airplane Emblem" crossorigin="anonymous" />
            <div class="cover-brand-text">
              <div class="cover-brand-title">GHUMO FIROO</div>
              <div class="cover-brand-tag">YOUR JOURNEY, OUR EXPERTISE!</div>
              <div class="cover-brand-partner-badge">Official Partner: Evoke Tent City Dhordo</div>
            </div>
          </div>

          <div class="cover-tagline-pill">
            Discover the Timeless Beauty, Heritage & Heart of Kutch
          </div>

          <div class="cover-main-title" style="font-size: ${dynamicTitleSize}px; letter-spacing: ${dynamicLetterSpacing}px; line-height: ${dynamicLineHeight};">
            ${coverMainTitle}
          </div>

          <div class="cover-duration-badge">
            ${durationPillText}
          </div>
        </div>

        <!-- Bespoke Client Personalization Plaque (Bottom-Left Corner) -->
        <div class="cover-guest-plaque">
          <div class="guest-plaque-label">✨ PREPARED EXCLUSIVELY FOR</div>
          <div class="guest-plaque-name">${displayGuestName}</div>
          ${displayGuestPhone ? `<div class="guest-plaque-phone">📞 ${displayGuestPhone}</div>` : ''}
        </div>

        <div class="cover-bottom-bar">
          <div>🌐 ghumofiroo.com</div>
          <div>Official Partner: Evoke Tent City Dhordo</div>
        </div>
      </div>

      <div class="pdf-page">
        <div class="brand-header">
          <div class="brand-logo-wrap">
            <img src="${logoImg}" class="brand-logo-img" alt="Ghumo Firoo Logo" crossorigin="anonymous" />
            <div class="brand-text">
              <div class="brand-name">Ghumo Firoo</div>
              <div class="brand-tagline">Your Journey, Our Expertise!</div>
            </div>
          </div>
          <div class="brand-badge">QUOTE REF: ${formattedQuoteRef}</div>
        </div>

        <div class="page-pricing-content">
          <div class="p2-section-heading">
            <div class="p2-section-title">OFFICIAL TRAVEL QUOTATION &amp; TRIP PARAMETERS</div>
            <div class="p2-gold-divider">
              <div class="p2-gold-line"></div>
              <span style="color: #c9a25a; font-size: 8px;">✦</span>
              <div class="p2-gold-line"></div>
            </div>
            <div class="p2-section-subtitle">Personalized Travel Proposal Prepared on ${quoteDate} • All-Inclusive Confirmed Pricing</div>
          </div>

          <div class="quote-spec-card">
            <div class="quote-spec-header">
              <div>
                <div class="quote-ref-badge">🏛️ CONFIRMED TRAVEL SPECIFICATIONS</div>
                <div style="font-size: 9px; color: #cbd5e1; margin-top: 2px;">Proposal Ref: ${formattedQuoteRef} • Valid For 15 Days • Personalized for ${displayGuestName}</div>
              </div>
              <div class="quote-price-col">
                <div style="font-size: 8.5px; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1; font-weight: 700;">Total Package Cost</div>
                <div class="quote-total-price">₹${formattedTotalCost}</div>
                <div style="font-size: 8px; color: #cbd5e1; line-height: 1.25; margin-top: 2px;">(₹${displayPerPaxPrice} per adult pax • All Taxes Included)</div>
              </div>
            </div>

            <div class="quote-grid-4">
              <div class="quote-cell">
                <div class="quote-cell-label">🚗 Vehicle</div>
                <div class="quote-cell-val">${effectiveCabName}</div>
                <div class="quote-cell-sub">Private Dedicated AC</div>
              </div>

              <div class="quote-cell">
                <div class="quote-cell-label">📅 Schedule</div>
                <div class="quote-cell-val">${effectiveTravelDate}</div>
                <div class="quote-cell-sub">Return: ${effectiveReturnDate}</div>
              </div>

              <div class="quote-cell">
                <div class="quote-cell-label">👥 Guest Breakdown</div>
                <div class="quote-cell-val">${effectiveAdults} Adult${effectiveAdults > 1 ? 's' : ''}${effectiveChildren > 0 ? ` + ${effectiveChildren} Child` : ''}</div>
                <div class="quote-cell-sub">Total: ${effectivePax} Confirmed Guests</div>
              </div>

              <div class="quote-cell">
                <div class="quote-cell-label">📍 Transfer Route</div>
                <div class="quote-cell-val" style="font-size: 9.5px;">Pickup: ${effectivePickup}</div>
                <div class="quote-cell-sub">Drop: ${effectiveDrop}</div>
              </div>
            </div>
          </div>

          <div class="v-section-box">
            <div class="v-section-title">
              <span>🏨</span> SELECTED HOTELS &amp; LUXURY STAYS
              <span style="font-size: 8.5px; font-weight: 600; color: #64748b; margin-left: auto;">Verified hospitality with premium amenities</span>
            </div>
            <div class="hotels-visual-grid ${displayHotels.length === 1 ? 'cols-1' : 'cols-2'}">
              ${displayHotels.map((hotel: any) => `
                <div class="hotel-visual-card">
                  <img src="${hotel.image}" alt="${hotel.name}" class="hvc-thumb" crossorigin="anonymous" />
                  <div class="hvc-body">
                    <div class="hvc-title-row">
                      <div class="hvc-name" title="${hotel.name}">${hotel.name}</div>
                      <div class="hvc-stars">${'★'.repeat(hotel.stars || 4)}${'☆'.repeat(Math.max(0, 5 - (hotel.stars || 4)))}</div>
                    </div>
                    <div class="hvc-meta">📍 ${hotel.location} • 🛏️ ${hotel.room_type}</div>
                    <div class="hvc-desc">${hotel.description}</div>
                    <div class="hvc-footer">
                      <span class="gold-meal-badge">${hotel.meal_plan}</span>
                      <span style="font-size: 7.2px; font-weight: 700; color: #166534;">✓ Instant Confirmation</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="v-section-box">
            <div class="v-section-title">
              <span>🏞️</span> TOP JOURNEY HIGHLIGHTS INCLUDED
              <span style="font-size: 8.5px; font-weight: 600; color: #64748b; margin-left: auto;">Curated iconic destinations</span>
            </div>
            <div class="highlights-grid">
              <div class="highlight-item-visual">
                <img src="${origin}/rann_utsav_white_desert.jpg" class="highlight-thumb" alt="White Rann" crossorigin="anonymous" />
                <div class="highlight-info">
                  <div class="highlight-title">🌅 White Rann Salt Desert Sunset</div>
                  <div class="highlight-desc">Glittering vast white salt marshes with spectacular sunset walk &amp; cultural gala.</div>
                </div>
              </div>
              <div class="highlight-item-visual">
                <img src="${origin}/rann_utsav_road_to_heaven.jpg" class="highlight-thumb" alt="Road to Heaven" crossorigin="anonymous" />
                <div class="highlight-info">
                  <div class="highlight-title">🛣️ Road to Heaven Highway</div>
                  <div class="highlight-desc">Iconic straight highway cutting through turquoise salt waters of the Great Rann.</div>
                </div>
              </div>
              <div class="highlight-item-visual">
                <img src="${origin}/kalodungar.jpg" class="highlight-thumb" alt="Kalo Dungar" crossorigin="anonymous" />
                <div class="highlight-info">
                  <div class="highlight-title">🏔️ Kalo Dungar Black Hill (1,525 ft)</div>
                  <div class="highlight-desc">Highest summit in Kutch offering panoramic 360° views overlooking the desert.</div>
                </div>
              </div>
              <div class="highlight-item-visual">
                <img src="${origin}/brochure-assets/palace_legacy.jpg" class="highlight-thumb" alt="Royal Heritage Palaces" crossorigin="anonymous" />
                <div class="highlight-info">
                  <div class="highlight-title">🏰 Royal Heritage Palaces &amp; Smritivan</div>
                  <div class="highlight-desc">Historic Prag Mahal, Aina Mahal &amp; India's largest memorial park in Bhuj.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="assurance-strip">
            <span>🛡️ <strong>Ghumo Firoo Assurance:</strong> 100% Dedicated Private Cab • No Hidden Driver Bata/Tolls • Guaranteed Rooms</span>
            <span style="color: #b8860b; font-weight: 800;">✓ VERIFIED OFFICIAL QUOTE</span>
          </div>
        </div>

        <div class="brand-footer">
          <div class="footer-left">
            <div class="footer-item">📞 +91 9910987264 / 9870229792</div>
            <div class="footer-item">✉️ booking@ghumofiroo.com</div>
          </div>
          <div class="footer-right">
            <div>🌐 ghumofiroo.com</div>
            <div>Page 2 of ${totalPages}</div>
          </div>
        </div>
      </div>

      <div class="pdf-page">
        <div class="brand-header">
          <div class="brand-logo-wrap">
            <img src="${logoImg}" class="brand-logo-img" alt="Ghumo Firoo Logo" crossorigin="anonymous" />
            <div class="brand-text">
              <div class="brand-name">Ghumo Firoo</div>
              <div class="brand-tagline">Your Journey, Our Expertise!</div>
            </div>
          </div>
          <div class="brand-badge">QUOTE REF: ${formattedQuoteRef}</div>
        </div>

        <div class="page-itinerary-container">
          <div class="p2-section-heading">
            <div class="p2-section-title">COMPLETE DAY-WISE ITINERARY</div>
            <div class="p2-gold-divider">
              <div class="p2-gold-line"></div>
              <span style="color: #c9a25a; font-size: 8px;">✦</span>
              <div class="p2-gold-line"></div>
            </div>
            <div class="p2-section-subtitle">Chauffeured private transfers, guided excursions, and curated experiences</div>
          </div>

          <div class="itinerary-list-wrap">
            ${itineraryList.map((day: any, idx: number) => {
              const dayImg = getItineraryDayImage(day, idx);
              const dayTag = day.title.split('→')[0].trim() || 'SIGHTSEEING';
              return `
                <div class="itinerary-card">
                  <div class="itinerary-day-col">
                    <div class="itinerary-day-num">DAY ${day.day}</div>
                    <div class="itinerary-day-tag">${dayTag.slice(0, 18)}</div>
                  </div>
                  <div class="itinerary-details-col">
                    <div class="itinerary-day-title">${day.title}</div>
                    <ul class="itinerary-bullets">
                      <li>${day.description}</li>
                      ${(day.activities && day.activities.length > 0)
                        ? day.activities.slice(0, totalDays > 3 ? 2 : 3).map((act: string) => `<li>${act}</li>`).join('')
                        : ''}
                    </ul>
                  </div>
                  <div class="itinerary-img-col">
                    <img src="${dayImg}" alt="${day.title}" crossorigin="anonymous" />
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="brand-footer">
          <div class="footer-left">
            <div class="footer-item">📞 +91 9910987264 / 9870229792</div>
            <div class="footer-item">✉️ booking@ghumofiroo.com</div>
          </div>
          <div class="footer-right">
            <div>🌐 ghumofiroo.com</div>
            <div>Page 3 of ${totalPages}</div>
          </div>
        </div>
      </div>

      <div class="pdf-page">
        <div class="brand-header">
          <div class="brand-logo-wrap">
            <img src="${logoImg}" class="brand-logo-img" alt="Ghumo Firoo Logo" crossorigin="anonymous" />
            <div class="brand-text">
              <div class="brand-name">Ghumo Firoo</div>
              <div class="brand-tagline">Your Journey, Our Expertise!</div>
            </div>
          </div>
          <div class="brand-badge">QUOTE REF: ${formattedQuoteRef}</div>
        </div>

        <div class="page-policy-content">
          <div class="p2-section-heading">
            <div class="p2-section-title">PACKAGE INCLUSIONS &amp; POLICIES</div>
            <div class="p2-gold-divider">
              <div class="p2-gold-line"></div>
              <span style="color: #c9a25a; font-size: 8px;">✦</span>
              <div class="p2-gold-line"></div>
            </div>
            <div class="p2-section-subtitle">Verified Inclusions, Standard Exclusions &amp; Important Booking Terms</div>
          </div>

          <div class="inc-exc-grid">
            <div class="v-section-box" style="border-color: rgba(34, 197, 94, 0.4); background: #fcfdfd;">
              <div class="v-section-title" style="color: #166534;"><span class="gold-icon">✓</span> What's Included in Your Quotation</div>
              <ul class="v-list-vertical">
                <li><strong style="color: #166534;">✓</strong> All transfers &amp; sightseeing by private dedicated AC vehicle (${effectiveCabName}).</li>
                <li><strong style="color: #166534;">✓</strong> All driver allowances, fuel charges, state permits, toll taxes &amp; parking fees.</li>
                <li><strong style="color: #166534;">✓</strong> Luxury tent/resort accommodation on double/triple sharing basis.</li>
                <li><strong style="color: #166534;">✓</strong> Buffet meals as specified (Breakfast &amp; Dinner / All Meals at Dhordo Tent City).</li>
                <li><strong style="color: #166534;">✓</strong> Complete assistance for White Rann entry permit documentation.</li>
                <li><strong style="color: #166534;">✓</strong> 24/7 dedicated on-trip concierge assistance throughout your tour.</li>
              </ul>
            </div>

            <div class="v-section-box" style="border-color: rgba(239, 68, 68, 0.35); background: #fdfcfc;">
              <div class="v-section-title" style="color: #991b1b;"><span class="gold-icon">✗</span> What's Excluded</div>
              <ul class="v-list-vertical">
                <li><strong style="color: #991b1b;">✗</strong> Airfare or train tickets to / from Bhuj.</li>
                <li><strong style="color: #991b1b;">✗</strong> Monument entry fees, camera permits &amp; local guide fees.</li>
                <li><strong style="color: #991b1b;">✗</strong> Personal expenses (laundry, room service, telephone calls, tips).</li>
                <li><strong style="color: #991b1b;">✗</strong> Optional activities (ATV rides, Paramotoring, Camel safari charges).</li>
                <li><strong style="color: #991b1b;">✗</strong> Any items or services not explicitly mentioned in inclusions.</li>
                <li><strong style="color: #991b1b;">✗</strong> GST 5% (Applicable as per Government regulations).</li>
              </ul>
            </div>
          </div>

          <div class="v-section-box">
            <div class="v-section-title"><span class="gold-icon">💳</span> Payment Schedule &amp; Booking Terms</div>
            <ul class="v-list-vertical">
              <li>• <strong>25% Advance Payment:</strong> Upon confirmation to block hotel rooms and secure dedicated vehicle.</li>
              <li>• <strong>50% Payment:</strong> Due 30 days prior to scheduled departure date.</li>
              <li>• <strong>100% Full Payment:</strong> Due 15 days prior to arrival.</li>
              <li>• <strong>Payment Methods:</strong> UPI, Bank NEFT/RTGS, Net Banking, and Credit/Debit Cards via PayU.</li>
            </ul>
          </div>

          <div class="v-section-box">
            <div class="v-section-title"><span class="gold-icon">🛡️</span> Cancellation &amp; Refund Policy</div>
            <ul class="v-list-vertical">
              <li>• <strong>Cancellation &gt; 30 Days Prior:</strong> 90% Refund (10% standard administrative charge).</li>
              <li>• <strong>Cancellation 15–30 Days Prior:</strong> 60% Refund of the total tour package cost.</li>
              <li>• <strong>Cancellation 7–14 Days Prior:</strong> 25% Refund of the total tour package cost.</li>
              <li>• <strong>Cancellation &lt; 7 Days / No-Show:</strong> 100% non-refundable.</li>
            </ul>
          </div>

          ${isRannUtsavPackage ? `
          <div class="rann-tips-box">
            <div class="rann-tips-header">
              <span style="font-size: 11px;">🌟</span>
              <span class="rann-tips-title">GHUMO FIROO TRAVEL &amp; GOURMET TIPS FOR RANN UTSAV</span>
              <span class="rann-tips-pill">CURATED LOCAL INSIDER GUIDE</span>
            </div>
            <div class="rann-tips-grid">
              <div class="rann-tip-card">
                <span class="rann-tip-icon">🌅</span>
                <div><strong>Sunset &amp; Twilight:</strong> Reach White Rann by 5:15 PM for golden hour &amp; full moon glow across the salt flats.</div>
              </div>
              <div class="rann-tip-card">
                <span class="rann-tip-icon">🧥</span>
                <div><strong>Desert Climate:</strong> Nights drop to 11°C–14°C; carry light woolens/shawl for evening gala &amp; stargazing.</div>
              </div>
              <div class="rann-tip-card">
                <span class="rann-tip-icon">🍲</span>
                <div><strong>Kutchi Gourmet:</strong> Don't miss authentic Kutchi Kadhi-Khichdi, Gulab Pak &amp; piping hot Bhujia Dabeli.</div>
              </div>
              <div class="rann-tip-card">
                <span class="rann-tip-icon">🪪</span>
                <div><strong>Permit &amp; ID:</strong> Keep original Government photo IDs handy for Dhordo checkpoint permit verification.</div>
              </div>
            </div>
          </div>
          ` : ''}

          <div style="background: linear-gradient(135deg, #0b1d3a 0%, #162a4d 100%); border: 1.5px solid #c9a25a; border-radius: 8px; padding: 8px 14px; color: #ffffff; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 10px; font-weight: 800; color: #d4af37; text-transform: uppercase; letter-spacing: 1px;">24/7 On-Trip Concierge Support</div>
              <div style="font-size: 8.5px; color: #cbd5e1;">Continuous helpline &amp; dedicated ground support throughout your vacation.</div>
            </div>
          </div>
        </div>

        <div class="brand-footer">
          <div class="footer-left">
            <div class="footer-item">📞 +91 9910987264 / 9870229792</div>
            <div class="footer-item">✉️ booking@ghumofiroo.com</div>
          </div>
          <div class="footer-right">
            <div>🌐 ghumofiroo.com</div>
            <div>Page 4 of ${totalPages}</div>
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
        const cleanPkgName = packageDetails.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
        const quotePdfName = isQuoteMode ? `${cleanPkgName}_Official_Quote.pdf` : `${destination.replace(/\s+/g, '_')}_Brochure.pdf`;
        const blob = new Blob([cached], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = quotePdfName;
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
  
        await Promise.all([
          document.fonts ? document.fonts.ready : Promise.resolve(),
          waitForImages(container, 8000)
        ]);
  
        const pages = Array.from(container.querySelectorAll('.pdf-page')) as HTMLElement[];
        pagesCount = pages.length;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  
        const scale = 2.0; // Crystal clear text and graphics at high zoom
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
            imageTimeout: 5000,
            logging: false,
            removeContainer: true
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95); // High quality eliminates JPEG artifacting
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
      const cleanPkgName = packageDetails.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
      const quotePdfName = isQuoteMode ? `${cleanPkgName}_Official_Quote.pdf` : `${destination.replace(/\s+/g, '_')}_Brochure.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = quotePdfName;
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
      <Button onClick={onDownloadClick} className={`${className} bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2`} aria-label={isQuoteMode ? "Download Quote PDF" : "Download brochure"}>
        <FileText className="w-5 h-5" aria-hidden="true" /> {buttonLabel || (isQuoteMode ? "Download Quote PDF" : "Download PDF Brochure")}
      </Button>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-5xl p-0 overflow-hidden bg-[#0a1128] text-white border-white/10 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] focus:outline-none" aria-label={isQuoteMode ? "Official Travel Quotation" : "Luxury Travel Consultation"}>
          <DialogTitle className="sr-only">{isQuoteMode ? "Download Official Travel Quote" : "Download Brochure & Consultation"}</DialogTitle>
          <DialogDescription className="sr-only">{isQuoteMode ? "Request and download official personalized travel quotation" : "Request custom itinerary and download brochure"}</DialogDescription>
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
                    {isQuoteMode ? "Official Quotation" : "Luxury Consult"}
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

                  {/* Starting Price / Quotation */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-[#D4AF37]">
                      <span className="text-xs font-bold">₹</span>
                    </span>
                    <div>
                      <p className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">{isQuoteMode ? "Total Quotation" : "Starting Price"}</p>
                      <p className="text-xs font-bold text-white">
                        {isQuoteMode && totalPrice 
                          ? `₹${Number(String(totalPrice).replace(/[^\d]/g, '')).toLocaleString('en-IN')}` 
                          : `₹${formatPrice()}`}
                      </p>
                    </div>
                  </div>

                  {/* Travel Style / Cab */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-[#D4AF37]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">{isQuoteMode ? "Selected Vehicle" : "Travel Style"}</p>
                      <p className="text-xs font-semibold text-white truncate max-w-[180px]">{selectedCabName || transport || "Private Transfers Included"}</p>
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
                      {isQuoteMode ? "Download Official Travel Quote" : "Download Premium Travel Guide"}
                    </h2>
                    <p className="text-white/70 text-[11px] leading-relaxed md:text-xs">
                      {isQuoteMode 
                        ? "Receive personalized quotation PDF with your selected vehicle, travel dates, pickup/drop station, hotel details, and price."
                        : "Receive complete itinerary, hotel options, sightseeing, inclusions, exclusions, and pricing details."}
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

                    {isQuoteMode ? (
                      <>
                        {/* City Input (Clean full width for Quote Mode) */}
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

                        {/* Confirmed Quote Specifications Badge */}
                        <div className="p-3.5 bg-[#D4AF37]/10 border border-[#D4AF37]/35 rounded-xl space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#E5C378] border-b border-white/10 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <span>📋</span> Confirmed Quote Specifications
                            </span>
                            <span className="text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              Pre-Configured
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-200">
                              <span className="text-[#D4AF37]">👥</span>
                              <span><strong>Travelers:</strong> {passengersCount || 2} Pax</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-200 min-w-0">
                              <span className="text-[#D4AF37]">🚗</span>
                              <span className="truncate" title={selectedCabName || transport || 'Private Vehicle'}>
                                <strong>Vehicle:</strong> {selectedCabName || transport || 'Private Vehicle'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-200">
                              <span className="text-[#D4AF37]">📅</span>
                              <span><strong>Dates:</strong> {travelDate ? new Date(travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Confirmed Schedule'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-200">
                              <span className="text-[#D4AF37]">💰</span>
                              <span><strong>Total:</strong> ₹{Number(String(totalPrice || formatPrice()).replace(/[^\d]/g, '')).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Row 3: City & Travel Month for standard brochure mode */}
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

                        {/* Row 4: Number of Travelers & Budget for standard brochure mode */}
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
                      </>
                    )}

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
                          <><Loader2 className="w-4 h-4 animate-spin text-[#0a1128]" /> {isQuoteMode ? 'Generating Official Quote' : 'Preparing Itinerary'} {progress ? `${progress}%` : ''}</>
                        ) : (
                          <><Download className="w-3.5 h-3.5" /> {isQuoteMode ? 'Download Official Quote PDF' : 'Download Premium Brochure'}</>
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
