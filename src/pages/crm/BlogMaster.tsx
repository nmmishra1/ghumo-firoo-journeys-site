import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import ReactMarkdown from 'react-markdown';
import { blogPosts, blogContents } from '@/data/blogData';
import {
  FileText, Plus, Search, Edit, Power, Info,
  CheckCircle2, AlertTriangle, Loader2, Globe,
  ArrowLeft, Save, Tag, X, ChevronRight,
  Sparkles, Calendar, Clock, BookOpen, Eye, Trash2, Copy, ExternalLink,
  LayoutGrid, List, Filter, Share2, MessageSquare, Layers, TrendingUp, Check,
  Heading1, Heading2, Bold, Italic, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Code, SlidersHorizontal, CheckSquare, Sparkle, RefreshCw, FileCheck, Code2
} from 'lucide-react';
import { crmFetch } from '@/utils/crmApi';

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Fallback travel categories if database categories API is offline or empty
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Destination Guides', slug: 'destination-guides' },
  { id: '2', name: 'Honeymoon Specials', slug: 'honeymoon-specials' },
  { id: '3', name: 'Family Getaways', slug: 'family-getaways' },
  { id: '4', name: 'Weekend Escapes', slug: 'weekend-escapes' },
  { id: '5', name: 'International Tours', slug: 'international-tours' },
  { id: '6', name: 'Visa & Travel Tips', slug: 'visa-travel-tips' },
  { id: '7', name: 'Safety & Planning', slug: 'safety-planning' },
  { id: '8', name: 'Hotels & Resorts', slug: 'hotels-resorts' },
  { id: '9', name: 'Culture & Festivals', slug: 'culture-festivals' },
  { id: '10', name: 'Adventure & Treks', slug: 'adventure-treks' },
  { id: '11', name: 'Luxury Travel', slug: 'luxury-travel' },
  { id: '12', name: 'Corporate Trips', slug: 'corporate-trips' },
];

