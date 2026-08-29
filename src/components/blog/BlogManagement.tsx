import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BlogEditor from './BlogEditor';
import BlogList from './BlogList';
import { supabase } from '@/integrations/supabase/client';

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  featured_image?: string;
  views: number;
}

const BlogManagement = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Get auth token from Supabase session
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    return session.access_token;
  };

  // Fetch user's blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const response = await fetch('/php-backend/blogs.php?all=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch blogs');
      
      const data = await response.json();
      setBlogs(Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load your blogs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsEditing(true);
  };

  const handleDelete = async (blogId: number) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const token = await getAuthToken();
      const response = await fetch(`/php-backend/blogs.php?id=${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete blog');

      toast({
        title: "Success",
        description: "Blog deleted successfully"
      });

      await fetchBlogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    await fetchBlogs();
    setIsEditing(false);
    setSelectedBlog(null);
  };

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.status === 'published').length,
    drafts: blogs.filter(b => b.status === 'draft').length,
    totalViews: blogs.reduce((sum, b) => sum + (b.views || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">Create and manage your travel blog posts</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedBlog(null);
            setIsEditing(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Blog Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total Posts</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-3xl font-bold text-green-600">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Drafts</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.drafts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalViews}</p>
          </CardContent>
        </Card>
      </div>

      {/* Editor or List */}
      {isEditing ? (
        <BlogEditor 
          blog={selectedBlog} 
          onSave={handleSave}
          onCancel={() => {
            setIsEditing(false);
            setSelectedBlog(null);
          }}
        />
      ) : (
        <BlogList 
          blogs={blogs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          onRefresh={fetchBlogs}
        />
      )}
    </div>
  );
};

export default BlogManagement;
