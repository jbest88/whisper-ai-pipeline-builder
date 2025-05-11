
import { useCallback, useRef, useState } from 'react';
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
  Handle,
  Position,
  useReactFlow,
  NodeTypes,
  EdgeTypes,
  Node,
} from '@xyflow/react';
import { useToast } from '@/components/ui/use-toast';
import '@xyflow/react/dist/style.css';
import { AINode, WorkflowEdge, NodeData } from '../types/workflow';
import { Trash, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

import ServiceNode from './nodes/ServiceNode';
import { getNodeIcon, getNodeColor } from '../utils/nodeUtils';

const nodeTypes: NodeTypes = {
  serviceNode: ServiceNode,
};

interface WorkflowCanvasProps {
  setSelectedNode: (node: AINode | null) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const initialNodes: Node<NodeData>[] = [
  {
    id: 'input-1',
    type: 'serviceNode',
    position: { x: 100, y: 200 },
    data: { 
      label: 'User Input',
      type: 'input',
      description: 'Start your workflow here',
      color: '#4338ca',
      handles: { source: true, target: false },
      config: {}
    }
  },
  {
    id: 'output-1',
    type: 'serviceNode',
    position: { x: 600, y: 200 },
    data: { 
      label: 'Response',
      type: 'output',
      description: 'Display results to the user',
      color: '#4338ca',
      handles: { source: false, target: true },
      config: {}
    }
  },
];

const initialEdges: WorkflowEdge[] = [];

const WorkflowCanvas = ({ setSelectedNode, apiKey, setApiKey }: WorkflowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(initialEdges);
  const { toast } = useToast();
  const reactFlowInstance = useReactFlow();
  const [reactFlowInst, setReactFlowInst] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      // Prevent connecting to the same node
      if (params.source === params.target) {
        toast({
          title: "Invalid Connection",
          description: "Cannot connect a node to itself",
          variant: "destructive"
        });
        return;
      }
      
      // Add the new edge
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
      
      toast({
        title: "Connection Created",
        description: "The nodes have been successfully connected"
      });
    },
    [setEdges, toast]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const nodeName = event.dataTransfer.getData('nodeName');
      
      if (typeof type === 'undefined' || !type || !reactFlowBounds || !reactFlowInst) {
        return;
      }

      const position = reactFlowInst.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const color = getNodeColor(type);
      
      const newNode: Node<NodeData> = {
        id: `${type}-${Math.floor(Math.random() * 10000)}`,
        type: 'serviceNode',
        position,
        data: {
          label: nodeName,
          type: type,
          description: '',
          color: color,
          handles: { source: true, target: true },
          icon: getNodeIcon(type),
          config: {}
        },
      };

      setNodes((nds) => nds.concat(newNode));
      
      toast({
        title: "Node Added",
        description: `${nodeName} has been added to your workflow`
      });
    },
    [reactFlowInst, setNodes, toast]
  );

  const onNodeClick = (_event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node as AINode);
  };

  const handleDeleteSelectedNodes = () => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    
    toast({
      title: "Nodes Deleted",
      description: "Selected nodes have been removed from the workflow"
    });
  };

  const zoomIn = () => {
    if (reactFlowInst) {
      reactFlowInst.zoomIn();
    }
  };

  const zoomOut = () => {
    if (reactFlowInst) {
      reactFlowInst.zoomOut({ maxZoom: 0.05 }); // Allow zooming out further
    }
  };

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInst}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={['Backspace', 'Delete']}
        minZoom={0.05} // Set minimum zoom level to allow zooming out further
        maxZoom={2}    // Set maximum zoom level
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={(n) => {
          const node = n as Node<NodeData>;
          return node.data.color || '#ddd';
        }} />
        <Panel position="top-right">
          <div className="bg-white shadow-md rounded p-3 text-xs">
            <p>Click on a node to configure it</p>
            <p>Drag between handles to connect nodes</p>
            <p>Press Delete/Backspace to remove selected nodes</p>
          </div>
        </Panel>
        <Panel position="bottom-left" className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDeleteSelectedNodes} className="bg-white">
            <Trash className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
          <Button size="sm" variant="outline" onClick={zoomIn} className="bg-white">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={zoomOut} className="bg-white">
            <ZoomOut className="h-4 w-4" />
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
