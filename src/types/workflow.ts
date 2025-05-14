
import { Node, Edge } from '@xyflow/react';

export interface NodeData {
  label: string;
  type: string;
  description?: string;
  color: string;
  handles?: {
    source: boolean;
    target: boolean;
  };
  icon?: JSX.Element;
  config?: Record<string, any>;
  input?: string | File | null;
  inputType?: 'text' | 'file' | 'audio' | 'image' | 'video';
  response?: string | Blob;
  responseType?: 'text' | 'image' | 'audio' | 'video' | 'code';
  responseFormat?: string; // For code syntax highlighting or MIME types
  error?: string;
  processing?: boolean;
  updateNodeData?: (nodeId: string, data: Record<string, any>) => void;
  openConfig?: (nodeId: string) => void; // Properly type the openConfig prop
  edges?: Edge[];
  nodes?: Node<NodeData>[];
  useResponseAsContext?: boolean; // Field to track if response should be used as context
  [key: string]: unknown; // Add index signature to satisfy Record<string, unknown>
}

// Define properly typed AINode and WorkflowEdge
export type AINode = Node<NodeData>;
export type WorkflowEdge = Edge & {
  animated: boolean;
  // Make sourceHandle and targetHandle optional explicitly with null as possible value
  sourceHandle?: string | null;
  targetHandle?: string | null;
};
