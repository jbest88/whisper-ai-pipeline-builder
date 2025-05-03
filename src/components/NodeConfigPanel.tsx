
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AINode } from '../types/workflow';
import { useToast } from '@/components/ui/use-toast';
import { useNodesState } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
      default:
        return 'API Key';
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
                  <p className="text-xs text-gray-500">
                    Your API key is required to make requests to the service
                  </p>
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
