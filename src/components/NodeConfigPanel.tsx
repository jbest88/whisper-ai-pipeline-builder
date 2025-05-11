import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AINode } from '../types/workflow';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ExternalLink } from 'lucide-react';

interface NodeConfigPanelProps {
  node: AINode;
  onClose: () => void;
  setApiKey: (key: string) => void;
}

const NodeConfigPanel = ({ node, onClose, setApiKey }: NodeConfigPanelProps) => {
  const [nodeName, setNodeName] = useState(node.data.label);
  const [nodeDescription, setNodeDescription] = useState(node.data.description || '');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const { toast } = useToast();
  const [nodeConfig, setNodeConfig] = useState<any>({});
  
  // Get node type specific configurations
  useEffect(() => {
    switch (node.data.type) {
      case 'openai':
        setNodeConfig({
          model: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 1000
        });
        break;
      case 'elevenlabs':
        setNodeConfig({
          voice: 'Rachel',
          model: 'eleven_multilingual_v2'
        });
        break;
      case 'dalle':
        setNodeConfig({
          size: '1024x1024',
          style: 'vivid'
        });
        break;
      case 'sora':
        setNodeConfig({
          duration: '10',
          resolution: '1080p',
          style: 'realistic'
        });
        break;
      case 'runway':
        setNodeConfig({
          duration: '8',
          frames: '24',
          mode: 'text-to-video'
        });
        break;
      case 'pika':
        setNodeConfig({
          duration: '5',
          style: 'cinematic',
          mode: 'text-to-video'
        });
        break;
      default:
        setNodeConfig({});
    }
  }, [node.data.type]);
  
  const handleSave = () => {
    // Here you would update the node in the ReactFlow state
    if (apiKeyInput) {
      setApiKey(apiKeyInput);
      toast({
        title: "API Key Saved",
        description: "Your API key has been securely saved"
      });
    }
    
    toast({
      title: "Configuration Saved",
      description: `${nodeName} has been configured successfully`
    });
    
    onClose();
  };

  const getAPIKeyLabel = () => {
    switch (node.data.type) {
      case 'openai':
        return 'OpenAI API Key';
      case 'anthropic':
        return 'Anthropic API Key';
      case 'elevenlabs':
        return 'ElevenLabs API Key';
      case 'stability':
        return 'Stability API Key';
      case 'sora':
        return 'OpenAI API Key';
      case 'runway':
        return 'Runway API Key';
      case 'pika':
        return 'Pika Labs API Key';
      default:
        return 'API Key';
    }
  };
  
  // Function to get API creation URL based on node type
  const getAPIKeyCreationURL = () => {
    switch (node.data.type) {
      case 'openai':
        return 'https://platform.openai.com/api-keys';
      case 'anthropic':
        return 'https://console.anthropic.com/settings/keys';
      case 'elevenlabs':
        return 'https://elevenlabs.io/subscription';
      case 'stability':
        return 'https://platform.stability.ai/account/keys';
      case 'sora':
        return 'https://platform.openai.com/api-keys';
      case 'runway':
        return 'https://runwayml.com/account/api-keys/';
      case 'pika':
        return 'https://pika.art/account/api-keys';
      case 'perplexity':
        return 'https://www.perplexity.ai/settings/api';
      case 'midjourney':
        return 'https://www.midjourney.com/account/';
      default:
        return null;
    }
  };

  const renderNodeSpecificConfig = () => {
    switch (node.data.type) {
      case 'openai':
        return (
          <>
            <div className="space-y-2 mb-4">
              <Label htmlFor="model">Model</Label>
              <select 
                id="model"
                className="w-full border rounded p-2 text-sm"
                value={nodeConfig.model}
                onChange={(e) => setNodeConfig({...nodeConfig, model: e.target.value})}
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4.5-preview">GPT-4.5-preview</option>
              </select>
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="temp">Temperature: {nodeConfig.temperature}</Label>
              <input 
                id="temp"
                type="range" 
                min="0" 
                max="2" 
                step="0.1"
                value={nodeConfig.temperature}
                onChange={(e) => setNodeConfig({...nodeConfig, temperature: parseFloat(e.target.value)})}
                className="w-full"
              />
            </div>
          </>
        );
      
      case 'elevenlabs':
        return (
          <>
            <div className="space-y-2 mb-4">
              <Label htmlFor="voice">Voice</Label>
              <select 
                id="voice"
                className="w-full border rounded p-2 text-sm"
                value={nodeConfig.voice}
                onChange={(e) => setNodeConfig({...nodeConfig, voice: e.target.value})}
              >
                <option value="Rachel">Rachel</option>
                <option value="Thomas">Thomas</option>
                <option value="Emily">Emily</option>
              </select>
            </div>
          </>
        );
      
      case 'dalle':
        return (
          <>
            <div className="space-y-2 mb-4">
              <Label htmlFor="size">Image Size</Label>
              <select 
                id="size"
                className="w-full border rounded p-2 text-sm"
                value={nodeConfig.size}
                onChange={(e) => setNodeConfig({...nodeConfig, size: e.target.value})}
              >
                <option value="1024x1024">1024x1024</option>
                <option value="1024x1792">1024x1792</option>
                <option value="1792x1024">1792x1024</option>
              </select>
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="style">Style</Label>
              <select 
                id="style"
                className="w-full border rounded p-2 text-sm"
                value={nodeConfig.style}
                onChange={(e) => setNodeConfig({...nodeConfig, style: e.target.value})}
              >
                <option value="vivid">Vivid</option>
                <option value="natural">Natural</option>
              </select>
            </div>
          </>
        );
        
      case 'sora':
        return (
          <>
            <div className="space-y-2 mb-4">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input 
                id="duration"
                type="number" 
                min="5"
                max="60"
                value={nodeConfig.duration}
                onChange={(e) => setNodeConfig({...nodeConfig, duration: e.target.value})}
              />
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="resolution">Resolution</Label>
              <select 
                id="resolution"
                className="w-full border rounded p-2 text-sm"
                value={nodeConfig.resolution}
                onChange={(e) => setNodeConfig({...nodeConfig, resolution: e.target.value})}
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4k">4K</option>
              </select>
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="style">Style</Label>
              <select 
                id="style"
                className="w-full border rounded p-2 text-sm"
                value={nodeConfig.style}
                onChange={(e) => setNodeConfig({...nodeConfig, style: e.target.value})}
              >
                <option value="realistic">Realistic</option>
                <option value="stylized">Stylized</option>
                <option value="animated">Animated</option>
              </select>
            </div>
          </>
        );
        
      case 'runway':
        return (
          <>
            <div className="space-y-2 mb-4">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input 
                id="duration"
                type="number" 
                min="2"
                max="16"
                value={nodeConfig.duration}
                onChange={(e) => setNodeConfig({...nodeConfig, duration: e.target.value})}
              />
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="frames">Frames per second</Label>
              <select 
                id="frames"
                className="w-full border rounded p-2 text-sm"
                value={nodeConfig.frames}
                onChange={(e) => setNodeConfig({...nodeConfig, frames: e.target.value})}
              >
                <option value="24">24 fps</option>
                <option value="30">30 fps</option>
                <option value="60">60 fps</option>
              </select>
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="mode">Mode</Label>
              <select 
                id="mode"
                className="w-full border rounded p-2 text-sm"
                value={nodeConfig.mode}
                onChange={(e) => setNodeConfig({...nodeConfig, mode: e.target.value})}
              >
                <option value="text-to-video">Text to Video</option>
                <option value="image-to-video">Image to Video</option>
              </select>
            </div>
          </>
        );
        
      case 'pika':
        return (
          <>
            <div className="space-y-2 mb-4">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input 
                id="duration"
                type="number" 
                min="3"
                max="10"
                value={nodeConfig.duration}
                onChange={(e) => setNodeConfig({...nodeConfig, duration: e.target.value})}
              />
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="style">Style</Label>
              <select 
                id="style"
                className="w-full border rounded p-2 text-sm"
                value={nodeConfig.style}
                onChange={(e) => setNodeConfig({...nodeConfig, style: e.target.value})}
              >
                <option value="cinematic">Cinematic</option>
                <option value="animation">Animation</option>
                <option value="artistic">Artistic</option>
                <option value="vlog">Vlog</option>
              </select>
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="mode">Mode</Label>
              <select 
                id="mode"
                className="w-full border rounded p-2 text-sm"
                value={nodeConfig.mode}
                onChange={(e) => setNodeConfig({...nodeConfig, mode: e.target.value})}
              >
                <option value="text-to-video">Text to Video</option>
                <option value="image-to-video">Image to Video</option>
              </select>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
        <h3 className="font-medium">Configure {node.data.label}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nodeName">Node Name</Label>
          <Input 
            id="nodeName"
            value={nodeName} 
            onChange={(e) => setNodeName(e.target.value)} 
            placeholder="Enter node name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nodeDesc">Description</Label>
          <Textarea 
            id="nodeDesc"
            value={nodeDescription} 
            onChange={(e) => setNodeDescription(e.target.value)}
            placeholder="Describe what this node does"
            rows={2}
          />
        </div>

        {node.data.type !== 'input' && node.data.type !== 'output' && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <h4 className="text-sm font-medium">API Configuration</h4>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">{getAPIKeyLabel()}</Label>
                  <Input
                    id="apiKey"
                    type="password" 
                    value={apiKeyInput} 
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter your API key"
                  />
                  <div className="flex justify-between items-center text-xs">
                    <p className="text-gray-500">
                      Your API key is required to make requests to the service
                    </p>
                    {getAPIKeyCreationURL() && (
                      <a 
                        href={getAPIKeyCreationURL()} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Get API Key <ExternalLink className="ml-1" size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {renderNodeSpecificConfig()}

        <div className="pt-2">
          <Button onClick={handleSave} className="w-full">
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
