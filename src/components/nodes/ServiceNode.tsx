
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AINode } from '../../types/workflow';
import { FaBrain, FaImage, FaVolumeUp, FaDatabase, FaFileAlt } from 'react-icons/fa';
import { BsChatText } from 'react-icons/bs';
import { FiSend } from 'react-icons/fi';
import { MdWebhook } from 'react-icons/md';

interface ServiceNodeProps {
  data: AINode['data'];
  id: string;
}

const ServiceNode = ({ data, id }: ServiceNodeProps) => {
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

  return (
    <div className="relative nodrag"> {/* Added nodrag class to prevent interfering with dragging */}
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
          <div className="text-xs text-gray-600">
            {data.description || 'Configure this node to add it to your workflow'}
          </div>
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
