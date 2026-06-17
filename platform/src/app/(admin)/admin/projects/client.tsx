'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, Plus, Search, Filter, MoreVertical, 
  Edit3, Trash2, ExternalLink, Image as ImageIcon, Eye
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { deleteProject, createProject } from '@/app/actions/projects';

import ImageUploader from '@/components/ui/ImageUploader';

export default function ProjectsClient({ initialProjects }: { initialProjects: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState(initialProjects);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setIsDeleting(id);
    const res = await deleteProject(id);
    if (res.success) {
      setProjects(prev => prev.filter(p => p.id !== id));
    } else {
      alert('Failed to delete project: ' + res.error);
    }
    setIsDeleting(null);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    if (imageUrl) {
      formData.set('imageUrl', imageUrl);
    }
    const res = await createProject(formData);
    
    if (res.success && res.data) {
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setImageUrl('');
      (e.target as HTMLFormElement).reset();
    } else {
      alert('Failed to create project: ' + res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-primary" />
            Projects Portfolio
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and showcase your best work.
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Add New Project
        </button>
      </div>

      <GlassCard className="p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search projects by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4" /> Filter by Category
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.length === 0 && (
             <div className="col-span-full py-12 text-center text-muted-foreground">
               No projects found. Add your first project!
             </div>
          )}
          {filteredProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-black/40 border border-white/5 hover:border-primary/50 rounded-xl overflow-hidden transition-all duration-300"
            >
              {/* Image Placeholder */}
              <div className="h-40 bg-white/5 flex items-center justify-center relative overflow-hidden group-hover:bg-white/10 transition-colors">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-white/20" />
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    disabled={isDeleting === project.id}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-primary/20 hover:bg-primary/40 rounded-full text-primary transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {project.category}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    project.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {project.isActive ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">{project.title}</h3>
                
                <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-white/5 pt-4">
                  <span>Added: {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {project.metrics?.length || 0} Metrics</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--card)] z-10">
              <h2 className="text-xl font-bold">Add New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required name="title" type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select name="category" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary">
                  <option>Web App</option>
                  <option>SaaS</option>
                  <option>Mobile App</option>
                  <option>Platform</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required name="description" rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Live URL (Optional)</label>
                  <input name="liveUrl" type="url" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GitHub URL (Optional)</label>
                  <input name="githubUrl" type="url" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Image</label>
                <ImageUploader 
                  value={imageUrl} 
                  onChange={setImageUrl} 
                  label="Upload Thumbnail"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-[var(--card)] mt-6 -mx-6 px-6 py-4 border-t border-[var(--border)]">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
