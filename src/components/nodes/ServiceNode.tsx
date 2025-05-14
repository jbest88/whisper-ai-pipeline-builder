
import React, { memo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Node } from '@xyflow/react';
import { NodeData } from '../../types/workflow';

// Define the node component
const ServiceNode = memo(({ data, id }: { data: NodeData; id: string }) => {
  const { toast } = useToast();

  // Process OpenAI node (GPT-4o, etc.)
  const processOpenAINode = async (node: Node<NodeData>, prompt: string) => {
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
      
      // Make API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${node.data.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
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
      
      // Update the node with the response
      if (typeof node.data.updateNodeData === 'function') {
        node.data.updateNodeData(node.id, {
          response: aiResponse,
          responseType: 'text',
          processing: false,
        });
      }
      
      // Find and update any output nodes connected to this node
      const connectedOutputs = node.data.edges
        ?.filter(e => e.source === node.id)
        .map(e => e.target) || [];
        
      connectedOutputs.forEach(outputId => {
        if (typeof node.data.updateNodeData === 'function') {
          node.data.updateNodeData(outputId, {
            response: aiResponse,
            responseType: 'text',
            processing: false,
          });
        }
      });
      
      toast({
        title: "AI Processing Complete",
        description: "Response generated successfully",
      });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  };

  // Return the component's JSX
  return (
    <div>
      {/* Your node rendering logic here */}
    </div>
  );
});

export default ServiceNode;
