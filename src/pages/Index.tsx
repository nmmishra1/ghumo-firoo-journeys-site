
import React from 'react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedDestinations from '@/components/home/FeaturedDestinations';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedDestinations />
      <WhyChooseUs />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
