'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Plus, Search, Filter,
  Edit3, Trash2, Eye, MessageCircle, X, 
  CheckCircle2, FileText, Calendar, Tag, Globe,
  ChevronDown, Image as ImageIcon, Type, AlignLeft
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { deleteBlogPost, createBlogPost, updateBlogPost, toggleBlogPostStatus } from '@/app/actions/blog';
import ImageUploader from '@/components/ui/ImageUploader';

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
  seoKeywords: string | null;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: { name: string | null; email: string | null };
  categories?: { id: string; name: string }[];
};

type StatusFilter = 'all' | 'published' | 'draft';

export default function BlogClient({ initialPosts }: { initialPosts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  // SEO accordion
  const [showSeo, setShowSeo] = useState(false);
  
  // Status dropdown
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && p.published) ||
      (statusFilter === 'draft' && !p.published);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.published).length,
    drafts: posts.filter(p => !p.published).length,
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    setIsDeleting(id);
    const res = await deleteBlogPost(id);
    if (res.success) {
      setPosts(prev => prev.filter(p => p.id !== id));
    } else {
      alert('Failed to delete post: ' + res.error);
    }
    setIsDeleting(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await toggleBlogPostStatus(id, !currentStatus);
    if (res.success) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, published: !currentStatus } : p));
    }
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setImageUrl('');
    setShowSeo(false);
    setShowModal(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setImageUrl(post.imageUrl || '');
    setShowSeo(!!(post.seoTitle || post.seoDesc || post.seoKeywords));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPost(null);
    setImageUrl('');
    setShowSeo(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    if (imageUrl) {
      formData.set('imageUrl', imageUrl);
    }

    let res;
    if (editingPost) {
      res = await updateBlogPost(editingPost.id, formData);
    } else {
      res = await createBlogPost(formData);
    }
    
    if (res.success && res.data) {
      if (editingPost) {
        setPosts(prev => prev.map(p => p.id === editingPost.id ? res.data : p));
      } else {
        setPosts([res.data, ...posts]);
      }
      closeModal();
      (e.target as HTMLFormElement).reset();
    } else {
      alert(`Failed to ${editingPost ? 'update' : 'create'} post: ` + res.error);
    }
    setIsSubmitting(false);
  };

  const statusLabel: Record<StatusFilter, string> = {
    all: 'All Posts',
    published: 'Published',
    draft: 'Drafts'
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-emerald-400" />
            Blog Manager
          </h1>
          <p className="text-slate-400 mt-1">
            Create, edit, and manage your blog posts.
          </p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          New Post
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard padding="p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Total Posts</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.published}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Published</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard padding="p-4" hover={false}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Edit3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.drafts}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Drafts</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Table Card */}
      <GlassCard className="overflow-hidden" padding="p-0">
        {/* Toolbar */}
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search posts by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto relative">
            <button 
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors w-full sm:w-auto justify-center bg-slate-950/40"
            >
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">{statusLabel[statusFilter]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
            
            <AnimatePresence>
              {showStatusDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-12 z-50 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
                >
                  {(['all', 'published', 'draft'] as StatusFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => { setStatusFilter(f); setShowStatusDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        statusFilter === f 
                          ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {statusLabel[f]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-slate-500 uppercase bg-slate-950/40 border-b border-white/5 tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Post</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Author</th>
                <th className="px-6 py-4 font-semibold hidden lg:table-cell">SEO</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5">
                        <FileText className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-medium">No posts found</p>
                      <p className="text-slate-600 text-sm">
                        {searchQuery || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filter.' 
                          : 'Create your first blog post to get started!'}
                      </p>
                      {!searchQuery && statusFilter === 'all' && (
                        <button
                          onClick={openCreateModal}
                          className="mt-2 px-4 py-2 text-sm font-medium text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/10 transition-colors"
                        >
                          Create First Post
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {filteredPosts.map((post, idx) => (
                <motion.tr 
                  key={post.id} 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {post.imageUrl ? (
                        <img 
                          src={post.imageUrl} 
                          alt="" 
                          className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-emerald-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate max-w-[280px]">{post.title}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[280px] mt-0.5">/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleStatus(post.id, post.published)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        post.published 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                      title={`Click to ${post.published ? 'unpublish' : 'publish'}`}
                    >
                      {post.published ? '● Published' : '○ Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-slate-400">{post.author?.name || 'Unknown'}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      {post.seoTitle ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title="SEO configured" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600" title="No SEO" />
                      )}
                      <span className="text-xs text-slate-500">
                        {post.seoTitle ? 'Configured' : 'Not set'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-sm">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(post)}
                        className="p-2 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-400 transition-all" 
                        title="Edit post"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        disabled={isDeleting === post.id}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all disabled:opacity-50" 
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {posts.length > 0 && (
          <div className="px-6 py-3.5 border-t border-white/5 bg-slate-950/40">
            <p className="text-xs text-slate-500">
              Showing {filteredPosts.length} of {posts.length} post{posts.length !== 1 ? 's' : ''}
              {statusFilter !== 'all' && <span> · Filtered by: <span className="text-slate-400">{statusLabel[statusFilter]}</span></span>}
            </p>
          </div>
        )}
      </GlassCard>

      {/* ===== CREATE / EDIT MODAL ===== */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/60 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {editingPost ? (
                      <><Edit3 className="w-5 h-5 text-cyan-400" /> Edit Post</>
                    ) : (
                      <><Plus className="w-5 h-5 text-emerald-400" /> Create New Post</>
                    )}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {editingPost ? 'Update the post details below.' : 'Fill in the details for your new blog post.'}
                  </p>
                </div>
                <button 
                  onClick={closeModal} 
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Body (scrollable) */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <Type className="w-4 h-4 text-emerald-400" />
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input 
                      required 
                      name="title" 
                      type="text" 
                      defaultValue={editingPost?.title || ''}
                      placeholder="Enter post title..."
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <AlignLeft className="w-4 h-4 text-cyan-400" />
                      Content <span className="text-red-400">*</span>
                    </label>
                    <textarea 
                      required 
                      name="content" 
                      rows={12} 
                      defaultValue={editingPost?.content || ''}
                      placeholder="Write your blog post content here... (Markdown supported)"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono text-sm leading-relaxed resize-y"
                    />
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      Cover Image
                    </label>
                    <ImageUploader 
                      value={imageUrl} 
                      onChange={setImageUrl} 
                      label="Upload Cover Image"
                    />
                  </div>

                  {/* SEO Section (Collapsible) */}
                  <div className="border border-white/5 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowSeo(!showSeo)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/40 hover:bg-slate-950/60 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        SEO Settings
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 font-normal">Optional</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showSeo ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showSeo && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-4 border-t border-white/5">
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1.5">SEO Title</label>
                              <input 
                                name="seoTitle" 
                                type="text" 
                                defaultValue={editingPost?.seoTitle || ''}
                                placeholder="Custom title for search engines..."
                                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1.5">SEO Description</label>
                              <textarea 
                                name="seoDesc" 
                                rows={2} 
                                defaultValue={editingPost?.seoDesc || ''}
                                placeholder="Brief description for search engine results..."
                                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 text-sm resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1.5">SEO Keywords</label>
                              <input 
                                name="seoKeywords" 
                                type="text" 
                                defaultValue={editingPost?.seoKeywords || ''}
                                placeholder="keyword1, keyword2, keyword3..."
                                className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 text-sm"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-white/5 bg-slate-950/60 flex justify-between items-center flex-shrink-0">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-xl hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting 
                      ? (editingPost ? 'Updating...' : 'Creating...') 
                      : (editingPost ? 'Update Post' : 'Save as Draft')
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
