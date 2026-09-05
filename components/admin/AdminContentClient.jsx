'use client';
import { useState } from 'react';
import { 
  FileText, Plus, Search, Eye, Edit3, Trash2, Globe, 
  CheckCircle, Clock, Tag, BookOpen, Power
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { createBlogPost, updateBlogPost, togglePublishBlogPost, deleteBlogPost } from '@/actions/admin.actions';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'General Health', 'Heart & Cardiology', 'Mental Wellness', 'Nutrition & Diet', 
  'Pediatrics', 'Skin & Dermatology', 'Fitness & Prevention'
];

export function AdminContentClient({ posts: initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'General Health',
    excerpt: '',
    content: '',
    tags: '',
    readTime: '5',
    coverImage: '',
    isPublished: true,
  });

  const categories = ['ALL', ...new Set(posts.map(p => p.category).filter(Boolean))];

  const filtered = posts
    .filter(p => selectedCategory === 'ALL' || p.category === selectedCategory)
    .filter(p => {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
    });

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      category: 'General Health',
      excerpt: '',
      content: '',
      tags: 'health, wellness, tips',
      readTime: '5',
      coverImage: '',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPost(p);
    setFormData({
      title: p.title,
      slug: p.slug,
      category: p.category || 'General Health',
      excerpt: p.excerpt || '',
      content: p.content,
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      readTime: (p.readTime || 5).toString(),
      coverImage: p.coverImage || '',
      isPublished: p.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please enter article title and content.');
      return;
    }

    setLoading(true);
    if (editingPost) {
      const res = await updateBlogPost(editingPost.id, formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success('Article updated successfully');
        setPosts(prev => prev.map(p => p.id === editingPost.id ? res.post : p));
        setIsModalOpen(false);
      }
    } else {
      const res = await createBlogPost(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success('Article created successfully');
        setPosts(prev => [res.post, ...prev]);
        setIsModalOpen(false);
      }
    }
    setLoading(false);
  };

  const handleTogglePublish = async (id) => {
    const res = await togglePublishBlogPost(id);
    if (res?.error) toast.error(res.error);
    else {
      toast.success('Publication status updated');
      setPosts(prev => prev.map(p => p.id === id ? { ...p, isPublished: !p.isPublished } : p));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const res = await deleteBlogPost(id);
    if (res?.error) toast.error(res.error);
    else {
      toast.success('Article deleted');
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
            Content & Health Blog CMS
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Publish health guides, medical news, and patient wellness resources
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> New Health Article
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No Articles Published</h3>
          <p className="text-sm text-gray-500 mt-1">Write your first health education post to inform patients.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(post => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex flex-col justify-between transition-all hover:shadow-md shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                    {post.category || 'General Health'}
                  </span>

                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    post.isPublished
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 mb-2">
                  {post.title}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
                  {post.excerpt || post.content}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {post.readTime || 5} min read
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {post.views || 0} views
                  </span>
                </div>

                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/80 gap-2">
                <span className="text-[11px] text-gray-400">
                  {formatDate(post.createdAt)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePublish(post.id)}
                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={post.isPublished ? 'Set to Draft' : 'Publish Article'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(post)}
                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit Article"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPost ? 'Edit Health Article' : 'Write New Health Article'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 10 Essential Tips for Healthy Heart in Summer"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Read Time (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.readTime}
                  onChange={e => setFormData({ ...formData, readTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Short Excerpt</label>
              <input
                type="text"
                value={formData.excerpt}
                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="A quick 1-2 sentence preview for cards and search engines"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Article Content *</label>
              <textarea
                rows={6}
                required
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write full article body content..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                placeholder="cardio, prevention, wellness"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Publish immediately to website
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-60"
              >
                {loading ? 'Saving...' : editingPost ? 'Save Changes' : 'Publish Article'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
