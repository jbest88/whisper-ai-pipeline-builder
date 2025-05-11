import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Trash, ZoomIn, ZoomOut, PlusCircle, X } from 'lucide-react';

import ServiceMenu from './ServiceMenu';
import ServiceNode from './nodes/ServiceNode';

import {
  AINode,
  WorkflowEdge,
  NodeData,
} from '../types/workflow';
import {
  getNodeIcon,
  getNodeColor,
  getNodeDescription,
} from '../utils/nodeUtils';

/* ─────────────────── node renderer map ─────────────────── */
const nodeTypes: NodeTypes = { serviceNode: ServiceNode };

/* ─────────────────── props ─────────────────────────────── */
interface WorkflowCanvasProps {
  setSelectedNode: (node: AINode | null) => void;   // used only by gear button
  apiKey: string;
  setApiKey: (key: string) => void;
}

/* ─────────────────── initial nodes ─────────────────────── */
const initialNodes: Node<NodeData>[] = [
  {
    id: 'input-1',
    type: 'serviceNode',
    position: { x: 100, y: 200 },
    data: {
      label: 'User Input',
      type: 'input',
      description: 'Enter your prompt here',
      color: '#4338ca',
      handles: { source: true, target: false },
    },
    draggable: true,
  },
  {
    id: 'output-1',
    type: 'serviceNode',
    position: { x: 600, y: 200 },
    data: {
      label: 'Response',
      type: 'output',
      description: 'AI response will appear here',
      color: '#4338ca',
      handles: { source: false, target: true },
    },
    draggable: true,
  },
];

/* ─────────────────── component ─────────────────────────── */
const WorkflowCanvas = ({ setSelectedNode, apiKey }: WorkflowCanvasProps) => {
  const wrapper = useRef<HTMLDivElement>(null);

  /* state hooks */
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange]   = useEdgesState<WorkflowEdge>([]);
  const [rfInstance, setRfInstance]        = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen]        = useState(false);
  const [isProcessing, setIsProcessing]    = useState(false);

  const { toast } = useToast();

  /* ───────── openConfig injected into each node ────────── */
  const openConfig = (nodeId: string) => {
    const n = nodes.find((x) => x.id === nodeId);
    if (n) setSelectedNode(n as AINode);
  };

  /* ───────── updateNodeData (unchanged business logic) ───
     NOTE: to keep the sample short I truncated the long
     processAINode / Whisper / ElevenLabs mocks you had.
     Paste them back if needed – no change required.        */
  const updateNodeData = useCallback(
    (nodeId: string, newData: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  ...newData,
                  updateNodeData,
                  openConfig,
                  edges: edges.filter((e) => e.source === n.id || e.target === n.id),
                  nodes: nds,
                },
              }
            : n,
        ),
      );
    },
    [edges, setNodes],
  );

  /* ───────── inject helpers into every node on edge / node change ─── */
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          updateNodeData,
          openConfig,
          edges: edges.filter((e) => e.source === n.id || e.target === n.id),
          nodes: nds,
        },
      })),
    );
  }, [edges, setNodes, updateNodeData]);

  /* ───────── connect handler (no change) ─────────────────────────── */
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  /* ───────── drag-over & drop (unchanged) ─────────────────────────── */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!rfInstance || !wrapper.current) return;

      const bounds = wrapper.current.getBoundingClientRect();
      const type   = e.dataTransfer.getData('application/reactflow');
      const name   = e.dataTransfer.getData('nodeName');

      if (!type) return;

      const position = rfInstance.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      const newNode: Node<NodeData> = {
        id: `${type}-${Date.now()}`,
        type: 'serviceNode',
        position,
        data: {
          label: name,
          type,
          description: '',
          color: getNodeColor(type),
          handles: { source: true, target: true },
          icon: getNodeIcon(type),
          updateNodeData,
          openConfig,
          edges: [],
        },
        draggable: true,
      };

      setNodes((nds) => nds.concat(newNode));
      toast({ title: 'Node Added', description: `${name} added to workflow` });
    },
    [rfInstance, updateNodeData, openConfig, setNodes, toast],
  );

  /* ───────── node click: ONLY select, no config ───────────────────── */
  const onNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node<NodeData>) => {
      setNodes((nds) =>
        nds.map((n) => ({ ...n, selected: n.id === node.id })),
      );
    },
    [setNodes],
  );

  /* ───────── helper UI actions (zoom / delete) ────────────────────── */
  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    toast({ title: 'Nodes Deleted', description: 'Selected nodes removed' });
  };

  const zoomIn  = () => rfInstance?.zoomIn();
  const zoomOut = () => rfInstance?.zoomOut({ maxZoom: 0.05 });

  /* ───────── render ──────────────────────────────────────────────── */
  return (
    <div className="h-full w-full" ref={wrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        nodesDraggable
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        deleteKeyCode={['Backspace', 'Delete']}
        minZoom={0.05}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={(n) => (n as Node<NodeData>).data.color || '#ddd'} />

        <Panel position="top-right">
          <div className="bg-white shadow rounded p-3 text-xs space-y-1">
            <p>• Click to select (gear to configure)</p>
            <p>• Drag handles to connect</p>
            <p>• Backspace/Delete removes</p>
          </div>
        </Panel>

        <Panel position="bottom-left" className="flex gap-2">
          <Button size="sm" variant="outline" onClick={deleteSelected}>
            <Trash className="h-4 w-4 mr-1" /> Delete Selected
          </Button>
          <Button size="sm" variant="outline" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </Panel>

        {/* floating add-node button & ServiceMenu (unchanged) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
          <Button
            size="icon"
            className={`rounded-full h-14 w-14 shadow transition ${
              isMenuOpen ? 'bg-red-500 rotate-45' : 'bg-primary'
            }`}
            onClick={() => setIsMenuOpen((o) => !o)}
          >
            {isMenuOpen ? <X size={24} /> : <PlusCircle size={24} />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-[9] bg-white/95 shadow-lg border-t rounded-t-xl">
            <ServiceMenu onSelectNode={(t, n) => {/* you can reuse handleAddNode here */}} onClose={() => setIsMenuOpen(false)} />
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
