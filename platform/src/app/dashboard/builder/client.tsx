'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, Smartphone, Tablet, Save, Undo, Redo, Layout,
  Type, Image as ImageIcon, Box, Square, GripVertical, Settings2,
  Plus, PenTool, MousePointer2, Layers, ChevronRight, Check, Trash2
} from 'lucide-react';

type Device = 'desktop' | 'tablet' | 'mobile';
type NodeType = 'container' | 'text' | 'button' | 'image';

interface Node {
  id: string;
  type: NodeType;
  content?: string;
  styles: React.CSSProperties;
  children: Node[];
}

// Initial state with a root container
const initialTree: Node = {
  id: 'root',
  type: 'container',
  styles: { padding: '20px', minHeight: '800px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '20px' },
  children: [
    {
      id: 'n-hero',
      type: 'container',
      styles: { padding: '80px 20px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderRadius: '16px' },
      children: [
        { id: 'n-title', type: 'text', content: 'Next-Gen Visual Builder', styles: { fontSize: '48px', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }, children: [] },
        { id: 'n-sub', type: 'text', content: 'Drag, drop, and build your layout completely dynamically.', styles: { fontSize: '18px', color: '#64748b', marginBottom: '40px' }, children: [] },
        { id: 'n-btn', type: 'button', content: 'Publish Now', styles: { padding: '16px 32px', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }, children: [] }
      ]
    }
  ]
};

export default function BuilderClient() {
  const [device, setDevice] = useState<Device>('desktop');
  const [activeTab, setActiveTab] = useState<'add' | 'layers' | 'settings'>('add');
  const [tree, setTree] = useState<Node>(initialTree);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string} | null>(null);

  // --- RECURSIVE TREE HELPERS ---

  // Update a specific node by ID
  const updateNode = (nodes: Node, id: string, updates: Partial<Node>): Node => {
    if (nodes.id === id) {
      return { ...nodes, ...updates, styles: { ...nodes.styles, ...updates.styles } };
    }
    return {
      ...nodes,
      children: nodes.children.map(child => updateNode(child, id, updates))
    };
  };

  // Find a specific node by ID
  const findNode = (node: Node, id: string): Node | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  };

  // Append a child to a specific parent
  const appendNode = (rootNode: Node, parentId: string, newNode: Node): Node => {
    if (rootNode.id === parentId) {
      return { ...rootNode, children: [...rootNode.children, newNode] };
    }
    return {
      ...rootNode,
      children: rootNode.children.map(child => appendNode(child, parentId, newNode))
    };
  };

  // Remove a node by ID
  const removeNode = (rootNode: Node, idToRemove: string): Node => {
    return {
      ...rootNode,
      children: rootNode.children.filter(c => c.id !== idToRemove).map(c => removeNode(c, idToRemove))
    };
  };

  // --- ACTIONS ---

  const handleAddElement = (type: NodeType) => {
    const newNode: Node = { id: `n-${Date.now()}`, type, children: [], styles: {} };
    
    // Default styling and content based on type
    if (type === 'container') {
      newNode.styles = { padding: '20px', minHeight: '100px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column' };
    } else if (type === 'text') {
      newNode.content = 'New Text Block';
      newNode.styles = { fontSize: '16px', color: '#0f172a' };
    } else if (type === 'button') {
      newNode.content = 'Click Me';
      newNode.styles = { padding: '12px 24px', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '6px', border: 'none' };
    } else if (type === 'image') {
      newNode.styles = { width: '100%', minHeight: '200px', backgroundColor: '#e2e8f0', backgroundImage: 'url("https://via.placeholder.com/800x400")', backgroundSize: 'cover', backgroundPosition: 'center' };
    }

    // Append to selected container or root
    const targetParentId = selectedId && findNode(tree, selectedId)?.type === 'container' ? selectedId : 'root';
    
    setTree(appendNode(tree, targetParentId, newNode));
    setSelectedId(newNode.id);
    setActiveTab('settings');
  };

  const handleUpdateStyle = (key: keyof React.CSSProperties, value: string) => {
    if (!selectedId) return;
    setTree(prev => updateNode(prev, selectedId, { styles: { [key]: value } }));
  };

  const handleUpdateContent = (value: string) => {
    if (!selectedId) return;
    setTree(prev => updateNode(prev, selectedId, { content: value }));
  };

  const handleDeleteSelected = () => {
    if (!selectedId || selectedId === 'root') return;
    setTree(prev => removeNode(prev, selectedId));
    setSelectedId(null);
  };

  const selectedNode = selectedId ? findNode(tree, selectedId) : null;

  // --- RENDER RECURSIVE ENGINE ---

  const renderNode = (node: Node) => {
    const isSelected = node.id === selectedId;
    const clickHandler = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedId(node.id);
      setActiveTab('settings');
    };

    const commonProps = {
      id: node.id,
      onClick: clickHandler,
      style: node.styles,
      className: `relative transition-all ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-1 hover:ring-indigo-300'}`
    };

    // Label overlay for selected element
    const labelOverlay = isSelected && node.id !== 'root' && (
      <div className="absolute -top-6 left-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 z-50 rounded-t">
        {node.type.toUpperCase()}
      </div>
    );

    switch (node.type) {
      case 'container':
        return (
          <div {...commonProps} key={node.id}>
            {labelOverlay}
            {node.children.length === 0 && <div className="text-slate-300 text-sm text-center py-4 select-none">Empty Container</div>}
            {node.children.map(child => renderNode(child))}
          </div>
        );
      case 'text':
        return (
          <div {...commonProps} key={node.id}>
            {labelOverlay}
            {node.content}
          </div>
        );
      case 'button':
        return (
          <button {...commonProps} key={node.id}>
            {labelOverlay}
            {node.content}
          </button>
        );
      case 'image':
        return (
          <div {...commonProps} key={node.id}>
            {labelOverlay}
          </div>
        );
      default:
        return null;
    }
  };

  // --- RENDER LAYER TREE ---
  const renderLayerTree = (node: Node, depth = 0) => {
    const isSelected = node.id === selectedId;
    return (
      <div key={node.id}>
        <div 
          onClick={() => { setSelectedId(node.id); setActiveTab('settings'); }}
          className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-xs font-medium transition-colors ${
            isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {node.type === 'container' ? <Box size={12} /> : node.type === 'text' ? <Type size={12} /> : node.type === 'button' ? <MousePointer2 size={12} /> : <ImageIcon size={12} />}
          {node.id === 'root' ? 'Root Body' : node.type.charAt(0).toUpperCase() + node.type.slice(1)}
        </div>
        {node.children.map(child => renderLayerTree(child, depth + 1))}
      </div>
    );
  };

  const getCanvasWidth = () => {
    switch (device) {
      case 'mobile': return 'w-[375px]';
      case 'tablet': return 'w-[768px]';
      case 'desktop': return 'w-full max-w-6xl';
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl flex items-center gap-2 bg-emerald-500/90 text-white">
            <Check size={16} /> {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ━━━ TOP TOOLBAR ━━━ */}
      <div className="h-14 border-b border-slate-800/50 bg-slate-900 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded flex items-center justify-center shadow-lg">
              <PenTool size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm">Visual Builder Pro</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex items-center gap-1 text-sm text-slate-400 font-medium">
            <span className="text-white">Landing Page (Dynamic)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded transition-colors ${device === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Monitor size={14} /></button>
          <button onClick={() => setDevice('tablet')} className={`p-1.5 rounded transition-colors ${device === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Tablet size={14} /></button>
          <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded transition-colors ${device === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Smartphone size={14} /></button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setToast({ message: 'JSON Layout Saved to DB!' }); setTimeout(()=>setToast(null), 3000); }}
            className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-500 flex items-center gap-2 transition-colors"
          >
            <Save size={14} /> Save Page
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* ━━━ LEFT SIDEBAR: ADD / LAYERS ━━━ */}
        <div className="w-64 bg-slate-900 border-r border-slate-800/50 flex flex-col shrink-0">
          <div className="flex border-b border-slate-800/50">
            <button onClick={() => setActiveTab('add')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'add' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'}`}><Plus size={14} /> Add</button>
            <button onClick={() => setActiveTab('layers')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'layers' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'}`}><Layers size={14} /> Layers</button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {activeTab === 'add' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 mb-4">Click to append to selected container, or root.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button onClick={() => handleAddElement('container')} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center gap-2 hover:border-indigo-500/50 transition-colors">
                    <Box size={16} className="text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-300">Container</span>
                  </button>
                  <button onClick={() => handleAddElement('text')} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center gap-2 hover:border-indigo-500/50 transition-colors">
                    <Type size={16} className="text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-300">Text Block</span>
                  </button>
                  <button onClick={() => handleAddElement('button')} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center gap-2 hover:border-indigo-500/50 transition-colors">
                    <MousePointer2 size={16} className="text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-300">Button</span>
                  </button>
                  <button onClick={() => handleAddElement('image')} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center gap-2 hover:border-indigo-500/50 transition-colors">
                    <ImageIcon size={16} className="text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-300">Image</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'layers' && (
              <div className="space-y-1">
                {renderLayerTree(tree)}
              </div>
            )}
          </div>
        </div>

        {/* ━━━ CENTER CANVAS ━━━ */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col" onClick={() => { setSelectedId('root'); setActiveTab('settings'); }}>
          <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="flex-1 overflow-auto custom-scrollbar flex justify-center py-10 px-4 z-10 transition-all">
            <motion.div layout className={`shadow-2xl transition-all duration-300 border border-slate-800 ${getCanvasWidth()}`}>
              {/* RENDER THE RECURSIVE TREE */}
              {renderNode(tree)}
            </motion.div>
          </div>
        </div>

        {/* ━━━ RIGHT SIDEBAR: SETTINGS ━━━ */}
        <div className="w-72 bg-slate-900 border-l border-slate-800/50 flex flex-col shrink-0 z-20 shadow-2xl">
          <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 size={16} className="text-indigo-400" />
              <h2 className="font-bold text-sm">Properties</h2>
            </div>
            {selectedId && selectedId !== 'root' && (
              <button onClick={handleDeleteSelected} className="text-red-400 hover:text-red-300 transition-colors" title="Delete Element">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {selectedNode ? (
              <div className="space-y-6">
                <div className="bg-slate-950/50 px-3 py-1.5 rounded border border-slate-800 mb-4 inline-block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedNode.type} ID: {selectedNode.id}</span>
                </div>

                {/* Content Settings */}
                {(selectedNode.type === 'text' || selectedNode.type === 'button') && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Content</h3>
                    <textarea 
                      value={selectedNode.content || ''}
                      onChange={(e) => handleUpdateContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs focus:outline-none focus:border-indigo-500"
                      rows={3}
                    />
                  </div>
                )}

                {selectedNode.type === 'image' && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Image URL</h3>
                    <input 
                      type="text" 
                      value={(selectedNode.styles.backgroundImage as string)?.replace('url("', '')?.replace('")', '') || ''}
                      onChange={(e) => handleUpdateStyle('backgroundImage', `url("${e.target.value}")`)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div className="h-px bg-slate-800/50" />

                {/* Spacing Settings */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Spacing & Sizing</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Width</label>
                      <input type="text" value={selectedNode.styles.width || ''} onChange={(e) => handleUpdateStyle('width', e.target.value)} placeholder="auto, 100%, 50px" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Min Height</label>
                      <input type="text" value={selectedNode.styles.minHeight || ''} onChange={(e) => handleUpdateStyle('minHeight', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Margin</label>
                      <input type="text" value={selectedNode.styles.margin || ''} onChange={(e) => handleUpdateStyle('margin', e.target.value)} placeholder="0px auto" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Padding</label>
                      <input type="text" value={selectedNode.styles.padding || ''} onChange={(e) => handleUpdateStyle('padding', e.target.value)} placeholder="10px 20px" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
                    </div>
                  </div>
                </div>

                {/* Container Flex Settings */}
                {selectedNode.type === 'container' && (
                  <>
                    <div className="h-px bg-slate-800/50" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Flex Layout</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-[10px] text-slate-500 mb-1 block">Direction</label>
                          <select value={selectedNode.styles.flexDirection || 'column'} onChange={(e) => handleUpdateStyle('flexDirection', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs">
                            <option value="row">Row (Horizontal)</option>
                            <option value="column">Column (Vertical)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 mb-1 block">Gap</label>
                          <input type="text" value={selectedNode.styles.gap || ''} onChange={(e) => handleUpdateStyle('gap', e.target.value)} placeholder="20px" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-500 mb-1 block">Align Items</label>
                          <select value={selectedNode.styles.alignItems || 'flex-start'} onChange={(e) => handleUpdateStyle('alignItems', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs">
                            <option value="flex-start">Start</option>
                            <option value="center">Center</option>
                            <option value="flex-end">End</option>
                            <option value="stretch">Stretch</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 mb-1 block">Justify</label>
                          <select value={selectedNode.styles.justifyContent || 'flex-start'} onChange={(e) => handleUpdateStyle('justifyContent', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs">
                            <option value="flex-start">Start</option>
                            <option value="center">Center</option>
                            <option value="space-between">Space Between</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-slate-800/50" />

                {/* Appearance Settings */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Appearance</h3>
                  {(selectedNode.type === 'text' || selectedNode.type === 'button') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                        <input type="text" value={selectedNode.styles.fontSize || ''} onChange={(e) => handleUpdateStyle('fontSize', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Font Weight</label>
                        <input type="text" value={selectedNode.styles.fontWeight || ''} onChange={(e) => handleUpdateStyle('fontWeight', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Text Color</label>
                      <input type="text" value={selectedNode.styles.color || ''} onChange={(e) => handleUpdateStyle('color', e.target.value)} placeholder="#000000" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Background Color</label>
                      <input type="text" value={selectedNode.styles.backgroundColor || ''} onChange={(e) => handleUpdateStyle('backgroundColor', e.target.value)} placeholder="#ffffff or transparent" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Border Radius</label>
                        <input type="text" value={selectedNode.styles.borderRadius || ''} onChange={(e) => handleUpdateStyle('borderRadius', e.target.value)} placeholder="8px" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Text Align</label>
                        <select value={selectedNode.styles.textAlign || 'left'} onChange={(e) => handleUpdateStyle('textAlign', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs">
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50 text-center">
                <MousePointer2 size={32} className="mb-3 text-slate-600" />
                <p className="text-xs">Select an element on the canvas to edit its properties.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
