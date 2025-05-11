import { useCallback, useEffect, useRef, useState } from 'react';
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
  OnPaneClick,
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

/* -------------------------------------------------------------------- */
/* node renderer map */
/* -------------------------------------------------------------------- */
const nodeTypes: NodeTypes = { serviceNode: ServiceNode };

/* -------------------------------------------------------------------- */
/* props */
/* -------------------------------------------------------------------- */
interface WorkflowCanvasProps {
  setSelectedNode: (node: AINode | null) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
}

/* -------------------------------------------------------------------- */
/* initial data */
/* -------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------- */
/* component */
/* -------------------------------------------------------------------- */
const WorkflowCanvas = ({ setSelectedNode }: WorkflowCanvasProps) => {
  const wrapper           = useRef<HTMLDivElement>(null);
  const [rf, setRf]       = useState<any>(null);

  /* nodes / edges */
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);

  /* ui flags */
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { toast } = useToast();

  /* ------------------------------------------------------------------ */
  /* helpers injected into every node                                   */
  /* ------------------------------------------------------------------ */
  const openConfig = (nodeId: string) => {
    const n = nodes.find((x) => x.id === nodeId);
    if (n) setSelectedNode(n as AINode);
  };

  const updateNodeData = useCallback(
    (nodeId: string, newData: Record<string, any>) =>
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
      ),
    [edges, setNodes],
  );

  /* refresh helper refs in nodes */
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
  }, [edges, setNodes]);

  /* ------------------------------------------------------------------ */
  /* connect handler (minimal)                                          */
  /* ------------------------------------------------------------------ */
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  /* ------------------------------------------------------------------ */
  /* drag / drop                                                         */
  /* ------------------------------------------------------------------ */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!rf || !wrapper.current) return;

      const bounds = wrapper.current.getBoundingClientRect();
      const type  = e.dataTransfer.getData('application/reactflow');
      const name  = e.dataTransfer.getData('nodeName');
      if (!type) return;

      const position = rf.screenToFlowPosition({
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
    [rf, updateNodeData, openConfig, setNodes, toast],
  );

  /* ------------------------------------------------------------------ */
  /* select / deselect logic                                            */
  /* ------------------------------------------------------------------ */
  const highlight = (id: string | null) =>
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === id,
        style:
          n.id === id
            ? { border: '2px solid #4f46e5', boxShadow: '0 0 0 2px #c7d2fe' }
            : { border: '1px solid transparent' },
      })),
    );

  const onNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node<NodeData>) => {
      highlight(node.id);
    },
    [highlight],
  );

  const onPaneClick: OnPaneClick = () => {
    highlight(null);
    setSelectedNode(null);               // close config panel
  };

  /* esc key to clear selection */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        highlight(null);
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [highlight, setSelectedNode]);

  /* ------------------------------------------------------------------ */
  /* misc ui helpers                                                    */
  /* ------------------------------------------------------------------ */
  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    toast({ title: 'Nodes Deleted', description: 'Selected nodes removed' });
  };
  const zoomIn  = () => rf?.zoomIn();
  const zoomOut = () => rf?.zoomOut({ maxZoom: 0.05 });

  /* ------------------------------------------------------------------ */
  /* render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="h-full w-full" ref={wrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRf}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}        {/* ← click outside to deselect */}
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
            <p>• Click node = highlight</p>
            <p>• Gear icon = configure</p>
            <p>• Esc / click empty = clear</p>
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

        {/* floating add-node button + menu */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
          <Button
            size="icon"
            className={`rounded-full h-14 w-14 shadow transition ${
              isMenuOpen ? 'bg-red-500 rotate-45' : 'bg-primary'
            }`}
            onClick={() => setIsMenuOpen((o) => !o)}
          >
            {isMenuOpen ? <X size={24} /> : <PlusCircle size={25} />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-[9] bg-white/95 shadow-lg border-t rounded-t-xl">
            <ServiceMenu
              onSelectNode={(type, name) => {
                /* you can call your handleAddNode here if needed */
              }}
              onClose={() => setIsMenuOpen(false)}
            />
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
