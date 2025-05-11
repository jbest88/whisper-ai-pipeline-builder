import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AINode } from '../../types/workflow';
import { FaBrain, FaImage, FaVolumeUp, FaDatabase, FaFileAlt } from 'react-icons/fa';
import { BsChatText } from 'react-icons/bs';
import { FiSend, FiFile, FiUpload } from 'react-icons/fi';
import { MdWebhook } from 'react-icons/md';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileAudio, FileVideo, FileImage, FileCode, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ServiceNodeProps {
  data: AINode['data'];
  id: string;
}

const ServiceNode = ({ data, id }: ServiceNodeProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'text' | 'file'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [useResponseAsContext, setUseResponseAsContext] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Find connected response nodes (if any)
  const [connectedResponseNode, setConnectedResponseNode] = useState<{id: string, response: string | Blob | null} | null>(null);
  
  // Determine appropriate input type based on connected nodes
  useEffect(() => {
    if (data.edges) {
      // For input nodes, check if there are any response nodes connected to it
      if (data.type === 'input') {
        // First, check edges where this node is the target (incoming edges)
        const incomingEdges = data.edges.filter(edge => edge.target === id);
        
        // For each incoming edge, check if the source is an output/response node
        for (const edge of incomingEdges) {
          const sourceNodeId = edge.source;
          if (data.nodes) {
            const sourceNode = data.nodes.find(node => node.id === sourceNodeId);
            if (sourceNode && sourceNode.data.type === 'output') {
              setConnectedResponseNode({
                id: sourceNodeId,
                response: sourceNode.data.response || null
              });
              return; // Found a connected response node
            }
          }
        }
        
        // If no response nodes are found as direct connections, reset the state
        setConnectedResponseNode(null);
      }
      
      const targetNodes = data.edges
        .filter(edge => edge.source === id)
        .map(edge => edge.target);
      
      // If connected to audio processing node (whisper, elevenlabs)
      const hasAudioTarget = targetNodes.some(targetId => {
        const targetNode = document.getElementById(targetId);
        return targetNode?.getAttribute('data-type') === 'whisper' || 
               targetNode?.getAttribute('data-type') === 'elevenlabs';
      });
      
      if (hasAudioTarget) {
        setSelectedTab('file');
      }
    }
  }, [data.edges, id, data.type, data.nodes]);

  // Update input value when using response as context
  useEffect(() => {
    if (useResponseAsContext && connectedResponseNode?.response && typeof connectedResponseNode.response === 'string') {
      setInputValue(prev => {
        // Only prepend the context if it's not already there
        if (!prev.includes("Context:\n" + connectedResponseNode.response)) {
          return `Context:\n${connectedResponseNode.response}\n\nYour task:${prev ? "\n" + prev : ''}`;
        }
        return prev;
      });
    }
  }, [useResponseAsContext, connectedResponseNode]);
  
  const getIcon = () => {
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

  const getResponseTypeIcon = () => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle sending data to connected nodes
  const handleSendData = () => {
    if (data.type === 'input') {
      const hasInput = selectedTab === 'text' ? inputValue.trim() !== '' : selectedFile !== null;
      
      if (hasInput) {
        setIsProcessing(true);
        // Find connected edges and nodes
        const edges = data.edges || [];
        const targetNodes = edges
          .filter(edge => edge.source === id) // Only edges where this node is the source
          .map(edge => edge.target);
        
        // Set the input value as data to be processed by target nodes
        targetNodes.forEach(targetId => {
          if (data.updateNodeData) {
            data.updateNodeData(targetId, { 
              input: selectedTab === 'text' ? inputValue : selectedFile,
              inputType: selectedTab === 'text' ? 'text' : selectedFile?.type?.includes('audio') ? 'audio' : 
                        selectedFile?.type?.includes('image') ? 'image' : 
                        selectedFile?.type?.includes('video') ? 'video' : 'file',
              processing: true
            });
          }
        });
        
        setIsProcessing(false);
      }
    }
  };

  // Render different types of content based on responseType
  const renderContentByType = () => {
    if (!data.response) return null;

    switch (data.responseType) {
      case 'image':
        if (showPreview) {
          const imageUrl = typeof data.response === 'string' 
            ? data.response 
            : URL.createObjectURL(data.response as Blob);
          return (
            <div className="flex flex-col items-center">
              <img 
                src={imageUrl} 
                alt="Generated image"
                className="max-h-28 max-w-full object-contain rounded"
              />
            </div>
          );
        }
        return <div className="text-xs text-green-600">Image generated</div>;
        
      case 'audio':
        if (showPreview) {
          const audioUrl = typeof data.response === 'string'
            ? data.response
            : URL.createObjectURL(data.response as Blob);
          return (
            <div className="flex flex-col items-center">
              <audio 
                ref={audioRef}
                controls
                className="w-full h-8 mt-1"
                src={audioUrl}
              />
            </div>
          );
        }
        return <div className="text-xs text-green-600">Audio generated</div>;
        
      case 'video':
        if (showPreview) {
          const videoUrl = typeof data.response === 'string'
            ? data.response
            : URL.createObjectURL(data.response as Blob);
          return (
            <div className="flex flex-col items-center">
              <video
                ref={videoRef}
                controls
                className="max-h-28 max-w-full rounded"
                src={videoUrl}
              />
            </div>
          );
        }
        return <div className="text-xs text-green-600">Video generated</div>;
        
      case 'code':
        if (showPreview) {
          return (
            <div className="w-full">
              <pre className="text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                <code>{typeof data.response === 'string' ? data.response : 'Code snippet'}</code>
              </pre>
            </div>
          );
        }
        return <div className="text-xs text-green-600">Code generated</div>;
        
      default:
        // Default text display
        return (
          <div className="text-xs max-h-32 overflow-y-auto">
            <div className="whitespace-pre-wrap">
              {typeof data.response === 'string' 
                ? data.response 
                : 'Response received'}
            </div>
          </div>
        );
    }
  };

  const renderNodeContent = () => {
    switch (data.type) {
      case 'input':
        return (
          <>
            {connectedResponseNode && (
              <div className="flex items-center justify-between mb-2 text-xs">
                <Label htmlFor={`context-${id}`}>Use response as context</Label>
                <Switch 
                  id={`context-${id}`} 
                  checked={useResponseAsContext} 
                  onCheckedChange={setUseResponseAsContext}
                  className="scale-75"
                />
              </div>
            )}
            <Tabs 
              defaultValue="text" 
              value={selectedTab}
              onValueChange={(value) => setSelectedTab(value as 'text' | 'file')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="file">File</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-0">
                <Textarea 
                  placeholder="Type your prompt here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full mb-2 text-sm"
                  rows={3}
                />
              </TabsContent>
              <TabsContent value="file" className="mt-0">
                <div className="border border-dashed border-gray-300 rounded-md p-4 mb-2 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant="outline" className="mb-1">
                        {selectedFile.type}
                      </Badge>
                      <span className="text-xs text-gray-700 truncate max-w-full">
                        {selectedFile.name}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="mt-1"
                        onClick={triggerFileUpload}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FiUpload className="h-8 w-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Click to upload a file</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={triggerFileUpload}
                        className="mt-1"
                      >
                        Browse Files
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <Button 
              size="sm" 
              onClick={handleSendData}
              disabled={isProcessing || (selectedTab === 'text' ? !inputValue.trim() : !selectedFile)}
              className="w-full"
            >
              Send to AI
            </Button>
          </>
        );
      case 'openai':
      case 'anthropic':
      case 'perplexity':
        return (
          <div className="text-xs">
            {data.processing ? (
              <div className="animate-pulse">Processing...</div>
            ) : data.response ? (
              <div className="text-green-600">Completed</div>
            ) : data.input ? (
              <div>
                {typeof data.input === 'string' ? 
                  `Ready to process text input (${data.input.length} chars)` :
                  `Ready to process ${data.inputType} file`
                }
              </div>
            ) : (
              <div>{data.description || 'Waiting for input...'}</div>
            )}
          </div>
        );
      case 'whisper':
        return (
          <div className="text-xs">
            {data.processing ? (
              <div className="animate-pulse">Transcribing audio...</div>
            ) : data.response ? (
              <div className="text-green-600">Transcription complete</div>
            ) : data.input && data.inputType === 'audio' ? (
              <div>Ready to transcribe audio</div>
            ) : (
              <div>{data.description || 'Waiting for audio input...'}</div>
            )}
          </div>
        );
      case 'elevenlabs':
        return (
          <div className="text-xs">
            {data.processing ? (
              <div className="animate-pulse">Generating speech...</div>
            ) : data.response ? (
              <div className="text-green-600">Speech generated</div>
            ) : data.input ? (
              <div>Ready to convert text to speech</div>
            ) : (
              <div>{data.description || 'Waiting for text input...'}</div>
            )}
          </div>
        );
      case 'output':
        return (
          <div className="flex flex-col w-full space-y-2">
            {data.response && data.responseType && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {getResponseTypeIcon()}
                  <span className="capitalize">{data.responseType}</span>
                </div>
                {data.responseType !== 'text' && (
                  <div className="flex items-center gap-1">
                    <Label htmlFor={`preview-${id}`} className="text-xs">Preview</Label>
                    <Switch 
                      id={`preview-${id}`} 
                      checked={showPreview} 
                      onCheckedChange={setShowPreview} 
                      className="scale-75"
                    />
                  </div>
                )}
              </div>
            )}
            {data.response ? (
              renderContentByType()
            ) : (
              <div className="text-xs">
                {data.description || 'Waiting for response...'}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="text-xs text-gray-600">
            {data.description || 'Configure this node to add it to your workflow'}
          </div>
        );
    }
  };

  return (
    <div className="relative nodrag" data-type={data.type}> 
      {data.handles?.target && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: data.color, width: 8, height: 8 }}
        />
      )}
      
      <Card className="w-60 shadow-md">
        <CardHeader 
          className="pb-2 pt-3 px-4 flex flex-row items-center justify-between nodrag"
          style={{ backgroundColor: data.color, color: 'white' }}
        >
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-semibold text-sm">{data.label}</span>
          </div>
        </CardHeader>
        <CardContent className="p-3 nodrag">
          {renderNodeContent()}
          {data.config?.apiKeyConfigured && (
            <div className="mt-2 text-xs bg-green-50 text-green-700 p-1 rounded flex items-center justify-center">
              <span>✓ API Key Configured</span>
            </div>
          )}
          <div className="mt-2 text-xs text-blue-500 flex items-center justify-center">
            <span>Click to configure</span>
          </div>
        </CardContent>
      </Card>
      
      {data.handles?.source && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: data.color, width: 8, height: 8 }}
        />
      )}
    </div>
  );
};

export default memo(ServiceNode);