const UNSPLASH_COVER_PRESETS = [
  { label: 'Georgia Mountains', url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=1200' },
  { label: 'Tropical Bali', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200' },
  { label: 'Maldives Island', url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200' },
  { label: 'Kashmir Valley', url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1200' },
  { label: 'Himachal Peaks', url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200' },
  { label: 'Dubai Skyline', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200' },
  { label: 'European Old Town', url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1200' },
];

const PRESET_TAGS = ['#Georgia', '#Bali', '#VisaGuide', '#Honeymoon', '#BudgetTravel', '#Itinerary', '#FamilyVacation', '#LuxuryResort', '#PackingTips'];

// Helper to convert React JSX elements back to markdown
const reactNodeToMarkdown = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(reactNodeToMarkdown).join('');
  
  if (node.props) {
    const children = node.props.children;
    const childText = reactNodeToMarkdown(children);
    
    const type = node.type;
    if (type === 'h2') return `\n## ${childText}\n`;
    if (type === 'h3') return `\n### ${childText}\n`;
    if (type === 'p') return `\n${childText}\n`;
    if (type === 'li') return `\n- ${childText}`;
    if (type === 'ul') return `\n${childText}\n`;
    if (type === 'ol') return `\n${childText}\n`;
    if (type === 'strong' || type === 'b') return `**${childText}**`;
    if (type === 'em' || type === 'i') return `*${childText}*`;
    if (type === 'a') return `[${childText}](${node.props.href || ''})`;
    if (type === 'div') return `${childText}`;
    
    return childText;
  }
  
  return '';
};

// Helper to resolve category names to seeded database category IDs
const resolveCategoryId = (categoryName: string, categoriesList: any[]): string => {
  if (!categoryName) return '1';
  const name = categoryName.toLowerCase();
  
  const found = categoriesList.find(c => 
    c.name.toLowerCase().includes(name) || 
    name.includes(c.name.toLowerCase()) ||
    c.slug.toLowerCase().includes(name) ||
    name.includes(c.slug.toLowerCase())
  );
  
  if (found) return String(found.id);
  
  if (name.includes('dest') || name.includes('guide')) return '1';
  if (name.includes('honeymoon')) return '2';
  if (name.includes('family')) return '3';
  if (name.includes('week') || name.includes('getaway')) return '4';
  if (name.includes('inter') || name.includes('georg') || name.includes('euro')) return '5';
  if (name.includes('visa')) return '6';
  if (name.includes('safety') || name.includes('tip') || name.includes('plan')) return '7';
  if (name.includes('hotel') || name.includes('stay')) return '8';
  if (name.includes('fest')) return '9';
  if (name.includes('adven') || name.includes('trek')) return '10';
  if (name.includes('luxur')) return '11';
  if (name.includes('corp')) return '12';
  
  return '1';
};

// Tag Input component for tags
const TagInput = ({ label, items, onChange, placeholder, colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20' }: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  colorClass?: string;
}) => {
  const [inputVal, setInputVal] = useState('');
  const add = (valToAdd?: string) => {
    const v = (valToAdd || inputVal).trim();
    if (v && !items.includes(v)) { onChange([...items, v]); }
    if (!valToAdd) setInputVal('');
  };
  const remove = (item: string) => onChange(items.filter(i => i !== item));
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="h-9 text-xs rounded-xl bg-slate-900 border-slate-750 text-slate-100 placeholder:text-slate-500"
        />
        <Button type="button" size="sm" variant="outline" onClick={() => add()} className="h-9 px-3 shrink-0 rounded-xl border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Preset Tag Chips */}
      <div className="flex flex-wrap gap-1 pt-1">
        {PRESET_TAGS.filter(t => !items.includes(t)).slice(0, 5).map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => add(tag)}
            className="text-[10px] text-slate-400 hover:text-amber-400 hover:border-amber-500/40 border border-slate-750 px-2 py-0.5 rounded-md transition-colors"
          >
            + {tag}
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {items.map(item => (
            <span key={item} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${colorClass}`}>
              {item}
              <button type="button" onClick={() => remove(item)} className="ml-0.5 hover:opacity-70 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const BLANK_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category_id: '1',
  author: 'GhumoFiroo Editorial',
  date: new Date().toISOString().split('T')[0],
  image: '',
  image_title: '',
  image_alt: '',
  read_time: '5 min read',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  canonical_url: '',
  schema_markup: null as any,
  related_destination: '',
  related_package: '',
  status: 'Draft' as 'Draft' | 'Published' | 'Scheduled' | 'Archived',
  publish_date: '',
  tags: [] as string[]
};

export default function BlogMaster() {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Editor View Mode for Studio
  const [editorMode, setEditorMode] = useState<'split' | 'write' | 'preview'>('split');

  // Form State
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const isFormView = location.pathname === '/crm/blogs/new' || location.pathname.startsWith('/crm/blogs/edit/');
  const isEdit = location.pathname.startsWith('/crm/blogs/edit/');
  const editId = isEdit ? location.pathname.replace('/crm/blogs/edit/', '') : null;

  const fetchedRef = React.useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadCategories();
    loadBlogs();
  }, []);

  useEffect(() => {
    if (isEdit && editId && blogs.length > 0) {
      const item = blogs.find(b => String(b.id) === String(editId));
      if (item) {
        let contentText = '';
        let resolvedCatId = '';

        if (item.is_static) {
          resolvedCatId = resolveCategoryId(item.category, categories);
          const fullStaticObj = blogContents[item.id] || blogContents[item.slug];
          if (fullStaticObj && fullStaticObj.content) {
            contentText = reactNodeToMarkdown(fullStaticObj.content);
          } else {
            contentText = item.excerpt ? `## ${item.title}\n\n${item.excerpt}` : '';
          }
        } else {
          resolvedCatId = item.category_id ? String(item.category_id) : resolveCategoryId(item.category, categories);
          contentText = item.content || '';
        }

        setEditingId(item.id);
        setForm({
          title: item.title || '',
          slug: item.slug || '',
          excerpt: item.excerpt || '',
          content: contentText,
          category_id: resolvedCatId,
          author: item.author || 'GhumoFiroo Editorial',
          date: item.date || new Date().toISOString().split('T')[0],
          image: item.image || '',
          image_title: item.image_title || '',
          image_alt: item.image_alt || '',
          read_time: item.read_time || '5 min read',
          seo_title: item.seo_title || item.title || '',
          seo_description: item.seo_description || item.excerpt || '',
          seo_keywords: item.seo_keywords || '',
          canonical_url: item.canonical_url || '',
          schema_markup: item.schema_markup || null,
          related_destination: item.related_destination || '',
          related_package: item.related_package || '',
          status: item.status || 'Published',
          publish_date: item.publish_date || '',
          tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',').map(t => t.trim()) : [])
        });
      }
    } else if (location.pathname === '/crm/blogs/new') {
      setEditingId(null);
      setForm({ ...BLANK_FORM });
    }
  }, [isEdit, editId, blogs, isFormView, categories]);

  // Auto-calculate reading time when content changes
  useEffect(() => {
    if (!form.content) return;
    const words = form.content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    const calculated = `${minutes} min read`;
    if (form.read_time !== calculated) {
      setForm(prev => ({ ...prev, read_time: calculated }));
    }
  }, [form.content]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/php-backend/blog_categories.php');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((c: any) => ({
            id: String(c.id || c.category_id || ''),
            name: String(c.name || c.category || c.title || 'Category'),
            slug: String(c.slug || '')
          })).filter(c => c.name && c.name !== 'undefined');
          
          if (formatted.length > 0) {
            setCategories(formatted);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load blog categories:', err);
    }
  };

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await crmFetch('/php-backend/blogs.php?all=true', {}, {
        action: 'list_blogs',
        module: 'Blogs'
      });
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const dbData = await res.json();

      const staticAdapted = blogPosts.map((sp: any) => ({
        id: sp.id,
        title: sp.title,
        slug: sp.slug,
        excerpt: sp.excerpt,
        category: sp.category,
        author: sp.author || 'GhumoFiroo Team',
        date: sp.date || '2026-01-01',
        image: sp.image,
        read_time: sp.readTime || '5 min read',
        status: 'Published',
        is_static: true,
        views: Math.floor(Math.random() * 500) + 120
      }));

      const dbSlugs = new Set((dbData || []).map((b: any) => b.slug));
      const filteredStatic = staticAdapted.filter(s => !dbSlugs.has(s.slug));

      setBlogs([...(dbData || []), ...filteredStatic]);
    } catch (err: any) {
      console.error('[BlogMaster] loadBlogs error:', err);
      toast({ title: 'Error loading blogs', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    setForm(prev => {
      const oldAutoSlug = prev.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      const isSlugUntouched = !prev.slug || prev.slug === oldAutoSlug;
      
      return {
        ...prev,
        title: val,
        slug: isSlugUntouched ? autoSlug : prev.slug,
        seo_title: !prev.seo_title || prev.seo_title === prev.title ? val : prev.seo_title,
        seo_description: !prev.seo_description || prev.seo_description === prev.excerpt ? prev.excerpt : prev.seo_description
      };
    });
  };

  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setForm(prev => ({
        ...prev,
        content: prev.content ? `${prev.content}\n\n${prefix}${defaultText}${suffix}` : `${prefix}${defaultText}${suffix}`
      }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    setForm(prev => ({ ...prev, content: newVal }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const blogToDelete = blogs.find(b => String(b.id) === String(id));
      const authHeaders = await getAuthHeader();
      const res = await crmFetch(`/php-backend/blogs.php?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders
      }, {
        action: 'delete_blog',
        module: 'Blogs',
        recordId: String(id),
        itemName: blogToDelete?.title || `Blog ID ${id}`
      });
      if (!res.ok) throw new Error('Failed to delete blog post');
      toast({ title: 'Blog post deleted' });
      loadBlogs();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleDuplicate = async (blog: any) => {
    try {
      const newSlug = `${blog.slug || 'copy'}-copy-${Date.now().toString().slice(-4)}`;
      const payload = {
        title: `${blog.title} (Copy)`,
        slug: newSlug,
        excerpt: blog.excerpt || '',
        content: blog.content || (blog.excerpt ? `## ${blog.title}\n\n${blog.excerpt}` : ''),
        category_id: blog.category_id || resolveCategoryId(blog.category, categories),
        author: blog.author || 'GhumoFiroo Editorial',
        date: new Date().toISOString().split('T')[0],
        image: blog.image || '',
        read_time: blog.read_time || '5 min read',
        status: 'Draft',
        seo_title: blog.title || '',
        seo_description: blog.excerpt || ''
      };

      const authHeaders = await getAuthHeader();
      const res = await crmFetch('/php-backend/blogs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload)
      }, {
        action: 'duplicate_blog',
        module: 'Blogs',
        itemName: payload.title
      });
      if (!res.ok) throw new Error('Failed to duplicate post');
      toast({ title: 'Blog post duplicated as draft' });
      loadBlogs();
    } catch (err: any) {
      toast({ title: 'Duplication failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast({ title: 'Article Title Required', description: 'Please enter a title for the blog article.', variant: 'destructive' });
      return;
    }

    if (!form.content.trim()) {
      toast({ title: 'Article Content Required', description: 'Please write or paste your markdown article content.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        id: editingId || undefined
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/php-backend/blogs.php?id=${editingId}` : '/php-backend/blogs.php';

      const authHeaders = await getAuthHeader();
      const res = await crmFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(payload)
      }, {
        action: editingId ? 'update_blog' : 'create_blog',
        module: 'Blogs',
        recordId: editingId ? String(editingId) : undefined,
        itemName: payload.title
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to save blog post');
      }

      toast({ title: `Blog post ${editingId ? 'updated' : 'created'} successfully!` });
      loadBlogs();
      navigate('/crm/blogs');
    } catch (err: any) {
      toast({ title: 'Failed to save blog post', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Filtered List Computation
  const filteredList = blogs.filter(b => {
    const q = search.trim().toLowerCase();
    const title = (b.title || '').toLowerCase();
    const excerpt = (b.excerpt || '').toLowerCase();
    const matchesSearch = title.includes(q) || excerpt.includes(q);
    const matchesCategory = filterCategory === 'all' ? true : 
                            (b.is_static ? resolveCategoryId(b.category, categories) === filterCategory : String(b.category_id) === filterCategory);
    const matchesStatus = filterStatus === 'all' ? true : b.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI Summary Stats
  const publishedCount = blogs.filter(b => b.status === 'Published').length;
  const draftCount = blogs.filter(b => b.status === 'Draft').length;
  const scheduledCount = blogs.filter(b => b.status === 'Scheduled').length;

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = form.content.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white font-montserrat">
              {isFormView ? (isEdit ? 'Edit Article Studio' : 'Create New Travel Article') : 'Blog Content Master'}
            </h2>
          </div>
          <p className="text-slate-300 text-xs font-medium pl-9">
            {isFormView ? 'Compose SEO-rich travel guides, destination itineraries, and expert travel advice.' : 'Publish, schedule, edit, and moderate editorial articles across the main travel portal.'}
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 self-stretch sm:self-auto">
          {!isFormView ? (
            <Button onClick={() => navigate('/crm/blogs/new')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-2 rounded-xl px-4 py-2.5 shadow-lg shadow-amber-500/20">
              <Plus className="w-4 h-4" /> New Blog Post
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => navigate('/crm/blogs')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-2 rounded-xl px-4 py-2 shadow-md transition-all shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-slate-950" /> Back to Directory
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 rounded-xl px-4 py-2 shadow-md"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isEdit ? 'Save Changes' : 'Publish Article'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* DIRECTORY STATS KPI STRIP (Directory View Only) */}
      {!isFormView && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-slate-800 bg-slate-900/80 text-slate-100 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Articles</p>
                <div className="text-2xl font-black text-white mt-0.5">{blogs.length}</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Live catalog entries</p>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <FileText className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 text-slate-100 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Published</p>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">{publishedCount}</div>
                <p className="text-[10px] text-emerald-400/80 font-medium mt-0.5">Active on live portal</p>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Globe className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 text-slate-100 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Drafts & Pipeline</p>
                <div className="text-2xl font-black text-amber-400 mt-0.5">{draftCount + scheduledCount}</div>
                <p className="text-[10px] text-amber-400/80 font-medium mt-0.5">{draftCount} drafts, {scheduledCount} scheduled</p>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/80 text-slate-100 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Categories Covered</p>
                <div className="text-2xl font-black text-blue-400 mt-0.5">{categories.length}</div>
                <p className="text-[10px] text-blue-400/80 font-medium mt-0.5">Topics & Destination Guides</p>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DIRECTORY VIEW WORKSPACE */}
      {!isFormView && (
        <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-xs">
          <CardHeader className="p-4 border-b border-slate-800 space-y-3">
            
            {/* Quick Status Filter Tabs & Layout Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Posts', count: blogs.length },
                  { id: 'Published', label: 'Published', count: publishedCount },
                  { id: 'Draft', label: 'Drafts', count: draftCount },
                  { id: 'Scheduled', label: 'Scheduled', count: scheduledCount }
                ].map(tab => (
                  <Button
                    key={tab.id}
                    variant={filterStatus === tab.id ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus(tab.id)}
                    className={`h-8 text-xs px-3 rounded-xl gap-1.5 font-medium ${
                      filterStatus === tab.id ? 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-600' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-current opacity-80">
                      {tab.count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Grid / Table View Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl shrink-0 self-end sm:self-auto border border-slate-800">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className={`h-7 w-8 p-0 rounded-lg ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('table')}
                  className={`h-7 w-8 p-0 rounded-lg ${viewMode === 'table' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'}`}
                  title="Table Directory View"
                >
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search articles by title, excerpt, or destination..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl bg-slate-950 border-slate-800 text-slate-100">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border border-slate-750 text-white [&_*]:!text-white shadow-2xl z-[9999] opacity-100">
                    <SelectItem value="all" className="!text-white hover:!bg-slate-800 focus:!bg-slate-800 focus:!text-white text-xs font-semibold">All Categories</SelectItem>
                    {categories.map(c => {
                      const catName = typeof c === 'string' ? c : (c?.name || c?.category || c?.title || `Category ${c?.id || ''}`);
                      const catId = typeof c === 'string' ? c : String(c?.id || c?.name || '');
                      return (
                        <SelectItem key={catId} value={catId} className="!text-white hover:!bg-slate-800 focus:!bg-slate-800 focus:!text-white text-xs font-semibold cursor-pointer py-2 border-b border-slate-800/60 last:border-0">
                          {catName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs font-bold text-slate-400 tracking-wider">Loading articles catalogue...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                <FileText className="w-12 h-12 mx-auto mb-3 text-amber-500/40" />
                <p className="font-extrabold text-sm text-white mb-1">No Matching Articles Found</p>
                <p className="text-slate-400 mb-4">Try clearing your search query or selecting a different category filter.</p>
                <Button size="sm" onClick={() => { setSearch(''); setFilterCategory('all'); setFilterStatus('all'); }} variant="outline" className="text-xs rounded-xl border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
                  Reset Filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              /* CARD GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredList.map((blog) => (
                  <Card key={blog.id} className="group overflow-hidden border-slate-800 hover:border-amber-500/40 transition-all duration-200 hover:shadow-md bg-slate-900/90 text-slate-100 flex flex-col justify-between">
                    <div>
                      {/* Image Thumbnail Header */}
                      <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                        <img
                          src={blog.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800'}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                        
                        {/* Status Badge Overlay */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                          <Badge
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              blog.status === 'Published' ? 'bg-emerald-500/90 text-white' :
                              blog.status === 'Draft' ? 'bg-amber-500/90 text-slate-950' :
                              blog.status === 'Scheduled' ? 'bg-blue-500/90 text-white' : 'bg-red-500/90 text-white'
                            }`}
                          >
                            {blog.status}
                          </Badge>
                          {blog.is_static && (
                            <Badge variant="outline" className="text-[9px] bg-black/50 backdrop-blur-md text-white border-white/30 px-2 py-0.5">
                              Static Seed
                            </Badge>
                          )}
                        </div>

                        {/* Reading Time Badge */}
                        <div className="absolute bottom-2.5 right-3 text-[10px] font-bold text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {blog.read_time || '5 min read'}
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                          <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                            {blog.category || 'Travel Guide'}
                          </span>
                          <span>
                            {blog.date ? new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-sm text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                          {blog.title}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {blog.excerpt || 'No description summary available.'}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-400 truncate max-w-[150px]">
                        By <span className="font-semibold text-white">{blog.author || 'GhumoFiroo'}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                          className="h-7 w-7 p-0 rounded-lg hover:bg-amber-500/10 text-slate-300 hover:text-amber-400"
                          title="Preview Live"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(blog)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/crm/blogs/edit/${blog.id}`)}
                          className="h-7 w-7 p-0 rounded-lg text-amber-400 hover:bg-amber-500/10"
                          title="Edit Article"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(blog.id)}
                          className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* TABLE DIRECTORY VIEW */
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/90 text-slate-100">
                <Table>
                  <TableHeader className="bg-slate-950">
                    <TableRow className="border-slate-800">
                      <TableHead className="w-12 text-slate-400">Thumbnail</TableHead>
                      <TableHead className="text-slate-400">Article Details</TableHead>
                      <TableHead className="text-slate-400">Route Slug</TableHead>
                      <TableHead className="text-slate-400">Category</TableHead>
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-right text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredList.map((blog) => (
                      <TableRow key={blog.id} className="hover:bg-slate-800/50 border-slate-800">
                        <TableCell>
                          <img
                            src={blog.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800'}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg border border-slate-750"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800'; }}
                          />
                        </TableCell>
                        <TableCell className="font-semibold text-xs max-w-xs text-white">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate">{blog.title}</span>
                            {blog.is_static && (
                              <Badge variant="outline" className="text-[9px] bg-slate-800 border-slate-700 text-slate-300 px-1.5 py-0 shrink-0 font-medium">Static</Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 font-normal mt-0.5">
                            {blog.excerpt}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 font-mono">
                          /blog/{blog.slug || '-'}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-300">{blog.category || 'General'}</TableCell>
                        <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                          {blog.date ? new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              blog.status === 'Published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              blog.status === 'Draft' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              blog.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {blog.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-amber-500/10 text-slate-300 hover:text-amber-400"
                              title="Preview post live"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDuplicate(blog)}
                              className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
                              title="Duplicate post"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/crm/blogs/edit/${blog.id}`)}
                              className="h-8 w-8 p-0 rounded-lg text-amber-400 hover:bg-amber-500/10"
                              title="Edit post"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(blog.id)}
                              className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/10 rounded-lg"
                              title="Delete post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CREATE & EDIT FORM WORKSPACE: MODERN 2-COLUMN STUDIO LAYOUT */}
      {isFormView && (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* MAIN COLUMN (LEFT ~68%) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. ARTICLE TITLE & SLUG CARD */}
            <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-md">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Article Title <span className="text-red-400">*</span>
                    </Label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {form.title.length} characters
                    </span>
                  </div>
                  <Input
                    value={form.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="e.g., Ultimate 7-Day Bali Itinerary for Couples 2026"
                    required
                    className="h-12 text-base font-bold rounded-xl bg-slate-950 border-slate-750 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
                  />
                </div>

                {/* URL SLUG GENERATOR */}
                <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-amber-400" /> Live Article URL Slug
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        ghumofiroo.com/blog/<span className="text-amber-400 font-bold">{form.slug || 'url-slug'}</span>
                      </span>
                      {form.slug && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://ghumofiroo.com/blog/${form.slug}`);
                            toast({ title: 'URL copied to clipboard' });
                          }}
                          className="h-6 px-2 text-[10px] rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Copy className="w-3 h-3 mr-1" /> Copy
                        </Button>
                      )}
                    </div>
                  </div>
                  <Input
                    value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g., bali-tour-itinerary-couples"
                    required
                    className="h-9 text-xs font-mono rounded-lg bg-slate-900 border-slate-750 text-slate-200 placeholder:text-slate-500"
                  />
                </div>

                {/* EXCERPT / SUBTITLE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Article Summary / Teaser Excerpt
                    </Label>
                    <span className="text-[11px] text-slate-400">
                      {form.excerpt.length} / 250 chars
                    </span>
                  </div>
                  <Textarea
                    value={form.excerpt}
                    onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Write a compelling 2-3 sentence teaser snippet that appears on listing cards and search engine results..."
                    className="min-h-[85px] text-xs resize-none rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500 leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. COVER IMAGE & MEDIA GALLERY PRESET SELECTOR */}
            <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-md">
              <CardHeader className="p-4 border-b border-slate-800 bg-slate-950/40">
                <CardTitle className="text-sm font-extrabold flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" /> Featured Article Cover Image
                  </span>
                  {form.image && (
                    <Badge variant="outline" className="text-[10px] text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                      Image Loaded
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Cover Image Direct URL
                  </Label>
                  <Input
                    value={form.image}
                    onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="Paste high-res image URL (e.g. https://images.unsplash.com/...)"
                    className="h-10 text-xs font-mono rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                {/* UNSPLASH TRAVEL PRESETS PICKER */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkle className="w-3 h-3 text-amber-400" /> Quick Travel Presets (1-Click Apply)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {UNSPLASH_COVER_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        type="button"
                        variant={form.image === preset.url ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setForm(prev => ({ ...prev, image: preset.url, image_alt: preset.label }))}
                        className={`text-xs rounded-xl gap-1.5 h-8 ${
                          form.image === preset.url ? 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-600' : 'text-slate-300 border-slate-750 bg-slate-950 hover:bg-slate-800'
                        }`}
                      >
                        <ImageIcon className="w-3 h-3" />
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-300">Image Hover Title</Label>
                    <Input
                      value={form.image_title}
                      onChange={e => setForm(prev => ({ ...prev, image_title: e.target.value }))}
                      placeholder="e.g., Scenic sunset over Bali beach"
                      className="h-9 text-xs rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-300">Image Alt Text (SEO Accessibility)</Label>
                    <Input
                      value={form.image_alt}
                      onChange={e => setForm(prev => ({ ...prev, image_alt: e.target.value }))}
                      placeholder="e.g., Aerial view of Uluwatu cliff temple in Bali"
                      className="h-9 text-xs rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* LIVE IMAGE PREVIEW CARD */}
                {form.image && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xs group bg-slate-950 h-56 mt-2">
                    <img
                      src={form.image}
                      alt={form.image_alt || 'Cover Preview'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <p className="text-xs font-bold truncate">{form.title || 'Article Title Preview'}</p>
                      <p className="text-[10px] text-slate-300 truncate">{form.image_alt || 'No alt text provided'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. RICH MARKDOWN STUDIO EDITOR & LIVE TYPOGRAPHY PREVIEW */}
            <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-md">
              <CardHeader className="p-4 border-b border-slate-800 bg-slate-950 text-white rounded-t-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <CardTitle className="text-sm font-extrabold text-white">
                      Article Content Studio
                    </CardTitle>
                  </div>

                  {/* STUDIO VIEW MODE SWITCHER */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    <Button
                      type="button"
                      size="sm"
                      variant={editorMode === 'split' ? 'secondary' : 'ghost'}
                      onClick={() => setEditorMode('split')}
                      className={`h-7 text-xs px-2.5 rounded-lg ${editorMode === 'split' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
                    >
                      <SlidersHorizontal className="w-3 h-3 mr-1" /> Split View
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={editorMode === 'write' ? 'secondary' : 'ghost'}
                      onClick={() => setEditorMode('write')}
                      className={`h-7 text-xs px-2.5 rounded-lg ${editorMode === 'write' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
                    >
                      <Edit className="w-3 h-3 mr-1" /> Write Only
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={editorMode === 'preview' ? 'secondary' : 'ghost'}
                      onClick={() => setEditorMode('preview')}
                      className={`h-7 text-xs px-2.5 rounded-lg ${editorMode === 'preview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
                    >
                      <Eye className="w-3 h-3 mr-1" /> Preview
                    </Button>
                  </div>
                </div>

                {/* MARKDOWN FORMATTING TOOLBAR */}
                {editorMode !== 'preview' && (
                  <div className="flex flex-wrap items-center gap-1 pt-3 border-t border-slate-800 mt-2">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400 mr-1 tracking-wider">Format:</span>
                    
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('## ', '', 'Section Heading')} className="h-7 text-xs px-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg">
                      <Heading1 className="w-3.5 h-3.5 mr-1 text-amber-400" /> H2
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('### ', '', 'Sub-section Heading')} className="h-7 text-xs px-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg">
                      <Heading2 className="w-3.5 h-3.5 mr-1 text-amber-400" /> H3
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('**', '**', 'Bold text')} className="h-7 text-xs px-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg">
                      <Bold className="w-3.5 h-3.5 mr-1 text-amber-400" /> Bold
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('*', '*', 'Italic text')} className="h-7 text-xs px-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg">
                      <Italic className="w-3.5 h-3.5 mr-1 text-amber-400" /> Italic
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('- ', '', 'Bullet item')} className="h-7 text-xs px-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg">
                      <List className="w-3.5 h-3.5 mr-1 text-amber-400" /> List
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('1. ', '', 'Numbered item')} className="h-7 text-xs px-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg">
                      <ListOrdered className="w-3.5 h-3.5 mr-1 text-amber-400" /> Numbered
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('> ', '', 'Highlight quote or travel tip')} className="h-7 text-xs px-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg">
                      <Quote className="w-3.5 h-3.5 mr-1 text-amber-400" /> Tip Quote
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('[', '](/packages)', 'Explore Tour Packages')} className="h-7 text-xs px-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg">
                      <LinkIcon className="w-3.5 h-3.5 mr-1 text-amber-400" /> Link
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => insertFormatting('```\n', '\n```', 'code block')} className="h-7 text-xs px-2 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg">
                      <Code className="w-3.5 h-3.5 mr-1 text-amber-400" /> Code
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                <div className={`grid gap-4 ${editorMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  
                  {/* TEXTAREA EDITOR */}
                  {editorMode !== 'preview' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span>Markdown Input</span>
                        <span>{wordCount} words | {charCount} chars</span>
                      </div>
                      <Textarea
                        ref={textareaRef}
                        value={form.content}
                        onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write article content using Markdown formatting..."
                        className="min-h-[520px] font-mono text-xs leading-relaxed rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500 focus-visible:ring-amber-500"
                        required
                      />
                    </div>
                  )}

                  {/* RENDERED MARKDOWN PREVIEW */}
                  {editorMode !== 'write' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span>Rendered Reader View</span>
                        <span className="text-amber-400 font-bold">{form.read_time}</span>
                      </div>
                      <div className="border border-slate-800 rounded-xl p-6 min-h-[520px] max-h-[600px] overflow-y-auto bg-slate-950 text-slate-100 prose prose-sm max-w-none dark:prose-invert">
                        {form.content ? (
                          <ReactMarkdown>{form.content}</ReactMarkdown>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center">
                            <BookOpen className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-xs italic">Type in the markdown editor to see live formatted reader view here.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* SIDEBAR COLUMN (RIGHT ~32%) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. PUBLISH & STATUS CARD */}
            <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-md">
              <CardHeader className="p-4 border-b border-slate-800 bg-slate-950/40">
                <CardTitle className="text-sm font-extrabold flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-400" /> Publishing & Status
                  </span>
                  <Badge
                    className={`text-[10px] font-bold px-2 py-0.5 ${
                      form.status === 'Published' ? 'bg-emerald-500 text-white' :
                      form.status === 'Draft' ? 'bg-amber-500 text-slate-950' :
                      form.status === 'Scheduled' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {form.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Publish Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v: any) => setForm(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-xl font-bold bg-slate-950 border-slate-750 text-white">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 shadow-2xl z-50">
                      <SelectItem value="Draft" className="text-slate-200 focus:bg-slate-800 focus:text-white text-xs">Draft (Private)</SelectItem>
                      <SelectItem value="Published" className="text-slate-200 focus:bg-slate-800 focus:text-white text-xs">Published (Live Portal)</SelectItem>
                      <SelectItem value="Scheduled" className="text-slate-200 focus:bg-slate-800 focus:text-white text-xs">Scheduled (Future)</SelectItem>
                      <SelectItem value="Archived" className="text-slate-200 focus:bg-slate-800 focus:text-white text-xs">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.status === 'Scheduled' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Scheduled Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={form.publish_date}
                      onChange={e => setForm(prev => ({ ...prev, publish_date: e.target.value }))}
                      className="h-10 text-xs rounded-xl bg-slate-950 border-slate-750 text-slate-100"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Publish Date</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="h-9 text-xs rounded-xl bg-slate-950 border-slate-750 text-slate-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Est. Read Time</Label>
                    <Input
                      value={form.read_time}
                      onChange={e => setForm(prev => ({ ...prev, read_time: e.target.value }))}
                      placeholder="5 min read"
                      className="h-9 text-xs rounded-xl font-medium bg-slate-950 border-slate-750 text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Author Name</Label>
                  <Select
                    value={form.author}
                    onValueChange={v => setForm(prev => ({ ...prev, author: v }))}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-xl bg-slate-950 border-slate-750 text-white">
                      <SelectValue placeholder="Select Author" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 shadow-2xl z-50">
                      <SelectItem value="GhumoFiroo Editorial" className="text-slate-200 focus:bg-slate-800 focus:text-white text-xs">GhumoFiroo Editorial</SelectItem>
                      <SelectItem value="Travel Specialist" className="text-slate-200 focus:bg-slate-800 focus:text-white text-xs">Travel Specialist</SelectItem>
                      <SelectItem value="Navin Kumar Mishra" className="text-slate-200 focus:bg-slate-800 focus:text-white text-xs">Navin Kumar Mishra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 rounded-xl h-10 shadow-md"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isEdit ? 'Save Article Changes' : 'Publish Article Live'}
                  </Button>

                  {form.slug && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.open(`/blog/${form.slug}`, '_blank')}
                      className="w-full text-xs gap-2 rounded-xl h-9 border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" /> Preview Article Page
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. CATEGORY & TAG MANAGER CARD */}
            <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-md">
              <CardHeader className="p-4 border-b border-slate-800 bg-slate-950/40">
                <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-white">
                  <Layers className="w-4 h-4 text-amber-400" /> Category & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Primary Topic Category</Label>
                  <Select
                    value={form.category_id}
                    onValueChange={v => setForm(prev => ({ ...prev, category_id: v }))}
                  >
                    <SelectTrigger className="h-10 text-xs rounded-xl font-medium bg-slate-950 border-slate-750 text-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border border-slate-750 text-white [&_*]:!text-white shadow-2xl z-[9999] opacity-100">
                      {categories.map(c => {
                        const catName = typeof c === 'string' ? c : (c?.name || c?.category || c?.title || `Category ${c?.id || ''}`);
                        const catId = typeof c === 'string' ? c : String(c?.id || c?.name || '');
                        return (
                          <SelectItem key={catId} value={catId} className="!text-white hover:!bg-slate-800 focus:!bg-slate-800 focus:!text-white text-xs font-semibold cursor-pointer py-2 border-b border-slate-800/60 last:border-0">
                            {catName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <TagInput
                  label="Search Tags & Keywords"
                  items={form.tags}
                  onChange={items => setForm(prev => ({ ...prev, tags: items }))}
                  placeholder="Type tag & press Enter"
                />
              </CardContent>
            </Card>

            {/* 3. GOOGLE SEO METADATA & SERP PREVIEW CARD */}
            <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-md">
              <CardHeader className="p-4 border-b border-slate-800 bg-slate-950/40">
                <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-white">
                  <Globe className="w-4 h-4 text-blue-400" /> Google SEO & SERP Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                
                {/* SEO TITLE */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">SEO Title Tag</Label>
                    <span className={`text-[10px] font-mono font-bold ${
                      form.seo_title.length >= 50 && form.seo_title.length <= 60 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {form.seo_title.length} / 60 chars
                    </span>
                  </div>
                  <Input
                    value={form.seo_title}
                    onChange={e => setForm(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="e.g., Best Bali Tour Packages from India 2026: Itinerary & Costs"
                    className="h-9 text-xs rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                {/* SEO DESCRIPTION */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Meta Description</Label>
                    <span className={`text-[10px] font-mono font-bold ${
                      form.seo_description.length >= 120 && form.seo_description.length <= 160 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {form.seo_description.length} / 160 chars
                    </span>
                  </div>
                  <Textarea
                    value={form.seo_description}
                    onChange={e => setForm(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="Write a high-CTR search description containing main target keywords..."
                    className="min-h-[75px] text-xs resize-none rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500 leading-relaxed"
                  />
                </div>

                {/* KEYWORDS */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">SEO Keywords</Label>
                  <Input
                    value={form.seo_keywords}
                    onChange={e => setForm(prev => ({ ...prev, seo_keywords: e.target.value }))}
                    placeholder="e.g., Bali tour package, visa for Bali, Ubud travel guide"
                    className="h-9 text-xs rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                {/* CANONICAL */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Canonical URL</Label>
                  <Input
                    value={form.canonical_url}
                    onChange={e => setForm(prev => ({ ...prev, canonical_url: e.target.value }))}
                    placeholder="https://ghumofiroo.com/blog/..."
                    className="h-9 text-xs font-mono rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                {/* GOOGLE SEARCH SERP SNIPPET PREVIEW CARD */}
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-950 shadow-xs space-y-1">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-400" /> Google Search Preview
                  </p>
                  <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 font-sans">
                    <span>https://ghumofiroo.com</span>
                    <span>›</span>
                    <span>blog</span>
                    <span>›</span>
                    <span className="text-slate-300 font-mono">{form.slug || 'url-slug'}</span>
                  </div>
                  <div className="text-sm font-bold text-blue-400 hover:underline cursor-pointer truncate font-sans">
                    {form.seo_title || form.title || 'Article Title Appears Here'}
                  </div>
                  <div className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                    <span className="text-slate-400 mr-1 font-medium">{new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} —</span>
                    {form.seo_description || form.excerpt || 'Google will display the meta description snippet here.'}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* 4. CROSS-LINKING RELATED ENTITIES CARD */}
            <Card className="border-slate-800 bg-slate-900/90 text-slate-100 shadow-md">
              <CardHeader className="p-4 border-b border-slate-800 bg-slate-950/40">
                <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-white">
                  <Share2 className="w-4 h-4 text-amber-400" /> Cross-Linking & Related Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Related Destination</Label>
                  <Input
                    value={form.related_destination}
                    onChange={e => setForm(prev => ({ ...prev, related_destination: e.target.value }))}
                    placeholder="e.g., Bali, Georgia, Kashmir"
                    className="h-9 text-xs rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Related Package Title</Label>
                  <Input
                    value={form.related_package}
                    onChange={e => setForm(prev => ({ ...prev, related_package: e.target.value }))}
                    placeholder="e.g., Bali Romantic Honeymoon 6D/5N"
                    className="h-9 text-xs rounded-xl bg-slate-950 border-slate-750 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </CardContent>
            </Card>

          </div>

        </form>
      )}
    </div>
  );
}
