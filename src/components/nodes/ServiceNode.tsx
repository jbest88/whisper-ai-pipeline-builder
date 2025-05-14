
import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AINode } from '../../types/workflow';
import {
  FaBrain,
  FaImage,
  FaVolumeUp,
  FaDatabase,
  FaFileAlt,
} from 'react-icons/fa';
import { BsChatText } from 'react-icons/bs';
import { FiSend, FiUpload } from 'react-icons/fi';
import { MdWebhook } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  FileAudio,
  FileVideo,
  FileImage,
  FileCode,
  FileText,
  Settings,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface ServiceNodeProps {
  data: AINode['data'];
  id: string;
}

/**
 * ServiceNode – full‐featured workflow node renderer
 * ▸ Entire card draggable; small gear button opens external config panel
 */
const ServiceNode = ({ data, id }: ServiceNodeProps) => {
  /* ------------------------------------------------------------------ */
  /* local state                                                         */
  /* ------------------------------------------------------------------ */
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'text' | 'file'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [useResponseAsContext, setUseResponseAsContext] = useState(false);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // track connected response node (for context injection)
  const [connectedResponseNode, setConnectedResponseNode] = useState<
    { id: string; response: string | Blob | null } | null
  >(null);

  /* ------------------------------------------------------------------ */
  /* edge / node introspection                                           */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!data.edges) return;

    // ─── for INPUT nodes, detect any OUTPUT feeding into it ───────────
    if (data.type === 'input') {
      const incoming = data.edges.filter((e) => e.target === id);
      let found: typeof connectedResponseNode = null;
      incoming.forEach((edge) => {
        const src = data.nodes?.find((n) => n.id === edge.source);
        if (src?.data.type === 'output') {
          found = { id: src.id, response: src.data.response || null };
        }
      });
      setConnectedResponseNode(found);
    }

    // if input connects to audio nodes, default to file tab
    const audioTargets = data.edges
      .filter((e) => e.source === id)
      .map((e) => e.target);
    const hasAudio = data.nodes
      ?.filter((n) => audioTargets.includes(n.id))
      .some((n) => n.data.type === 'whisper' || n.data.type === 'elevenlabs');
    if (hasAudio) setSelectedTab('file');
  }, [data.edges, data.nodes, data.type, id]);

  // prepend context when toggle enabled
  useEffect(() => {
    if (
      useResponseAsContext &&
      connectedResponseNode?.response &&
      typeof connectedResponseNode.response === 'string'
    ) {
      setInputValue((prev) => {
        if (prev.includes('Context:\n' + connectedResponseNode.response)) return prev;
        return `Context:\n${connectedResponseNode.response}\n\nYour task:${prev ? '\n' + prev : ''}`;
      });
    }
  }, [useResponseAsContext, connectedResponseNode]);

  /* ------------------------------------------------------------------ */
  /* helpers                                                             */
  /* ------------------------------------------------------------------ */
  const typeIcon = () => {
    switch (data.type) {
      case 'openai':
      case 'anthropic':
      case 'perplexity':
        return <FaBrain className="h-5 w-5" />;
      case 'elevenlabs':
      case 'whisper':
        return <FaVolumeUp className="h-5 w-5" />;
      case 'dalle':
      case 'stability':
      case 'midjourney':
        return <FaImage className="h-5 w-5" />;
      case 'blog':
      case 'social':
        return <FaFileAlt className="h-5 w-5" />;
      case 'vector-db':
      case 'memory':
        return <FaDatabase className="h-5 w-5" />;
      case 'input':
        return <BsChatText className="h-5 w-5" />;
      case 'output':
        return <FiSend className="h-5 w-5" />;
      case 'webhook':
        return <MdWebhook className="h-5 w-5" />;
      default:
        return <FaBrain className="h-5 w-5" />;
    }
  };

  const respIcon = () => {
    switch (data.responseType) {
      case 'audio':
        return <FileAudio className="h-4 w-4" />;
      case 'video':
        return <FileVideo className="h-4 w-4" />;
      case 'image':
        return <FileImage className="h-4 w-4" />;
      case 'code':
        return <FileCode className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Fixed openConfig to ensure it properly calls the function from props
  const openConfig = () => {
    console.log('Opening config for node:', id);
    console.log('openConfig function available:', typeof data.openConfig === 'function');
    
    if (typeof data.openConfig === 'function') {
      data.openConfig(id);
    } else {
      console.error('openConfig is not available on this node:', data);
    }
  };

  const triggerFileUpload = () => fileInputRef.current?.click();

  /* ------------------------------------------------------------------ */
  /* send input downstream                                               */
  /* ------------------------------------------------------------------ */
  const handleSend = async () => {
    if (data.type !== 'input') return;
    const valid = selectedTab === 'text' ? inputValue.trim() : selectedFile;
    if (!valid) return;

    setIsProcessing(true);
    const targets = data.edges
      ?.filter((e) => e.source === id)
      .map((e) => e.target) || [];

    // First, update all target nodes to show they're processing
    targets.forEach((tid) => {
      if (typeof data.updateNodeData === 'function') {
        data.updateNodeData(tid, {
          input: selectedTab === 'text' ? inputValue : selectedFile,
          inputType:
            selectedTab === 'text'
              ? 'text'
              : selectedFile?.type.includes('audio')
              ? 'audio'
              : selectedFile?.type.includes('video')
              ? 'video'
              : selectedFile?.type.includes('image')
              ? 'image'
              : 'file',
          processing: true,
        });
      }
    });

    // Process each target node
    for (const tid of targets) {
      const targetNode = data.nodes?.find((n) => n.id === tid);
      if (!targetNode) continue;

      try {
        // Process based on target node type
        if (targetNode.data.type === 'openai') {
          await processOpenAINode(targetNode, inputValue);
        } else if (targetNode.data.type === 'output') {
          // Pass the input directly to the output node
          if (typeof data.updateNodeData === 'function') {
            data.updateNodeData(tid, {
              response: inputValue,
              responseType: 'text',
              processing: false,
            });
          }
        }
        // Add other node types as needed
      } catch (error) {
        console.error(`Error processing node ${tid}:`, error);
        if (typeof data.updateNodeData === 'function') {
          data.updateNodeData(tid, {
            error: error instanceof Error ? error.message : 'Unknown error',
            processing: false,
          });
        }
        
        toast({
          title: "Processing Error",
          description: error instanceof Error ? error.message : "Failed to process request",
          variant: "destructive"
        });
      }
    }

    setIsProcessing(false);
  };

  // Process OpenAI node (GPT-4o, etc.)
  const processOpenAINode = async (node: AINode, prompt: string) => {
    // Simulate AI processing for now (later this would make an actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
    
    const response = `This is a simulated response from ${node.data.label}.\n\nYou asked: "${prompt}"\n\nIn a real implementation, this would make an API call to OpenAI with your API key.`;
    
    // Update the node with the response
    if (typeof data.updateNodeData === 'function') {
      data.updateNodeData(node.id, {
        response,
        responseType: 'text',
        processing: false,
      });
    }
    
    // Find and update any output nodes connected to this node
    const connectedOutputs = data.edges
      ?.filter(e => e.source === node.id)
      .map(e => e.target) || [];
      
    connectedOutputs.forEach(outputId => {
      if (typeof data.updateNodeData === 'function') {
        data.updateNodeData(outputId, {
          response,
          responseType: 'text',
          processing: false,
        });
      }
    });
    
    toast({
      title: "AI Processing Complete",
      description: "Response generated successfully",
    });
  };

  /* ------------------------------------------------------------------ */
  /* render helpers                                                      */
  /* ------------------------------------------------------------------ */
  const renderPreview = () => {
    if (!data.response) return null;
    switch (data.responseType) {
      case 'image': {
        const src =
          typeof data.response === 'string'
            ? data.response
            : URL.createObjectURL(data.response as Blob);
        return showPreview ? (
          <img src={src} alt="img" className="max-h-28 object-contain rounded" />
        ) : (
          <p className="text-xs text-green-600">Image generated</p>
        );
      }
      case 'audio': {
        const src =
          typeof data.response === 'string'
            ? data.response
            : URL.createObjectURL(data.response as Blob);
        return showPreview ? (
          <audio ref={audioRef} controls className="w-full h-8" src={src} />
        ) : (
          <p className="text-xs text-green-600">Audio generated</p>
        );
      }
      case 'video': {
        const src =
          typeof data.response === 'string'
            ? data.response
            : URL.createObjectURL(data.response as Blob);
        return showPreview ? (
          <video ref={videoRef} controls className="max-h-28 rounded" src={src} />
        ) : (
          <p className="text-xs text-green-600">Video generated</p>
        );
      }
      case 'code':
        return showPreview ? (
          <pre className="bg-gray-100 p-1 text-xs rounded overflow-x-auto">
            <code>{typeof data.response === 'string' ? data.response : 'code'}</code>
          </pre>
        ) : (
          <p className="text-xs text-green-600">Code generated</p>
        );
      default:
        return (
          <div className="text-xs max-h-32 overflow-y-auto whitespace-pre-wrap">
            {typeof data.response === 'string' ? data.response : 'Response'}
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (data.type) {
      case 'input':
        return (
          <>
            {connectedResponseNode && (
              <div className="flex items-center justify-between mb-2 text-xs">
                <Label htmlFor={`ctx-${id}`}>Use response as context</Label>
                <Switch
                  id={`ctx-${id}`}
                  checked={useResponseAsContext}
                  onCheckedChange={setUseResponseAsContext}
                  className="scale-75"
                />
              </div>
            )}
            <Tabs
              value={selectedTab}
              onValueChange={(v) => setSelectedTab(v as 'text' | 'file')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-2 text-xs">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="file">File</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <Textarea
                  rows={3}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter prompt…"
                  className="text-sm mb-2"
                />
              </TabsContent>
              <TabsContent value="file">
                <div className="border border-dashed rounded p-4 text-center">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <Badge variant="outline" className="mb-1">
                        {selectedFile.type}
                      </Badge>
                      <p className="truncate text-xs max-w-full">{selectedFile.name}</p>
                      <Button size="sm" variant="outline" onClick={triggerFileUpload}>Change</Button>
                    </div>
                  ) : (
                    <Button variant="ghost" className="flex flex-col items-center text-gray-500" onClick={triggerFileUpload}>
                      <FiUpload className="h-6 w-6 mb-1" /> Browse
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <Button
              size="sm"
              className="w-full"
              disabled={isProcessing || (selectedTab === 'text' ? !inputValue.trim() : !selectedFile)}
              onClick={handleSend}
            >
              {isProcessing ? "Processing..." : "Send to AI"}
            </Button>
          </>
        );

      case 'output':
        return (
          <div className="flex flex-col space-y-2 text-xs">
            {data.response && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">{respIcon()}<span className="capitalize">{data.responseType}</span></div>
                {data.responseType !== 'text' && (
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`prev-${id}`}>Preview</Label>
                    <Switch
                      id={`prev-${id}`}
                      className="scale-75"
                      checked={showPreview}
                      onCheckedChange={setShowPreview}
                    />
                  </div>
                )}
              </div>
            )}
            {data.response ? renderPreview() : <p>{data.description || 'Waiting for response…'}</p>}
          </div>
        );

      default:
        return (
          <div className="flex flex-col space-y-2">
            {data.processing ? (
              <div className="text-xs text-center py-2">
                <div className="animate-pulse">Processing...</div>
              </div>
            ) : data.response ? (
              renderPreview()
            ) : (
              <p className="text-xs">{data.description || 'Waiting for input…'}</p>
            )}
            {data.error && (
              <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                Error: {data.error}
              </div>
            )}
          </div>
        );
    }
  };

  /* ------------------------------------------------------------------ */
  /* JSX                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="relative" data-type={data.type}>
      {data.handles?.target && (
        <Handle type="target" position={Position.Left} style={{ background: data.color, width: 8, height: 8 }} />
      )}

      <Card className="w-60 shadow-md">
        {/* Header (drag handle + gear) */}
        <CardHeader
          data-reactflow-drag-handle
          className="pb-2 pt-3 px-4 flex items-center justify-between"
          style={{ backgroundColor: data.color, color: 'white' }}
        >
          <div className="flex items-center gap-2">{typeIcon()}<span className="font-semibold text-sm truncate max-w-[120px]">{data.label}</span></div>
          <button title="Configure" className="nodrag" onClick={openConfig}>
            <Settings className="h-4 w-4 opacity-80 hover:opacity-100" />
          </button>
        </CardHeader>

        <CardContent className="p-3 space-y-2">
          {renderContent()}
        </CardContent>
      </Card>

      {data.handles?.source && (
        <Handle type="source" position={Position.Right} style={{ background: data.color, width: 8, height: 8 }} />
      )}
    </div>
  );
};

export default memo(ServiceNode);
