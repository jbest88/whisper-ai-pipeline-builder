import { useState, useEffect } from 'react';
import WorkflowCanvas from '../components/WorkflowCanvas';
import Sidebar from '../components/Sidebar';
import NodeConfigPanel from '../components/NodeConfigPanel';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { AINode, WorkflowExecution, ExecutionStatus } from '../types/workflow';
import { loadFromStorage, saveToStorage, removeFromStorage } from '../utils/storageUtils';
import { Calendar, Download, Play, Save, Trash, Check, AlertCircle } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';

const Dashboard = () => {
  const [selectedNode, setSelectedNode] = useState<AINode | null>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [workflowName, setWorkflowName] = useState('My n8n Workflow');
  const [latestExecution, setLatestExecution] = useState<WorkflowExecution | null>(null);

  useEffect(() => {
    const savedApiKey = loadFromStorage('openai_api_key');
    if (savedApiKey) setApiKey(savedApiKey);
    const savedWorkflowName = loadFromStorage('workflow_name');
    if (savedWorkflowName) setWorkflowName(savedWorkflowName);
  }, []);

  useEffect(() => {
    if (apiKey) saveToStorage('openai_api_key', apiKey);
  }, [apiKey]);
  useEffect(() => {
    if (workflowName) saveToStorage('workflow_name', workflowName);
  }, [workflowName]);

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
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      status: ExecutionStatus.RUNNING,
      startTime: Date.now(),
      nodeResults: {}
    };
    setLatestExecution(execution);
    toast({
      title: "Workflow Running",
      description: "Enter a prompt in the input node and click 'Send to AI'"
    });
    setTimeout(() => {
      setIsWorkflowRunning(false);
      setLatestExecution(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: ExecutionStatus.COMPLETED,
          endTime: Date.now()
        };
      });
      toast({
        title: "Workflow Ready",
        description: "Workflow has been initialized and is ready to process data"
      });
    }, 2000);
  };

  const handleSaveWorkflow = () => {
    toast({
      title: "Workflow Saved",
      description: "Your workflow has been saved to storage"
    });
  };

  const handleClearWorkflow = () => {
    if (window.confirm("Are you sure you want to clear the current workflow? This cannot be undone.")) {
      removeFromStorage('workflow_nodes');
      removeFromStorage('workflow_edges');
      toast({
        title: "Workflow Cleared",
        description: "Your workflow has been cleared. Refresh the page to start with a clean workflow."
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkflowName(e.target.value);
  };

  const handleExport = () => {
    const nodes = loadFromStorage('workflow_nodes');
    const edges = loadFromStorage('workflow_edges');
    if (!nodes || !edges) {
      toast({
        title: "Nothing to Export",
        description: "Create a workflow first before exporting",
        variant: "destructive"
      });
      return;
    }
    const data = {
      name: workflowName,
      nodes,
      edges,
      created: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Workflow Exported",
      description: "Your workflow has been exported as JSON"
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
         <Sidebar className="w-64 flex-shrink-0" />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="text"
                value={workflowName}
                onChange={handleNameChange}
                className="text-xl font-semibold text-gray-800 border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1"
              />
              <div className="flex items-center ml-3 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>Last edited: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              {latestExecution && (
                <div className={`flex items-center px-3 py-1 rounded-full text-xs ${
                  latestExecution.status === ExecutionStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                  latestExecution.status === ExecutionStatus.ERROR ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {latestExecution.status === ExecutionStatus.COMPLETED ? (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  ) : latestExecution.status === ExecutionStatus.ERROR ? (
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
                  )}
                  {latestExecution.status === ExecutionStatus.RUNNING ? 'Running...' :
                  latestExecution.status === ExecutionStatus.COMPLETED ? 'Last run successful' :
                  'Execution failed'}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleSaveWorkflow}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearWorkflow} className="text-red-500 hover:text-red-600">
                <Trash className="h-4 w-4 mr-1" /> Clear
              </Button>
              <Button
                size="sm"
                onClick={handleRunWorkflow}
                disabled={isWorkflowRunning}
                className={isWorkflowRunning ? 'animate-pulse' : ''}
              >
                <Play className="h-4 w-4 mr-1" />
                {isWorkflowRunning ? 'Running...' : 'Execute Workflow'}
              </Button>
            </div>
          </header>

          {/* MAIN CANVAS AREA */}
          <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
  <WorkflowCanvas setSelectedNode={setSelectedNode} apiKey={apiKey} setApiKey={setApiKey} />
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
    </SidebarProvider>
  );
};

export default Dashboard;
