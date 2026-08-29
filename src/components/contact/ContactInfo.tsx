
import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, ExternalLink, Copy } from 'lucide-react';
import ProtectedEmail from '@/components/security/ProtectedEmail';
import { useToast } from '@/hooks/use-toast';
import '../../styles/animations.css';
import { pushEvent } from '@/lib/analytics';

const ContactInfo = () => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied! 📋",
        description: `${type} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const handlePhoneCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailClick = () => {
    // Route users to the secure contact form instead of direct mailto
    window.location.href = '/contact';
  };

  const handleWhatsApp = () => {
  const message = encodeURIComponent("Hi! I'm interested in planning a trip with Ghumo Firoo Travels.");
    try { pushEvent('whatsapp_click', { source: 'contact_info_widget' }); } catch {}
    window.open(`https://wa.me/919910987264?text=${message}`, '_blank');
  };

  const handleTelegram = () => {
    window.open('https://t.me/Ghumofirootravels', '_blank');
  };
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center animate-fade-in">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0a1128] to-[#1c2541] bg-clip-text text-transparent mb-3">
          Multiple Ways to Connect
        </h2>
        <p className="text-lg text-gray-600">Choose your preferred way to reach us - we're always here to help</p>
      </div>

      {/* Quick Contact Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsApp}
          className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 border-green-400/30 hover:border-green-300/50"
        >
          <MessageCircle className="w-6 h-6 mx-auto mb-1 group-hover:animate-bounce" />
          <p className="font-semibold text-xs">WhatsApp</p>
          <p className="text-xs opacity-90">Instant Chat</p>
        </button>

        {/* Telegram */}
        <button
          onClick={handleTelegram}
          className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <Send className="w-6 h-6 mx-auto mb-1 group-hover:animate-bounce" />
          <p className="font-semibold text-xs">Telegram</p>
          <p className="text-xs opacity-90">Quick Message</p>
        </button>

        {/* Phone Call */}
        <button
          onClick={() => handlePhoneCall('+919910987264')}
          className="group bg-gradient-to-br bg-gradient-warm text-white text-white p-3 rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <Phone className="w-6 h-6 mx-auto mb-1 group-hover:animate-bounce" />
          <p className="font-semibold text-xs">Call Now</p>
          <p className="text-xs opacity-90">Direct Line</p>
        </button>

        {/* Email → Contact Form */}
        <button
          onClick={handleEmailClick}
          className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <Mail className="w-6 h-6 mx-auto mb-1 group-hover:animate-bounce" />
          <p className="font-semibold text-xs">Email via Form</p>
          <p className="text-xs opacity-90">Secure & Anti‑Spam</p>
        </button>
      </div>

      {/* Detailed Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Office Address */}
        <div className="group backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/20">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-2 text-base">Visit Our Office</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                Shop No. 210, 2nd Floor, Pratap Complex<br />
                Metro Gate Number 3, near Munirka<br />
                Baba Gangnath Market, Munirka<br />
                New Delhi, Delhi 110067
              </p>
              <button
                onClick={() => copyToClipboard('Shop No. 210, 2nd Floor, Pratap Complex, Metro Gate Number 3, near Munirka, Baba Gangnath Market, Munirka, New Delhi, Delhi 110067', 'Address')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
              >
                <Copy className="w-3 h-3" />
                Copy Address
              </button>
            </div>
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="group backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/20">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-2 text-base">Call Us Anytime</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">+91 9910987264</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePhoneCall('+919910987264')}
                      className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => copyToClipboard('+919910987264', 'Phone number')}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">+91 9870229792</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePhoneCall('+919870229792')}
                      className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => copyToClipboard('+919870229792', 'Phone number')}
                      className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-green-600 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  24/7 Emergency Support
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Clock className="h-4 w-4 text-accent" />
                  <span className="font-semibold text-gray-800 text-sm">Business Hours</span>
                </div>
                <div className="mt-3 space-y-1 text-gray-600 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Monday - Saturday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sunday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email card removed per request; use contact form instead */}
        
      </div>

      {/* Social Media & Additional Contact */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-white/20 p-6 rounded-xl">
        <h3 className="font-bold text-gray-800 mb-4 text-center text-lg">Follow Our Adventures</h3>
        <div className="flex justify-center space-x-4 mb-4">
          <a 
            href="https://www.facebook.com/ghumofirootravels" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
          >
            <svg className="w-5 h-5 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
            </svg>
          </a>
          <a 
            href="https://www.instagram.com/ghumofirootravels/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-gradient-to-br from-pink-500 to-purple-600 text-white p-3 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
          >
            <svg className="w-5 h-5 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988c6.62 0 11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.334-1.297C3.334 14.24 2.29 11.494 2.29 8.449s1.044-5.791 2.825-7.242c.886-.807 2.037-1.297 3.334-1.297s2.448.49 3.334 1.297c1.781 1.451 2.825 4.197 2.825 7.242s-1.044 5.791-2.825 7.242c-.886.807-2.037 1.297-3.334 1.297z"/>
            </svg>
          </a>
          <a 
            href="https://www.youtube.com/@ghumofirootravels" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
          >
            <svg className="w-5 h-5 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
          <a 
            href="https://x.com/GhumoFiroo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
          >
            <svg className="w-5 h-5 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
        </div>
        <div className="text-center">
          <p className="text-gray-600 mb-3 text-sm">Stay updated with our latest travel stories, tips, and exclusive offers!</p>
          <div className="flex justify-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-blue-600">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              Daily Travel Tips
            </span>
            <span className="flex items-center gap-1 text-purple-600">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
              Exclusive Deals
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Travel Stories
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
