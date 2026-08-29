import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import LazyImage from '@/components/ui/LazyImage';

interface BlogCardItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
}

const blogs: BlogCardItem[] = [
  {
    id: 1,
    slug: 'rann-utsav-2026',
    title: 'Rann Utsav 2026-27 Complete Travel Guide',
    excerpt: 'The ultimate guide to planning your trip to the White Rann of Kutch for the 2026-27 festival. Booking tips, best time, and packages.',
    image: '/Rann-Utsav-Gujarat.png',
    category: 'Premium Destinations',
    readTime: '15 min read',
    date: 'June 21, 2026',
    author: 'Gujarat Travel Expert'
  },
  {
    id: 2,
    slug: 'char-dham-yatra',
    title: 'Char Dham Yatra Complete Guide',
    excerpt: 'Perform your holy pilgrimage with ease. Plan your routes, register online, book helicopters, and avoid common pilgrim mistakes.',
    image: '/Badrinath.png',
    category: 'Sacred Journeys',
    readTime: '12 min read',
    date: 'June 18, 2026',
    author: 'Char Dham Specialist'
  },
  {
    id: 3,
    slug: 'schengen-visa-guide',
    title: 'Schengen Visa Guide For Indian Travelers',
    excerpt: 'Detailed document checklist, appointment tips, bank balance requirements, and step-by-step visa guidelines for Europe tours.',
    image: '/Europe Image New.png',
    category: 'Visa Guides',
    readTime: '10 min read',
    date: 'June 15, 2026',
    author: 'Visa Consultant'
  }
];

const TravelBlogSection: React.FC = () => {
  return (
    <section className="py-24 bg-white text-[#0a1128]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-accent border border-accent/20 px-4 py-2 rounded-full text-sm font-semibold tracking-wide uppercase font-poppins">
            ✍️ Travel Blog
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-montserrat">
            Latest from <span className="text-accent">Our Travel Guides</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-poppins">
            Stay updated with expert advice, visa tips, and complete destination guides.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Card key={blog.id} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white text-[#0a1128] shadow-md hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col h-full">
              {/* Image Header */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl">
                <LazyImage
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3.5 py-1.5 rounded-full bg-gradient-warm text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                    {blog.category}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <CardContent className="p-6 flex-grow flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold font-poppins">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      {blog.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      {blog.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2 font-montserrat">
                    {blog.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 font-medium font-poppins">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[#0a1128]">
                      <User className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 font-poppins">{blog.author}</span>
                  </div>
                  
                  <Link 
                    to={`/guide/${blog.slug}`}
                    className="flex items-center gap-1 text-xs font-bold text-accent group-hover:gap-2 transition-all font-poppins"
                  >
                    Read Guide
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to="/guides">
            <Button variant="outline" size="lg" className="border-2 border-accent text-accent hover:bg-gradient-warm hover:text-white px-8 py-3.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 cursor-pointer">
              Explore All Travel Guides
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TravelBlogSection;
