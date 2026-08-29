
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { pushEvent } from '@/lib/analytics';
import { leadService } from '@/services/leadService';
import { Loader2, MapPin, Phone, User } from 'lucide-react';
import { trackLead } from '@/lib/pixel';
import { useNavigate } from 'react-router-dom';
import { INDIAN_PHONE_REGEX, sanitizePhone, PHONE_ERROR_MSG } from '@/lib/validation';

const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().refine((val) => INDIAN_PHONE_REGEX.test(val.replace(/\D/g, '')), PHONE_ERROR_MSG),
  destination: z.string().min(2, 'Destination is required'),
});

type FormData = z.infer<typeof formSchema>;

const HeroLeadForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      destination: '',
    },
  });

  const finalSubmit = async (data: FormData, token: string) => {
    setIsSubmitting(true);
    try {
      const leadPayload = {
        packageName: `Quick Enquiry - ${data.destination}`,
        packagePrice: 0,
        duration: '',
        destinations: data.destination,
        customerName: data.fullName,
        customerEmail: 'not-provided@example.com',
        customerPhone: data.phone,
        source: 'Home Hero Section',
        status: 'New Inquiry',
        leadDestination: [data.destination],
        notes: `Quick enquiry for ${data.destination}`,
      };

      const createdLead = await leadService.createLead(leadPayload);
      const success = !!createdLead;

      if (success) {
        pushEvent('generate_lead', {
            currency: 'INR',
            value: 0,
            lead_type: 'home_hero_enquiry'
        });
        trackLead();
        
        // Navigate to Thank You page with minimal context
        const params = new URLSearchParams({
          type: 'enquiry',
          name: data.fullName,
          email: 'not-provided@example.com'
        });
        navigate(`/thank-you?${params.toString()}`);
        
        toast({
          title: "Enquiry Sent!",
          description: "Our travel expert will call you shortly.",
          className: "bg-green-600 text-white border-none",
        });
        
        form.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted, skipping OTP for quick enquiry", data);
    await finalSubmit(data, '');
  };

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-white mb-2 text-center">
          Plan Your Dream Trip
        </h3>
        <p className="text-white/80 text-center mb-6 text-sm">
          Get a free custom quote within 24 hours
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                      <Input 
                        placeholder="Your Name" 
                        {...field} 
                        id="hero-fullName"
                        name="fullName"
                        autoComplete="name"
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                      <Input 
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit Mobile (e.g. 9876543210)" 
                        {...field} 
                        id="hero-phone"
                        name="phone"
                        autoComplete="tel"
                        onChange={(e) => field.onChange(sanitizePhone(e.target.value))}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all"
                        maxLength={10}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                      <Input 
                        placeholder="Where do you want to go?" 
                        {...field} 
                        id="hero-destination"
                        name="destination"
                        autoComplete="off"
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300 text-xs" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-gradient-warm hover:opacity-90 text-white font-bold py-6 shadow-lg hover:shadow-accent/25 transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Get Free Quote"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default HeroLeadForm;
