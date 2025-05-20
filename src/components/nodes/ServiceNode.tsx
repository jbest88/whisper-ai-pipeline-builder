
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useToast } from '@/components/ui/use-toast';
import { NodeData } from '../../types/workflow';
import { FiSettings } from 'react-icons/fi';
import { cn } from '@/lib/utils';

// Define the node component
const ServiceNode = memo(({ data, id }: { data: NodeData; id: string }) => {
  const { toast } = useToast();
  
  // Function to process input nodes when user submits a prompt
  const handleSendPrompt = async () => {
    if (!data.input) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt before sending",
        variant: "destructive"
      });
      return;
    }
    
    if (data.type === 'input') {
      // Find connected nodes (outgoing connections)
      const connectedNodes = data.edges
        ?.filter(e => e.source === id)
        .map(e => e.target) || [];
      
      if (connectedNodes.length === 0) {
        toast({
          title: "No Connections",
          description: "Connect this input to an AI service first",
          variant: "destructive"
        });
        return;
      }
      
      // Update the input node to show processing
      if (typeof data.updateNodeData === 'function') {
        data.updateNodeData(id, { processing: true });
      }
      
      // Send the prompt to each connected node
      const prompt = data.input as string;
      
      // Process each connected node based on its type
      for (const nodeId of connectedNodes) {
        const node = data.nodes?.find(n => n.id === nodeId);
        if (!node) continue;
        
        try {
          if (node.data.type === 'openai') {
            await processOpenAINode(node, prompt);
          } else {
            // For other node types
            if (typeof data.updateNodeData === 'function') {
              data.updateNodeData(nodeId, {
                input: prompt,
                processing: true
              });
              
              // Simulate processing for now
              setTimeout(() => {
                if (typeof data.updateNodeData === 'function') {
                  const response = `Processed by ${node.data.label}: ${prompt}`;
                  data.updateNodeData(nodeId, {
                    response: response,
                    responseType: 'text',
                    processing: false
                  });
                  
                  // Propagate the response to any connected nodes
                  propagateResponseToNextNodes(node, response);
                }
              }, 2000);
            }
          }
        } catch (error) {
          console.error(`Error processing node ${nodeId}:`, error);
          if (typeof data.updateNodeData === 'function') {
            data.updateNodeData(nodeId, {
              error: error instanceof Error ? error.message : 'Unknown error',
              processing: false
            });
          }
          
          toast({
            title: "Processing Error",
            description: error instanceof Error ? error.message : 'Unknown error',
            variant: "destructive"
          });
        }
      }
      
      // Update the input node to show processing is complete
      if (typeof data.updateNodeData === 'function') {
        data.updateNodeData(id, { processing: false });
      }
    }
  };

  // Process OpenAI node (GPT-4o, etc.)
  const processOpenAINode = async (node: any, prompt: string) => {
    // Check if we have API key
    if (!node.data.apiKey) {
      throw new Error('OpenAI API key is required. Please configure the node.');
    }
    
    try {
      // Show processing state
      toast({
        title: "Processing Request",
        description: `Sending prompt to ${node.data.label || 'OpenAI'}...`
      });
      
      // Determine model from node config or use default
      const model = node.data.config?.model || 'gpt-4o';
      
      // Initialize messages array with a system message
      let messages = [{ role: 'system', content: 'You are a helpful assistant.' }];
      
      // Add the current prompt as the latest message
      messages.push({ role: 'user', content: prompt });
      
      console.log("Sending messages to OpenAI:", messages);
      
      // Make API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${node.data.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: node.data.config?.temperature || 0.7,
          max_tokens: node.data.config?.maxTokens || 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'No response from OpenAI';
      
      // Store only the current conversation pair as context, not the full history
      const updatedContext = [
        { role: 'user', content: prompt },
        { role: 'assistant', content: aiResponse }
      ];
      
      // Update the node with the response and updated context
      if (typeof node.data.updateNodeData === 'function') {
        node.data.updateNodeData(node.id, {
          response: aiResponse,
          responseType: 'text',
          processing: false,
          context: updatedContext  // Store only the latest conversation pair
        });
      }
      
      // Propagate the response to any connected nodes
      propagateResponseToNextNodes(node, aiResponse);
      
      toast({
        title: "AI Processing Complete",
        description: "Response generated successfully",
      });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  };
  
  // Function to propagate the response to the next connected nodes
  const propagateResponseToNextNodes = (node: any, response: string | Blob) => {
    const connectedOutputs = node.data.edges
      ?.filter(e => e.source === node.id)
      .map(e => e.target) || [];
      
    for (const outputId of connectedOutputs) {
      const outputNode = node.data.nodes?.find(n => n.id === outputId);
      if (!outputNode) continue;
      
      console.log(`Propagating response to node ${outputId}`, outputNode.data.type);
      
      if (typeof node.data.updateNodeData === 'function') {
        // If it's an output node, just display the response
        if (outputNode.data.type === 'output') {
          node.data.updateNodeData(outputId, {
            response: response,
            responseType: typeof response === 'string' ? 'text' : 
              (response instanceof Blob ? (response.type.startsWith('image/') ? 'image' : 
                (response.type.startsWith('video/') ? 'video' : 
                  (response.type.startsWith('audio/') ? 'audio' : 'file'))) : 'text'),
            processing: false,
          });
        } 
        // For language model nodes (like OpenAI), automatically use the response as input
        else if (outputNode.data.type === 'openai' || 
                outputNode.data.type === 'llm' ||
                outputNode.data.type === 'anthropic' ||
                outputNode.data.type === 'gemini') {
          
          // If the response is a string, set it as the input
          if (typeof response === 'string') {
            node.data.updateNodeData(outputId, {
              input: response,
              inputType: 'text',
              processing: false,
              // Don't set context here, it will be created during processing
            });
            
            // Automatically trigger processing for LLM nodes when they receive input
            setTimeout(() => {
              // Find the LLM node with updated data
              const updatedLLMNode = node.data.nodes?.find(n => n.id === outputId);
              if (!updatedLLMNode) return;
              
              // Use processOpenAINode to process the input
              if (updatedLLMNode.data.type === 'openai' && updatedLLMNode.data.apiKey) {
                processOpenAINode(updatedLLMNode, response as string);
              }
            }, 500); // Small delay to ensure data is updated
          }
        }
        // If it's an input node, store the response as input but don't overwrite any user input
        else if (outputNode.data.type === 'input') {
          node.data.updateNodeData(outputId, {
            input: response as string,
            processing: false,
          });
        } 
        // For all other node types, update their input with the response
        else {
          node.data.updateNodeData(outputId, {
            input: response,
            inputType: typeof response === 'string' ? 'text' : 
              (response instanceof Blob ? (response.type.startsWith('image/') ? 'image' : 
                (response.type.startsWith('video/') ? 'video' : 
                  (response.type.startsWith('audio/') ? 'audio' : 'file'))) : 'text'),
            processing: false,
          });
        }
      }
    }
  };

  // Determine if this node is a source, target, or both
  const hasSourceHandle = data.handles?.source;
  const hasTargetHandle = data.handles?.target;

  return (
    <div className="min-w-[180px] min-h-[80px] bg-white rounded-lg shadow-md border border-gray-200 p-4 flex flex-col">
      {/* Node Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {data.icon && <span className="text-lg" style={{ color: data.color }}>{data.icon}</span>}
          <h3 className="text-sm font-medium truncate max-w-[120px]">{data.label}</h3>
        </div>
        {data.openConfig && (
          <button
            onClick={() => data.openConfig && data.openConfig(id)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiSettings size={14} />
          </button>
        )}
      </div>
      
      {/* Node Content */}
      <div className="text-xs text-gray-500 flex-1">
        {data.description || 'Configure this node'}
        
        {/* Show error if present */}
        {data.error && (
          <div className="mt-2 text-red-500 text-xs">
            Error: {data.error}
          </div>
        )}

        {/* Input Field for Input Node */}
        {data.type === 'input' && (
          <div className="mt-2">
            <input
              type="text"
              value={data.input as string || ''}
              onChange={(e) => data.updateNodeData && data.updateNodeData(id, { input: e.target.value })}
              placeholder="Enter your prompt..."
              className="w-full text-xs p-1.5 border border-gray-300 rounded"
            />
            <button
              onClick={handleSendPrompt}
              disabled={data.processing}
              className={cn(
                "w-full mt-1.5 py-1 rounded text-white text-xs",
                data.processing ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {data.processing ? "Processing..." : "Send to AI"}
            </button>
          </div>
        )}

        {/* Display Response for Output Node */}
        {data.type === 'output' && data.response && (
          <div className="mt-2 max-h-[200px] overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 text-gray-800">
            {data.response.toString()}
          </div>
        )}
        
        {/* Display Input for LLM Nodes */}
        {(data.type === 'openai' || data.type === 'llm' || data.type === 'anthropic' || data.type === 'gemini') && data.input && (
          <div className="mt-2 text-xs">
            <div className="font-medium">Input:</div>
            <div className="truncate max-w-full">{typeof data.input === 'string' ? data.input : 'Non-text input'}</div>
          </div>
        )}
        
        {/* Display Response for LLM Nodes */}
        {(data.type === 'openai' || data.type === 'llm' || data.type === 'anthropic' || data.type === 'gemini') && data.response && (
          <div className="mt-2 text-xs">
            <div className="font-medium">Response:</div>
            <div className="truncate max-h-[100px] overflow-hidden">{data.response.toString().substring(0, 100)}...</div>
          </div>
        )}
      </div>

      {/* Handles for connections */}
      {hasTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: data.color }}
          className="w-3 h-3 border-2 border-white"
        />
      )}
      
      {hasSourceHandle && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: data.color }}
          className="w-3 h-3 border-2 border-white"
        />
      )}
      
      {/* Processing Indicator */}
      {data.processing && (
        <div className="absolute inset-0 bg-black/5 rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

export default ServiceNode;
