import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Save, X } from 'lucide-react';

interface BlogEditorProps {
  blog?: any;
  onSave: () => void;
  onCancel: () => void;
}

type EditorMode = 'rich' | 'markdown';

interface Topic {
  id: number;
  name: string;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ blog, onSave, onCancel }) => {
  const [title, setTitle] = useState(blog?.title || '');
  const [excerpt, setExcerpt] = useState(blog?.excerpt || '');
  const [content, setContent] = useState(blog?.content || '');
  const [featuredImage, setFeaturedImage] = useState(blog?.featured_image || '');
  const [topicId, setTopicId] = useState(blog?.topic_id || '');
  const [tags, setTags] = useState(blog?.tags ? blog.tags.split(',').map((t: string) => t.trim()) : []);
  const [status, setStatus] = useState(blog?.status || 'draft');
  const [publishDate, setPublishDate] = useState(blog?.published_at ? blog.published_at.split('T')[0] : '');
  const [editorMode, setEditorMode] = useState<EditorMode>('rich');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [saving, setSaving] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const { toast } = useToast();

  // Fetch topics on load
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/php-backend/blog_categories.php');
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    return session.access_token;
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const token = await getAuthToken();

      const payload = {
        title,
        content,
        excerpt,
        featured_image: featuredImage,
        topic_id: topicId ? parseInt(topicId) : null,
        tags: tags.filter(t => t.trim()),
        status,
        published_at: status === 'published' && publishDate ? `${publishDate}T00:00:00Z` : null
      };

      const url = blog?.id ? `/php-backend/blogs.php?id=${blog.id}` : '/php-backend/blogs.php';
      const method = blog?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save blog');
      }

      toast({
        title: "Success",
        description: `Blog ${blog?.id ? 'updated' : 'created'} successfully!`
      });

      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save blog",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/php-backend/upload.php', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFeaturedImage(data.url);
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {blog?.id ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Editor Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={editorMode === 'rich' ? 'default' : 'outline'}
              onClick={() => setEditorMode('rich')}
            >
              Rich Text
            </Button>
            <Button
              variant={editorMode === 'markdown' ? 'default' : 'outline'}
              onClick={() => setEditorMode('markdown')}
            >
              Markdown
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title..."
              className="w-full"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of your blog post..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="space-y-3">
              {featuredImage && (
                <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFeaturedImage('')}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <label className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <span className="text-sm text-gray-600">
                  Click to upload or paste image URL
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <Input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="Or paste image URL..."
              />
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a topic...</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add a tag..."
                />
                <Button onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {status === 'published' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Date
                </label>
                <Input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editorMode === 'rich' ? 'Rich Text Editor' : 'Markdown Editor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editorMode === 'rich' ? (
            <div className="space-y-2">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-3">
                  <strong>Formatting Guide:</strong>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>**bold text** → <strong>bold text</strong></li>
                    <li>*italic text* → <em>italic text</em></li>
                    <li># Heading 1, ## Heading 2, etc.</li>
                    <li>- List item (use - or *)</li>
                    <li>[Link text](URL)</li>
                    <li>![Image alt](Image URL)</li>
                  </ul>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog post here... Use markdown formatting..."
                rows={15}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post in markdown format..."
              rows={15}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h2>{title || 'Blog Title'}</h2>
            <p>{excerpt}</p>
            <div className="text-gray-600 text-sm">
              {content.substring(0, 200)}...
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save and Publish'}
        </Button>
      </div>
    </div>
  );
};

export default BlogEditor;
