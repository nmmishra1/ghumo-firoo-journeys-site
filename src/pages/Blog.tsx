import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowRight, Search, Clock, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import SEO from '@/components/SEO';
import LazyImage from '@/components/ui/LazyImage';
import { useToast } from '@/hooks/use-toast';
import { submitToGoogleSheets } from '@/lib/googleSheets';
import { trackLead } from '@/lib/pixel';
import { blogPosts, blogContents, BlogPost } from '@/data/blogData';
import ReactMarkdown from 'react-markdown';
import '../styles/animations.css';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

const Blog = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allPosts, setAllPosts] = useState<BlogPost[]>(blogPosts);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load dynamic blog posts on mount
  useEffect(() => {
    const loadDynamicBlogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/blogs.php`);
        if (res.ok) {
          const data = await res.json();
          // Filter out static posts that are overridden by database posts (same slug)
          const dbSlugs = new Set(data.map((p: any) => p.slug));
          const filteredStatic = blogPosts.filter(p => !dbSlugs.has(p.slug));
          
          // Merge and sort
          const merged = [...filteredStatic, ...data].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setAllPosts(merged);
        }
      } catch (err) {
        console.error('Failed to load dynamic blogs:', err);
      }
    };
    loadDynamicBlogs();
  }, []);

  // Sync selectedPost with slug
  useEffect(() => {
    if (slug) {
      const loadPost = async () => {
        // First try to fetch from database to support live edits of static posts
        try {
          const res = await fetch(`${API_BASE}/blogs.php?slug=${slug}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedPost(data);
            window.scrollTo(0, 0);
            return;
          }
        } catch (err) {
          console.error('Failed to fetch single blog from DB, trying static:', err);
        }

        // Fallback to static post if database query failed or returned 404
        const post = blogPosts.find(p => p.slug === slug);
        if (post) {
          setSelectedPost(post);
          window.scrollTo(0, 0);
        } else {
          setSelectedPost(null);
        }
      };
      loadPost();
    } else {
      setSelectedPost(null);
    }
  }, [slug]);

  // JSON-LD for individual blog post
  const blogPostSchema = selectedPost ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": selectedPost.title,
    "description": selectedPost.metaDescription ?? selectedPost.excerpt,
    "image": selectedPost.image.startsWith('http') ? selectedPost.image : `https://ghumofiroo.com${selectedPost.image}`,
    "author": {
      "@type": "Person",
      "name": selectedPost.author
    },
    "datePublished": selectedPost.date,
    "publisher": {
      "@type": "Organization",
      "name": "Ghumo Firoo Travels",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ghumofiroo.com/ghumo-firoo-logo.png"
      }
    }
  } : null;

  const handleSubscribe = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await submitToGoogleSheets({
        email,
        type: 'newsletter',
        source: 'blog_page',
        timestamp: new Date().toISOString()
      });
      trackLead('Newsletter Subscription', { em: email }, { source: 'blog_page' });
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostClick = (post: BlogPost) => {
    navigate(`/blog/${post.slug}`);
  };

  const categories = ['All', ...new Set(allPosts.map(post => post.category))];

  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      const title = (post.title || '').toLowerCase();
      const excerpt = (post.excerpt || '').toLowerCase();
      const matchesSearch = title.includes(searchTerm.toLowerCase()) || 
                           excerpt.includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allPosts, searchTerm, selectedCategory]);

  if (selectedPost) {
    return (
      <Layout>
        <SEO 
          title={selectedPost.title}
          description={selectedPost.metaDescription ?? selectedPost.excerpt}
          image={selectedPost.image}
          imageAlt={selectedPost.imageAlt ?? selectedPost.title}
          type="article"
          author={selectedPost.author}
          publishedTime={selectedPost.date}
          structuredData={blogPostSchema}
        />
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen py-12 transition-colors duration-500">
          <div className="max-w-4xl mx-auto px-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog')}
              className="mb-8 group dark:text-slate-300 dark:hover:bg-white/10"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to all posts
            </Button>

            <article className="glass-card overflow-hidden rounded-3xl shadow-glass-lg animate-fade-in dark:bg-slate-900/50 dark:border-white/10">
              <div className="relative h-[400px]">
                <LazyImage 
                  src={selectedPost.image} 
                  alt={selectedPost.imageAlt ?? selectedPost.title}
                  title={selectedPost.imageTitle ?? selectedPost.title}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-4 text-white/90 text-sm mb-4">
                    <span className="px-3 py-1 rounded-full bg-accent/80 backdrop-blur-md">
                      {selectedPost.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {selectedPost.readTime}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    {selectedPost.title}
                  </h1>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-8 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedPost.author}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{new Date(selectedPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full dark:border-white/10 dark:text-slate-300"><Share2 className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="rounded-full dark:border-white/10 dark:text-slate-300"><Heart className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div className="prose prose-lg prose-blue dark:prose-invert max-w-none">
                  {typeof selectedPost.id === 'number' ? (
                    blogContents[selectedPost.id as number]
                  ) : (
                    <ReactMarkdown>{selectedPost.content || ''}</ReactMarkdown>
                  )}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Explore More Destinations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allPosts.filter(p => p.id !== selectedPost.id).slice(0, 2).map(post => (
                      <div 
                        key={post.id}
                        onClick={() => handlePostClick(post)}
                        className="p-4 rounded-xl border border-gray-100 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all cursor-pointer group"
                      >
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{post.category}</p>
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors line-clamp-1">
                          {post.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title="Travel Blog 2026 | Expert Guides & Offbeat Destinations"
        description="Explore India's hidden gems with our 2026 travel guides. Tips for Char Dham, Europe visas, and budget weekend getaways from Delhi."
      />
      
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen pt-32 pb-20 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Journey Through <span className="text-blue-600 dark:text-blue-400">Our Stories</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Expert guides, destination inspiration, and practical tips for your 2026 adventures.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto items-center justify-center">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  type="text" 
                  placeholder="Search articles..." 
                  className="pl-12 h-14 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full h-12 px-6 transition-all ${
                      selectedCategory === category 
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none' 
                        : 'bg-white/50 dark:bg-white/5 dark:border-white/10 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Post Spotlight */}
          {filteredPosts.length > 0 && selectedCategory === 'All' && !searchTerm && (
            <div 
              onClick={() => handlePostClick(filteredPosts[0])}
              className="mb-20 glass-card group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10 hover:shadow-2xl transition-all duration-500 dark:bg-slate-900/50"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-72 md:h-full min-h-[400px] overflow-hidden">
                  <LazyImage 
                    src={filteredPosts[0].image} 
                    alt={filteredPosts[0].imageAlt ?? filteredPosts[0].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold tracking-wider uppercase shadow-lg">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-10 md:p-14 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mb-6">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-500" /> {new Date(filteredPosts[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-500" /> {filteredPosts[0].readTime}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-white/50 dark:border-white/10 shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{filteredPosts[0].author}</p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Author</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => (
                <div 
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="glass-card group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 dark:bg-slate-900/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <LazyImage 
                      src={post.image} 
                      alt={post.imageAlt ?? post.title}
                      title={post.imageTitle ?? post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold tracking-wider uppercase">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{post.author}</span>
                      </div>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 mb-6">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No articles found</h3>
                <p className="text-gray-600 dark:text-slate-400">Try adjusting your search or category filters.</p>
              </div>
            )}
          </div>

          <div className="glass-card rounded-[3rem] p-8 md:p-16 relative overflow-hidden dark:bg-slate-900/50 dark:border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Stay Ahead of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Travel Curve</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-slate-400 mb-10 leading-relaxed">
                Get exclusive travel deals, offbeat guides, and the latest 2026 destination trends delivered straight to your inbox.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="h-14 rounded-2xl border-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm flex-grow"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button 
                  className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-lg shadow-blue-200 dark:shadow-none whitespace-nowrap"
                  onClick={handleSubscribe}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Subscribing...' : 'Join the Club'}
                </Button>
              </div>
              <p className="mt-6 text-sm text-gray-500 dark:text-slate-500">
                Join 10,000+ travelers. No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
