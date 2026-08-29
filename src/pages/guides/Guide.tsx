import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import DestinationGuideView from '@/components/content/DestinationGuideView';
import { getGuide } from '@/lib/contentLoader';

const GuidePage: React.FC = () => {
  const { slug } = useParams();
  const guide = slug ? getGuide(slug) : undefined;

  if (!guide) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0B1026] text-white flex items-center justify-center">
          <div className="max-w-md mx-auto px-6 py-16 text-center bg-[#1A2342]/60 border border-white/10 rounded-[24px] shadow-2xl backdrop-blur-md">
            <h1 className="text-3xl font-bold mb-3 text-accent">Guide Not Found</h1>
            <p className="text-slate-300 text-sm">We couldn’t find that guide. It may be in drafting or scheduled to release shortly.</p>
            <Link to="/guides" className="inline-flex items-center justify-center mt-6 px-5 py-2.5 bg-gradient-warm text-[#0b1026] font-bold rounded-xl shadow-lg transition-transform hover:scale-105">
              See all guides
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title={`${guide.title} Travel Guide`} description={guide.summary} />
      <div className="min-h-screen bg-[#0B1026] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <DestinationGuideView guide={guide} />
        </div>
      </div>
    </Layout>
  );
};

export default GuidePage;