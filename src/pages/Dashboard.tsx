
import { useState } from 'react';
import WorkflowCanvas from '../components/WorkflowCanvas';
import Sidebar from '../components/Sidebar';
import NodeConfigPanel from '../components/NodeConfigPanel';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AINode } from '../types/workflow';

const Dashboard = () => {
  const [selectedNode, setSelectedNode] = useState<AINode | null>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  
  const handleRunWorkflow = () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add at least one API key in the node configuration panel.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Workflow Executing",
      description: "Your AI workflow is now running. Results will appear in the response nodes."
    });
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
            <Button onClick={handleRunWorkflow}>
              Run Workflow
            </Button>
          </div>
        </header>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <WorkflowCanvas setSelectedNode={setSelectedNode} apiKey={apiKey} setApiKey={setApiKey} />
            <button 
              className="absolute bottom-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
              onClick={() => toast({ title: "New Node", description: "Drag nodes from the sidebar to add them to your workflow" })}
            >
              <PlusCircle size={24} />
            </button>
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
