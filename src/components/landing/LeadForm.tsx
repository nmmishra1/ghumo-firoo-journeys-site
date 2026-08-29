import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackLead } from '@/lib/pixel';
import { leadService } from '@/services/leadService';
import { retryFailedSubmissions } from '@/lib/googleSheets';
import { useNavigate } from 'react-router-dom';
import { validateIndianPhone, sanitizePhone, PHONE_ERROR_MSG } from '@/lib/validation';

interface LeadFormProps {
  packageName: string; // e.g., "Char Dham Helicopter"
  variant?: 'inline' | 'popup' | 'sidebar';
  hideHeader?: boolean;
  clean?: boolean; // If true, removes container styles (bg, shadow, border)
}

interface FormData {
  name: string;
  phone: string;
  email: string;
}

// Simple UUID generator
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const LeadForm: React.FC<LeadFormProps> = ({ packageName, variant = 'inline', hideHeader = false, clean = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  // OTP verification removed
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    // Generate or retrieve session ID on mount
    let sid = sessionStorage.getItem('analytics_session_id');
    if (!sid) {
      sid = generateUUID();
      sessionStorage.setItem('analytics_session_id', sid);
    }
    setSessionId(sid);

    // Try to resend any previously failed submissions
    retryFailedSubmissions();
  }, []);

  const processSubmission = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    const submissionTimestamp = new Date().toISOString();
    const userAgent = navigator.userAgent;

    try {
      // 1. Validate Form Data Integrity (Basic Check)
      if (!data.name || !data.phone || !data.email) {
        throw new Error('Missing required fields');
      }

      // 2. Track Lead in Meta Pixel & CAPI
      // Split name for CAPI if possible
      const nameParts = data.name.trim().split(' ');
      const fn = nameParts[0];
      const ln = nameParts.slice(1).join(' ') || '';

      // Prepare enhanced event data
      const eventMetadata = {
        timestamp: submissionTimestamp,
        session_id: sessionId,
        user_agent: userAgent,
        device_platform: /Mobile|Android|iPhone/i.test(userAgent) ? 'mobile' : 'desktop',
        package_interest: packageName,
      };

      trackLead(packageName, {
        em: data.email,
        ph: data.phone,
        fn: fn,
        ln: ln,
      }, eventMetadata);

      // 3. Submit to CRM and Google Sheets
      const leadPayload = {
        packageName: packageName,
        packagePrice: 0,
        duration: '',
        destinations: packageName,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        source: 'landing_page_lead_form',
        status: 'New Inquiry',
        leadDestination: [packageName],
      };
      
      await leadService.createLead(leadPayload);
      
      console.log('Lead successfully processed (CRM & Sheets):', leadPayload);

      // 4. Navigate to Thank You page with context
      const params = new URLSearchParams({
        type: 'enquiry',
        name: data.name,
        email: data.email
      });
      navigate(`/thank-you?${params.toString()}`);
      setIsSuccess(true);
      
    } catch (err) {
      console.error('Submission validation/network error:', err);
      setError('Something went wrong. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    await processSubmission(data);
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 p-6 rounded-xl text-center border border-green-100 animate-in fade-in duration-500">
        <div className="flex justify-center mb-3">
          <CheckCircle className="text-green-600 w-12 h-12" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Thank You!</h3>
        <p className="text-green-700">
          We have received your request for <strong>{packageName}</strong>. 
          <br/>Our travel expert will call you shortly on <strong>{new Date().toLocaleDateString()}</strong>.
        </p>
        <p className="text-xs text-green-600 mt-4">
          Session ID: {sessionId.slice(0, 8)}...
        </p>
      </div>
    );
  }

  const containerClasses = clean 
    ? '' 
    : `bg-white p-6 rounded-xl shadow-xl border border-gray-100 ${variant === 'sidebar' ? 'sticky top-24' : ''}`;

  return (
    <div className={containerClasses}>
      
      {!hideHeader && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Best Price Now</h3>
          <p className="text-gray-600 text-sm">
            Limited seats available for {new Date().getFullYear()} season!
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="sr-only">Full Name</label>
          <input autoComplete="name"
            id="name"
            type="text"
            placeholder="Your Name *"
            className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'} focus:outline-none focus:ring-2 transition-all`}
            {...register('name', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="sr-only">Phone Number</label>
          <input autoComplete="tel"
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit Mobile (e.g. 9876543210) *"
            className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'} focus:outline-none focus:ring-2 transition-all`}
            {...register('phone', { 
              required: 'Phone is required',
              validate: (value) => validateIndianPhone(value) || PHONE_ERROR_MSG,
              onChange: (e) => {
                e.target.value = sanitizePhone(e.target.value);
              }
            })}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="sr-only">Email Address</label>
          <input autoComplete="email"
            id="email"
            type="email"
            placeholder="Email Address *"
            className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'} focus:outline-none focus:ring-2 transition-all`}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Get Best Price Now'
          )}
        </Button>
        
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Your details are 100% safe with us.
        </p>
      </form>
    </div>
  );
};

export default LeadForm;
