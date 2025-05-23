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
  Edge,
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
} from '../utils/nodeUtils';
import { loadFromStorage, saveToStorage } from '../utils/storageUtils';

const nodeTypes: NodeTypes = {
  serviceNode: ServiceNode
};

interface WorkflowCanvasProps {
  setSelectedNode: (node: AINode | null) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
}

const WorkflowCanvas = ({ setSelectedNode, apiKey }: WorkflowCanvasProps) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const [rf, setRf] = useState<any>(null);

  // nodes / edges
  const [nodes, setNodes, onNodesChange] = useNodesState<AINode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);

  // ui flags
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { toast } = useToast();

  // Load saved nodes and edges from storage on initial render
  useEffect(() => {
    try {
      const savedNodes = loadFromStorage('workflow_nodes');
      const savedEdges = loadFromStorage('workflow_edges');

      if (savedNodes) {
        setNodes(savedNodes);
      } else {
        // Set default nodes if no saved nodes found
        setNodes([
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
          },
        ]);
      }

      if (savedEdges) {
        setEdges(savedEdges);
      }
    } catch (error) {
      console.error('Error loading workflow from storage:', error);
      toast({
        title: 'Error',
        description: 'Could not load saved workflow',
        variant: 'destructive'
      });
    }
  }, [setNodes, setEdges, toast]);

  // Save nodes and edges with debounce to prevent excessive storage operations
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback((type: 'nodes' | 'edges', data: any) => {
    if (saveTimeout) clearTimeout(saveTimeout);

    const timeout = setTimeout(() => {
      saveToStorage(`workflow_${type}`, data, {
        useSessionFallback: true,
        showErrors: false
      });
    }, 1000); // 1 second debounce

    setSaveTimeout(timeout);
  }, [saveTimeout]);

  // Save nodes and edges to storage whenever they change
  useEffect(() => {
    if (nodes.length > 0) {
      debouncedSave('nodes', nodes);
    }
  }, [nodes, debouncedSave]);

  useEffect(() => {
    if (edges.length > 0) {
      debouncedSave('edges', edges);
    }
  }, [edges, debouncedSave]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [saveTimeout]);

  // helpers injected into every node
  const openConfig = useCallback((nodeId: string) => {
    const foundNode = nodes.find((x) => x.id === nodeId);
    if (foundNode) {
      setSelectedNode(foundNode);
    }
  }, [nodes, setSelectedNode]);

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
                  nodes,
                },
              }
            : n,
        ),
      ),
    [edges, nodes, setNodes, openConfig],
  );

  // refresh helper refs in nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          updateNodeData,
          openConfig,
          edges: edges.filter((e) => e.source === n.id || e.target === n.id),
          nodes,
        },
      })),
    );
  }, [edges, nodes, setNodes, updateNodeData, openConfig]);

  // connect handler
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) {
        toast({
          title: "Connection Error",
          description: "Missing source or target for connection",
          variant: "destructive"
        });
        return;
      }

      // Check for duplicate connections
      const isDuplicate = edges.some(
        edge => edge.source === params.source && edge.target === params.target
      );

      if (isDuplicate) {
        toast({
          title: "Connection Error",
          description: "A connection already exists between these nodes",
          variant: "destructive"
        });
        return;
      }

      // Add the new edge with explicit type casting to match WorkflowEdge type
      try {
        const newEdge: WorkflowEdge = {
          ...params,
          animated: true,
          id: `e-${params.source}-${params.target}-${Date.now()}`
        };

        setEdges(eds => addEdge(newEdge, eds) as WorkflowEdge[]);

        toast({
          title: "Connection Created",
          description: "Nodes connected successfully"
        });
      } catch (error) {
        toast({
          title: "Connection Error",
          description: "Failed to create connection between nodes",
          variant: "destructive"
        });
      }
    },
    [edges, toast, setEdges],
  );

  // drag/drop
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!rf || !wrapper.current) return;

      const bounds = wrapper.current.getBoundingClientRect();
      const type = e.dataTransfer.getData('application/reactflow');
      const name = e.dataTransfer.getData('nodeName');

      if (!type || !name) return;

      try {
        const position = rf.screenToFlowPosition({
          x: e.clientX - bounds.left,
          y: e.clientY - bounds.top,
        });

        const newNode: AINode = {
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
        };

        setNodes(currentNodes => [...currentNodes, newNode]);

        toast({
          title: 'Node Added',
          description: `${name} added to workflow`
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add node to workflow',
          variant: 'destructive'
        });
      }
    },
    [rf, updateNodeData, openConfig, setNodes, toast],
  );

  // select/deselect logic
  const highlight = useCallback((id: string | null) =>
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: n.id === id,
        style:
          n.id === id
            ? { border: '2px solid #4f46e5', boxShadow: '0 0 0 2px #c7d2fe' }
            : { border: '1px solid transparent' },
      })),
    ),
    [setNodes]
  );

  const onNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node<NodeData>) => {
      highlight(node.id);
    },
    [highlight],
  );

  const onPaneClick = useCallback(() => {
    highlight(null);
    setSelectedNode(null);
  }, [setSelectedNode, highlight]);

  // esc key to clear selection
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        highlight(null);
        setSelectedNode(null);
      }
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [setSelectedNode, highlight]);

  // misc ui helpers
  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    toast({ title: 'Nodes Deleted', description: 'Selected nodes removed' });
  };
  const zoomIn  = () => rf?.zoomIn();
  const zoomOut = () => rf?.zoomOut({ maxZoom: 0.05 });

  // FINAL RENDER (the key: use flex-1 min-w-0 min-h-0 for 100% fill)
  return (
    <div
      ref={wrapper}
      className="flex-1 min-w-0 min-h-0"
      style={{ width: '100%', height: '100%' }}
    >
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
        onPaneClick={onPaneClick}
        nodesDraggable
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        deleteKeyCode={['Backspace', 'Delete']}
        minZoom={0.05}
        maxZoom={2}
        connectOnClick={false}
        style={{ width: '100%', height: '100%' }}
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={(n) => (n as Node<NodeData>).data.color || '#ddd'} />

        <Panel position="top-right">
          <div className="bg-white shadow rounded p-3 text-xs space-y-1">
            <p>• Click node = highlight</p>
            <p>• Gear icon = configure</p>
            <p>• Esc / click empty = clear</p>
            <p>• Connect nodes = drag from handle</p>
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
                if (!rf || !wrapper.current) return;
                try {
                  const center = rf.screenToFlowPosition({
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                  });

                  const newNode: AINode = {
                    id: `${type}-${Date.now()}`,
                    type: 'serviceNode',
                    position: center,
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
                  };

                  setNodes(currentNodes => [...currentNodes, newNode]);
                  toast({ title: 'Node Added', description: `${name} added to workflow` });

                  setIsMenuOpen(false);
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to add node to workflow',
                    variant: 'destructive'
                  });
                }
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
