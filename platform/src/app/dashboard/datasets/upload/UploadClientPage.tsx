'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminDataset } from '@/app/actions/data-management';
import { UploadCloud, Link as LinkIcon, FileText, CheckCircle, Database, BrainCircuit, ArrowRight, Loader2 } from 'lucide-react';

export default function UploadClientPage() {
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    purpose: 'rag',
    visibility: 'private'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 500 * 1024 * 1024) {
        alert('File size exceeds 500MB limit.');
        return;
      }
      setFile(selected);
      if (!formData.name) {
        setFormData({ ...formData, name: selected.name.split('.')[0] });
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === 'file' && !file) return alert('Please select a file');
    if (uploadMode === 'link' && !link) return alert('Please enter a link');

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const dataset = await createAdminDataset({
        ...formData,
        sourceType: uploadMode
      });
      setUploadProgress(40);

      const payload = new FormData();
      payload.append('datasetId', dataset.id);
      if (uploadMode === 'file' && file) {
        payload.append('file', file);
      } else if (uploadMode === 'link') {
        payload.append('link', link);
      }

      setUploadProgress(60);

      const res = await fetch('/api/data/upload', {
        method: 'POST',
        body: payload
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadComplete(true);
      }, 500);

    } catch (error) {
      console.error(error);
      alert('Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (uploadComplete) {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto space-y-6 bg-slate-900 border border-indigo-500/30 rounded-xl">
        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Data Uploaded Successfully!</h2>
        <p className="text-slate-400">
          &quot;{formData.name}&quot; is now secured in your dataset library. What would you like to do next?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <button onClick={() => router.push('/dashboard/builder')} className="p-6 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl transition-all group flex flex-col items-center text-center gap-3">
            <BrainCircuit className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="font-bold text-white">Train AI / RAG</h3>
              <p className="text-xs text-slate-500 mt-1">Chunk and embed into Vector DB</p>
            </div>
          </button>
          
          <button onClick={() => router.push('/dashboard/datasets')} className="p-6 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl transition-all group flex flex-col items-center text-center gap-3">
            <Database className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="font-bold text-white">View in Datasets</h3>
              <p className="text-xs text-slate-500 mt-1">Manage metadata and files</p>
            </div>
          </button>
        </div>

        <button onClick={() => { setUploadComplete(false); setFile(null); setLink(''); }} className="mt-8 text-sm text-indigo-400 hover:underline">
          Upload another file
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
      <form onSubmit={handleUpload} className="space-y-8">
        
        {/* Source Selection */}
        <div className="flex gap-4 p-1 bg-slate-950 rounded-lg w-fit border border-slate-800">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${uploadMode === 'file' ? 'bg-slate-800 shadow text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <UploadCloud className="w-4 h-4" /> Local File
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('link')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${uploadMode === 'link' ? 'bg-slate-800 shadow text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <LinkIcon className="w-4 h-4" /> URL / Link
          </button>
        </div>

        {/* File / Link Input Area */}
        {uploadMode === 'file' ? (
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 transition-colors rounded-xl p-12 text-center relative bg-slate-950/50">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <UploadCloud className="w-10 h-10 text-slate-500" />
              <div>
                <p className="font-medium text-lg text-white">Click or drag file to upload</p>
                <p className="text-sm text-slate-500 mt-1">Supports CSV, PDF, JSON, ZIP, DOCX (Max 500MB)</p>
              </div>
              {file && (
                <div className="mt-4 p-3 bg-slate-900 border border-indigo-500/30 rounded flex items-center gap-3 text-indigo-400">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs opacity-70">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="font-medium text-white">External Data URL</label>
            <input 
              type="url" 
              required
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-white"
              placeholder="https://example.com/data.csv or API endpoint"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <p className="text-xs text-slate-500">The system will automatically fetch and ingest data from this link.</p>
          </div>
        )}

        {/* Metadata Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Dataset Name</label>
            <input required className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Q3 Financial Report" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Category</label>
            <select className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="">Select Category</option>
              <option value="finance">Finance</option>
              <option value="hr">Human Resources</option>
              <option value="tech">Technical Docs</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg min-h-[80px] text-white focus:outline-none focus:border-indigo-500 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Briefly describe what this data contains..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">AI Purpose</label>
            <select className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}>
              <option value="rag">RAG (Retrieval-Augmented Generation)</option>
              <option value="analytics">Data Analytics</option>
              <option value="training">Model Fine-tuning</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Visibility</label>
            <select className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500" value={formData.visibility} onChange={e => setFormData({...formData, visibility: e.target.value})}>
              <option value="private">Private (Admin Only)</option>
              <option value="workspace">Workspace Shared</option>
              <option value="public">Publicly Available</option>
            </select>
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-indigo-400 font-medium">Uploading and Analyzing...</span>
              <span className="text-white">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-6">
          <button 
            type="button"
            className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            Preview Data
          </button>
          <button 
            type="button"
            className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            Validate Schema
          </button>
          <button 
            type="button"
            className="px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-500 transition-colors"
          >
            Save Draft
          </button>
          <button 
            type="submit" 
            disabled={isUploading}
            className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>Upload & Connect to AI <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
