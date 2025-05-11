
import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AINode } from '../../types/workflow';
import { FaBrain, FaImage, FaVolumeUp, FaDatabase, FaFileAlt } from 'react-icons/fa';
import { BsChatText } from 'react-icons/bs';
import { FiSend } from 'react-icons/fi';
import { MdWebhook } from 'react-icons/md';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ServiceNodeProps {
  data: AINode['data'];
  id: string;
}

const ServiceNode = ({ data, id }: ServiceNodeProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  // Handle sending data to connected nodes
  const handleSendData = () => {
    if (data.type === 'input' && inputValue.trim() !== '') {
      setIsProcessing(true);
      // Find connected edges and nodes
      const edges = data.edges || [];
      const targetNodes = edges.map(edge => edge.target);
      
      // Set the input value as data to be processed by target nodes
      targetNodes.forEach(targetId => {
        if (data.updateNodeData) {
          data.updateNodeData(targetId, { 
            input: inputValue,
            processing: true
          });
        }
      });
      
      setIsProcessing(false);
    }
  };

  const renderNodeContent = () => {
    switch (data.type) {
      case 'input':
        return (
          <>
            <Textarea 
              placeholder="Type your prompt here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full mb-2 text-sm"
              rows={3}
            />
            <Button 
              size="sm" 
              onClick={handleSendData}
              disabled={isProcessing || !inputValue.trim()}
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
              <div>Ready to process</div>
            ) : (
              <div>{data.description || 'Waiting for input...'}</div>
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
    <div className="relative nodrag"> 
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
