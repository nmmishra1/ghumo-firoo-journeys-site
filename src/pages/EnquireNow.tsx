
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Layout from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[+]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  packageType: z.string().min(1, 'Please select a package type'),
  travelDates: z.string().min(1, 'Please provide preferred travel dates'),
  numberOfTravelers: z.string().min(1, 'Please specify number of travelers'),
  budget: z.string().optional(),
  specialRequests: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof formSchema>;

const EnquireNow = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      packageType: '',
      travelDates: '',
      numberOfTravelers: '',
      budget: '',
      specialRequests: '',
      message: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Create mailto link with form data
      const subject = encodeURIComponent(`Tour Package Enquiry - ${data.packageType}`);
      const body = encodeURIComponent(`
Dear Ghumo Firoo Travels Team,

I would like to enquire about your tour packages. Please find my details below:

Full Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Package Type: ${data.packageType}
Preferred Travel Dates: ${data.travelDates}
Number of Travelers: ${data.numberOfTravelers}
Budget Range: ${data.budget || 'Not specified'}
Special Requests: ${data.specialRequests || 'None'}

Message:
${data.message}

Please get back to me with package details and pricing.

Best regards,
${data.fullName}
      `);

      const mailtoLink = `mailto:booking@ghumofiroo.com?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;

      toast({
        title: "Enquiry Submitted!",
        description: "Your default email client has opened. Please send the email to complete your enquiry.",
      });

      // Reset form after successful submission
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const packageTypes = [
    'Char Dham Yatra',
    'Golden Triangle',
    'Kashmir Paradise',
    'Rajasthan Royal',
    'Turkey Adventure',
    'Dubai Delights',
    'Thailand Tropical',
    'Singapore Malaysia',
    'Custom Package',
    'Other'
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative h-[40vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=600&fit=crop')"
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Enquire Now</h1>
          <p className="text-xl">Tell us about your dream destination and we'll craft the perfect journey</p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Plan Your Perfect Trip</h2>
              <p className="text-lg text-gray-600">
                Fill out the form below and our travel experts will get back to you within 24 hours
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 XXXXX XXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Type *</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            {...field}
                          >
                            <option value="">Select a package</option>
                            {packageTypes.map((packageType) => (
                              <option key={packageType} value={packageType}>
                                {packageType}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="travelDates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Travel Dates *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., December 2024 or 15-25 Jan 2025" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfTravelers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Travelers *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2 Adults, 1 Child" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range (Optional)</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            {...field}
                          >
                            <option value="">Select budget range</option>
                            <option value="Under ₹25,000">Under ₹25,000</option>
                            <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                            <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                            <option value="₹1,00,000 - ₹2,00,000">₹1,00,000 - ₹2,00,000</option>
                            <option value="Above ₹2,00,000">Above ₹2,00,000</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Vegetarian meals, Wheelchair access" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us more about your travel preferences, expectations, or any specific requirements..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-center">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-orange-500 hover:bg-orange-600 px-12 py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
                  </Button>
                </div>
              </form>
            </Form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="text-center text-gray-600">
                <p className="mb-2">
                  <strong>Need immediate assistance?</strong>
                </p>
                <p>Call us at: <a href="tel:+919910987264" className="text-orange-600 font-semibold">+91 98765 43210</a></p>
                <p>Email us at: <a href="mailto:booking@ghumofiroo.com" className="text-orange-600 font-semibold">booking@ghumofiroo.com</a></p>
                <p className="text-sm text-gray-500 mt-4">
                  Note: Form data is sent via email and not stored in any database
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EnquireNow;
