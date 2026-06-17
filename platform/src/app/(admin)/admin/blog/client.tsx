'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Plus, Search, Filter,
  Edit3, Trash2, Eye, MessageCircle, XCircle, CheckCircle2
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { deleteBlogPost, createBlogPost, toggleBlogPostStatus } from '@/app/actions/blog';

import ImageUploader from '@/components/ui/ImageUploader';

export default function BlogClient({ initialPosts }: { initialPosts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState(initialPosts);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
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

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    if (imageUrl) {
      formData.set('imageUrl', imageUrl);
    }
    const res = await createBlogPost(formData);
    
    if (res.success && res.data) {
      setPosts([res.data, ...posts]);
      setShowModal(false);
      setImageUrl('');
      (e.target as HTMLFormElement).reset();
    } else {
      alert('Failed to create post: ' + res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            Blog & Comments
          </h1>
          <p className="text-muted-foreground mt-1">
            Write articles and engage with your audience.
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Create New Post
        </button>
      </div>

      <GlassCard className="overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors w-full sm:w-auto justify-center">
              <Filter className="w-4 h-4" /> Status
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/40 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Post Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Metrics</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No posts found. Create your first blog post!
                  </td>
                </tr>
              )}
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium text-white">
                    {post.title}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleStatus(post.id, post.published)}
                      className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider transition-opacity hover:opacity-80 ${
                        post.published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1" title="Views"><Eye className="w-4 h-4" /> 0</span>
                      <span className="flex items-center gap-1" title="Comments"><MessageCircle className="w-4 h-4" /> 0</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-white/10 rounded-md text-white transition-colors" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        disabled={isDeleting === post.id}
                        className="p-1.5 hover:bg-red-500/20 rounded-md text-red-400 transition-colors disabled:opacity-50" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--card)] z-10">
              <h2 className="text-xl font-bold">Create New Post</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required name="title" type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content (Markdown supported)</label>
                <textarea required name="content" rows={10} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary font-mono text-sm"></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <ImageUploader 
                  value={imageUrl} 
                  onChange={setImageUrl} 
                  label="Upload Cover Image"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-[var(--card)] mt-6 -mx-6 px-6 py-4 border-t border-[var(--border)]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
