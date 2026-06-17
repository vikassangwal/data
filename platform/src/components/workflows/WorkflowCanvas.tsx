'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Trigger: User Query' },
    position: { x: 250, y: 25 },
  },
];

const initialEdges: Edge[] = [];

export default function WorkflowCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = (type: string, label: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'default',
      data: { label },
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] border border-border/50 rounded-xl overflow-hidden bg-background">
      <div className="w-64 border-r border-border/50 bg-card p-4 flex flex-col gap-4">
        <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Node Types</h3>
        <button
          onClick={() => addNode('default', 'LLM Prompt')}
          className="p-3 text-sm text-left bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
        >
          🤖 LLM Prompt
        </button>
        <button
          onClick={() => addNode('default', 'API Tool')}
          className="p-3 text-sm text-left bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
        >
          🔌 API Tool
        </button>
        <button
          onClick={() => addNode('output', 'Output Response')}
          className="p-3 text-sm text-left bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
        >
          🏁 Output Response
        </button>
      </div>
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-background"
        >
          <Background color="#888" gap={16} />
          <Controls className="bg-card border-border fill-foreground" />
          <MiniMap className="bg-card" maskColor="rgba(0,0,0,0.1)" />
        </ReactFlow>
      </div>
    </div>
  );
}
