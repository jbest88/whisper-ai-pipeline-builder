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
  Node,
  useReactFlow,
  NodeTypes,
  Edge,
} from '@xyflow/react';
import { useToast } from '@/components/ui/use-toast';
import '@xyflow/react/dist/style.css';
import { AINode, WorkflowEdge, NodeData } from '../types/workflow';
import { Trash, ZoomIn, ZoomOut, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServiceMenu from './ServiceMenu';
import ServiceNode from './nodes/ServiceNode';
import { getNodeIcon, getNodeColor, getNodeDescription } from '../utils/nodeUtils';

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
      description: 'Enter your prompt here',
      color: '#4338ca',
      handles: { source: true, target: false },
      config: {}
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
      config: {}
    },
    draggable: true,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to update node data for workflow processing
  const updateNodeData = useCallback((nodeId: string, newData: Record<string, any>) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === nodeId) {
          // Update this node with new data
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
              updateNodeData, // Pass the function so nodes can communicate
              edges: edges.filter(e => e.source === node.id || e.target === node.id),
            },
          };
        }
        return node;
      })
    );

    // If data includes a user input that needs to be sent to the API
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      // Handle different node types
      if (node.data.type === 'openai' && newData.input && !node.data.response) {
        processAINode(nodeId, newData.input, newData.inputType || 'text');
      } else if (node.data.type === 'whisper' && newData.input && !node.data.response && newData.inputType === 'audio') {
        processWhisperNode(nodeId, newData.input);
      } else if (node.data.type === 'elevenlabs' && newData.input && !node.data.response) {
        processElevenLabsNode(nodeId, newData.input);
      }
    }
  }, [nodes, edges, setNodes, apiKey]);

  // Mock API processing for OpenAI node
  const processAINode = useCallback(async (nodeId: string, input: string | File, inputType: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please configure OpenAI API key in the node settings",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Update the node to show processing state
    updateNodeData(nodeId, { processing: true });
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock response based on input type
      let response;
      if (inputType === 'text') {
        response = `AI response to: "${input}"\n\nThis is a simulated response from the OpenAI model. In a real implementation, this would be the actual response from the API call using the provided API key.`;
      } else {
        const fileInput = input as File;
        response = `AI processed ${inputType} file: ${fileInput.name} (${fileInput.size} bytes)\n\nThis is a simulated response for processing a ${inputType} file with OpenAI.`;
      }
      
      // Update node with response
      updateNodeData(nodeId, { 
        processing: false, 
        response: response 
      });
      
      // Find connected output nodes and update them
      const connectedEdges = edges.filter(edge => edge.source === nodeId);
      connectedEdges.forEach(edge => {
        updateNodeData(edge.target, { response });
      });
      
      toast({
        title: "Processing Complete",
        description: "AI has generated a response"
      });
    } catch (error) {
      console.error('Error processing AI node:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process with AI",
        variant: "destructive"
      });
      updateNodeData(nodeId, { processing: false, error: "Failed to process" });
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, edges, updateNodeData, toast, setIsProcessing]);

  // Mock API processing for Whisper node
  const processWhisperNode = useCallback(async (nodeId: string, audioFile: File) => {
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please configure API key in the node settings",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Update the node to show processing state
    updateNodeData(nodeId, { processing: true });
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock transcription response
      const response = `Transcription of audio file: ${audioFile.name}\n\nThis is a simulated transcription from Whisper. In a real implementation, this would contain the actual transcribed text from the audio file.`;
      
      // Update node with response
      updateNodeData(nodeId, { 
        processing: false, 
        response: response 
      });
      
      // Find connected output nodes and update them
      const connectedEdges = edges.filter(edge => edge.source === nodeId);
      connectedEdges.forEach(edge => {
        updateNodeData(edge.target, { response });
      });
      
      toast({
        title: "Transcription Complete",
        description: "Audio has been transcribed"
      });
    } catch (error) {
      console.error('Error processing Whisper node:', error);
      toast({
        title: "Processing Error",
        description: "Failed to transcribe audio",
        variant: "destructive"
      });
      updateNodeData(nodeId, { processing: false, error: "Failed to transcribe" });
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, edges, updateNodeData, toast, setIsProcessing]);

  // Mock API processing for ElevenLabs node
  const processElevenLabsNode = useCallback(async (nodeId: string, input: string | File) => {
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please configure ElevenLabs API key in the node settings",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Update the node to show processing state
    updateNodeData(nodeId, { processing: true });
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock response
      const textInput = typeof input === 'string' ? input : 'Transcribed text';
      const response = `Text-to-Speech complete for: "${textInput.substring(0, 50)}${textInput.length > 50 ? '...' : ''}"\n\nThis is a simulated TTS response. In a real implementation, an audio file would be generated.`;
      
      // Update node with response
      updateNodeData(nodeId, { 
        processing: false, 
        response: response 
      });
      
      // Find connected output nodes and update them
      const connectedEdges = edges.filter(edge => edge.source === nodeId);
      connectedEdges.forEach(edge => {
        updateNodeData(edge.target, { response });
      });
      
      toast({
        title: "Speech Generation Complete",
        description: "Text has been converted to speech"
      });
    } catch (error) {
      console.error('Error processing ElevenLabs node:', error);
      toast({
        title: "Processing Error",
        description: "Failed to generate speech",
        variant: "destructive"
      });
      updateNodeData(nodeId, { processing: false, error: "Failed to generate speech" });
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, edges, updateNodeData, toast, setIsProcessing]);

  // Initialize nodes with updateNodeData function
  useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          updateNodeData,
          edges: edges.filter(e => e.source === node.id || e.target === node.id),
        },
      }))
    );
  }, [updateNodeData, edges, setNodes, setEdges]);

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
      
      // Add the new edge with required 'animated' property
      const newEdge: WorkflowEdge = { 
        ...params, 
        animated: true, 
        id: `e-${params.source}-${params.target}`,
        // Add default values for sourceHandle and targetHandle if they're undefined
        sourceHandle: params.sourceHandle || null,
        targetHandle: params.targetHandle || null
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Update source and target nodes with edge information
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode) {
        // If source is input and target is OpenAI, make sure they're compatible
        if (sourceNode.data.type === 'input' && targetNode.data.type === 'openai') {
          toast({
            title: "Connection Created",
            description: "Input node connected to OpenAI. Enter a prompt and click Send."
          });
        }
        // If source is OpenAI and target is output, make sure they're compatible
        else if (sourceNode.data.type === 'openai' && targetNode.data.type === 'output') {
          toast({
            title: "Connection Created",
            description: "OpenAI node connected to Response node. Results will display there."
          });
        }
      }
      
      // Update nodes with new edge info
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            updateNodeData,
            edges: [...edges, newEdge].filter(e => e.source === node.id || e.target === node.id),
          },
        }))
      );
    },
    [setEdges, toast, nodes, edges, updateNodeData]
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
        draggable: true,
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAddNode = (type: string, nodeName: string) => {
    if (!reactFlowInst) return;
    
    // Get the center of the viewport
    const { x, y } = reactFlowInst.getViewport();
    const centerX = reactFlowInst.width / 2;
    const centerY = reactFlowInst.height / 2;
    
    // Convert screen coordinates to flow coordinates
    const position = reactFlowInst.screenToFlowPosition({
      x: centerX,
      y: centerY,
    });
    
    const color = getNodeColor(type);
    
    const newNode: Node<NodeData> = {
      id: `${type}-${Math.floor(Math.random() * 10000)}`,
      type: 'serviceNode',
      position,
      data: {
        label: nodeName,
        type: type,
        description: getNodeDescription(type),
        color: color,
        handles: { source: true, target: true },
        icon: getNodeIcon(type),
        config: {},
        updateNodeData,
        edges: []
      },
      draggable: true,
    };

    setNodes((nds) => nds.concat(newNode));
    
    toast({
      title: "Node Added",
      description: `${nodeName} has been added to your workflow`
    });
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
        draggable={true}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodesDraggable={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={['Backspace', 'Delete']}
        minZoom={0.05}
        maxZoom={2}
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
        
        {/* Add Node Button - Mac style */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            size="icon"
            className={`rounded-full shadow-lg h-14 w-14 transition-all duration-300 ${
              isMenuOpen ? 'bg-red-500 hover:bg-red-600 rotate-45' : 'bg-primary hover:bg-primary/90'
            }`}
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <PlusCircle size={24} />}
          </Button>
        </div>

        {/* Service Menu - Mac style animation */}
        {isMenuOpen && (
          <div className="fixed bottom-0 left-0 right-0 z-[9] bg-white/95 shadow-lg border-t border-gray-200 rounded-t-xl animate-slide-in-bottom">
            <ServiceMenu onSelectNode={handleAddNode} onClose={toggleMenu} />
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
