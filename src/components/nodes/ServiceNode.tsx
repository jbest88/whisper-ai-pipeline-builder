
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

interface ServiceNodeProps {
  data: AINode['data'];
  id: string;
}

const ServiceNode = ({ data, id }: ServiceNodeProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'text' | 'file'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Determine appropriate input type based on connected nodes
  useEffect(() => {
    if (data.edges) {
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
  }, [data.edges, id]);
  
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
        const targetNodes = edges.map(edge => edge.target);
        
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

  const renderNodeContent = () => {
    switch (data.type) {
      case 'input':
        return (
          <>
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
          <div className="text-xs max-h-32 overflow-y-auto">
            {data.response ? (
              <div className="whitespace-pre-wrap">{data.response}</div>
            ) : (
              <div>{data.description || 'Waiting for response...'}</div>
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
