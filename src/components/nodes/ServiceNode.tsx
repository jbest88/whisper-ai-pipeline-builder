import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useToast } from '@/components/ui/use-toast';
import { NodeData, ExecutionStatus } from '../../types/workflow';
import { FiSettings, FiInfo } from 'react-icons/fi';
import { Play, CheckCircle2, AlertCircle, Forward } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the node component
const ServiceNode = memo(({ data, id }: { data: NodeData; id: string }) => {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  
  // Auto-process when receiving input for AI nodes
  useEffect(() => {
    // Only run for AI nodes when they receive input and are not already processing
    if ((data.type === 'openai' || data.type === 'dalle' || data.type === 'gemini') &&
        data.input && !data.processing && !data.executed) {
      handleProcessNode();
    }
  }, [data.input, data.type]);

  // Auto-propagate responses to connected nodes
  useEffect(() => {
    // When a node generates a response, auto-propagate to connected nodes
    if (data.response && !data.processing && data.executed) {
      propagateResponseToNextNodes(data, data.response);
    }
  }, [data.response, data.processing, data.executed]);
  
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
        data.updateNodeData(id, { 
          processing: true,
          executed: true,
          error: undefined
        });
      }
      
      // Process each connected node
      const prompt = data.input as string;
      processConnectedNodes(connectedNodes, prompt);
      
      // Update the input node to show processing is complete
      if (typeof data.updateNodeData === 'function') {
        data.updateNodeData(id, { processing: false });
      }
    }
  };

  // Function to process a specific node
  const handleProcessNode = async () => {
    if (!data.input) {
      return;
    }
    
    try {
      // Update node to show processing
      if (typeof data.updateNodeData === 'function') {
        data.updateNodeData(id, { 
          processing: true,
          executed: true,
          error: undefined
        });
      }
      
      // Process based on node type
      if (data.type === 'openai') {
        await processOpenAINode({id, data}, data.input as string);
      } else if (data.type === 'dalle') {
        await processDALLENode({id, data}, data.input as string);
      } else if (data.type === 'gemini') {
        await processGeminiNode({id, data}, data.input as string);
      } else {
        // For other node types
        if (typeof data.updateNodeData === 'function') {
          setTimeout(() => {
            if (typeof data.updateNodeData === 'function') {
              const response = `Processed by ${data.label}: ${data.input}`;
              data.updateNodeData(id, {
                response: response,
                responseType: 'text',
                processing: false,
                error: undefined
              });
            }
          }, 1500);
        }
      }
      
    } catch (error) {
      console.error(`Error processing node ${id}:`, error);
      if (typeof data.updateNodeData === 'function') {
        data.updateNodeData(id, {
          error: error instanceof Error ? error.message : 'Unknown error',
          processing: false,
          executed: true
        });
      }
      
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  // Process connected nodes with prompt
  const processConnectedNodes = async (connectedNodes, prompt) => {
    for (const nodeId of connectedNodes) {
      const node = data.nodes?.find(n => n.id === nodeId);
      if (!node) continue;
      
      try {
        if (node.data.type === 'openai') {
          await processOpenAINode(node, prompt);
        } else if (node.data.type === 'dalle') {
          await processDALLENode(node, prompt);
        } else if (node.data.type === 'gemini') {
          await processGeminiNode(node, prompt);
        } else if (node.data.type === 'input') {
          // For input nodes in the middle of the workflow, just update their input
          if (typeof data.updateNodeData === 'function') {
            data.updateNodeData(nodeId, {
              input: prompt,
              inputType: 'text',
              processing: false,
              executed: false,
              // Add context info to show this is from previous node
              context: [{type: 'context', content: 'Response from previous node:'}]
            });
          }
        } else {
          // For other node types
          if (typeof data.updateNodeData === 'function') {
            data.updateNodeData(nodeId, {
              input: prompt,
              processing: true,
              executed: true
            });
            
            // Simulate processing for now
            setTimeout(() => {
              if (typeof data.updateNodeData === 'function') {
                const response = `Processed by ${node.data.label}: ${prompt}`;
                data.updateNodeData(nodeId, {
                  response: response,
                  responseType: 'text',
                  processing: false,
                  error: undefined
                });
              }
            }, 1500);
          }
        }
      } catch (error) {
        console.error(`Error processing node ${nodeId}:`, error);
        if (typeof data.updateNodeData === 'function') {
          data.updateNodeData(nodeId, {
            error: error instanceof Error ? error.message : 'Unknown error',
            processing: false,
            executed: true
          });
        }
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
      console.log("Processing OpenAI node:", node.id);
      
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
          executed: true,
          error: undefined,
          context: updatedContext  // Store only the latest conversation pair
        });
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  };
  
  // Process DALL-E node (image generation)
  const processDALLENode = async (node: any, prompt: string) => {
    // Check if we have API key
    if (!node.data.apiKey) {
      throw new Error('OpenAI API key is required. Please configure the node.');
    }
    
    try {
      // Show processing state
      console.log("Processing DALL-E node:", node.id);
      
      // Determine model from node config or use default
      const model = node.data.config?.model || 'dall-e-3';
      const size = node.data.config?.size || '1024x1024';
      const style = node.data.config?.style || 'vivid';
      const quality = node.data.config?.quality || 'standard';
      
      console.log(`Generating image with DALL-E: model=${model}, size=${size}, style=${style}, quality=${quality}`);
      
      // Make API call to OpenAI for image generation
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${node.data.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          n: 1,
          size: size,
          style: style,
          quality: quality
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const imageUrl = data.data[0]?.url;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E');
      }
      
      // Fetch the image as blob
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      
      // Update the node with the image response
      if (typeof node.data.updateNodeData === 'function') {
        node.data.updateNodeData(node.id, {
          response: imageBlob,
          responseType: 'image',
          processing: false,
          executed: true,
          error: undefined
        });
      }
      
      // Propagate the response to any connected nodes
      propagateResponseToNextNodes(node, imageBlob);
      
      toast({
        title: "Image Generated",
        description: "DALL-E has generated an image based on your prompt"
      });
    } catch (error) {
      console.error('DALL-E API Error:', error);
      throw error;
    }
  };
  
  // Process Gemini node (image generation)
  const processGeminiNode = async (node: any, prompt: string) => {
    // Check if we have API key
    if (!node.data.apiKey) {
      throw new Error('Google API key is required. Please configure the node.');
    }
    
    try {
      // Show processing state
      console.log("Processing Gemini node:", node.id);
      
      // For demonstration purposes, we'll simulate a Gemini response
      // In a real implementation, this would make calls to the Google Gemini API
      
      if (typeof node.data.updateNodeData === 'function') {
        node.data.updateNodeData(node.id, {
          processing: true,
          executed: true,
          error: undefined
        });
      }
      
      // Simulate API call - in a real implementation, replace with actual Gemini API call
      setTimeout(async () => {
        try {
          // This is a placeholder for the Gemini API call
          // For now, we'll just use a placeholder image for demonstration
          
          // Create a placeholder canvas and draw some text on it
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#9333ea');
            gradient.addColorStop(1, '#6366f1');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add some text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Gemini Image Generation', canvas.width/2, canvas.height/2 - 20);
            ctx.font = '18px Arial';
            ctx.fillText('(Simulated)', canvas.width/2, canvas.height/2 + 20);
            ctx.font = '14px Arial';
            ctx.fillText(prompt.substring(0, 40) + (prompt.length > 40 ? '...' : ''), canvas.width/2, canvas.height/2 + 60);
          }
          
          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (blob && typeof node.data.updateNodeData === 'function') {
              // Update the node with the image response
              node.data.updateNodeData(node.id, {
                response: blob,
                responseType: 'image',
                processing: false,
                executed: true,
                error: undefined
              });
              
              // Propagate the response to any connected nodes
              propagateResponseToNextNodes(node, blob);
            }
          });
          
          toast({
            title: "Image Generated",
            description: "Gemini has generated an image based on your prompt"
          });
        } catch (error) {
          console.error('Gemini API Simulation Error:', error);
          if (typeof node.data.updateNodeData === 'function') {
            node.data.updateNodeData(node.id, {
              error: error instanceof Error ? error.message : 'Unknown error',
              processing: false,
              executed: true
            });
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  };
  
  // Function to propagate the response to the next connected nodes
  const propagateResponseToNextNodes = (node: any, response: string | Blob) => {
    const connectedOutputs = node.edges
      ?.filter(e => e.source === node.id)
      .map(e => e.target) || [];
      
    for (const outputId of connectedOutputs) {
      const outputNode = node.nodes?.find(n => n.id === outputId);
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
            executed: true,
            error: undefined
          });
        } 
        // For language model nodes (like OpenAI), automatically use the response as input and process
        else if (outputNode.data.type === 'openai' || 
                outputNode.data.type === 'anthropic' ||
                outputNode.data.type === 'perplexity' ||
                outputNode.data.type === 'gemini' ||
                outputNode.data.type === 'dalle' ||
                outputNode.data.type === 'code' ||
                outputNode.data.type === 'function') {
          
          // If the response is a string, set it as the input
          if (typeof response === 'string') {
            node.data.updateNodeData(outputId, {
              input: response,
              inputType: 'text',
              processing: false,
              executed: false, // Not executed yet
            });
            // Node will auto-process through its useEffect when it receives input
          }
        }
        // If it's an input node, store the response as input but don't auto-process
        else if (outputNode.data.type === 'input') {
          node.data.updateNodeData(outputId, {
            input: typeof response === 'string' ? response : 'Binary data from previous node',
            processing: false,
            executed: false,
            // Add context info to show this is from previous node
            context: [{type: 'context', content: 'Response from previous node:'}]
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
            executed: false
          });
        }
      }
    }
  };

  // Determine if this node is a source, target, or both
  const hasSourceHandle = data.handles?.source;
  const hasTargetHandle = data.handles?.target;
  
  // Get execution status visual indicator
  const getStatusIndicator = () => {
    if (data.processing) {
      return (
        <div className="absolute top-0 right-0 w-3 h-3 m-1">
          <div className="w-full h-full bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      );
    } else if (data.executed) {
      if (data.error) {
        return (
          <div className="absolute top-0 right-0 w-3 h-3 m-1">
            <div className="w-full h-full bg-red-500 rounded-full"></div>
          </div>
        );
      } else {
        return (
          <div className="absolute top-0 right-0 w-3 h-3 m-1">
            <div className="w-full h-full bg-green-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div 
      className={cn(
        "min-w-[200px] max-w-[280px] bg-white rounded-md shadow-md border",
        data.executed && !data.error ? "border-green-300" : 
        data.error ? "border-red-300" : 
        data.processing ? "border-blue-300" : "border-gray-200",
        "flex flex-col relative"
      )}
    >
      {/* Node Header */}
      <div 
        className={cn(
          "px-3 py-2 flex justify-between items-center rounded-t-md",
          data.executed && !data.error ? "bg-green-50" : 
          data.error ? "bg-red-50" : 
          data.processing ? "bg-blue-50" : 
          "bg-gray-50"
        )}
        style={{ borderBottom: `2px solid ${data.color}` }}
      >
        <div className="flex items-center gap-2">
          {data.icon && <span className="text-lg" style={{ color: data.color }}>{data.icon}</span>}
          <h3 className="text-sm font-medium truncate max-w-[120px]">{data.label}</h3>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700 mr-1"
          >
            <FiInfo size={14} />
          </button>
          {data.openConfig && (
            <button
              onClick={() => data.openConfig && data.openConfig(id)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiSettings size={14} />
            </button>
          )}
        </div>
        {getStatusIndicator()}
      </div>
      
      {/* Node Content */}
      <div className="p-3 text-xs text-gray-600 flex-1">
        {!showDetails && !data.error && !data.response && (
          <div className="text-gray-500 italic">
            {data.description || 'Configure this node'}
          </div>
        )}
        
        {/* Show error if present */}
        {data.error && (
          <div className="mt-1 text-red-500 text-xs p-2 bg-red-50 rounded border border-red-200 flex items-start">
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
            <div>{data.error}</div>
          </div>
        )}

        {/* Input Field for Input Node */}
        {data.type === 'input' && (
          <div className="mt-2">
            {/* Show context from previous node if this is an intermediate input node */}
            {data.context && (
              <div className="mb-2 text-gray-500 bg-gray-50 p-2 rounded text-xs">
                {typeof data.context === 'string' 
                  ? data.context 
                  : (data.context[0] && 'content' in data.context[0]) 
                    ? data.context[0].content 
                    : 'Input from previous node'}
              </div>
            )}
            
            <input
              type="text"
              value={data.input as string || ''}
              onChange={(e) => data.updateNodeData && data.updateNodeData(id, { input: e.target.value })}
              placeholder="Enter your prompt..."
              className="w-full text-xs p-2 border border-gray-300 rounded"
            />
            
            {/* Show button only for starting input nodes or input nodes that need manual forwarding */}
            <button
              onClick={handleSendPrompt}
              disabled={data.processing}
              className={cn(
                "w-full mt-2 py-1.5 rounded text-white text-xs flex items-center justify-center",
                data.processing ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {data.processing ? (
                <span className="flex items-center">
                  <span className="w-3 h-3 bg-white rounded-full animate-bounce mr-2"></span>
                  Processing...
                </span>
              ) : data.context ? (
                <>
                  <Forward className="h-3 w-3 mr-1" /> Continue Workflow
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" /> Execute Workflow
                </>
              )}
            </button>
          </div>
        )}

        {/* Details view for any node */}
        {showDetails && (
          <div className="mt-1 text-xs">
            <div className="font-medium mb-1 text-gray-700">Node Details:</div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200 space-y-1">
              <div><span className="font-medium">Type:</span> {data.type}</div>
              {data.executed && (
                <div><span className="font-medium">Status:</span> {data.error ? 'Error' : 'Executed'}</div>
              )}
              {data.input && (
                <div className="truncate">
                  <span className="font-medium">Input:</span> {typeof data.input === 'string' ? data.input.substring(0, 50) + (data.input.length > 50 ? '...' : '') : 'Non-text input'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Display Response for Output Node */}
        {data.type === 'output' && data.response && (
          <div className="mt-2 max-h-[150px] overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 text-gray-800 text-xs">
            {typeof data.response === 'string' ? (
              <pre className="whitespace-pre-wrap">{data.response}</pre>
            ) : (
              data.responseType === 'image' ? (
                <div className="flex justify-center">
                  <img 
                    src={URL.createObjectURL(data.response as Blob)} 
                    alt="Generated" 
                    className="max-w-full max-h-[120px] object-contain"
                    onLoad={() => URL.revokeObjectURL(URL.createObjectURL(data.response as Blob))}
                  />
                </div>
              ) : (
                <span>Binary response received</span>
              )
            )}
          </div>
        )}
        
        {/* Display Summary Response for LLM Nodes */}
        {(data.type === 'openai' || data.type === 'anthropic' || data.type === 'perplexity') && data.response && !showDetails && (
          <div className="mt-2 text-xs">
            <div className="font-medium flex items-center text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Response Generated
            </div>
            <div className="truncate text-gray-600 mt-1">
              {typeof data.response === 'string' ? 
                `"${data.response.substring(0, 50)}${data.response.length > 50 ? '...' : ''}"` : 
                'Non-text response'}
            </div>
          </div>
        )}
        
        {/* Display Full Response for LLM Nodes when details shown */}
        {(data.type === 'openai' || data.type === 'anthropic' || data.type === 'perplexity') && data.response && showDetails && (
          <div className="mt-2 text-xs">
            <div className="font-medium mb-1">Response:</div>
            <div className="max-h-[150px] overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
              {typeof data.response === 'string' ? (
                <pre className="whitespace-pre-wrap">{data.response}</pre>
              ) : (
                <span>Binary response</span>
              )}
            </div>
          </div>
        )}
        
        {/* Display Image Response for Image Generation Nodes */}
        {(data.type === 'dalle' || data.type === 'gemini' || data.type === 'stability' || data.type === 'midjourney') 
          && data.response && data.responseType === 'image' && (
          <div className="mt-2 text-xs">
            <div className="font-medium flex items-center text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Image Generated
            </div>
            <div className="mt-2 flex justify-center">
              <img 
                src={URL.createObjectURL(data.response as Blob)} 
                alt="Generated" 
                className="max-w-full max-h-[150px] object-contain rounded"
              />
            </div>
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
        <div className="absolute inset-0 bg-black/5 rounded-md flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

export default ServiceNode;
