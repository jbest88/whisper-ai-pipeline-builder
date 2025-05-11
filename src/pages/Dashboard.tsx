
import { useState, useEffect } from 'react';
import WorkflowCanvas from '../components/WorkflowCanvas';
import Sidebar from '../components/Sidebar';
import NodeConfigPanel from '../components/NodeConfigPanel';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { AINode } from '../types/workflow';

const Dashboard = () => {
  const [selectedNode, setSelectedNode] = useState<AINode | null>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  
  // Effect to load saved API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);
  
  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    }
  }, [apiKey]);
  
  const handleRunWorkflow = () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add an OpenAI API key in the node configuration panel.",
        variant: "destructive"
      });
      return;
    }
    
    setIsWorkflowRunning(true);
    toast({
      title: "Workflow Ready",
      description: "Enter a prompt in the input node and click 'Send to AI'"
    });
    
    // Simulate workflow completion after a delay
    setTimeout(() => {
      setIsWorkflowRunning(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">AI Workflow Builder</h1>
            <p className="text-sm text-gray-500">Create and connect AI services in a visual workflow</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => toast({ title: "Workflow Saved", description: "Your workflow has been saved successfully" })}>
              Save
            </Button>
            <Button 
              onClick={handleRunWorkflow} 
              disabled={isWorkflowRunning}
              className={isWorkflowRunning ? 'animate-pulse' : ''}
            >
              {isWorkflowRunning ? 'Running...' : 'Run Workflow'}
            </Button>
          </div>
        </header>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <WorkflowCanvas setSelectedNode={setSelectedNode} apiKey={apiKey} setApiKey={setApiKey} />
          </div>
          
          {selectedNode && (
            <NodeConfigPanel 
              node={selectedNode} 
              setApiKey={setApiKey}
              onClose={() => setSelectedNode(null)} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
