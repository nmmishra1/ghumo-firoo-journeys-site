import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit2, Trash2, Eye, Calendar, Badge } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface BlogListProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (blogId: number) => void;
  loading: boolean;
  onRefresh: () => void;
}

const BlogList: React.FC<BlogListProps> = ({
  blogs,
  onEdit,
  onDelete,
  loading,
  onRefresh
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const publishedBlogs = blogs.filter(b => b.status === 'published');
  const draftBlogs = blogs.filter(b => b.status === 'draft');
  const archivedBlogs = blogs.filter(b => b.status === 'archived');

  const renderBlogGroup = (title: string, blogList: Blog[]) => {
    if (blogList.length === 0) return null;

    return (
      <div key={title} className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-gray-500">({blogList.length})</span>
        </h3>
        <div className="space-y-3">
          {blogList.map((blog) => (
            <Card key={blog.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Featured Image */}
                  {blog.featured_image && (
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Blog Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600">
                          {blog.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                          {blog.excerpt}
                        </p>
                      </div>
                      <Badge className={getStatusColor(blog.status)}>
                        {blog.status}
                      </Badge>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {blog.published_at
                          ? new Date(blog.published_at).toLocaleDateString()
                          : formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {blog.views} views
                      </span>
                      <span className="text-gray-400">
                        Slug: {blog.slug}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(blog)}
                      title="Edit blog"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(blog.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete blog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {blog.status === 'published' && (
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                        title="View published blog"
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your blogs...</p>
        </div>
      )}

      {!loading && blogs.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">No blogs yet. Create your first blog post!</p>
        </Card>
      )}

      {!loading && blogs.length > 0 && (
        <>
          {renderBlogGroup('📢 Published Blogs', publishedBlogs)}
          {renderBlogGroup('📝 Draft Blogs', draftBlogs)}
          {renderBlogGroup('📦 Archived Blogs', archivedBlogs)}
        </>
      )}
    </div>
  );
};

export default BlogList;
