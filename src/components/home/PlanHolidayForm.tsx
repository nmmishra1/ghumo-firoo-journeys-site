import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { pushEvent } from '@/lib/analytics';
import { leadService } from '@/services/leadService';
import { trackLead } from '@/lib/pixel';
import { useNavigate } from 'react-router-dom';
import { INDIAN_PHONE_REGEX, sanitizePhone, PHONE_ERROR_MSG } from '@/lib/validation';
import { Loader2, Calendar, MapPin, Users, Phone, User, Compass } from 'lucide-react';

const formSchema = z.object({
  destination: z.string().min(2, 'Please select or enter a destination'),
  travelDate: z.string().min(2, 'Travel date is required'),
  duration: z.string().min(1, 'Duration is required'),
  guests: z.string().min(1, 'Guest count is required'),
  fullName: z.string().min(2, 'Full Name is required'),
  phone: z.string().refine((val) => INDIAN_PHONE_REGEX.test(val.replace(/\D/g, '')), PHONE_ERROR_MSG),
});

type FormData = z.infer<typeof formSchema>;

const PlanHolidayForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: '',
      travelDate: '',
      duration: '',
      guests: '',
      fullName: '',
      phone: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const leadPayload = {
        packageName: `Holiday Plan - ${data.destination}`,
        packagePrice: 0,
        duration: `${data.duration} Days`,
        destinations: data.destination,
        customerName: data.fullName,
        customerEmail: 'not-provided@example.com',
        customerPhone: data.phone,
        source: 'Home Plan Holiday Form',
        status: 'New Inquiry',
        leadDestination: [data.destination],
        notes: `Plan Holiday Form submission. Date: ${data.travelDate}, Guests: ${data.guests}, Duration: ${data.duration} Days`,
      };

      const createdLead = await leadService.createLead(leadPayload);
      if (createdLead) {
        pushEvent('generate_lead', {
          currency: 'INR',
          value: 0,
          lead_type: 'plan_holiday_form'
        });
        trackLead();

        const params = new URLSearchParams({
          type: 'enquiry',
          name: data.fullName,
          email: 'not-provided@example.com'
        });
        navigate(`/thank-you?${params.toString()}`);

        toast({
          title: "Holiday Request Received!",
          description: "Our travel designer will contact you with a custom plan shortly.",
          className: "bg-green-600 text-white border-none",
        });

        form.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Holiday Form Submission Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const destinationsList = [
    'Rann Utsav (Kutch)',
    'Char Dham Yatra',
    'Kedarnath Dham',
    'Europe Highlights',
    'Switzerland & France',
    'Dubai Delights',
    'Bali Paradise',
    'Thailand Tropical',
    'Kashmir Paradise'
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-orange-400 border border-accent/20 px-4 py-2 rounded-full text-sm font-medium">
            📝 Custom Holiday Planner
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Plan My <span className="text-gradient-warm animate-gradient-x">Dream Holiday</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Fill in your trip details below. Our luxury travel designers will craft a bespoke itinerary for you within 24 hours.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-md text-white rounded-3xl shadow-2xl p-6 sm:p-10">
          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Destination */}
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 font-bold text-sm">Select Destination</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                            <select
                              {...field}
                              id="plan-destination"
                              name="destination"
                              autoComplete="off"
                              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-850 bg-slate-950 text-white focus:ring-2 focus:ring-accent focus:border-accent transition-all text-sm appearance-none outline-none"
                            >
                              <option value="" disabled>Where do you want to go?</option>
                              {destinationsList.map(dest => (
                                <option key={dest} value={dest} className="bg-slate-950 text-white">{dest}</option>
                              ))}
                            </select>
                            <div className="absolute right-3.5 top-4 pointer-events-none text-slate-400">▼</div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Travel Date */}
                  <FormField
                    control={form.control}
                    name="travelDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 font-bold text-sm">Target Departure Month / Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                            <Input 
                              placeholder="e.g. October 2026, Dec 15th" 
                              {...field}
                              id="plan-travelDate"
                              name="travelDate"
                              autoComplete="off"
                              className="h-12 pl-11 border-slate-850 bg-slate-950 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-accent rounded-xl"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Duration */}
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 font-bold text-sm">Duration (Days)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Compass className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                            <Input 
                              type="number"
                              placeholder="e.g. 5, 10, 15" 
                              {...field}
                              id="plan-duration"
                              name="duration"
                              autoComplete="off"
                              className="h-12 pl-11 border-slate-850 bg-slate-950 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-accent rounded-xl"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Guest Count */}
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 font-bold text-sm">Guest Count (Adults + Kids)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                            <Input 
                              placeholder="e.g. 2 Adults, 2 Kids" 
                              {...field}
                              id="plan-guests"
                              name="guests"
                              autoComplete="off"
                              className="h-12 pl-11 border-slate-850 bg-slate-950 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-accent rounded-xl"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Contact Name */}
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 font-bold text-sm">Your Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                            <Input 
                              placeholder="Enter your full name" 
                              {...field}
                              id="plan-fullName"
                              name="fullName"
                              autoComplete="name"
                              className="h-12 pl-11 border-slate-850 bg-slate-950 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-accent rounded-xl"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Contact Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 font-bold text-sm">10-Digit Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                            <Input 
                              type="tel"
                              inputMode="numeric"
                              placeholder="10-digit Phone Number" 
                              {...field}
                              id="plan-phone"
                              name="phone"
                              autoComplete="tel"
                              onChange={(e) => field.onChange(sanitizePhone(e.target.value))}
                              className="h-12 pl-11 border-slate-850 bg-slate-950 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-accent rounded-xl"
                              maxLength={10}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-gradient-warm hover:opacity-90 text-white font-extrabold text-lg rounded-2xl border-0 shadow-lg shadow-accent/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generating Your Quote...
                      </>
                    ) : (
                      "Plan My Holiday [Get Free Quote]"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PlanHolidayForm;
