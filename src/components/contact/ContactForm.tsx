import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Send, User, Mail, Phone, MessageSquare, Loader2 } from 'lucide-react';
import { leadService } from '@/services/leadService';
import { trackEvent } from '@/lib/pixel';
import { useNavigate } from 'react-router-dom';
import { validateIndianPhone, sanitizePhone, PHONE_ERROR_MSG, validateName, validateEmail, validateMessage } from '@/lib/validation';
import '../../styles/animations.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    company: '', // honeypot
    formStart: Date.now(), // timing token
    captchaToken: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // initialize timing token on mount
  useEffect(() => {
    setFormData(prev => ({ ...prev, formStart: Date.now() }));
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Name
    const nameErr = validateName(formData.name);
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (nameErr) {
      newErrors.name = nameErr;
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone — Indian mobile number
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validateIndianPhone(formData.phone)) {
      newErrors.phone = PHONE_ERROR_MSG;
    }

    // Message
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else {
      const msgErr = validateMessage(formData.message);
      if (msgErr) newErrors.message = msgErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await leadService.createLead({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        packageName: formData.subject || 'General Inquiry',
        packagePrice: 0,
        duration: '',
        destinations: 'General',
        notes: formData.message,
        source: 'contact_page',
        status: 'New Inquiry',
        leadDestination: ['General'],
      });

      trackEvent('Contact', {
        content_name: 'Contact Form',
        status: 'submitted'
      }, {
        em: formData.email,
        ph: formData.phone,
        fn: formData.name.split(' ')[0],
        ln: formData.name.split(' ').slice(1).join(' ') || undefined
      });

      try {
        let functionUrl = (import.meta as any).env?.VITE_ENQUIRY_FUNCTION_URL as string | undefined;
        if (!functionUrl && (import.meta.env as any).VITE_SUPABASE_URL) {
          functionUrl = `${(import.meta.env as any).VITE_SUPABASE_URL}/functions/v1/send-travel-enquiry`;
        }
        if (functionUrl) {
          await fetch(functionUrl, {
            method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerData: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              message: formData.message,
              subject: formData.subject,
            },
            type: 'contact',
            honeypot: formData.company,
            formStart: formData.formStart,
          }),
        });
        }
        
        // /api/send-travel-enquiry is not a real server route in this static app.
        // The Google Sheets submission above already captured the lead.
        // This optional notification endpoint failure is silently ignored.
      } catch {
        // Silently ignore — Google Sheets captured the lead successfully
      }

      toast({
        title: "Message sent successfully! ✨",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        company: '',
        formStart: Date.now(),
        captchaToken: '',
      });
      setErrors({});
      const params = new URLSearchParams({
        type: 'contact',
        name: formData.name,
        email: formData.email
      });
      navigate(`/thank-you?${params.toString()}`);
    } catch (error) {
      console.error("Contact submission failed", error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Send us a Message
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="group">
            <Label htmlFor="name" className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <User className="w-4 h-4 text-indigo-500" />
              Full Name *
            </Label>
            <div className="relative">
              <Input autoComplete="name"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`pl-10 h-12 rounded-xl transition-all duration-300 focus:shadow-md ${errors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
                placeholder="Enter your full name"
              />
              <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
            {errors.name && <p className="text-red-500 text-sm mt-1">⚠️ {errors.name}</p>}
          </div>

          {/* Email Address */}
          <div className="group">
            <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              Email Address *
            </Label>
            <div className="relative">
              <Input autoComplete="email"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`pl-10 h-12 rounded-xl transition-all duration-300 focus:shadow-md ${errors.email ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
                placeholder="Enter your email address"
              />
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">⚠️ {errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="group">
            <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <Phone className="w-4 h-4 text-indigo-500" />
              Phone Number *
            </Label>
            <div className="relative">
              <Input autoComplete="tel"
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: sanitizePhone(e.target.value) }))}
                className={`pl-10 h-12 rounded-xl transition-all duration-300 focus:shadow-md ${errors.phone ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}
                placeholder="10-digit mobile number"
              />
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">⚠️ {errors.phone}</p>}
          </div>

          {/* Subject */}
          <div className="group">
            <Label htmlFor="subject" className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Subject
            </Label>
            <div className="relative">
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="pl-10 h-12 rounded-xl border-gray-200 transition-all duration-300 focus:shadow-md"
                placeholder="How can we help you?"
              />
              <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Message */}
          <div className="group">
            <Label htmlFor="message" className="flex items-center gap-2 text-gray-700 font-medium mb-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              Your Message *
            </Label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className={`w-full pl-10 pt-4 pb-4 pr-4 bg-white/50 border-2 rounded-xl transition-all duration-300 focus:bg-white/80 focus:border-indigo-500 focus:shadow-lg resize-none ${
                  errors.message ? 'border-red-400 bg-red-50/50' : 'border-gray-200 hover:border-indigo-300'
                }`}
                placeholder="Tell us about your dream destination, travel dates, group size, and any special requirements..."
              />
              <MessageSquare className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
            </div>
            {errors.message && <p className="text-red-500 text-sm mt-1 flex items-center gap-1">⚠️ {errors.message}</p>}
          </div>

          {/* Honeypot */}
          <input type="text" className="hidden" tabIndex={-1} autoComplete="off" value={formData.company} onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} />

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending your message...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </div>
            )}
          </Button>
        </form>
        
        {/* Trust indicators */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>24h Response</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Expert Guidance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
