import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Eye, FileText, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Subscriber {
  email: string;
  subscribed_at: string;
  status: string;
}

interface Campaign {
  id: number;
  title: string;
  subject: string;
  recipient_count: number;
  status: string;
  created_at: string;
}

export const EmailMarketingHub: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [activeTab, setActiveTab] = useState<'composer' | 'subscribers' | 'history'>('composer');

  // Form State
  const [title, setTitle] = useState('2026 Luxury Travel Special');
  const [subject, setSubject] = useState('Exclusive 2026 Travel Inspiration — Ghumo Firoo Journeys');
  const [bodyHtml, setBodyHtml] = useState(getDefaultTemplate('rann-utsav'));
  const [selectedTemplate, setSelectedTemplate] = useState('rann-utsav');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertTagAtCursor = (tag: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + ` ${tag} ` + after;
      setBodyHtml(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length + 2, start + tag.length + 2);
      }, 0);
    } else {
      setBodyHtml(prev => prev + ` ${tag} `);
    }
  };

  const [dbPackages, setDbPackages] = useState<any[]>([]);

  const fetchBootstrapData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/php-backend/email_marketing.php');
      const data = await res.json();
      if (res.ok && data.success) {
        setTotalSubscribers(data.total_subscribers || 0);
        setTotalCampaigns(data.total_campaigns_sent || 0);
        setDbPackages(data.packages || []);
      }
    } catch (err) {
      console.error('Failed to load email marketing bootstrap:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/php-backend/email_marketing.php?action=subscribers');
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error('Failed to fetch subscribers:', err);
    }
  };

  const fetchCampaignHistory = async () => {
    try {
      const res = await fetch('/php-backend/email_marketing.php?action=history');
      const data = await res.json();
      if (res.ok && data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error('Failed to fetch campaign history:', err);
    }
  };

  const handleTabChange = (tab: 'composer' | 'subscribers' | 'history') => {
    setActiveTab(tab);
    if (tab === 'subscribers') {
      fetchSubscribers();
    } else if (tab === 'history') {
      fetchCampaignHistory();
    }
  };

  useEffect(() => {
    fetchBootstrapData();
  }, []);

  function getDefaultTemplate(type: string): string {
    if (type === 'rann-utsav') {
      return `<h2 style="color: #0F172A; font-size: 22px; margin-top: 0; font-weight: 800;">Dear {{NAME}},</h2>
<p style="font-size: 14px; color: #334155; line-height: 1.6;">Greetings from <strong>Ghumo Firoo Journeys</strong>! We are delighted to present an exclusive early-bird invitation for the official <strong>Rann Utsav Kutch {{YEAR}}</strong> White Desert festival season.</p>

<div style="background: #FFFDF5; border-left: 4px solid #C9A25A; border: 1px solid #F3E8D0; padding: 18px; border-radius: 12px; margin: 20px 0;">
  <h3 style="color: #855B14; margin: 0 0 10px 0; font-size: 16px; font-weight: 800;">🎪 Rann Utsav Tent City Highlights & Packages:</h3>
  <ul style="margin: 0; padding-left: 20px; color: #1E293B; font-size: 13px;">
    <li style="margin-bottom: 6px;"><strong>Luxury Accommodation:</strong> Premium AC Swiss Tents, Royal Rajwadi Suites & Bungalows at Evoke Tent City Dhordo.</li>
    <li style="margin-bottom: 6px;"><strong>Full Board Dining:</strong> Daily authentic Kutchi, Gujarati Thali & 100% Pure Jain buffet meals.</li>
    <li style="margin-bottom: 6px;"><strong>Sightseeing Excursions:</strong> White Rann Full Moon sunset walk, Kalo Dungar (Black Hill), and Smritivan Museum in Bhuj.</li>
    <li style="margin-bottom: 6px;"><strong>Complimentary Transfers:</strong> Fixed AC coach pickups directly from Bhuj Airport & Railway Station.</li>
    <li><strong>BSF Permits:</strong> Pre-approved White Salt Desert entry permits included with your voucher.</li>
  </ul>
</div>

<p style="font-size: 13px; color: #334155;">Packages starting from <strong style="color: #855B14;">₹7,999 per guest</strong>. Full moon nights sell out rapidly — reserve your preferred tent cluster today!</p>

<div style="text-align: center; margin-top: 24px;">
  <a href="https://ghumofiroo.com/packages/rann-utsav" style="background: linear-gradient(135deg, #C9A25A, #E5C378); color: #070C1E; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-radius: 10px; display: inline-block; box-shadow: 0 6px 20px rgba(201,162,90,0.3);">Reserve Your Rann Tent Slot →</a>
</div>

<p style="font-size: 11px; color: #64748B; margin-top: 30px; text-align: center;">Need assistance? Speak with our Kutch Travel Specialist at <a href="tel:+919910987264" style="color: #855B14; font-weight: 700;">+91 99109 87264</a> | <a href="{{UNSUBSCRIBE_LINK}}" style="color: #94A3B8;">Unsubscribe</a></p>`;
    } else if (type === 'char-dham') {
      return `<h2 style="color: #0F172A; font-size: 22px; margin-top: 0; font-weight: 800;">Respected {{NAME}},</h2>
<p style="font-size: 14px; color: #334155; line-height: 1.6;">Jai Badri Vishal! <strong>Ghumo Firoo Journeys</strong> is honored to open pre-registrations for the sacred <strong>Char Dham Yatra {{YEAR}} by Helicopter</strong>.</p>

<div style="background: #FFFDF5; border-left: 4px solid #C9A25A; border: 1px solid #F3E8D0; padding: 18px; border-radius: 12px; margin: 20px 0;">
  <h3 style="color: #855B14; margin: 0 0 10px 0; font-size: 16px; font-weight: 800;">🚁 VIP Helicopter Yatra Benefits:</h3>
  <ul style="margin: 0; padding-left: 20px; color: #1E293B; font-size: 13px;">
    <li style="margin-bottom: 6px;"><strong>Helicopter Charters:</strong> Dehradun Sahastradhara to Kharsali, Harsil, Sersi/Phata, Kedarnath & Badrinath.</li>
    <li style="margin-bottom: 6px;"><strong>VIP Darshan Passes:</strong> Priority zero-wait token access at Kedarnath and Badrinath shrines.</li>
    <li style="margin-bottom: 6px;"><strong>Deluxe Stays & Satvik Food:</strong> 5-Star luxury hotels with 100% pure vegetarian / Jain meals without onion & garlic.</li>
    <li style="margin-bottom: 6px;"><strong>Ground SUV Comfort:</strong> Private chauffeured Innova Crysta for all local ground movements.</li>
    <li><strong>Biometric Passports:</strong> Pre-arranged Uttarakhand Tourist Care registration & medical support.</li>
  </ul>
</div>

<p style="font-size: 13px; color: #334155;">Helicopter slots are strictly limited per day. Secure your family's VIP darshan token today!</p>

<div style="text-align: center; margin-top: 24px;">
  <a href="https://ghumofiroo.com/packages/char-dham-yatra" style="background: linear-gradient(135deg, #C9A25A, #E5C378); color: #070C1E; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-radius: 10px; display: inline-block; box-shadow: 0 6px 20px rgba(201,162,90,0.3);">View Helicopter Darshan Slots →</a>
</div>

<p style="font-size: 11px; color: #64748B; margin-top: 30px; text-align: center;">Char Dham Pilgrimage Concierge: <a href="tel:+919870229792" style="color: #855B14; font-weight: 700;">+91 98702 29792</a> | <a href="{{UNSUBSCRIBE_LINK}}" style="color: #94A3B8;">Unsubscribe</a></p>`;
    } else if (type === 'singapore') {
      return `<h2 style="color: #0F172A; font-size: 22px; margin-top: 0; font-weight: 800;">Hi {{NAME}},</h2>
<p style="font-size: 14px; color: #334155; line-height: 1.6;">Ready for an extraordinary skyline vacation? Discover <strong>Ghumo Firoo's Singapore 4D3N & Sentosa Island {{YEAR}} Specials</strong>!</p>

<div style="background: #FFFDF5; border-left: 4px solid #C9A25A; border: 1px solid #F3E8D0; padding: 18px; border-radius: 12px; margin: 20px 0;">
  <h3 style="color: #855B14; margin: 0 0 10px 0; font-size: 16px; font-weight: 800;">🦁 Singapore Package Inclusions:</h3>
  <ul style="margin: 0; padding-left: 20px; color: #1E293B; font-size: 13px;">
    <li style="margin-bottom: 6px;"><strong>1-Click eVisa:</strong> 100% hassle-free Singapore tourist visa processing for Indian passport holders.</li>
    <li style="margin-bottom: 6px;"><strong>Universal Studios:</strong> Express theme park passes + Sentosa Cable Car & Wings of Time show.</li>
    <li style="margin-bottom: 6px;"><strong>Gardens by the Bay:</strong> Flower Dome, Cloud Forest, and Marina Bay Sands observation deck access.</li>
    <li style="margin-bottom: 6px;"><strong>Night Safari & Cruise:</strong> Guided Night Safari tram tour + optional Genting Dream Ocean Cruise combo.</li>
    <li><strong>Luxury Hotels:</strong> 4-Star & 5-Star stays with daily breakfast buffet and private transfers.</li>
  </ul>
</div>

<p style="font-size: 13px; color: #334155;">Packages starting from <strong style="color: #855B14;">₹48,000 per guest</strong>. Direct non-stop flight options from Delhi, Mumbai & Bengaluru.</p>

<div style="text-align: center; margin-top: 24px;">
  <a href="https://ghumofiroo.com/packages/singapore" style="background: linear-gradient(135deg, #C9A25A, #E5C378); color: #070C1E; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-radius: 10px; display: inline-block; box-shadow: 0 6px 20px rgba(201,162,90,0.3);">Explore Singapore Itineraries →</a>
</div>

<p style="font-size: 11px; color: #64748B; margin-top: 30px; text-align: center;">International Travel Designer: <a href="tel:+919910987264" style="color: #855B14; font-weight: 700;">+91 99109 87264</a> | <a href="{{UNSUBSCRIBE_LINK}}" style="color: #94A3B8;">Unsubscribe</a></p>`;
    }
    return '';
  }

  const handleSelectDbPackage = (pkgId: string) => {
    setSelectedTemplate(pkgId);
    const pkg = dbPackages.find(p => String(p.id) === String(pkgId) || p.slug === pkgId);
    if (!pkg) return;

    const pkgTitle = pkg.title || pkg.name || 'Luxury Travel Escapes';
    const duration = pkg.duration || pkg.days || 'Custom Tour';
    const priceStr = pkg.price ? `₹${Number(pkg.price).toLocaleString('en-IN')}` : 'Special Rates Available';
    const slug = pkg.slug || 'packages';
    const pkgUrl = `https://ghumofiroo.com/packages/${slug.replace(/^\//, '')}`;

    let highlightsList = [
      'Verified 4-Star / 5-Star luxury hotel accommodation with daily breakfast.',
      'Chauffeured private AC transfers for all airport pickups & sightseeing.',
      'Priority sightseeing entrance passes & local expert tour concierge.',
      'Flexible 24x7 travel assistance & customized day-by-day itinerary.'
    ];

    if (pkg.description) {
      const parts = pkg.description.split('. ').filter((s: string) => s.length > 10).slice(0, 4);
      if (parts.length > 0) highlightsList = parts;
    }

    setTitle(`${pkgTitle} — ${duration} Luxury Escape`);
    setSubject(`✈️ Exclusive Special: ${pkgTitle} (${duration}) — Reserve Your VIP Slot!`);

    const dynamicHtml = `<h2 style="color: #0F172A; font-size: 22px; margin-top: 0; font-weight: 800;">Dear {{NAME}},</h2>
<p style="font-size: 14px; color: #334155; line-height: 1.6;">Greetings from <strong>Ghumo Firoo Journeys</strong>! We are delighted to present an exclusive luxury itinerary for <strong>${pkgTitle}</strong> (${duration}).</p>

<div style="background: #FFFDF5; border-left: 4px solid #C9A25A; border: 1px solid #F3E8D0; padding: 18px; border-radius: 12px; margin: 20px 0;">
  <h3 style="color: #855B14; margin: 0 0 10px 0; font-size: 16px; font-weight: 800;">🌟 ${pkgTitle} Package Highlights:</h3>
  <ul style="margin: 0; padding-left: 20px; color: #1E293B; font-size: 13px;">
    ${highlightsList.map(h => `<li style="margin-bottom: 6px;">${h.trim()}</li>`).join('')}
  </ul>
</div>

<p style="font-size: 13px; color: #334155;">Packages starting from <strong style="color: #855B14;">${priceStr} per guest</strong>. Limited availability for upcoming dates!</p>

<div style="text-align: center; margin-top: 24px;">
  <a href="${pkgUrl}" style="background: linear-gradient(135deg, #C9A25A, #E5C378); color: #070C1E; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-radius: 10px; display: inline-block; box-shadow: 0 6px 20px rgba(201,162,90,0.3);">Explore & Book ${pkgTitle} →</a>
</div>

<p style="font-size: 11px; color: #64748B; margin-top: 30px; text-align: center;">Need assistance? Speak with our Travel Specialist at <a href="tel:+919910987264" style="color: #855B14; font-weight: 700;">+91 99109 87264</a> | <a href="{{UNSUBSCRIBE_LINK}}" style="color: #94A3B8;">Unsubscribe</a></p>`;

    setBodyHtml(dynamicHtml);
  };

  const handleTemplateChange = (tmplKey: string) => {
    setSelectedTemplate(tmplKey);
    if (tmplKey === 'rann-utsav') {
      setTitle('Rann Utsav 2026 Full Moon Special');
      setSubject('🎪 Rann Utsav Kutch 2026 — VIP Tent City Reservations Open!');
      setBodyHtml(getDefaultTemplate('rann-utsav'));
    } else if (tmplKey === 'char-dham') {
      setTitle('Char Dham Yatra 2026 Helicopter Pre-Registration');
      setSubject('🚁 Char Dham Helicopter Yatra 2026 — Reserved VIP Darshan Slots');
      setBodyHtml(getDefaultTemplate('char-dham'));
    } else if (tmplKey === 'singapore') {
      setTitle('Singapore 4D3N & Sentosa Retreat');
      setSubject('🦁 Singapore 4D3N & Universal Studios Family Special');
      setBodyHtml(getDefaultTemplate('singapore'));
    }
  };

  const handleSendCampaign = async () => {
    if (!subject.trim() || !bodyHtml.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide both Subject and Email HTML Body.' });
      return;
    }

    try {
      setDispatching(true);
      setStatusMessage(null);
      const res = await fetch('/php-backend/email_marketing.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          body_html: bodyHtml
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: data.message || 'Campaign dispatched successfully!' });
        fetchMarketingData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to dispatch campaign.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error dispatching campaign.' });
    } finally {
      setDispatching(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim() || !testEmailAddress.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid test email address.' });
      return;
    }

    try {
      setSendingTest(true);
      setStatusMessage(null);
      const res = await fetch('/php-backend/email_marketing.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject: subject.trim(),
          body_html: bodyHtml,
          target_emails: [testEmailAddress.trim()]
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: `Test email dispatched to ${testEmailAddress}! Please check your inbox/spam folder.` });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to send test email.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error sending test email.' });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#121B3B] via-[#0E152E] to-[#0A0F24] border border-[#C9A25A]/30 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E5C378]">
            <Mail className="h-4 w-4 text-[#C9A25A]" /> Email Marketing & Broadcast Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-normal text-white">
            Private Travel Inspiration Broadcasts
          </h1>
          <p className="text-xs text-slate-300">
            Dispatch high-converting luxury travel itineraries, festival deals, and VIP vouchers to saved subscribers and CRM leads.
          </p>
        </div>

        <Button 
          onClick={fetchBootstrapData} 
          variant="outline" 
          className="border-white/20 text-slate-200 hover:bg-white/10 text-xs gap-2 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Lists
        </Button>
      </div>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Subscribers Card -> Switches to Subscribers Tab */}
        <div 
          onClick={() => handleTabChange('subscribers')}
          className="bg-[#0B1226]/90 border border-white/10 hover:border-[#C9A25A]/60 p-5 rounded-2xl flex items-center justify-between shadow-lg cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider group-hover:text-amber-300 transition-colors">Total Subscribers</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{totalSubscribers}</h3>
            <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">🟢 Verified & CRM Leads — <span className="underline font-bold">View All →</span></p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Campaigns Dispatched Card -> Switches to History Tab */}
        <div 
          onClick={() => handleTabChange('history')}
          className="bg-[#0B1226]/90 border border-white/10 hover:border-indigo-500/60 p-5 rounded-2xl flex items-center justify-between shadow-lg cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider group-hover:text-indigo-300 transition-colors">Campaigns Dispatched</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">{totalCampaigns}</h3>
            <p className="text-[10px] text-indigo-300 mt-0.5 flex items-center gap-1">✨ Active Broadcasts — <span className="underline font-bold">View Log →</span></p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-all">
            <Send className="h-6 w-6" />
          </div>
        </div>

        {/* Average Open Rate Card */}
        <div 
          onClick={() => handleTabChange('history')}
          className="bg-[#0B1226]/90 border border-white/10 hover:border-emerald-500/60 p-5 rounded-2xl flex items-center justify-between shadow-lg cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider group-hover:text-emerald-300 transition-colors">Average Open Rate</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">48.5%</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">High Intent Luxury Audience — <span className="underline font-bold">Audit →</span></p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
            <Star className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-white/10 gap-6">
        <button 
          onClick={() => handleTabChange('composer')} 
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === 'composer' ? 'border-[#C9A25A] text-[#E5C378]' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Sparkles className="h-4 w-4" /> Campaign Composer
        </button>
        <button 
          onClick={() => handleTabChange('subscribers')} 
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === 'subscribers' ? 'border-[#C9A25A] text-[#E5C378]' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Users className="h-4 w-4" /> Subscribers Database ({totalSubscribers})
        </button>
        <button 
          onClick={() => handleTabChange('history')} 
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === 'history' ? 'border-[#C9A25A] text-[#E5C378]' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <FileText className="h-4 w-4" /> Sent Campaigns Log ({totalCampaigns})
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/10 border-rose-500/40 text-rose-300'}`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tab 1: Campaign Composer */}
      {activeTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editor Form */}
          <div className="lg:col-span-7 space-y-5 bg-[#0B1226]/90 border border-white/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <FileText className="h-4 w-4 text-[#C9A25A]" /> Compose New Email Broadcast
            </h3>

            {/* Dynamic Template Quick Select */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#E5C378] font-bold uppercase tracking-wider block">
                  ✨ Pick High-Converting Travel Template:
                </label>
                <span className="text-[10px] text-amber-300 font-mono">
                  {dbPackages.length} Database Packages Available
                </span>
              </div>

              {/* Dynamic Database Package Select Dropdown */}
              {dbPackages.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl space-y-1">
                  <label className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
                    🌐 Auto-Generate Template From CRM Package:
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'rann-utsav' || val === 'char-dham' || val === 'singapore') {
                        handleTemplateChange(val);
                      } else {
                        handleSelectDbPackage(val);
                      }
                    }}
                    className="w-full bg-[#070C1E] border border-amber-500/40 text-amber-300 font-bold text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="" disabled>-- Select a Live Package to Generate Template --</option>
                    <optgroup label="Featured High-Converting Campaigns">
                      <option value="rann-utsav">🎪 Rann Utsav Kutch 2026</option>
                      <option value="char-dham">🚁 Char Dham Helicopter Yatra 2026</option>
                      <option value="singapore">🦁 Singapore 4D3N & Sentosa Retreat</option>
                    </optgroup>
                    <optgroup label="Live Database Tour Packages">
                      {dbPackages.map((pkg: any) => (
                        <option key={pkg.id || pkg.slug} value={pkg.id || pkg.slug}>
                          📍 {pkg.title || pkg.name} ({pkg.duration || pkg.days || 'Custom'}) — ₹{Number(pkg.price || 0).toLocaleString('en-IN')}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

              {/* Quick Action Preset Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleTemplateChange('rann-utsav')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${selectedTemplate === 'rann-utsav' ? 'bg-[#C9A25A]/20 border-[#C9A25A] text-[#E5C378]' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                >
                  🎪 Rann Utsav Kutch
                </button>
                <button
                  onClick={() => handleTemplateChange('char-dham')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${selectedTemplate === 'char-dham' ? 'bg-[#C9A25A]/20 border-[#C9A25A] text-[#E5C378]' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                >
                  🚁 Char Dham Helicopter
                </button>
                <button
                  onClick={() => handleTemplateChange('singapore')}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${selectedTemplate === 'singapore' ? 'bg-[#C9A25A]/20 border-[#C9A25A] text-[#E5C378]' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                >
                  🦁 Singapore 4D3N
                </button>
              </div>
            </div>

            {/* Campaign Title */}
            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1 block">Internal Campaign Name:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#070C1E] border border-white/15 focus:border-[#C9A25A] px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            {/* Subject Line */}
            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1 block">Email Subject Line (Appears in User Inbox):</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#070C1E] border border-white/15 focus:border-[#C9A25A] px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            {/* HTML Body Editor with Dynamic Tags Toolbar */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="text-xs text-slate-300 font-semibold">Email HTML Body Content:</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-amber-300 font-mono">Insert Tag:</span>
                  <button 
                    type="button" 
                    onClick={() => insertTagAtCursor('{{NAME}}')} 
                    className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md text-[10px] font-mono hover:bg-amber-500/40 transition-colors"
                  >
                    + {'{{NAME}}'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertTagAtCursor('{{EMAIL}}')} 
                    className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md text-[10px] font-mono hover:bg-amber-500/40 transition-colors"
                  >
                    + {'{{EMAIL}}'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertTagAtCursor('{{YEAR}}')} 
                    className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md text-[10px] font-mono hover:bg-amber-500/40 transition-colors"
                  >
                    + {'{{YEAR}}'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => insertTagAtCursor('{{UNSUBSCRIBE_LINK}}')} 
                    className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-md text-[10px] font-mono hover:bg-amber-500/40 transition-colors"
                  >
                    + {'{{UNSUBSCRIBE_LINK}}'}
                  </button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                rows={12}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="w-full bg-[#070C1E] border border-white/15 focus:border-[#C9A25A] p-4 rounded-xl text-xs text-slate-200 font-mono focus:outline-none"
              />
            </div>

            {/* Submit Action & Test Box */}
            <div className="pt-2 space-y-3">
              {/* Send Test Email Quick Box */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <label className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block">
                  ✉️ Test Email Preview in Your Personal Inbox:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email address (e.g. nkm143@gmail.com)"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    className="flex-1 bg-[#070C1E] border border-white/20 focus:border-[#C9A25A] px-3.5 py-2 rounded-lg text-xs text-white focus:outline-none placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={sendingTest || !testEmailAddress}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs h-9 px-4 rounded-lg cursor-pointer shrink-0 border border-amber-400"
                  >
                    {sendingTest ? 'Sending Test...' : 'Send Test Email'}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSendCampaign}
                disabled={dispatching || totalSubscribers === 0}
                className="w-full py-6 bg-gradient-to-r from-[#C9A25A] to-[#E5C378] text-[#070C1E] font-extrabold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg cursor-pointer"
              >
                {dispatching ? 'Dispatching Campaign...' : `🚀 Dispatch Campaign to ${totalSubscribers} Subscribers`}
              </Button>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0B1226]/90 border border-white/10 p-5 rounded-2xl shadow-xl">
              <h4 className="text-xs uppercase tracking-widest font-bold text-[#E5C378] flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-[#C9A25A]" /> Live Email Inbox Preview
              </h4>
              <div className="bg-[#FAF7F2] text-slate-900 rounded-xl p-5 shadow-inner min-h-[460px] overflow-y-auto border border-slate-200 text-left">
                <div className="border-b border-slate-300/70 pb-3 mb-4 text-left">
                  <p className="text-[11px] text-slate-600 font-semibold"><strong>From:</strong> Ghumo Firoo Journeys &lt;noreply@ghumofiroo.com&gt;</p>
                  <p className="text-xs font-extrabold text-slate-900 mt-1"><strong>Subject:</strong> {subject}</p>
                </div>
                <div className="email-preview-content text-slate-900 text-left space-y-3" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subscribers Database */}
      {activeTab === 'subscribers' && (
        <div className="bg-[#0B1226]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-[#C9A25A]" /> Verified Email Subscribers & CRM Leads
            </h3>
            <span className="text-xs text-amber-300 font-mono">{subscribers.length} total entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 uppercase text-[10px] text-amber-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Subscribed Date</th>
                  <th className="py-3 px-4">Status / Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscribers.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-white">{sub.email}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{sub.subscribed_at}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        ✓ {sub.status || 'Active Subscriber'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Campaign History */}
      {activeTab === 'history' && (
        <div className="bg-[#0B1226]/90 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#C9A25A]" /> Dispatched Campaigns Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 uppercase text-[10px] text-amber-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Subject Line</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Dispatched At</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{camp.title}</td>
                    <td className="py-3 px-4 text-slate-300">{camp.subject}</td>
                    <td className="py-3 px-4 text-amber-300 font-bold">{camp.recipient_count} emails</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{camp.created_at}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        ✓ {camp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
