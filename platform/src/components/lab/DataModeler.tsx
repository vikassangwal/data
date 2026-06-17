'use client';

import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: 'table-sales',
    type: 'default',
    data: { label: 'Sales (sales.csv)' },
    position: { x: 250, y: 50 },
    style: { background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' },
  },
  {
    id: 'table-users',
    type: 'default',
    data: { label: 'Customers (users.json)' },
    position: { x: 100, y: 200 },
    style: { background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' },
  },
  {
    id: 'table-products',
    type: 'default',
    data: { label: 'Products (inventory.xml)' },
    position: { x: 400, y: 200 },
    style: { background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '8px' },
  },
];

const initialEdges: Edge[] = [];

export default function DataModeler() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [isCompiling, setIsCompiling] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState('');

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#38bdf8', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const handleAutoDetect = () => {
    setIsDetecting(true);
    setToastMsg('Analyzing table schemas for primary & foreign keys...');
    
    setTimeout(() => {
      // Simulate AI identifying relationships
      const detectedEdges: Edge[] = [
        { id: 'e-sales-users', source: 'table-sales', target: 'table-users', label: 'customer_id = id', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
        { id: 'e-sales-products', source: 'table-sales', target: 'table-products', label: 'product_id = sku', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      ];
      setEdges((eds) => [...eds, ...detectedEdges]);
      setToastMsg('✨ 2 Relationships Auto-Detected successfully!');
      
      setTimeout(() => {
        setToastMsg('');
        setIsDetecting(false);
      }, 3000);
    }, 2000);
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setToastMsg('Compiling unified data schema for Smart Query Engine...');
    
    setTimeout(() => {
      setToastMsg('✨ Schema Compiled! Unified AI queries are now enabled.');
      setTimeout(() => {
        setToastMsg('');
        setIsCompiling(false);
      }, 3000);
    }, 2500);
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500/90 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl animate-fade-in-down flex items-center gap-2">
          {(isDetecting || isCompiling) && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {toastMsg}
        </div>
      )}

      {/* Header Bar */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center z-10 relative">
        <div>
          <h3 className="text-white font-bold text-lg">Visual Data Modeler</h3>
          <p className="text-xs text-white/50">Drag and connect tables to define relationships.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAutoDetect}
            disabled={isDetecting || isCompiling}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white text-xs font-bold rounded-lg transition-colors shadow-lg cursor-pointer"
          >
            {isDetecting ? 'Detecting...' : '✨ Auto-Detect Relations'}
          </button>
          <button 
            onClick={handleCompile}
            disabled={isDetecting || isCompiling}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white text-xs font-bold rounded-lg transition-colors shadow-lg cursor-pointer flex items-center gap-2"
          >
            {isCompiling ? 'Compiling...' : '⚙️ Compile Unified Model'}
          </button>
        </div>
      </div>
      
      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-[#03060f]"
        >
          <Controls className="bg-slate-800 border-none fill-white" />
          <MiniMap 
            nodeStrokeWidth={3} 
            nodeColor="#1e293b" 
            maskColor="rgba(0,0,0,0.5)" 
            style={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} 
          />
          <Background gap={16} size={1} color="#334155" />
        </ReactFlow>
      </div>
    </div>
  );
}
